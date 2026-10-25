package main

import (
	"crypto/sha256"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
	"unicode"
)

// naturalLess 实现自然排序比较：将字符串拆分为文本段和数字段交替序列，
// 文本段按大小写不敏感字典序比较，数字段按数值大小比较。
// 例如: "2-foo" < "10-foo"（数值 2 < 10），而非字典序 "10" < "2"。
func naturalLess(a, b string) bool {
	ia, ib := 0, 0
	for ia < len(a) && ib < len(b) {
		ca, cb := rune(a[ia]), rune(b[ib])
		aDigit, bDigit := unicode.IsDigit(ca), unicode.IsDigit(cb)

		switch {
		case aDigit && bDigit:
			// 跳过前导零
			nza, nzb := ia, ib
			for nza < len(a) && a[nza] == '0' {
				nza++
			}
			for nzb < len(b) && b[nzb] == '0' {
				nzb++
			}
			// 找到数字段结尾
			ea, eb := nza, nzb
			for ea < len(a) && unicode.IsDigit(rune(a[ea])) {
				ea++
			}
			for eb < len(b) && unicode.IsDigit(rune(b[eb])) {
				eb++
			}
			lenA, lenB := ea-nza, eb-nzb
			// 有效位数不同 → 位数少的更小
			if lenA != lenB {
				return lenA < lenB
			}
			// 有效位数相同 → 逐字符比较数字
			for k := 0; k < lenA; k++ {
				if a[nza+k] != b[nzb+k] {
					return a[nza+k] < b[nzb+k]
				}
			}
			// 数值完全相等 → 前导零多的排前面（稳定性）
			if (nza - ia) != (nzb - ib) {
				return (nza - ia) > (nzb - ib)
			}
			ia, ib = ea, eb

		case aDigit != bDigit:
			// 数字段 < 非数字段（数字开头的排前面）
			return aDigit

		default:
			// 两个都是非数字字符，大小写不敏感比较
			la, lb := unicode.ToLower(ca), unicode.ToLower(cb)
			if la != lb {
				return la < lb
			}
			ia++
			ib++
		}
	}
	// 短串是长串的前缀 → 短串更小
	return len(a) < len(b)
}

var ignoredDirNames = map[string]bool{
	".git":          true,
	"node_modules":  true,
	"__pycache__":   true,
	".venv":         true,
	"venv":          true,
	".DS_Store":     true,
	"dist":          true,
	"target":        true,
	"build":         true,
	".pytest_cache": true,
	".mypy_cache":   true,
	".idea":         true,
	".vscode":       true,
	"cache":         true,
	".cache":        true,
	".turbo":        true,
	"comics":        true,
	"downloads":     true,
	"tmp":           true,
	"temp":          true,
	"sources":       true,
	"artifacts":     true,
	".state":        true,
	"vendor":        true,
	"coverage":      true,
	"logs":          true,
	"log":           true,
	"vault":         true,
}

// 文档与有效源码文件白名单（排除海量漫画压缩包、图片、编译二进制、字体地图等杂质）
var allowedDocExtensions = map[string]bool{
	".md":       true,
	".markdown": true,
	".mdown":    true,
	".html":     true,
	".htm":      true,
	".py":       true,
	".sh":       true,
	".bash":     true,
	".zsh":      true,
	".json":     true,
	".yaml":     true,
	".yml":      true,
	".go":       true,
	".rs":       true,
	".js":       true,
	".ts":       true,
	".css":      true,
	".sql":      true,
	".toml":     true,
	".xml":      true,
	".c":        true,
	".cpp":      true,
	".h":        true,
	".conf":     true,
	".ini":      true,
	".txt":        true,
	".csv":        true,
	".java":       true,
	".kt":         true,
	".kts":        true,
	".scala":      true,
	".proto":      true,
	".dockerfile": true,
	".gradle":     true,
	".properties": true,
}

