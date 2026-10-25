package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"syscall"
	"time"
)

type Task struct {
	ID         string    `json:"id"`
	Type       string    `json:"type"`       // "draft" (生成新文章) | "explain" (解释文章)
	Status     string    `json:"status"`     // "queued" | "running" | "completed" | "failed"
	Prompt     string    `json:"prompt"`     // 持久化存储的前 500 字符摘要
	RepoID     string    `json:"repo_id"`
	RepoName   string    `json:"repo_name"`
	TargetFile string    `json:"target_file"` // 生成的新文件路径或正在解释的目标路径
	CreatedAt  time.Time `json:"created_at"`
	StartedAt  time.Time `json:"started_at,omitempty"`
	EndedAt    time.Time `json:"ended_at,omitempty"`
	ExitCode   int       `json:"exit_code"`
	ErrorMsg   string    `json:"error_msg,omitempty"`
	LogFile    string    `json:"log_file"`
	rawPrompt  string    // 内存中保留的完整 Prompt (最大 5000 字符)，供 Worker 执行
}

type TaskManager struct {
	mu       sync.RWMutex
	tasks    []*Task
	queue    chan *Task
	stateDir string
	cfg      *Config
	rm       *RepoManager
}

func NewTaskManager(cfg *Config, rm *RepoManager) *TaskManager {
	tm := &TaskManager{
		tasks:    make([]*Task, 0),
		queue:    make(chan *Task, 50),
		stateDir: cfg.StateDir,
		cfg:      cfg,
		rm:       rm,
	}

	_ = os.MkdirAll(filepath.Join(tm.stateDir, "logs"), 0755)
	tm.loadTasks()

	// 启动后台单并发 Worker
	go tm.workerLoop()

	return tm
}

func (tm *TaskManager) tasksFile() string {
	return filepath.Join(tm.stateDir, "tasks.json")
}

func (tm *TaskManager) loadTasks() {
	data, err := os.ReadFile(tm.tasksFile())
	if err != nil {
		return
	}
	var loaded []*Task
	if err := json.Unmarshal(data, &loaded); err == nil {
		tm.tasks = loaded
		// 如果上次意外断电导致 running 状态，标记为 failed
		for _, t := range tm.tasks {
			if t.Status == "running" || t.Status == "queued" {
				t.Status = "failed"
				t.ErrorMsg = "service restarted while task was in progress"
			}
			// 防御性截断，避免历史 tasks.json 膨胀导致启动 OOM
			if rPrompt := []rune(t.Prompt); len(rPrompt) > 500 {
				t.Prompt = string(rPrompt[:500]) + "..."
			}
		}
	}
}

func (tm *TaskManager) saveTasks() {
	tm.mu.RLock()
	defer tm.mu.RUnlock()

	data, err := json.MarshalIndent(tm.tasks, "", "  ")
	if err != nil {
		return
	}
	_ = os.WriteFile(tm.tasksFile(), data, 0644)
}

