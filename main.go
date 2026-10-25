package main

import (
	"compress/gzip"
	"embed"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"io/fs"
	"log"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

//go:embed web/*
var embeddedWeb embed.FS

type App struct {
	cfg     *Config
	rm      *RepoManager
	tm      *TaskManager
	cfgPath string
}

func main() {
	cfgPath := flag.String("config", "config.yaml", "path to yaml config file")
	flag.Parse()

	cfg, err := LoadConfig(*cfgPath)
	if err != nil {
		log.Fatalf("Fatal: failed to load config: %v", err)
	}

	rm := NewRepoManager(cfg.Repositories)
	tm := NewTaskManager(cfg, rm)

	_ = os.MkdirAll(cfg.StateDir, 0755)
	logFile, err := os.OpenFile(filepath.Join(cfg.StateDir, "access.log"), os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0644)
	if err == nil {
		log.SetOutput(io.MultiWriter(os.Stderr, logFile))
	}

	app := &App{
		cfg:     cfg,
		rm:      rm,
		tm:      tm,
		cfgPath: *cfgPath,
	}

	server := &http.Server{
		Addr:         fmt.Sprintf("%s:%d", cfg.Host, cfg.Port),
		Handler:      app.routes(),
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 60 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	log.Printf("[doc-lens] Server starting on http://%s:%d", cfg.Host, cfg.Port)
	log.Printf("[doc-lens] Mounted %d repositories. StateDir: %s", len(cfg.Repositories), cfg.StateDir)
	if cfg.Auth.InitialPass != "" {
		log.Printf("[doc-lens] Initial password is '%s' (please change in config.yaml)", cfg.Auth.InitialPass)
	}

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server stopped: %v", err)
	}
}

func (a *App) routes() http.Handler {
	mux := http.NewServeMux()

	// 1. 认证相关 API
	mux.HandleFunc("/api/auth/login", a.handleLogin)
	mux.HandleFunc("/api/auth/logout", a.handleLogout)
	mux.HandleFunc("/api/auth/me", a.handleAuthMe)

	// 2. 仓库与文件树 API (需要认证)
	mux.HandleFunc("/api/repos", a.requireAuth(a.handleRepos))
	mux.HandleFunc("/api/tree", a.requireAuth(a.handleTree))
	mux.HandleFunc("/api/recent", a.requireAuth(a.handleRecent))
	mux.HandleFunc("/api/content", a.requireAuth(a.handleContent))
	mux.HandleFunc("/api/search", a.requireAuth(a.handleSearch))

	// 3. AI 异步任务 API (需要认证)
	mux.HandleFunc("/api/tasks", a.requireAuth(a.handleTasks))
	mux.HandleFunc("/api/tasks/", a.requireAuth(a.handleTaskDetail))

	// 4. 原始文件直读 (供 HTML 沙箱 Iframe 读取，需要认证)
	mux.HandleFunc("/raw/", a.requireAuth(a.handleRaw))

	// 5. 静态资源与前端 SPA 路由
	webFS, err := fs.Sub(embeddedWeb, "web")
	if err != nil {
		log.Fatalf("Failed to extract embedded web assets: %v", err)
	}
	_ = mime.AddExtensionType(".svg", "image/svg+xml")
	_ = mime.AddExtensionType(".ico", "image/x-icon")
	_ = mime.AddExtensionType(".woff2", "font/woff2")
	_ = mime.AddExtensionType(".woff", "font/woff")
	fileServer := http.FileServer(http.FS(webFS))

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path

		// 如果是明确的静态资源（包含扩展名如 .js, .css, .svg, .png, .ico, .woff2）
		if strings.HasPrefix(path, "/js/") || strings.HasPrefix(path, "/css/") || strings.HasPrefix(path, "/fonts/") || strings.HasPrefix(path, "/assets/") || strings.HasSuffix(path, ".ico") || strings.HasSuffix(path, ".svg") || strings.HasSuffix(path, ".png") || strings.HasSuffix(path, ".woff2") || strings.HasSuffix(path, ".woff") {
			if strings.HasSuffix(path, ".woff2") || strings.HasSuffix(path, ".woff") || strings.Contains(path, "mermaid.min.js") || strings.Contains(path, "markdown-it.min.js") || strings.Contains(path, "prism.min.") {
				w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
			} else if strings.HasSuffix(path, "/app.js") || strings.HasSuffix(path, "/style.css") {
				w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
				w.Header().Set("Pragma", "no-cache")
				w.Header().Set("Expires", "0")
				w.Header().Set("CDN-Cache-Control", "no-store")
				w.Header().Set("Cloudflare-CDN-Cache-Control", "no-store, no-cache, max-age=0, must-revalidate")
			} else if r.URL.RawQuery != "" {
				w.Header().Set("Cache-Control", "public, max-age=604800")
			} else {
				w.Header().Set("Cache-Control", "public, max-age=3600, must-revalidate")
			}
			fileServer.ServeHTTP(w, r)
			return
		}

		// 检查静态文件是否存在
		f, err := webFS.Open(strings.TrimPrefix(path, "/"))
		if err == nil {
			f.Close()
			if strings.Contains(path, "mermaid.min.js") || strings.Contains(path, "markdown-it.min.js") || strings.Contains(path, "prism.min.") {
				w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
			} else if strings.HasSuffix(path, "/app.js") || strings.HasSuffix(path, "/style.css") {
				w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
				w.Header().Set("Pragma", "no-cache")
				w.Header().Set("Expires", "0")
				w.Header().Set("CDN-Cache-Control", "no-store")
				w.Header().Set("Cloudflare-CDN-Cache-Control", "no-store, no-cache, max-age=0, must-revalidate")
			} else if r.URL.RawQuery != "" {
				w.Header().Set("Cache-Control", "public, max-age=604800")
			} else {
				w.Header().Set("Cache-Control", "public, max-age=3600, must-revalidate")
			}
			fileServer.ServeHTTP(w, r)
			return
		}

		// 其余所有路由（例如 /files/os/career/xxx.md 或 /）全部返回 index.html（SPA 路由处理）
		indexFile, err := webFS.Open("index.html")
		if err != nil {
			http.Error(w, "index.html missing", http.StatusInternalServerError)
			return
		}
		defer indexFile.Close()

		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
		w.Header().Set("Pragma", "no-cache")
		w.Header().Set("Expires", "0")
		w.Header().Set("CDN-Cache-Control", "no-store")
		w.Header().Set("Cloudflare-CDN-Cache-Control", "no-store, no-cache, max-age=0, must-revalidate")
		_, _ = io.Copy(w, indexFile)
	})

	return a.loggerMiddleware(a.gzipMiddleware(a.corsAndSecurityMiddleware(a.apiRateLimitMiddleware(mux))))
}