func isAllowedDocFile(name, ext string) bool {
	if allowedDocExtensions[ext] {
		return true
	}
	lower := strings.ToLower(name)
	return lower == "dockerfile" || lower == "makefile"
}

type TreeNode struct {
	Name     string      `json:"name"`
	Path     string      `json:"path"` // 相对于仓库根目录的相对路径 (URL friendly: 使用正斜杠 /)
	IsDir    bool        `json:"is_dir"`
	IsRepo   bool        `json:"is_repo,omitempty"`
	Size     int64       `json:"size,omitempty"`
	ModTime  int64       `json:"mod_time"`
	Ext      string      `json:"ext,omitempty"`
	Children []*TreeNode `json:"children,omitempty"`
}

type RecentFileInfo struct {
	Name      string `json:"name"`
	Path      string `json:"path"`
	FullRoute string `json:"full_route"`
	ModTime   int64  `json:"mod_time"`
	Size      int64  `json:"size"`
	RepoID    string `json:"repo_id"`
	RepoName  string `json:"repo_name"`
}

type FileContentResponse struct {
	Path        string `json:"path"`
	RelPath     string `json:"rel_path"`
	RepoID      string `json:"repo_id"`
	RepoName    string `json:"repo_name"`
	Type        string `json:"type"` // "markdown" | "html" | "code" | "binary"
	Content     string `json:"content,omitempty"`
	Size        int64  `json:"size"`
	Lines       int    `json:"lines"`
	ModTime     int64  `json:"mod_time"`
	RoutePrefix string `json:"route_prefix"`
	Writable    bool   `json:"writable"`
}

type CachedTree struct {
	Root      *TreeNode
	JSONBytes []byte
	ETag      string
	ModTime   time.Time
}

type CachedDoc struct {
	Resp      *FileContentResponse
	JSONBytes []byte
	ModTime   int64
	Size      int64
	ETag      string
}

type RepoManager struct {
	repos     []RepoConfig
	treeCache map[string]*CachedTree
	docCache  map[string]*CachedDoc
	cacheMu   sync.RWMutex
}

func NewRepoManager(repos []RepoConfig) *RepoManager {
	rm := &RepoManager{
		repos:     repos,
		treeCache: make(map[string]*CachedTree),
		docCache:  make(map[string]*CachedDoc),
	}

	// 启动后台静默异步预热所有仓库树，确保用户访问时永远 0ms 命中
	go func() {
		time.Sleep(500 * time.Millisecond)
		for _, r := range repos {
			_, _ = rm.GetCachedTree(r.ID, true)
		}
	}()

	return rm
}

func (rm *RepoManager) GetRepoByID(id string) (*RepoConfig, error) {
	for i := range rm.repos {
		if rm.repos[i].ID == id {
			return &rm.repos[i], nil
		}
	}
	return nil, fmt.Errorf("repository %s not found", id)
}

func (rm *RepoManager) FindRepoByRoute(urlPath string) (*RepoConfig, string, error) {
	cleanURL := "/" + strings.Trim(urlPath, "/")

	sortedRepos := make([]RepoConfig, len(rm.repos))
	copy(sortedRepos, rm.repos)
	sort.Slice(sortedRepos, func(i, j int) bool {
		return len(sortedRepos[i].RoutePrefix) > len(sortedRepos[j].RoutePrefix)
	})

	for _, r := range sortedRepos {
		prefix := "/" + strings.Trim(r.RoutePrefix, "/")
		if prefix == cleanURL {
			return &r, "", nil
		}
		if strings.HasPrefix(cleanURL, prefix+"/") {
			rel := strings.TrimPrefix(cleanURL, prefix+"/")
			return &r, rel, nil
		}
	}

	if len(rm.repos) > 0 {
		return &rm.repos[0], strings.TrimPrefix(cleanURL, "/"), nil
	}

	return nil, "", errors.New("no matching repository found")
}