func (tm *TaskManager) SubmitTask(taskType, repoID, targetFile, prompt string) (*Task, error) {
	prompt = strings.TrimSpace(prompt)
	if prompt == "" {
		return nil, errors.New("prompt cannot be empty")
	}
	if len([]rune(prompt)) > 5000 {
		return nil, errors.New("prompt exceeds maximum limit of 5000 characters")
	}

	repo, err := tm.rm.GetRepoByID(repoID)
	if err != nil {
		return nil, err
	}

	// 安全校验：校验 TargetFile 防止路径穿越与非法探测
	if strings.TrimSpace(targetFile) != "" {
		cleanTarget, err := tm.rm.SafeResolve(repo, targetFile)
		if err != nil {
			return nil, fmt.Errorf("invalid target file path: %w", err)
		}
		if taskType == "explain" {
			fInfo, err := os.Stat(cleanTarget)
			if err != nil {
				return nil, fmt.Errorf("target file does not exist: %w", err)
			}
			if fInfo.IsDir() {
				return nil, errors.New("target file cannot be a directory")
			}
		}
	}

	taskID := fmt.Sprintf("task_%s_%s", time.Now().Format("20060102_150405"), randomHex(4))
	logFile := filepath.Join(tm.stateDir, "logs", fmt.Sprintf("%s.log", taskID))

	// tasks.json 中只持久化前 500 字符摘要，彻底杜绝 tasks.json 膨胀导致启动 OOM
	promptRunes := []rune(prompt)
	promptSummary := prompt
	if len(promptRunes) > 500 {
		promptSummary = string(promptRunes[:500]) + "..."
	}

	task := &Task{
		ID:         taskID,
		Type:       taskType,
		Status:     "queued",
		Prompt:     promptSummary,
		RepoID:     repoID,
		RepoName:   repo.Name,
		TargetFile: targetFile,
		CreatedAt:  time.Now(),
		LogFile:    logFile,
		rawPrompt:  prompt,
	}

	tm.mu.Lock()
	// 最多保留最近 100 条任务历史
	if len(tm.tasks) > 100 {
		tm.tasks = tm.tasks[len(tm.tasks)-100:]
	}
	tm.tasks = append([]*Task{task}, tm.tasks...)
	tm.mu.Unlock()

	tm.saveTasks()

	// 投递队列
	select {
	case tm.queue <- task:
		return task, nil
	default:
		task.Status = "failed"
		task.ErrorMsg = "task queue is full, please try again later"
		tm.saveTasks()
		return task, fmt.Errorf("queue is full")
	}
}

func (tm *TaskManager) workerLoop() {
	for task := range tm.queue {
		func() {
			defer func() {
				if r := recover(); r != nil {
					task.Status = "failed"
					task.ErrorMsg = fmt.Sprintf("internal worker panic: %v", r)
					task.EndedAt = time.Now()
					tm.saveTasks()
				}
			}()
			tm.executeTask(task)
		}()
	}
}

