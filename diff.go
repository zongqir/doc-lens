package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

type DocCommitItem struct {
	Hash      string `json:"hash"`
	ShortHash string `json:"short_hash"`
	Author    string `json:"author"`
	Date      string `json:"date"`
	Message   string `json:"message"`
	IsCurrent bool   `json:"is_current,omitempty"`
}

type IncrementalSection struct {
	Type       string `json:"type"` // "add_heading" | "del_heading" | "add_diagram" | "add_table" | "add_block"
	Level      int    `json:"level,omitempty"`
	Title      string `json:"title"`
	Snippet    string `json:"snippet,omitempty"`
	LineNumber int    `json:"line_number,omitempty"`
}

type IncrementalDiffResponse struct {
	FilePath      string                `json:"file_path"`
	BaseCommit    string                `json:"base_commit"`
	TargetCommit  string                `json:"target_commit"`
	TargetMessage string                `json:"target_message"`
	TargetDate    string                `json:"target_date"`
	Stats         DiffStats             `json:"stats"`
	Summary       string                `json:"summary"`
	Sections      []IncrementalSection  `json:"sections"`
}

type DiffStats struct {
	AddedLines   int `json:"added_lines"`
	RemovedLines int `json:"removed_lines"`
}

// GetDocCommitHistory 获取指定 Markdown 文档的 Git 提交历史 (包含工作区未提交检测)
func (rm *RepoManager) GetDocCommitHistory(repo *RepoConfig, relPath string, limit int) ([]DocCommitItem, error) {
	if limit <= 0 || limit > 50 {
		limit = 15
	}

	cleanRel := filepath.ToSlash(filepath.Clean(relPath))
	cleanRel = strings.TrimPrefix(cleanRel, "/")

	// 1. 检查当前工作区该文件是否有未提交的修改
	var items []DocCommitItem
	statusCmd := exec.Command("git", "-C", repo.Path, "status", "--porcelain", "--", cleanRel)
	if out, err := statusCmd.Output(); err == nil && len(bytes.TrimSpace(out)) > 0 {
		items = append(items, DocCommitItem{
			Hash:      "WORKING_TREE",
			ShortHash: "当前未提交",
			Author:    "工作区最新",
			Date:      time.Now().Format("2006-01-02 15:04:05"),
			Message:   "本地工作区未提交之最新增量修改",
			IsCurrent: true,
		})
	}

	// 2. 提取 Git 提交日志
	logCmd := exec.Command("git", "-C", repo.Path, "log", fmt.Sprintf("-n%d", limit), "--pretty=format:%H|%an|%ad|%s", "--date=iso-strict", "--", cleanRel)
	out, err := logCmd.Output()
	if err != nil {
		// 如果不是 git 仓库或暂无提交历史，且有工作区修改则返回工作区项
		if len(items) > 0 {
			return items, nil
		}
		return []DocCommitItem{}, nil
	}

	lines := strings.Split(string(out), "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		parts := strings.SplitN(line, "|", 4)
		if len(parts) < 4 {
			continue
		}
		hash := parts[0]
		short := hash
		if len(short) > 7 {
			short = short[:7]
		}
		dateStr := parts[2]
		if t, err := time.Parse(time.RFC3339, dateStr); err == nil {
			dateStr = t.Local().Format("2006-01-02 15:04:05")
		}

		items = append(items, DocCommitItem{
			Hash:      hash,
			ShortHash: short,
			Author:    parts[1],
			Date:      dateStr,
			Message:   parts[3],
		})
	}

	return items, nil
}

