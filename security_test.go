package main

import (
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestSecurity_GetClientIP(t *testing.T) {
	// 验证 CF-Connecting-IP 必须优先于伪造的 X-Forwarded-For 和 X-Real-IP
	req := httptest.NewRequest("GET", "/api/test", nil)
	req.Header.Set("X-Forwarded-For", "1.1.1.1, 2.2.2.2")
	req.Header.Set("X-Real-IP", "3.3.3.3")
	req.Header.Set("CF-Connecting-IP", "4.4.4.4")
	req.RemoteAddr = "127.0.0.1:12345"

	ip := GetClientIP(req)
	if ip != "4.4.4.4" {
		t.Fatalf("expected CF-Connecting-IP '4.4.4.4', got '%s'", ip)
	}

	// 当无 CF 头时，优先 X-Real-IP
	req2 := httptest.NewRequest("GET", "/api/test", nil)
	req2.Header.Set("X-Forwarded-For", "1.1.1.1")
	req2.Header.Set("X-Real-IP", "3.3.3.3")
	if ip2 := GetClientIP(req2); ip2 != "3.3.3.3" {
		t.Fatalf("expected X-Real-IP '3.3.3.3', got '%s'", ip2)
	}

	// 当仅有 RemoteAddr 时，正常剥离端口
	req3 := httptest.NewRequest("GET", "/api/test", nil)
	req3.RemoteAddr = "192.168.1.100:54321"
	if ip3 := GetClientIP(req3); ip3 != "192.168.1.100" {
		t.Fatalf("expected RemoteAddr host '192.168.1.100', got '%s'", ip3)
	}
}

func TestSecurity_IsSecureRequest(t *testing.T) {
	// 普通 HTTP
	req1 := httptest.NewRequest("GET", "http://localhost:18086", nil)
	if isSecureRequest(req1) {
		t.Fatalf("expected plain HTTP to be non-secure")
	}

	// 经由反代或 Cloudflare Tunnel 转发的 HTTPS
	req2 := httptest.NewRequest("GET", "http://localhost:18086", nil)
	req2.Header.Set("X-Forwarded-Proto", "https")
	if !isSecureRequest(req2) {
		t.Fatalf("expected X-Forwarded-Proto: https to be detected as secure")
	}

	req3 := httptest.NewRequest("GET", "http://localhost:18086", nil)
	req3.Header.Set("CF-Visitor", `{"scheme":"https"}`)
	if !isSecureRequest(req3) {
		t.Fatalf("expected CF-Visitor https to be detected as secure")
	}
}

func TestSecurity_SafeResolve_And_ForbiddenPaths(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "doclens_sec_test_*")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tempDir)

	// 创建合法文件与敏感目录
	_ = os.WriteFile(filepath.Join(tempDir, "doc.md"), []byte("# Hello"), 0644)
	_ = os.MkdirAll(filepath.Join(tempDir, "vault"), 0755)
	_ = os.WriteFile(filepath.Join(tempDir, "vault", "secret.key"), []byte("secret"), 0600)
	_ = os.MkdirAll(filepath.Join(tempDir, ".git"), 0755)
	_ = os.WriteFile(filepath.Join(tempDir, ".git", "config"), []byte("[core]"), 0600)
	_ = os.WriteFile(filepath.Join(tempDir, ".env"), []byte("API_KEY=123"), 0600)
	_ = os.MkdirAll(filepath.Join(tempDir, "custom_ignored"), 0755)
	_ = os.WriteFile(filepath.Join(tempDir, "custom_ignored", "note.md"), []byte("ignore me"), 0644)

	repo := &RepoConfig{
		ID:          "test_repo",
		Name:        "Test Repo",
		Path:        tempDir,
		RoutePrefix: "/test",
		IgnoreDirs:  []string{"custom_ignored"},
	}
	rm := NewRepoManager([]RepoConfig{*repo})

	// 1. 合法路径应成功解析
	abs, err := rm.SafeResolve(repo, "doc.md")
	if err != nil || abs != filepath.Join(tempDir, "doc.md") {
		t.Fatalf("expected valid resolution, got: %s, err: %v", abs, err)
	}

	// 2. 经典目录穿越攻击应被拦截
	if _, err := rm.SafeResolve(repo, "../../etc/passwd"); err == nil {
		t.Fatalf("expected path traversal to fail")
	}
	if _, err := rm.SafeResolve(repo, "/etc/passwd"); err == nil {
		t.Fatalf("expected absolute path to fail")
	}

	// 3. 空字节攻击应被拦截
	if _, err := rm.SafeResolve(repo, "doc.md\x00/etc/passwd"); err == nil {
		t.Fatalf("expected null byte attack to fail")
	}

	// 4. 隐藏文件 (.git, .env) 应被拦截
	if _, err := rm.SafeResolve(repo, ".git/config"); err == nil {
		t.Fatalf("expected .git to be forbidden")
	}
	if _, err := rm.SafeResolve(repo, ".env"); err == nil {
		t.Fatalf("expected .env to be forbidden")
	}

	// 5. 全局受保护目录 (vault) 应被拦截
	if _, err := rm.SafeResolve(repo, "vault/secret.key"); err == nil {
		t.Fatalf("expected vault to be forbidden")
	}

	// 6. 仓库自定义 IgnoreDirs 应被拦截
	if _, err := rm.SafeResolve(repo, "custom_ignored/note.md"); err == nil {
		t.Fatalf("expected custom_ignored to be forbidden")
	}

	// 7. ReadFile 对 .env 的扩展名白名单拦截
	if _, err := rm.ReadFile(repo, ".env"); err == nil {
		t.Fatalf("expected ReadFile of .env to fail")
	}
}