func (tm *TaskManager) executeTask(task *Task) {
	task.Status = "running"
	task.StartedAt = time.Now()
	tm.saveTasks()

	repo, err := tm.rm.GetRepoByID(task.RepoID)
	if err != nil {
		task.Status = "failed"
		task.ErrorMsg = err.Error()
		task.EndedAt = time.Now()
		tm.saveTasks()
		return
	}

	logF, err := os.OpenFile(task.LogFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		task.Status = "failed"
		task.ErrorMsg = fmt.Sprintf("failed to open log file: %v", err)
		task.EndedAt = time.Now()
		tm.saveTasks()
		return
	}
	defer logF.Close()

	execPrompt := task.rawPrompt
	if execPrompt == "" {
		execPrompt = task.Prompt
	}

	header := fmt.Sprintf("=== doc-lens AI Task: %s ===\nType: %s\nTarget: %s\nRepo: %s (%s)\nTime: %s\nPrompt: %s\n===============================\n\n",
		task.ID, task.Type, task.TargetFile, repo.Name, repo.Path, task.StartedAt.Format("2006-01-02 15:04:05"), execPrompt)
	_, _ = logF.WriteString(header)

	// 构造执行命令
	// 优先调用系统配置的 runner (例如 dagu-ai 或 ay)
	runner := tm.cfg.AI.RunnerCmd
	if runner == "" {
		runner = "dagu-ai"
	}

	// 组装完整的 AI 指令
	var execArgs []string
	var fullPrompt string

	if task.Type == "draft" {
		targetFileHint := "遵循命名规范 YYYY-MM-DD-主题.md（纯中文与连字符命名），并存入合适的子目录（如专题/）。"
		if strings.TrimSpace(task.TargetFile) != "" {
			targetFileHint = fmt.Sprintf("建议存入文件路径：%s。", strings.TrimSpace(task.TargetFile))
		}
		fullPrompt = fmt.Sprintf("任务：根据用户要求在目录 %s 下生成一篇深度、专业、格式严密的 Markdown 文档。文件名要求：%s。写作准则：严格遵循本仓库 AGENTS.md 规范，采取唯物现实主义与去道德化客观视角，包含多级标题目录结构、必要时使用 Mermaid 图表展示架构与流程、严禁敷衍。用户需求：%s",
			repo.Path, targetFileHint, execPrompt)
	} else {
		fullPrompt = fmt.Sprintf("任务：请对文件 %s 进行深度逻辑解剖与透视分析。针对用户关注的问题：%s。要求：指出核心矛盾、客观利益账本、潜在盲点与要点总结，使用结构化 Markdown 呈现。",
			task.TargetFile, execPrompt)
	}

	execArgs = []string{"-p", fullPrompt}

	cmd := exec.Command(runner, execArgs...)
	cmd.Dir = repo.Path
	// 继承物理用户的环境变量，保证 CLI 工具链与配额正常加载，并注入默认 NAS 代理环境
	env := os.Environ()
	proxyDefaults := map[string]string{
		"http_proxy":  "http://127.0.0.1:7890",
		"https_proxy": "http://127.0.0.1:7890",
		"all_proxy":   "socks5://127.0.0.1:7891",
		"ALL_PROXY":   "socks5://127.0.0.1:7891",
	}
	for k, v := range proxyDefaults {
		if os.Getenv(k) == "" {
			env = append(env, fmt.Sprintf("%s=%s", k, v))
		}
	}
	cmd.Env = env
	// 脱离父进程组，独立运行
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}

	cmd.Stdout = logF
	cmd.Stderr = logF

	runErr := cmd.Run()
	task.EndedAt = time.Now()

	if runErr != nil {
		task.Status = "failed"
		if exitError, ok := runErr.(*exec.ExitError); ok {
			task.ExitCode = exitError.ExitCode()
		} else {
			task.ExitCode = -1
		}
		task.ErrorMsg = runErr.Error()
		_, _ = logF.WriteString(fmt.Sprintf("\n[doc-lens] Process exited with error: %v (exit code %d)\n", runErr, task.ExitCode))
	} else {
		task.Status = "completed"
		task.ExitCode = 0
		_, _ = logF.WriteString("\n[doc-lens] Task successfully finished.\n")
	}

	tm.saveTasks()
}

func (tm *TaskManager) ListTasks(limit int) []*Task {
	tm.mu.RLock()
	defer tm.mu.RUnlock()

	if limit <= 0 || limit > len(tm.tasks) {
		limit = len(tm.tasks)
	}
	result := make([]*Task, limit)
	copy(result, tm.tasks[:limit])
	return result
}

func (tm *TaskManager) GetTask(id string) *Task {
	tm.mu.RLock()
	defer tm.mu.RUnlock()

	for _, t := range tm.tasks {
		if t.ID == id {
			return t
		}
	}
	return nil
}

func (tm *TaskManager) ReadTaskLog(id string, tailBytes int64) (string, error) {
	task := tm.GetTask(id)
	if task == nil {
		return "", fmt.Errorf("task %s not found", id)
	}

	info, err := os.Stat(task.LogFile)
	if err != nil {
		return "", fmt.Errorf("log file not found: %w", err)
	}

	// 硬上限限制为 512KB，杜绝任意 tail 导致的内存耗尽
	const maxTailBytes = int64(512 * 1024)
	if tailBytes <= 0 || tailBytes > maxTailBytes {
		tailBytes = maxTailBytes
	}

	file, err := os.Open(task.LogFile)
	if err != nil {
		return "", err
	}
	defer file.Close()

	if info.Size() <= tailBytes {
		data, err := io.ReadAll(io.LimitReader(file, tailBytes))
		return string(data), err
	}

	// 读取尾部字节
	offset := info.Size() - tailBytes
	if _, err := file.Seek(offset, io.SeekStart); err != nil {
		return "", err
	}
	data, err := io.ReadAll(io.LimitReader(file, tailBytes))
	return string(data), err
}