func isPathPermitted(repo *RepoConfig, cleanRel string) error {
	norm := filepath.ToSlash(cleanRel)
	parts := strings.Split(norm, "/")
	for _, part := range parts {
		if part == "" || part == "." {
			continue
		}
		if strings.HasPrefix(part, ".") {
			return errors.New("access to hidden file or directory is forbidden")
		}
		if ignoredDirNames[part] {
			return fmt.Errorf("access to restricted directory '%s' is forbidden", part)
		}
	}

	// 检查仓库配置中的忽略目录列表
	for _, ign := range repo.IgnoreDirs {
		cleanIgn := filepath.ToSlash(filepath.Clean(filepath.FromSlash(ign)))
		cleanIgn = strings.Trim(cleanIgn, "/")
		if cleanIgn == "" {
			continue
		}
		if norm == cleanIgn || strings.HasPrefix(norm, cleanIgn+"/") {
			return errors.New("access to ignored directory is forbidden")
		}
	}
	return nil
}

func (rm *RepoManager) SafeResolve(repo *RepoConfig, relPath string) (string, error) {
	if strings.Contains(relPath, "\x00") {
		return "", errors.New("invalid path: null byte detected")
	}
	cleanRel := filepath.Clean(filepath.FromSlash(relPath))
	if strings.HasPrefix(cleanRel, "..") || strings.HasPrefix(cleanRel, "/") || filepath.IsAbs(cleanRel) {
		return "", errors.New("invalid path: path traversal detected")
	}

	// 深度安全防护：禁止访问隐藏文件/目录（如 .git, .env）以及受保护/配置忽略的敏感目录
	if err := isPathPermitted(repo, cleanRel); err != nil {
		return "", err
	}

	absPath := filepath.Join(repo.Path, cleanRel)
	realRepo, err := filepath.EvalSymlinks(repo.Path)
	if err != nil {
		realRepo = repo.Path
	}

	realTarget, err := filepath.EvalSymlinks(absPath)
	if err != nil {
		// 目标路径尚不存在时，逐级向上查找最近存在的物理祖先目录并校验是否逃逸仓库
		ancestor := absPath
		for {
			parent := filepath.Dir(ancestor)
			if parent == ancestor || parent == "." || parent == "/" {
				break
			}
			realParent, pErr := filepath.EvalSymlinks(parent)
			if pErr == nil {
				if realParent != realRepo && !strings.HasPrefix(realParent, realRepo+string(filepath.Separator)) {
					return "", errors.New("security check failed: parent directory is outside repository root")
				}
				break
			}
			ancestor = parent
		}
		return absPath, nil
	}

	if realTarget != realRepo && !strings.HasPrefix(realTarget, realRepo+string(filepath.Separator)) {
		return "", errors.New("security check failed: target is outside repository root")
	}

	return absPath, nil
}

func (rm *RepoManager) InvalidateCache(repoID string) {
	rm.cacheMu.Lock()
	delete(rm.treeCache, repoID)
	prefix := repoID + ":"
	for k := range rm.docCache {
		if strings.HasPrefix(k, prefix) {
			delete(rm.docCache, k)
		}
	}
	rm.cacheMu.Unlock()
}