// GetIncrementalDiff 计算纯机械的结构性大块增量 (无 AI、纯确定性)
func (rm *RepoManager) GetIncrementalDiff(repo *RepoConfig, relPath string, commitHash string) (*IncrementalDiffResponse, error) {
	cleanRel := filepath.ToSlash(filepath.Clean(relPath))
	cleanRel = strings.TrimPrefix(cleanRel, "/")

	var diffCmd *exec.Cmd
	var targetMessage string
	var targetDate string
	var baseCommit string
	var targetCommit string

	if commitHash == "" || commitHash == "HEAD" || commitHash == "LATEST" {
		history, _ := rm.GetDocCommitHistory(repo, cleanRel, 1)
		if len(history) > 0 {
			commitHash = history[0].Hash
		} else {
			commitHash = "HEAD"
		}
	}

	if commitHash == "WORKING_TREE" {
		// 工作区与 HEAD 比较
		diffCmd = exec.Command("git", "-C", repo.Path, "diff", "HEAD", "--", cleanRel)
		baseCommit = "HEAD"
		targetCommit = "WORKING_TREE"
		targetMessage = "工作区未提交修改"
		targetDate = time.Now().Format("2006-01-02 15:04:05")
	} else {
		// 校验该 commit 是否有 parent (HEAD~1)
		parentCmd := exec.Command("git", "-C", repo.Path, "rev-parse", "--verify", commitHash+"~1")
		if err := parentCmd.Run(); err == nil {
			diffCmd = exec.Command("git", "-C", repo.Path, "diff", commitHash+"~1", commitHash, "--", cleanRel)
			baseCommit = commitHash + "~1"
		} else {
			// 属于仓库初始第一个 Commit
			diffCmd = exec.Command("git", "-C", repo.Path, "diff-tree", "--root", "-p", commitHash, "--", cleanRel)
			baseCommit = "4b825dc642cb6eb9a060e54bf8d69288fbee4904" // empty tree
		}
		targetCommit = commitHash

		// 读取该 Commit 的元信息
		infoCmd := exec.Command("git", "-C", repo.Path, "log", "-1", "--pretty=format:%ad|%s", "--date=iso-strict", commitHash)
		if infoOut, err := infoCmd.Output(); err == nil {
			parts := strings.SplitN(string(infoOut), "|", 2)
			if len(parts) == 2 {
				if t, err := time.Parse(time.RFC3339, parts[0]); err == nil {
					targetDate = t.Local().Format("2006-01-02 15:04:05")
				} else {
					targetDate = parts[0]
				}
				targetMessage = parts[1]
			}
		}
	}

	rawDiff, err := diffCmd.Output()
	if err != nil {
		return nil, fmt.Errorf("failed to execute git diff: %w", err)
	}

	resp := parseDeterministicIncrementalDiff(string(rawDiff))
	resp.FilePath = cleanRel
	resp.BaseCommit = baseCommit
	resp.TargetCommit = targetCommit
	resp.TargetMessage = targetMessage
	resp.TargetDate = targetDate

	return resp, nil
}

