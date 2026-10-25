package main

import (
	"bufio"
	"context"
	"errors"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

type SearchResultItem struct {
	RepoID      string `json:"repo_id"`
	RepoName    string `json:"repo_name"`
	Path        string `json:"path"`        // 相对路径
	FullRoute   string `json:"full_route"`  // 前端路由地址，如 /notes/guide.md
	Title       string `json:"title"`       // 提取的 Markdown 标题或文件名
	Snippet     string `json:"snippet"`     // 命中的上下文摘要
	LineNumber  int    `json:"line_number"` // 命中行号 (正文检索模式)
	Ext         string `json:"ext"`         // 扩展名
	ModTime     int64  `json:"mod_time"`
	Score       int    `json:"-"`
}

// Search 执行标题/路径快速匹配或正文全文检索
func (rm *RepoManager) Search(repoID string, query string, mode string, limit int) ([]SearchResultItem, error) {
	q := strings.TrimSpace(query)
	if q == "" {
		return []SearchResultItem{}, nil
	}
	if limit <= 0 || limit > 100 {
		limit = 40
	}

	var targetRepos []*RepoConfig
	if repoID != "" && repoID != "all" {
		repo, err := rm.GetRepoByID(repoID)
		if err != nil {
			return nil, err
		}
		targetRepos = append(targetRepos, repo)
	} else {
		for i := range rm.repos {
			targetRepos = append(targetRepos, &rm.repos[i])
		}
	}

	if mode == "content" {
		return rm.searchContent(targetRepos, q, limit)
	}
	return rm.searchTitlesAndPaths(targetRepos, q, limit)
}

// searchTitlesAndPaths 从内存缓存树中毫秒级检索标题与路径
func (rm *RepoManager) searchTitlesAndPaths(repos []*RepoConfig, query string, limit int) ([]SearchResultItem, error) {
	var results []SearchResultItem
	lowerQ := strings.ToLower(query)

	for _, repo := range repos {
		cached, err := rm.GetCachedTree(repo.ID, false)
		if err != nil || cached == nil || cached.Root == nil {
			continue
		}

		var collect func(node *TreeNode)
		collect = func(node *TreeNode) {
			if node == nil {
				return
			}
			if !node.IsDir {
				nameLower := strings.ToLower(node.Name)
				pathLower := strings.ToLower(node.Path)

				score := 0
				if nameLower == lowerQ {
					score = 100 // 文件名完全一致
				} else if strings.HasPrefix(nameLower, lowerQ) {
					score = 80  // 文件名前缀匹配
				} else if strings.Contains(nameLower, lowerQ) {
					score = 60  // 文件名包含
				} else if strings.Contains(pathLower, lowerQ) {
					score = 30  // 路径包含
				}

				if score > 0 {
					cleanPath := strings.TrimPrefix(filepath.ToSlash(node.Path), "/")
					cleanPrefix := "/" + strings.Trim(repo.RoutePrefix, "/")
					fullRoute := cleanPrefix + "/" + cleanPath
					if cleanPrefix == "/" {
						fullRoute = "/" + cleanPath
					}

					// 尝试从文件名推导易读标题
					title := node.Name
					ext := strings.ToLower(filepath.Ext(node.Name))
					if ext != "" {
						title = strings.TrimSuffix(node.Name, ext)
					}

					results = append(results, SearchResultItem{
						RepoID:     repo.ID,
						RepoName:   repo.Name,
						Path:       cleanPath,
						FullRoute:  fullRoute,
						Title:      title,
						Ext:        ext,
						ModTime:    node.ModTime,
						Score:      score,
					})
				}
			}

			for _, child := range node.Children {
				collect(child)
			}
		}

		collect(cached.Root)
	}

	// 按相关度降序、修改时间降序排序
	sort.Slice(results, func(i, j int) bool {
		if results[i].Score != results[j].Score {
			return results[i].Score > results[j].Score
		}
		return results[i].ModTime > results[j].ModTime
	})

	if len(results) > limit {
		results = results[:limit]
	}

	return results, nil
}

// searchContent 在白名单文档中逐行扫描正文内容并提取 Snippet
func (rm *RepoManager) searchContent(repos []*RepoConfig, query string, limit int) ([]SearchResultItem, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 4*time.Second)
	defer cancel()

	var results []SearchResultItem
	lowerQ := strings.ToLower(query)

	for _, repo := range repos {
		if ctx.Err() != nil || len(results) >= limit {
			break
		}

		cached, err := rm.GetCachedTree(repo.ID, false)
		if err != nil || cached == nil || cached.Root == nil {
			continue
		}

		var docNodes []*TreeNode
		var collectDocNodes func(node *TreeNode)
		collectDocNodes = func(node *TreeNode) {
			if node == nil {
				return
			}
			if !node.IsDir {
				ext := strings.ToLower(filepath.Ext(node.Name))
				// 仅全文检索文本与代码类白名单
				if allowedDocExtensions[ext] {
					docNodes = append(docNodes, node)
				}
			}
			for _, child := range node.Children {
				collectDocNodes(child)
			}
		}
		collectDocNodes(cached.Root)

		for _, node := range docNodes {
			if ctx.Err() != nil || len(results) >= limit {
				break
			}

			// 单文件限制最大 3MB，防止超大日志卡顿
			if node.Size > 3*1024*1024 {
				continue
			}

			absPath := filepath.Join(repo.Path, filepath.FromSlash(node.Path))
			item, found := scanFileForQuery(ctx, repo, node, absPath, lowerQ)
			if found {
				results = append(results, item)
			}
		}
	}

	// 优先按匹配分数，其次最后修改时间排序
	sort.Slice(results, func(i, j int) bool {
		if results[i].Score != results[j].Score {
			return results[i].Score > results[j].Score
		}
		return results[i].ModTime > results[j].ModTime
	})

	if len(results) > limit {
		results = results[:limit]
	}

	return results, nil
}

