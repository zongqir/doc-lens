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
		_, _ = io.Copy(w, indexFile)
	})

	return a.gzipMiddleware(a.corsAndSecurityMiddleware(mux))
}

type gzipResponseWriter struct {
	io.Writer
	http.ResponseWriter
}

func (w gzipResponseWriter) Write(b []byte) (int, error) {
	return w.Writer.Write(b)
}

func (a *App) gzipMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.Contains(r.Header.Get("Accept-Encoding"), "gzip") {
			next.ServeHTTP(w, r)
			return
		}
		w.Header().Set("Content-Encoding", "gzip")
		gz := gzip.NewWriter(w)
		defer gz.Close()
		gzw := gzipResponseWriter{Writer: gz, ResponseWriter: w}
		next.ServeHTTP(gzw, r)
	})
}

func (a *App) corsAndSecurityMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "SAMEORIGIN")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
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
	if !limiter.Allow(ip) {
		http.Error(w, `{"error":"too many attempts, locked for 15 minutes"}`, http.StatusTooManyRequests)
		return
	}

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

	SetAuthCookie(w, token, a.cfg.Auth.SessionDays)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"success": true,
		"token":   token,
		"expires": a.cfg.Auth.SessionDays,
	})
}

func (a *App) handleLogout(w http.ResponseWriter, r *http.Request) {
	ClearAuthCookie(w)
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
	_ = json.NewEncoder(w).Encode(a.cfg.Repositories)
}

func (a *App) handleTree(w http.ResponseWriter, r *http.Request) {
	repoID := r.URL.Query().Get("repo")
	if repoID == "" && len(a.cfg.Repositories) > 0 {
		repoID = a.cfg.Repositories[0].ID
	}
	refresh := r.URL.Query().Get("refresh") == "true"

	tree, err := a.rm.GetTree(repoID, refresh)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(tree)
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

	contentResp, err := a.rm.ReadFile(repo, relPath)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(contentResp)
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

	// 针对 HTML 设置沙箱安全头
	if strings.HasSuffix(strings.ToLower(absPath), ".html") || strings.HasSuffix(strings.ToLower(absPath), ".htm") {
		w.Header().Set("Content-Security-Policy", "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:;")
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
		if req.Prompt == "" {
			http.Error(w, `{"error":"prompt cannot be empty"}`, http.StatusBadRequest)
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