// parseDeterministicIncrementalDiff 纯机械算法提取大块/章节结构，彻底过滤标点与琐碎语句噪音
func parseDeterministicIncrementalDiff(rawDiff string) *IncrementalDiffResponse {
	resp := &IncrementalDiffResponse{
		Sections: make([]IncrementalSection, 0),
	}

	lines := strings.Split(rawDiff, "\n")
	var addedCount int
	var removedCount int

	headingRegex := regexp.MustCompile(`^(\+|-)\s*(#{1,6})\s+(.+)$`)

	// 块追踪状态
	inMermaid := false
	mermaidLines := 0
	mermaidSnippet := ""

	inTable := false
	tableRows := 0
	tableHeader := ""

	consecutiveAddLines := 0
	var blockSnippet strings.Builder

	flushLargeBlock := func() {
		if consecutiveAddLines >= 5 {
			s := strings.TrimSpace(blockSnippet.String())
			runes := []rune(s)
			if len(runes) > 90 {
				s = string(runes[:90]) + "..."
			}
			resp.Sections = append(resp.Sections, IncrementalSection{
				Type:    "add_block",
				Title:   fmt.Sprintf("新增密集分析推演大段 (连续 %d 行)", consecutiveAddLines),
				Snippet: s,
			})
		}
		consecutiveAddLines = 0
		blockSnippet.Reset()
	}

	flushTable := func() {
		if inTable {
			if tableRows >= 2 {
				resp.Sections = append(resp.Sections, IncrementalSection{
					Type:    "add_table",
					Title:   fmt.Sprintf("新增客观利益与数据对比表格 (%d 行)", tableRows),
					Snippet: tableHeader,
				})
			}
			inTable = false
			tableRows = 0
			tableHeader = ""
		}
	}

	for _, line := range lines {
		// 跳过 Git 头部与 Hunk 分隔头
		if strings.HasPrefix(line, "diff --git") || strings.HasPrefix(line, "index ") ||
			strings.HasPrefix(line, "--- ") || strings.HasPrefix(line, "+++ ") ||
			strings.HasPrefix(line, "@@ ") {
			flushLargeBlock()
			flushTable()
			continue
		}

		if strings.HasPrefix(line, "+") && !strings.HasPrefix(line, "+++") {
			addedCount++
			trimmedPlus := strings.TrimPrefix(line, "+")
			trimmedSpace := strings.TrimSpace(trimmedPlus)

			// 1. 检查 Mermaid 代码块
			if strings.HasPrefix(trimmedSpace, "```mermaid") {
				flushLargeBlock()
				flushTable()
				inMermaid = true
				mermaidLines = 0
				mermaidSnippet = ""
				continue
			}
			if inMermaid {
				if strings.HasPrefix(trimmedSpace, "```") {
					resp.Sections = append(resp.Sections, IncrementalSection{
						Type:    "add_diagram",
						Title:   "新增 Mermaid 架构 / 机制推演流程图",
						Snippet: mermaidSnippet,
					})
					inMermaid = false
					mermaidLines = 0
					mermaidSnippet = ""
				} else {
					mermaidLines++
					if mermaidLines == 1 && trimmedSpace != "" {
						mermaidSnippet = trimmedSpace
					}
				}
				continue
			}

			// 2. 检查 Markdown 标题 (#, ##, ###)
			if m := headingRegex.FindStringSubmatch(line); m != nil && m[1] == "+" {
				flushLargeBlock()
				flushTable()
				level := len(m[2])
				cleanTitle := strings.TrimSpace(m[3])
				resp.Sections = append(resp.Sections, IncrementalSection{
					Type:  "add_heading",
					Level: level,
					Title: cleanTitle,
				})
				continue
			}

			// 3. 检查 Markdown 表格行 (| ... |)
			if strings.HasPrefix(trimmedSpace, "|") && strings.HasSuffix(trimmedSpace, "|") {
				flushLargeBlock()
				if !inTable {
					inTable = true
					tableRows = 0
					tableHeader = trimmedSpace
				}
				if !strings.Contains(trimmedSpace, "---") {
					tableRows++
				}
				continue
			} else if inTable {
				flushTable()
			}

			// 4. 统计连续新增非空行 (大段落)
			if trimmedSpace != "" && !strings.HasPrefix(trimmedSpace, "```") {
				consecutiveAddLines++
				if blockSnippet.Len() < 120 {
					if blockSnippet.Len() > 0 {
						blockSnippet.WriteString(" ")
					}
					blockSnippet.WriteString(trimmedSpace)
				}
			} else {
				flushLargeBlock()
			}
			continue
		}

		if strings.HasPrefix(line, "-") && !strings.HasPrefix(line, "---") {
			removedCount++
			flushLargeBlock()
			flushTable()

			// 检查是否删除了核心章节
			if m := headingRegex.FindStringSubmatch(line); m != nil && m[1] == "-" {
				level := len(m[2])
				cleanTitle := strings.TrimSpace(m[3])
				resp.Sections = append(resp.Sections, IncrementalSection{
					Type:  "del_heading",
					Level: level,
					Title: cleanTitle,
				})
			}
			continue
		}

		// 上下文未修改行 (空格开头)
		flushLargeBlock()
		flushTable()
	}

	flushLargeBlock()
	flushTable()

	resp.Stats = DiffStats{
		AddedLines:   addedCount,
		RemovedLines: removedCount,
	}

	// 生成无 AI 的纯客观统计摘要
	var addHeadingCount int
	var delHeadingCount int
	var diagramCount int
	var tableCount int
	var blockCount int

	for _, s := range resp.Sections {
		switch s.Type {
		case "add_heading":
			addHeadingCount++
		case "del_heading":
			delHeadingCount++
		case "add_diagram":
			diagramCount++
		case "add_table":
			tableCount++
		case "add_block":
			blockCount++
		}
	}

	var summaryParts []string
	if addHeadingCount > 0 {
		summaryParts = append(summaryParts, fmt.Sprintf("新增 %d 个核心章节", addHeadingCount))
	}
	if diagramCount > 0 {
		summaryParts = append(summaryParts, fmt.Sprintf("新增 %d 张推演图表", diagramCount))
	}
	if tableCount > 0 {
		summaryParts = append(summaryParts, fmt.Sprintf("新增 %d 张对比表格", tableCount))
	}
	if blockCount > 0 {
		summaryParts = append(summaryParts, fmt.Sprintf("新增 %d 个深度推演大段", blockCount))
	}
	if delHeadingCount > 0 {
		summaryParts = append(summaryParts, fmt.Sprintf("移除 %d 个章节", delHeadingCount))
	}

	if len(summaryParts) == 0 {
		if addedCount > 0 || removedCount > 0 {
			resp.Summary = fmt.Sprintf("本次变更无新增大章节与图表结构（纯微观语句或标点微调，增减行数: +%d/-%d）", addedCount, removedCount)
		} else {
			resp.Summary = "与对比版本相比内容无实质性差异"
		}
	} else {
		resp.Summary = fmt.Sprintf("相较于上一版本：+%d 行 / %s", addedCount, strings.Join(summaryParts, "，"))
	}

	return resp
}