func (rm *RepoManager) GetCachedTree(repoID string, forceRefresh bool) (*CachedTree, error) {
	repo, err := rm.GetRepoByID(repoID)
	if err != nil {
		return nil, err
	}

	rm.cacheMu.RLock()
	cached, ok := rm.treeCache[repoID]
	rm.cacheMu.RUnlock()

	// 内存缓存持久有效（2 小时超长保鲜）；强制刷新时增加 5 秒防抖，防止高频刷新击穿磁盘 I/O
	if ok && !forceRefresh && time.Since(cached.ModTime) < 2*time.Hour {
		return cached, nil
	}
	if ok && forceRefresh && time.Since(cached.ModTime) < 5*time.Second {
		return cached, nil
	}

	ignoreMap := make(map[string]bool)
	for _, ign := range repo.IgnoreDirs {
		clean := filepath.ToSlash(filepath.Clean(ign))
		clean = strings.Trim(clean, "/")
		if clean != "" {
			ignoreMap[clean] = true
		}
	}

	rootNode, err := rm.scanDirectory(repo.Path, "", 0, 10, ignoreMap)
	if err != nil {
		if ok {
			return cached, nil
		}
		return nil, err
	}
	rootNode.Name = repo.Name

	jsonBytes, err := json.Marshal(rootNode)
	if err != nil {
		if ok {
			return cached, nil
		}
		return nil, err
	}

	h := sha256.Sum256(jsonBytes)
	etag := fmt.Sprintf(`"w_%x_%d"`, h[:8], time.Now().Unix())

	newCached := &CachedTree{
		Root:      rootNode,
		JSONBytes: jsonBytes,
		ETag:      etag,
		ModTime:   time.Now(),
	}

	rm.cacheMu.Lock()
	rm.treeCache[repoID] = newCached
	rm.cacheMu.Unlock()

	return newCached, nil
}

func (rm *RepoManager) GetTree(repoID string, forceRefresh bool) (*TreeNode, error) {
	cached, err := rm.GetCachedTree(repoID, forceRefresh)
	if err != nil {
		return nil, err
	}
	return cached.Root, nil
}

func (rm *RepoManager) scanDirectory(realRoot, relPath string, currentDepth, maxDepth int, ignoreMap map[string]bool) (*TreeNode, error) {
	if currentDepth > maxDepth {
		return nil, nil
	}

	currentAbs := filepath.Join(realRoot, relPath)
	info, err := os.Stat(currentAbs)
	if err != nil {
		return nil, err
	}

	node := &TreeNode{
		Name:    info.Name(),
		Path:    filepath.ToSlash(relPath),
		IsDir:   info.IsDir(),
		ModTime: info.ModTime().Unix(),
		Size:    info.Size(),
		Ext:     strings.ToLower(filepath.Ext(info.Name())),
	}

	if !info.IsDir() {
		// 非目录且不在允许白名单内的杂质文件，直接过滤
		if !isAllowedDocFile(node.Name, node.Ext) {
			return nil, nil
		}
		return node, nil
	}

	// 仅浅层目录检查是否独立 git 仓库，消除深层数千次 stat
	if currentDepth <= 2 {
		gitPath := filepath.Join(currentAbs, ".git")
		if _, gErr := os.Stat(gitPath); gErr == nil {
			node.IsRepo = true
		}
	}

	entries, err := os.ReadDir(currentAbs)
	if err != nil {
		return node, nil
	}

	var children []*TreeNode
	for _, entry := range entries {
		name := entry.Name()
		if ignoredDirNames[name] || strings.HasPrefix(name, ".") {
			continue
		}

		childRel := filepath.Join(relPath, name)
		cleanChildRel := filepath.ToSlash(filepath.Clean(childRel))
		cleanChildRel = strings.Trim(cleanChildRel, "/")

		if ignoreMap[cleanChildRel] {
			continue
		}

		if !entry.IsDir() {
			ext := strings.ToLower(filepath.Ext(name))
			if !isAllowedDocFile(name, ext) {
				continue
			}
			fInfo, fErr := entry.Info()
			if fErr != nil {
				continue
			}
			children = append(children, &TreeNode{
				Name:    name,
				Path:    cleanChildRel,
				IsDir:   false,
				ModTime: fInfo.ModTime().Unix(),
				Size:    fInfo.Size(),
				Ext:     ext,
			})
			continue
		}

		childNode, err := rm.scanDirectory(realRoot, childRel, currentDepth+1, maxDepth, ignoreMap)
		if err != nil || childNode == nil {
			continue
		}
		children = append(children, childNode)
	}

	// 如果非根目录且过滤后该目录下无任何有效文档或子目录，剔除空目录
	if currentDepth > 0 && len(children) == 0 {
		return nil, nil
	}

	// 排序：目录在前，按名称字典序
	sort.Slice(children, func(i, j int) bool {
		if children[i].IsDir != children[j].IsDir {
			return children[i].IsDir
		}
		return naturalLess(children[i].Name, children[j].Name)
	})

	node.Children = children
	return node, nil
}