func (a *App) loggerMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		duration := time.Since(start)
		log.Printf("[REQ] %s %s from %s took %v", r.Method, r.URL.Path, r.RemoteAddr, duration)
	})
}

type gzipResponseWriter struct {
	http.ResponseWriter
	gz          *gzip.Writer
	wroteHeader bool
	statusCode  int
}

func (w *gzipResponseWriter) WriteHeader(code int) {
	if w.wroteHeader {
		return
	}
	w.statusCode = code
	w.wroteHeader = true
	// 304 Not Modified 与 204 No Content 禁止包含 Content-Encoding 及 body
	if code == http.StatusNotModified || code == http.StatusNoContent {
		w.Header().Del("Content-Encoding")
		w.ResponseWriter.WriteHeader(code)
		return
	}
	// 关键修复：开启 gzip 后原有的 Content-Length 不再准确，必须立即删除！
	// 否则 HTTP/2 客户端（浏览器/反向代理）发现实际接收字节与 Content-Length 不符时，会报 net::ERR_HTTP2_PROTOCOL_ERROR
	w.Header().Del("Content-Length")
	w.Header().Set("Content-Encoding", "gzip")
	w.ResponseWriter.WriteHeader(code)
}

func (w *gzipResponseWriter) Write(b []byte) (int, error) {
	if !w.wroteHeader {
		w.WriteHeader(http.StatusOK)
	}
	if w.statusCode == http.StatusNotModified || w.statusCode == http.StatusNoContent {
		return 0, nil
	}
	if w.gz == nil {
		w.gz = gzip.NewWriter(w.ResponseWriter)
	}
	return w.gz.Write(b)
}