// API: 获取文档 Commit 历史
func (a *App) handleDocHistory(w http.ResponseWriter, r *http.Request) {
	repoID := r.URL.Query().Get("repo")
	queryPath := r.URL.Query().Get("path")

	var repo *RepoConfig
	var relPath string
	var err error

	if repoID != "" {
		repo, err = a.rm.GetRepoByID(repoID)
		if err != nil {
			http.Error(w, `{"error":"invalid repository"}`, http.StatusBadRequest)
			return
		}
		relPath = queryPath
	} else {
		repo, relPath, err = a.rm.FindRepoByRoute(queryPath)
		if err != nil {
			http.Error(w, `{"error":"failed to match repository route"}`, http.StatusBadRequest)
			return
		}
	}

	// 安全校验
	if _, err := a.rm.SafeResolve(repo, relPath); err != nil {
		http.Error(w, `{"error":"access forbidden or file does not exist"}`, http.StatusForbidden)
		return
	}

	history, err := a.rm.GetDocCommitHistory(repo, relPath, 20)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(history)
}

// API: 提取纯机械大块/章节增量
func (a *App) handleDocIncrementalDiff(w http.ResponseWriter, r *http.Request) {
	repoID := r.URL.Query().Get("repo")
	queryPath := r.URL.Query().Get("path")
	commitHash := r.URL.Query().Get("commit")

	var repo *RepoConfig
	var relPath string
	var err error

	if repoID != "" {
		repo, err = a.rm.GetRepoByID(repoID)
		if err != nil {
			http.Error(w, `{"error":"invalid repository"}`, http.StatusBadRequest)
			return
		}
		relPath = queryPath
	} else {
		repo, relPath, err = a.rm.FindRepoByRoute(queryPath)
		if err != nil {
			http.Error(w, `{"error":"failed to match repository route"}`, http.StatusBadRequest)
			return
		}
	}

	// 安全校验
	if _, err := a.rm.SafeResolve(repo, relPath); err != nil {
		http.Error(w, `{"error":"access forbidden or file does not exist"}`, http.StatusForbidden)
		return
	}

	diffResult, err := a.rm.GetIncrementalDiff(repo, relPath, commitHash)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(diffResult)
}