// scanFileForQuery 快速扫描单个文件并提取命中的上下文行
func scanFileForQuery(ctx context.Context, repo *RepoConfig, node *TreeNode, absPath string, lowerQ string) (SearchResultItem, bool) {
	f, err := os.Open(absPath)
	if err != nil {
		return SearchResultItem{}, false
	}
	defer f.Close()

	reader := bufio.NewReader(f)
	lineNum := 0
	matchedLine := ""
	matchedLineNum := 0
	docTitle := ""
	score := 20

	ext := strings.ToLower(filepath.Ext(node.Name))
	isMarkdown := ext == ".md" || ext == ".markdown" || ext == ".mdown"

	for {
		if ctx.Err() != nil {
			return SearchResultItem{}, false
		}
		lineBytes, isPrefix, err := reader.ReadLine()
		if err != nil {
			if errors.Is(err, io.EOF) {
				break
			}
			return SearchResultItem{}, false
		}
		// 如果一行过长被切分，忽略后续长尾部分避免内存占用
		if isPrefix {
			for isPrefix && err == nil {
				_, isPrefix, err = reader.ReadLine()
			}
		}

		lineNum++
		line := string(lineBytes)
		trimmed := strings.TrimSpace(line)

		// 提取 Markdown 的首个一级/二级标题作为文章真实标题
		if isMarkdown && docTitle == "" && (strings.HasPrefix(trimmed, "# ") || strings.HasPrefix(trimmed, "## ")) {
			docTitle = strings.TrimSpace(strings.TrimLeft(trimmed, "# "))
		}

		// 检查关键词匹配（记录第一次命中即可，避免单文档重复）
		if matchedLine == "" {
			if idx := strings.Index(strings.ToLower(line), lowerQ); idx != -1 {
				matchedLine = line
				matchedLineNum = lineNum
				score = 50
			}
		}

		// 如果找到了标题和命中行，且读取超过 100 行，可快速退出该文件
		if matchedLine != "" && (docTitle != "" || !isMarkdown || lineNum > 30) {
			break
		}
	}

	if matchedLine == "" {
		return SearchResultItem{}, false
	}

	// 格式化 Snippet 片段（关键词周围高亮区域）
	snippet := makeSnippet(matchedLine, lowerQ, 140)

	if docTitle == "" {
		if ext != "" {
			docTitle = strings.TrimSuffix(node.Name, ext)
		} else {
			docTitle = node.Name
		}
	}

	cleanPath := strings.TrimPrefix(filepath.ToSlash(node.Path), "/")
	cleanPrefix := "/" + strings.Trim(repo.RoutePrefix, "/")
	fullRoute := cleanPrefix + "/" + cleanPath
	if cleanPrefix == "/" {
		fullRoute = "/" + cleanPath
	}

	return SearchResultItem{
		RepoID:     repo.ID,
		RepoName:   repo.Name,
		Path:       cleanPath,
		FullRoute:  fullRoute,
		Title:      docTitle,
		Snippet:    snippet,
		LineNumber: matchedLineNum,
		Ext:        ext,
		ModTime:    node.ModTime,
		Score:      score,
	}, true
}

// makeSnippet 从命中行截取关键词前后的文字，添加省略号
func makeSnippet(line string, lowerQ string, maxLen int) string {
	line = strings.TrimSpace(line)
	// 去除多余连续空白符
	fields := strings.Fields(line)
	compactLine := strings.Join(fields, " ")

	lowerLine := strings.ToLower(compactLine)
	idx := strings.Index(lowerLine, lowerQ)
	if idx == -1 {
		if len([]rune(compactLine)) > maxLen {
			return string([]rune(compactLine)[:maxLen]) + "..."
		}
		return compactLine
	}

	runes := []rune(compactLine)
	qRunesLen := len([]rune(lowerQ))
	matchStartRune := len([]rune(compactLine[:idx]))

	half := (maxLen - qRunesLen) / 2
	start := matchStartRune - half
	prefix := "..."
	if start <= 0 {
		start = 0
		prefix = ""
	}

	end := start + maxLen
	suffix := "..."
	if end >= len(runes) {
		end = len(runes)
		suffix = ""
	}

	return prefix + string(runes[start:end]) + suffix
}