func (w *gzipResponseWriter) Close() error {
	if w.gz != nil {
		return w.gz.Close()
	}
	return nil
}

func (a *App) gzipMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// HEAD 请求无响应体，或不支持 gzip 的请求直接放行
		if r.Method == http.MethodHead || !strings.Contains(r.Header.Get("Accept-Encoding"), "gzip") {
			next.ServeHTTP(w, r)
			return
		}
		// 常见二进制/字体/图像资源本身已具备高压缩率，跳过 gzip 避免无谓开销
		ext := strings.ToLower(filepath.Ext(r.URL.Path))
		if ext == ".woff2" || ext == ".png" || ext == ".jpg" || ext == ".jpeg" || ext == ".gif" || ext == ".ico" || ext == ".webp" {
			next.ServeHTTP(w, r)
			return
		}
		gzw := &gzipResponseWriter{ResponseWriter: w, statusCode: http.StatusOK}
		defer gzw.Close()
		next.ServeHTTP(gzw, r)
	})
}

func (a *App) apiRateLimitMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 仅针对 /api/ 应用分 IP 令牌桶限流保护（每秒 2 个，突发 40 个，即 120 req/min）
		if strings.HasPrefix(r.URL.Path, "/api/") {
			ip := GetClientIP(r)
			if !globalAPILimiter.Allow(ip, 2.0, 40.0) {
				w.Header().Set("Retry-After", "5")
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusTooManyRequests)
				_, _ = w.Write([]byte(`{"error":"too many requests, please slow down"}`))
				return
			}
		}
		next.ServeHTTP(w, r)
	})
}

func (a *App) corsAndSecurityMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "SAMEORIGIN")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		w.Header().Set("X-XSS-Protection", "1; mode=block")
		next.ServeHTTP(w, r)
	})
}

func (a *App) requireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !IsAuthenticated(r, a.cfg.Auth.SessionSecret) {
			http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
			return
		}
		next(w, r)
	}
}

func (a *App) handleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	ip := GetClientIP(r)

	// 全局登录请求限流（防止分布式请求耗尽 NAS CPU）
	if !globalLoginLimiter.Allow("global_login", 10.0, 20.0) {
		http.Error(w, `{"error":"system busy, please try again later"}`, http.StatusTooManyRequests)
		return
	}

	// 单 IP 高频探测限制（30秒内最多10次）
	if !limiter.AllowAttempt(ip) {
		http.Error(w, `{"error":"too many attempts, please slow down"}`, http.StatusTooManyRequests)
		return
	}

	// 密码错误锁定限制（15分钟输错5次锁定）
	if !limiter.Allow(ip) {
		http.Error(w, `{"error":"too many attempts, locked for 15 minutes"}`, http.StatusTooManyRequests)
		return
	}

	// 安全加固：限制请求体最大 1KB，防止巨型 Body OOM
	r.Body = http.MaxBytesReader(w, r.Body, 1024)

	var req struct {
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid json request"}`, http.StatusBadRequest)
		return
	}

	if !VerifyPassword(a.cfg.Auth.PasswordHash, req.Password) {
		limiter.RecordFail(ip)
		http.Error(w, `{"error":"invalid password"}`, http.StatusUnauthorized)
		return
	}

	limiter.Reset(ip)
	token, err := CreateSessionToken(a.cfg.Auth.SessionSecret, a.cfg.Auth.SessionDays)
	if err != nil {
		http.Error(w, `{"error":"failed to generate session"}`, http.StatusInternalServerError)
		return
	}

	SetAuthCookie(w, r, token, a.cfg.Auth.SessionDays)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"success": true,
		"token":   token,
		"expires": a.cfg.Auth.SessionDays,
	})
}

func (a *App) handleLogout(w http.ResponseWriter, r *http.Request) {
	ClearAuthCookie(w, r)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

func (a *App) handleAuthMe(w http.ResponseWriter, r *http.Request) {
	authed := IsAuthenticated(r, a.cfg.Auth.SessionSecret)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"authenticated": authed,
	})
}