func TestSecurity_RateLimiters(t *testing.T) {
	limiter := NewGlobalAPILimiter()

	// 突发限制为 3，速率为每秒 1 个
	// 前 3 次请求必须通过
	for i := 0; i < 3; i++ {
		if !limiter.Allow("ip1", 1.0, 3.0) {
			t.Fatalf("request %d should have been allowed", i+1)
		}
	}

	// 第 4 次应被拦截 (429)
	if limiter.Allow("ip1", 1.0, 3.0) {
		t.Fatalf("request 4 should have been blocked")
	}

	// 其他 IP 应不受影响
	if !limiter.Allow("ip2", 1.0, 3.0) {
		t.Fatalf("ip2 should have been allowed independently")
	}
}

func TestSecurity_TaskPromptTruncationAndLimits(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "doclens_task_test_*")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tempDir)

	repo := &RepoConfig{
		ID:          "test_repo",
		Name:        "Test Repo",
		Path:        tempDir,
		RoutePrefix: "/test",
	}
	rm := NewRepoManager([]RepoConfig{*repo})
	cfg := &Config{
		StateDir: tempDir,
		AI: AIConfig{
			RunnerCmd: "echo",
		},
	}
	tm := NewTaskManager(cfg, rm)

	// 1. 空 Prompt 拒绝
	if _, err := tm.SubmitTask("draft", "test_repo", "", "   "); err == nil {
		t.Fatalf("expected empty prompt to be rejected")
	}

	// 2. 超长 Prompt (>5000 字符) 拒绝
	hugePrompt := strings.Repeat("A", 5001)
	if _, err := tm.SubmitTask("draft", "test_repo", "", hugePrompt); err == nil {
		t.Fatalf("expected prompt > 5000 to be rejected")
	}

	// 3. 正常 2000 字符 Prompt，内存保留 2000 字符，Task.Prompt (持久化) 截断为 500 字符
	longPrompt := strings.Repeat("中", 2000)
	task, err := tm.SubmitTask("draft", "test_repo", "", longPrompt)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len([]rune(task.Prompt)) > 510 { // 500 runes + "..."
		t.Fatalf("expected Task.Prompt to be truncated to <= 510 runes, got %d", len([]rune(task.Prompt)))
	}
	if len([]rune(task.rawPrompt)) != 2000 {
		t.Fatalf("expected task.rawPrompt to retain full 2000 characters in memory, got %d", len([]rune(task.rawPrompt)))
	}
}

func TestSecurity_ReadTaskLogTailLimit(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "doclens_log_test_*")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tempDir)

	repo := &RepoConfig{
		ID:          "test_repo",
		Name:        "Test Repo",
		Path:        tempDir,
		RoutePrefix: "/test",
	}
	rm := NewRepoManager([]RepoConfig{*repo})
	cfg := &Config{
		StateDir: tempDir,
	}
	tm := NewTaskManager(cfg, rm)

	// 创建一个测试日志文件 (1MB)
	logDir := filepath.Join(tempDir, "logs")
	_ = os.MkdirAll(logDir, 0755)
	logPath := filepath.Join(logDir, "test.log")
	bigData := strings.Repeat("0123456789abcdef", 64*1024) // 1MB
	_ = os.WriteFile(logPath, []byte(bigData), 0644)

	task := &Task{
		ID:      "test_task",
		LogFile: logPath,
	}
	tm.tasks = []*Task{task}

	// 即使传入 100MB tailBytes，也必须被硬限制为最多 512KB
	content, err := tm.ReadTaskLog("test_task", 100*1024*1024)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(content) > 512*1024 {
		t.Fatalf("expected log read to be capped at 512KB, got %d bytes", len(content))
	}
}

func TestSecurity_HttpMaxBytesReader(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "doclens_http_test_*")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tempDir)

	repo := &RepoConfig{
		ID:          "test_repo",
		Name:        "Test Repo",
		Path:        tempDir,
		RoutePrefix: "/test",
	}
	rm := NewRepoManager([]RepoConfig{*repo})
	cfg := &Config{
		StateDir: tempDir,
		Auth: AuthConfig{
			PasswordHash:  "$2a$10$abcdefghijklmnopqrstuvwxyz0123456789012345678901234567",
			SessionSecret: "test_secret_32_bytes_long_12345678",
			SessionDays:   1,
		},
	}
	tm := NewTaskManager(cfg, rm)
	app := &App{
		cfg: cfg,
		rm:  rm,
		tm:  tm,
	}

	handler := app.routes()

	// 1. 发送 5KB 庞大 Body 给 /api/auth/login（限制 1KB），预期报错并被拦截
	hugeLoginJSON := `{"password":"` + strings.Repeat("x", 5000) + `"}`
	reqLogin := httptest.NewRequest("POST", "/api/auth/login", strings.NewReader(hugeLoginJSON))
	reqLogin.Header.Set("Content-Type", "application/json")
	wLogin := httptest.NewRecorder()
	handler.ServeHTTP(wLogin, reqLogin)

	if wLogin.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 for oversized login body, got %d", wLogin.Code)
	}

	// 2. 发送 100KB 庞大 Body 给 /api/tasks（限制 32KB），预期报错并被拦截
	hugeTaskJSON := `{"prompt":"` + strings.Repeat("x", 100*1024) + `"}`
	reqTask := httptest.NewRequest("POST", "/api/tasks", strings.NewReader(hugeTaskJSON))
	reqTask.Header.Set("Content-Type", "application/json")
	// 注入有效 Session Cookie
	token, _ := CreateSessionToken(cfg.Auth.SessionSecret, 1)
	reqTask.AddCookie(&http.Cookie{Name: "doc_lens_session", Value: token})
	wTask := httptest.NewRecorder()
	handler.ServeHTTP(wTask, reqTask)

	if wTask.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 for oversized task body, got %d", wTask.Code)
	}
}
