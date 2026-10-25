package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
	"syscall"
	"time"
)

type Task struct {
	ID         string    `json:"id"`
	Type       string    `json:"type"`       // "new" | "draft" | "append" | "modify" | "explain"
	Status     string    `json:"status"`     // "queued" | "running" | "completed" | "failed"
	Prompt     string    `json:"prompt"`     // 持久化存储的前 500 字符摘要
	RepoID     string    `json:"repo_id"`
	RepoName   string    `json:"repo_name"`
	TargetFile string    `json:"target_file"` // 关联的参考/修改文档路径（相对路径）
	OutputFile string    `json:"output_file"` // 最终生成或修改后的前端直达路由
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
			// 如果因为意外断电或服务升级重启，先自动校验是否实际已完成并落盘
			if t.Status == "running" || t.Status == "queued" || (t.Status == "failed" && t.ErrorMsg == "service restarted while task was in progress") {
				if tm.rm != nil && t.RepoID != "" {
					if repo, err := tm.rm.GetRepoByID(t.RepoID); err == nil {
						out := tm.detectOutputFile(repo, t, t.StartedAt)
						if out != "" {
							cleanPrefix := "/" + strings.Trim(repo.RoutePrefix, "/")
							t.Status = "completed"
							t.OutputFile = cleanPrefix + "/" + strings.TrimPrefix(out, "/")
							t.TargetFile = out
							t.ErrorMsg = ""
							if t.EndedAt.IsZero() {
								t.EndedAt = time.Now()
							}
							tm.rm.InvalidateCache(t.RepoID)
							continue
						}
					}
				}
				if t.Status != "failed" {
					t.Status = "failed"
					t.ErrorMsg = "service restarted while task was in progress"
				}
			}
			// 防御性截断，避免历史 tasks.json 膨胀导致启动 OOM
			if rPrompt := []rune(t.Prompt); len(rPrompt) > 500 {
				t.Prompt = string(rPrompt[:500]) + "..."
			}
			// 自动回填已完成任务的 OutputFile，保障历史任务即刻可跳转
			if t.Status == "completed" && t.OutputFile == "" && tm.rm != nil && t.RepoID != "" {
				if repo, err := tm.rm.GetRepoByID(t.RepoID); err == nil {
					out := tm.detectOutputFile(repo, t, t.StartedAt)
					if out != "" {
						cleanPrefix := "/" + strings.Trim(repo.RoutePrefix, "/")
						t.OutputFile = cleanPrefix + "/" + strings.TrimPrefix(out, "/")
						if t.TargetFile == "" {
							t.TargetFile = out
						}
					}
				}
			}
		}
		// 持久化更新后的任务状态与路径
		tm.saveTasks()
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
	cleanTarget := strings.TrimSpace(targetFile)
	if cleanTarget != "" {
		resolvedTarget, err := tm.rm.SafeResolve(repo, cleanTarget)
		if err != nil {
			return nil, fmt.Errorf("invalid target file path: %w", err)
		}
		if taskType == "explain" || taskType == "append" || taskType == "modify" {
			fInfo, err := os.Stat(resolvedTarget)
			if err != nil {
				return nil, fmt.Errorf("target file does not exist: %w", err)
			}
			if fInfo.IsDir() {
				return nil, errors.New("target file cannot be a directory")
			}
		}
		if rel, err := filepath.Rel(repo.Path, resolvedTarget); err == nil {
			cleanTarget = filepath.ToSlash(rel)
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
		TargetFile: cleanTarget,
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

	cleanTarget := strings.TrimSpace(task.TargetFile)
	cleanTarget = strings.TrimPrefix(cleanTarget, "/")

	switch task.Type {
	case "append":
		fullPrompt = fmt.Sprintf("任务：针对当前正在阅读的文档 '%s' 进行补充与深化。用户具体要求：%s。写作准则：严格遵循本仓库 AGENTS.md 规范（包含文风去AI化、利益账本与结构规范等），将补充内容自然融合或追加到该文档中。完成后在控制台输出更新后的文件绝对路径（格式：file://%s/%s）。",
			cleanTarget, execPrompt, repo.Path, cleanTarget)
	case "modify":
		fullPrompt = fmt.Sprintf("任务：针对当前正在阅读的文档 '%s' 进行修改与重构。用户具体要求：%s。写作准则：严格遵循本仓库 AGENTS.md 规范，对该文档对应内容进行精准修改。完成后在控制台输出修改后的文件绝对路径（格式：file://%s/%s）。",
			cleanTarget, execPrompt, repo.Path, cleanTarget)
	case "explain":
		fullPrompt = fmt.Sprintf("任务：请对文档 '%s' 进行深度逻辑解剖与透视分析。针对用户关注的问题：%s。要求：严格遵循本仓库 AGENTS.md 规范，指出核心矛盾、客观利益账本、潜在盲点与要点总结，使用结构化 Markdown 呈现并归档到合适位置。",
			cleanTarget, execPrompt)
	default: // "new" 或 "draft"
		if cleanTarget != "" {
			fullPrompt = fmt.Sprintf("任务：基于参考文档 '%s' 及用户要求，在目录 %s 下撰写并归档一篇 Markdown 文档。用户具体要求：%s。写作准则：严格遵循本仓库 AGENTS.md 规范，由你根据本领域知识矩阵与分类规范，自行决策存入最合适的子目录并确定文件名与结构。完成后在控制台输出生成的文件绝对路径（格式：file://...）。",
				cleanTarget, repo.Path, execPrompt)
		} else {
			fullPrompt = fmt.Sprintf("任务：根据用户要求在目录 %s 下研究并输出整理为 Markdown 文档。用户具体要求：%s。写作准则：严格遵循本仓库 AGENTS.md 规范，由你根据本领域知识矩阵与分类规范，自行决策存入最合适的子目录并确定文件名与结构。完成后在控制台输出生成的文件绝对路径（格式：file://...）。",
				repo.Path, execPrompt)
		}
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
		if tm.rm != nil && task.RepoID != "" {
			tm.rm.InvalidateCache(task.RepoID)
		}

		// 解析与探测生成或修改的文件路径，赋予 task.OutputFile
		outputRelPath := tm.detectOutputFile(repo, task, task.StartedAt)
		if outputRelPath != "" {
			cleanPrefix := "/" + strings.Trim(repo.RoutePrefix, "/")
			task.OutputFile = cleanPrefix + "/" + strings.TrimPrefix(outputRelPath, "/")
			if task.TargetFile == "" {
				task.TargetFile = outputRelPath
			}
			_, _ = logF.WriteString(fmt.Sprintf("[doc-lens] Target document detected: %s (Route: %s)\n", outputRelPath, task.OutputFile))
		}
	}

	tm.saveTasks()
}

// detectOutputFile 自动探测任务生成或修改的 Markdown 文档相对路径
func (tm *TaskManager) detectOutputFile(repo *RepoConfig, task *Task, startTime time.Time) string {
	// 1. 如果是追加/修改模式且指定了存在的 TargetFile，直接使用 TargetFile
	if (task.Type == "append" || task.Type == "modify") && strings.TrimSpace(task.TargetFile) != "" {
		clean := strings.Trim(task.TargetFile, "/")
		full := filepath.Join(repo.Path, clean)
		if fInfo, err := os.Stat(full); err == nil && !fInfo.IsDir() {
			return filepath.ToSlash(clean)
		}
	}

	// 2. 从任务日志中匹配文件路径（精准度最高）
	if task.LogFile != "" {
		if data, err := os.ReadFile(task.LogFile); err == nil {
			content := string(data)
			cleanRepoPath := strings.TrimRight(repo.Path, "/")
			re := regexp.MustCompile(`(?:file:/*)?` + regexp.QuoteMeta(strings.TrimPrefix(cleanRepoPath, "/")) + `/([^\s\)\"\'>]+?\.(?:md|markdown|html))`)
			matches := re.FindAllStringSubmatch(content, -1)
			for i := len(matches) - 1; i >= 0; i-- {
				relPath := matches[i][1]
				candidate := filepath.Join(repo.Path, relPath)
				if fInfo, err := os.Stat(candidate); err == nil && !fInfo.IsDir() {
					return filepath.ToSlash(relPath)
				}
				// 容错：如果日志打印的相对路径在多层子目录下发生了归档偏移，根据基础文件名在仓库内精确定位
				baseName := filepath.Base(relPath)
				cleanBase := regexp.MustCompile(`^\d{4}-\d{2}-\d{2}-`).ReplaceAllString(baseName, "")
				var matchedRel string
				_ = filepath.WalkDir(repo.Path, func(path string, d os.DirEntry, err error) error {
					if err != nil || matchedRel != "" {
						return nil
					}
					if d.IsDir() {
						if strings.HasPrefix(d.Name(), ".") || d.Name() == "node_modules" || d.Name() == "logs" || d.Name() == "bin" {
							return filepath.SkipDir
						}
						return nil
					}
					if d.Name() == baseName || (cleanBase != "" && d.Name() == cleanBase) {
						if r, err := filepath.Rel(repo.Path, path); err == nil {
							matchedRel = filepath.ToSlash(r)
						}
					}
					return nil
				})
				if matchedRel != "" {
					return matchedRel
				}
			}
		}
	}

	// 3. 遍历仓库根目录，寻找在任务开始后（留出 10 秒缓冲）被新创建或修改的 markdown 文件
	var newestFile string
	var newestMod time.Time
	searchThreshold := startTime.Add(-10 * time.Second)

	_ = filepath.WalkDir(repo.Path, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return nil
		}
		name := d.Name()
		if d.IsDir() {
			if strings.HasPrefix(name, ".") || name == "node_modules" || name == "logs" || name == "bin" {
				return filepath.SkipDir
			}
			return nil
		}
		ext := strings.ToLower(filepath.Ext(name))
		if ext == ".md" || ext == ".markdown" || ext == ".html" {
			info, err := d.Info()
			if err != nil {
				return nil
			}
			mod := info.ModTime()
			if mod.After(searchThreshold) {
				if newestFile == "" || mod.After(newestMod) {
					newestFile = path
					newestMod = mod
				}
			}
		}
		return nil
	})

	if newestFile != "" {
		if rel, err := filepath.Rel(repo.Path, newestFile); err == nil {
			return filepath.ToSlash(rel)
		}
	}

	// 4. Fallback: 如果 task.TargetFile 不为空，尝试使用它
	if strings.TrimSpace(task.TargetFile) != "" {
		return strings.Trim(task.TargetFile, "/")
	}

	return ""
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