func (a *App) handleRepos(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "private, max-age=300, stale-while-revalidate=3600")
	_ = json.NewEncoder(w).Encode(a.cfg.Repositories)
}

func (a *App) handleTree(w http.ResponseWriter, r *http.Request) {
	repoID := r.URL.Query().Get("repo")
	if repoID == "" && len(a.cfg.Repositories) > 0 {
		repoID = a.cfg.Repositories[0].ID
	}
	refresh := r.URL.Query().Get("refresh") == "true"

	cached, err := a.rm.GetCachedTree(repoID, refresh)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusBadRequest)
		return
	}

	w.Header().Set("ETag", cached.ETag)
	if refresh {
		w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	} else {
		w.Header().Set("Cache-Control", "private, max-age=120, stale-while-revalidate=600")
	}

	// 304 条件协商快速返回，0 毫秒零字节穿透
	if match := r.Header.Get("If-None-Match"); match != "" && strings.Contains(match, cached.ETag) {
		w.WriteHeader(http.StatusNotModified)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_, _ = w.Write(cached.JSONBytes)
}

func (a *App) handleRecent(w http.ResponseWriter, r *http.Request) {
	repoID := r.URL.Query().Get("repo")
	if repoID == "" && len(a.cfg.Repositories) > 0 {
		repoID = a.cfg.Repositories[0].ID
	}
	limit := 10
	if lStr := r.URL.Query().Get("limit"); lStr != "" {
		if l, err := strconv.Atoi(lStr); err == nil && l > 0 && l <= 50 {
			limit = l
		}
	}

	recentFiles, err := a.rm.GetRecentFiles(repoID, limit)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "private, max-age=60, stale-while-revalidate=300")
	_ = json.NewEncoder(w).Encode(recentFiles)
}

func (a *App) handleContent(w http.ResponseWriter, r *http.Request) {
	queryPath := r.URL.Query().Get("path")
	repoID := r.URL.Query().Get("repo")

	var repo *RepoConfig
	var relPath string
	var err error

	if repoID != "" {
		repo, err = a.rm.GetRepoByID(repoID)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusBadRequest)
			return
		}
		relPath = queryPath
	} else {
		// 根据 URL 路径智能匹配仓库
		repo, relPath, err = a.rm.FindRepoByRoute(queryPath)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusBadRequest)
			return
		}
	}

	cachedDoc, err := a.rm.GetCachedFile(repo, relPath)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusNotFound)
		return
	}

	w.Header().Set("ETag", cachedDoc.ETag)
	w.Header().Set("Cache-Control", "private, max-age=180, stale-while-revalidate=1800")

	// 304 条件协商快速返回
	if match := r.Header.Get("If-None-Match"); match != "" && strings.Contains(match, cachedDoc.ETag) {
		w.WriteHeader(http.StatusNotModified)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_, _ = w.Write(cachedDoc.JSONBytes)
}