// GetRecentFiles 提取当前仓库（或指定仓库）最近修改/生成的 Markdown 文档
func (rm *RepoManager) GetRecentFiles(repoID string, limit int) ([]RecentFileInfo, error) {
	if limit <= 0 {
		limit = 10
	}

	tree, err := rm.GetTree(repoID, false)
	if err != nil {
		return nil, err
	}

	repo, err := rm.GetRepoByID(repoID)
	if err != nil {
		return nil, err
	}

	cleanPrefix := "/" + strings.Trim(repo.RoutePrefix, "/")

	var allFiles []*TreeNode
	var collectFiles func(n *TreeNode)
	collectFiles = func(n *TreeNode) {
		if n == nil {
			return
		}
		if !n.IsDir {
			if n.Ext == ".md" || n.Ext == ".markdown" {
				allFiles = append(allFiles, n)
			}
			return
		}
		for _, child := range n.Children {
			collectFiles(child)
		}
	}
	collectFiles(tree)

	// 按修改时间降序排序
	sort.Slice(allFiles, func(i, j int) bool {
		return allFiles[i].ModTime > allFiles[j].ModTime
	})

	if len(allFiles) > limit {
		allFiles = allFiles[:limit]
	}

	results := make([]RecentFileInfo, 0, len(allFiles))
	for _, f := range allFiles {
		cleanRel := strings.TrimPrefix(f.Path, "/")
		fullRoute := cleanPrefix + "/" + cleanRel
		results = append(results, RecentFileInfo{
			Name:      f.Name,
			Path:      f.Path,
			FullRoute: fullRoute,
			ModTime:   f.ModTime,
			Size:      f.Size,
			RepoID:    repo.ID,
			RepoName:  repo.Name,
		})
	}

	return results, nil
}

// deduplicatePathSegments 消除相对路径中相邻重复的目录段，例如 a/b/b/c.md -> a/b/c.md
func deduplicatePathSegments(pathStr string) string {
	parts := strings.Split(filepath.ToSlash(pathStr), "/")
	var dedup []string
	for _, p := range parts {
		if p == "" || p == "." {
			continue
		}
		if len(dedup) > 0 && dedup[len(dedup)-1] == p {
			continue
		}
		dedup = append(dedup, p)
	}
	return strings.Join(dedup, "/")
}

func (rm *RepoManager) GetCachedFile(repo *RepoConfig, relPath string) (*CachedDoc, error) {
	absPath, err := rm.SafeResolve(repo, relPath)
	if err != nil {
		return nil, err
	}

	info, statErr := os.Stat(absPath)
	if statErr != nil {
		// 1. 容错：尝试追加 .md 扩展名查找
		candMd := absPath + ".md"
		if cInfo, cErr := os.Stat(candMd); cErr == nil && !cInfo.IsDir() {
			absPath = candMd
			info = cInfo
			relPath = relPath + ".md"
			statErr = nil
		}
	}

	// 2. 容错：若路径存在重复目录层级（如 a/b/b/c），尝试去重后解析
	if statErr != nil {
		dedupRel := deduplicatePathSegments(relPath)
		if dedupRel != relPath {
			if dAbs, dErr := rm.SafeResolve(repo, dedupRel); dErr == nil {
				if dInfo, sErr := os.Stat(dAbs); sErr == nil {
					absPath = dAbs
					info = dInfo
					relPath = dedupRel
					statErr = nil
				} else if dMdInfo, mdErr := os.Stat(dAbs + ".md"); mdErr == nil && !dMdInfo.IsDir() {
					absPath = dAbs + ".md"
					info = dMdInfo
					relPath = dedupRel + ".md"
					statErr = nil
				}
			}
		}
	}

	if statErr != nil {
		return nil, fmt.Errorf("file not found: %w", statErr)
	}

	// 3. 目录智能回退：若目标为目录，自动索引其下的 README.md 或 index.md
	if info.IsDir() {
		candidates := []string{"README.md", "index.md", "readme.md", "Index.md"}
		found := false
		for _, cand := range candidates {
			candPath := filepath.Join(absPath, cand)
			if cInfo, cErr := os.Stat(candPath); cErr == nil && !cInfo.IsDir() {
				absPath = candPath
				info = cInfo
				relPath = filepath.ToSlash(filepath.Join(relPath, cand))
				found = true
				break
			}
		}
		if !found {
			return nil, errors.New("target is a directory without README.md or index.md")
		}
	}

	if info.Size() > 10*1024*1024 {
		return nil, errors.New("file is too large to preview (>10MB)")
	}

	cacheKey := repo.ID + ":" + filepath.ToSlash(relPath)
	modTime := info.ModTime().Unix()
	size := info.Size()

	rm.cacheMu.RLock()
	cached, ok := rm.docCache[cacheKey]
	rm.cacheMu.RUnlock()

	if ok && cached.ModTime == modTime && cached.Size == size {
		return cached, nil
	}

	data, err := os.ReadFile(absPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	ext := strings.ToLower(filepath.Ext(info.Name()))
	if !isAllowedDocFile(info.Name(), ext) {
		return nil, errors.New("file type not allowed for preview")
	}
	fileType := detectFileType(ext)

	lines := strings.Count(string(data), "\n") + 1

	resp := &FileContentResponse{
		Path:        filepath.ToSlash(filepath.Join(repo.RoutePrefix, relPath)),
		RelPath:     filepath.ToSlash(relPath),
		RepoID:      repo.ID,
		RepoName:    repo.Name,
		Type:        fileType,
		Content:     string(data),
		Size:        size,
		Lines:       lines,
		ModTime:     modTime,
		RoutePrefix: repo.RoutePrefix,
		Writable:    repo.Writable,
	}

	jsonBytes, err := json.Marshal(resp)
	if err != nil {
		return nil, err
	}

	etag := fmt.Sprintf(`"doc_%x_%x"`, modTime, size)
	newCached := &CachedDoc{
		Resp:      resp,
		JSONBytes: jsonBytes,
		ModTime:   modTime,
		Size:      size,
		ETag:      etag,
	}

	rm.cacheMu.Lock()
	if len(rm.docCache) > 500 {
		for k := range rm.docCache {
			delete(rm.docCache, k)
			if len(rm.docCache) <= 300 {
				break
			}
		}
	}
	rm.docCache[cacheKey] = newCached
	rm.cacheMu.Unlock()

	return newCached, nil
}

func (rm *RepoManager) ReadFile(repo *RepoConfig, relPath string) (*FileContentResponse, error) {
	cached, err := rm.GetCachedFile(repo, relPath)
	if err != nil {
		return nil, err
	}
	return cached.Resp, nil
}

func detectFileType(ext string) string {
	switch ext {
	case ".md", ".markdown", ".mdown":
		return "markdown"
	case ".html", ".htm":
		return "html"
	case ".py", ".sh", ".bash", ".zsh", ".json", ".yaml", ".yml", ".go", ".rs",
		".js", ".ts", ".css", ".sql", ".toml", ".xml", ".c", ".cpp", ".h",
		".conf", ".ini", ".txt", ".log", ".csv",
		".java", ".kt", ".kts", ".scala", ".proto", ".dockerfile", ".gradle", ".properties":
		return "code"
	default:
		return "text"
	}
}