func (a *App) handleSearch(w http.ResponseWriter, r *http.Request) {
	q := strings.TrimSpace(r.URL.Query().Get("q"))
	if q == "" {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode([]SearchResultItem{})
		return
	}

	repoID := r.URL.Query().Get("repo")
	mode := r.URL.Query().Get("mode")
	if mode != "content" {
		mode = "title"
	}

	limit := 35
	if lStr := r.URL.Query().Get("limit"); lStr != "" {
		if l, err := strconv.Atoi(lStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	results, err := a.rm.Search(repoID, q, mode, limit)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "private, no-cache")
	_ = json.NewEncoder(w).Encode(results)
}

var allowedRawExtensions = map[string]bool{
	".html":     true,
	".htm":      true,
	".md":       true,
	".markdown": true,
	".mdown":    true,
	".txt":      true,
	".json":     true,
	".css":      true,
	".js":       true,
	".svg":      true,
	".png":      true,
	".jpg":      true,
	".jpeg":     true,
	".gif":      true,
	".webp":     true,
	".ico":      true,
}

func (a *App) handleRaw(w http.ResponseWriter, r *http.Request) {
	rawPath := strings.TrimPrefix(r.URL.Path, "/raw")
	repo, relPath, err := a.rm.FindRepoByRoute(rawPath)
	if err != nil {
		http.Error(w, "repository not found", http.StatusNotFound)
		return
	}

	absPath, err := a.rm.SafeResolve(repo, relPath)
	if err != nil {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	if _, sErr := os.Stat(absPath); sErr != nil {
		dedupRel := deduplicatePathSegments(relPath)
		if dedupRel != relPath {
			if dAbs, dErr := a.rm.SafeResolve(repo, dedupRel); dErr == nil {
				if _, sdErr := os.Stat(dAbs); sdErr == nil {
					absPath = dAbs
				}
			}
		}
	}

	ext := strings.ToLower(filepath.Ext(absPath))
	if !allowedRawExtensions[ext] {
		http.Error(w, "forbidden file extension", http.StatusForbidden)
		return
	}

	// 针对 HTML 与 SVG 实施沙箱化 CSP 与防嗅探，杜绝同源 XSS 攻击
	if ext == ".html" || ext == ".htm" {
		w.Header().Set("Content-Security-Policy", "sandbox allow-scripts allow-forms; default-src 'self' 'unsafe-inline' data: blob: https:;")
		w.Header().Set("X-Content-Type-Options", "nosniff")
	} else if ext == ".svg" {
		w.Header().Set("Content-Security-Policy", "sandbox; default-src 'none'; img-src 'self' data:;")
		w.Header().Set("X-Content-Type-Options", "nosniff")
	}

	http.ServeFile(w, r, absPath)
}

func (a *App) handleTasks(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		limit := 20
		if lStr := r.URL.Query().Get("limit"); lStr != "" {
			if l, err := strconv.Atoi(lStr); err == nil && l > 0 {
				limit = l
			}
		}
		tasks := a.tm.ListTasks(limit)
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(tasks)
		return
	}

	if r.Method == http.MethodPost {
		// 安全加固：限制请求体最大 32KB，防止巨型 Prompt OOM 同时支持 5000 汉字 UTF-8
		r.Body = http.MaxBytesReader(w, r.Body, 32*1024)

		var req struct {
			Type       string `json:"type"`        // "draft" | "explain"
			RepoID     string `json:"repo_id"`
			TargetFile string `json:"target_file"` // 相对路径，如 "2026-10-25-新研究.md"
			Prompt     string `json:"prompt"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"error":"invalid json request"}`, http.StatusBadRequest)
			return
		}
		if strings.TrimSpace(req.Prompt) == "" {
			http.Error(w, `{"error":"prompt cannot be empty"}`, http.StatusBadRequest)
			return
		}
		if len([]rune(req.Prompt)) > 5000 {
			http.Error(w, `{"error":"prompt too long (max 5000 chars)"}`, http.StatusBadRequest)
			return
		}
		if req.Type == "" {
			req.Type = "draft"
		}
		if req.RepoID == "" && len(a.cfg.Repositories) > 0 {
			req.RepoID = a.cfg.Repositories[0].ID
		}

		task, err := a.tm.SubmitTask(req.Type, req.RepoID, req.TargetFile, req.Prompt)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(task)
		return
	}

	http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
}

func (a *App) handleTaskDetail(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/api/tasks/")
	parts := strings.Split(path, "/")
	taskID := parts[0]

	if len(parts) > 1 && parts[1] == "logs" {
		tailBytes := int64(50000) // 默认读取最后 50KB 日志
		if tStr := r.URL.Query().Get("tail"); tStr != "" {
			if t, err := strconv.ParseInt(tStr, 10, 64); err == nil && t > 0 {
				tailBytes = t
			}
		}
		if tailBytes > 512*1024 {
			tailBytes = 512 * 1024 // 安全硬上限 512KB
		}
		logContent, err := a.tm.ReadTaskLog(taskID, tailBytes)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusNotFound)
			return
		}
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		_, _ = w.Write([]byte(logContent))
		return
	}

	task := a.tm.GetTask(taskID)
	if task == nil {
		http.Error(w, `{"error":"task not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(task)
}
