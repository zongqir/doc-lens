package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type SessionPayload struct {
	User      string `json:"u"`
	ExpiresAt int64  `json:"exp"`
}

type RateLimiter struct {
	mu       sync.Mutex
	attempts map[string][]time.Time
}

var limiter = &RateLimiter{
	attempts: make(map[string][]time.Time),
}

func init() {
	// 定期清理 RateLimiter 中超过 15 分钟的过期记录，杜绝内存持续膨胀
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		for range ticker.C {
			limiter.mu.Lock()
			now := time.Now()
			cutoff := now.Add(-15 * time.Minute)
			for ip, times := range limiter.attempts {
				var valid []time.Time
				for _, t := range times {
					if t.After(cutoff) {
						valid = append(valid, t)
					}
				}
				if len(valid) == 0 {
					delete(limiter.attempts, ip)
				} else {
					limiter.attempts[ip] = valid
				}
			}
			limiter.mu.Unlock()
		}
	}()
}

// Allow 检查 15 分钟内输错密码是否超过 5 次
func (r *RateLimiter) Allow(ip string) bool {
	r.mu.Lock()
	defer r.mu.Unlock()

	now := time.Now()
	cutoff := now.Add(-15 * time.Minute)

	var valid []time.Time
	for _, t := range r.attempts[ip] {
		if t.After(cutoff) {
			valid = append(valid, t)
		}
	}
	r.attempts[ip] = valid

	return len(valid) < 5
}

// AllowAttempt 限制单个 IP 的登录请求频次（防止并发请求打爆 bcrypt CPU）
func (r *RateLimiter) AllowAttempt(ip string) bool {
	r.mu.Lock()
	defer r.mu.Unlock()

	now := time.Now()
	cutoff := now.Add(-30 * time.Second)

	var valid []time.Time
	for _, t := range r.attempts[ip] {
		if t.After(cutoff) {
			valid = append(valid, t)
		}
	}
	// 30 秒内最多 10 次请求
	return len(valid) < 10
}

func (r *RateLimiter) RecordFail(ip string) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.attempts[ip] = append(r.attempts[ip], time.Now())
}

func (r *RateLimiter) Reset(ip string) {
	r.mu.Lock()
	defer r.mu.Unlock()
	delete(r.attempts, ip)
}

// GlobalAPILimiter 全局与分 IP 令牌桶限流器
type GlobalAPILimiter struct {
	mu      sync.Mutex
	clients map[string]*clientBucket
}

type clientBucket struct {
	tokens     float64
	lastUpdate time.Time
	lastSeen   time.Time
}

func NewGlobalAPILimiter() *GlobalAPILimiter {
	l := &GlobalAPILimiter{
		clients: make(map[string]*clientBucket),
	}
	// 定期清理闲置超过 10 分钟的客户端记录，杜绝内存泄漏
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		for range ticker.C {
			l.mu.Lock()
			now := time.Now()
			for ip, b := range l.clients {
				if now.Sub(b.lastSeen) > 10*time.Minute {
					delete(l.clients, ip)
				}
			}
			l.mu.Unlock()
		}
	}()
	return l
}

func (l *GlobalAPILimiter) Allow(key string, rate float64, burst float64) bool {
	l.mu.Lock()
	defer l.mu.Unlock()

	now := time.Now()
	b, exists := l.clients[key]
	if !exists {
		l.clients[key] = &clientBucket{
			tokens:     burst - 1,
			lastUpdate: now,
			lastSeen:   now,
		}
		return true
	}

	b.lastSeen = now
	elapsed := now.Sub(b.lastUpdate).Seconds()
	b.lastUpdate = now

	b.tokens += elapsed * rate
	if b.tokens > burst {
		b.tokens = burst
	}

	if b.tokens >= 1.0 {
		b.tokens -= 1.0
		return true
	}

	return false
}

var (
	globalLoginLimiter = NewGlobalAPILimiter()
	globalAPILimiter   = NewGlobalAPILimiter()
)

func VerifyPassword(hashedPassword, plainPassword string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(plainPassword))
	return err == nil
}

func CreateSessionToken(secret string, days int) (string, error) {
	exp := time.Now().Add(time.Duration(days) * 24 * time.Hour).Unix()
	payload := SessionPayload{
		User:      "admin",
		ExpiresAt: exp,
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	payloadB64 := base64.RawURLEncoding.EncodeToString(data)
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(payloadB64))
	sigB64 := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))

	return payloadB64 + "." + sigB64, nil
}

func ValidateSessionToken(token, secret string) bool {
	parts := strings.Split(token, ".")
	if len(parts) != 2 {
		return false
	}

	payloadB64 := parts[0]
	sigB64 := parts[1]

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(payloadB64))
	expectedSig := mac.Sum(nil)

	actualSig, err := base64.RawURLEncoding.DecodeString(sigB64)
	if err != nil || !hmac.Equal(actualSig, expectedSig) {
		return false
	}

	payloadBytes, err := base64.RawURLEncoding.DecodeString(payloadB64)
	if err != nil {
		return false
	}

	var payload SessionPayload
	if err := json.Unmarshal(payloadBytes, &payload); err != nil {
		return false
	}

	return time.Now().Unix() <= payload.ExpiresAt
}

func isSecureRequest(r *http.Request) bool {
	if r == nil {
		return false
	}
	if r.TLS != nil {
		return true
	}
	if strings.EqualFold(r.Header.Get("X-Forwarded-Proto"), "https") {
		return true
	}
	if strings.Contains(r.Header.Get("CF-Visitor"), `"https"`) {
		return true
	}
	if strings.HasPrefix(r.Header.Get("Origin"), "https://") || strings.HasPrefix(r.Header.Get("Referer"), "https://") {
		return true
	}
	return false
}

func SetAuthCookie(w http.ResponseWriter, r *http.Request, token string, days int) {
	maxAge := days * 24 * 3600
	cookie := &http.Cookie{
		Name:     "doc_lens_session",
		Value:    token,
		Path:     "/",
		MaxAge:   maxAge,
		HttpOnly: true,
		Secure:   isSecureRequest(r),
		SameSite: http.SameSiteStrictMode,
	}
	http.SetCookie(w, cookie)
}

func ClearAuthCookie(w http.ResponseWriter, r *http.Request) {
	cookie := &http.Cookie{
		Name:     "doc_lens_session",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   isSecureRequest(r),
		SameSite: http.SameSiteStrictMode,
	}
	http.SetCookie(w, cookie)
}

func GetClientIP(r *http.Request) string {
	// 优先读取 Cloudflare 注入的真实客户端 IP（防伪造与绕过）
	if cfip := strings.TrimSpace(r.Header.Get("CF-Connecting-IP")); cfip != "" {
		return cfip
	}
	if xri := strings.TrimSpace(r.Header.Get("X-Real-IP")); xri != "" {
		return xri
	}
	if xff := strings.TrimSpace(r.Header.Get("X-Forwarded-For")); xff != "" {
		parts := strings.Split(xff, ",")
		if ip := strings.TrimSpace(parts[0]); ip != "" {
			return ip
		}
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err == nil && host != "" {
		return host
	}
	return r.RemoteAddr
}

func IsAuthenticated(r *http.Request, secret string) bool {
	cookie, err := r.Cookie("doc_lens_session")
	if err != nil || cookie.Value == "" {
		// 也支持从 Authorization: Bearer <token> 获取
		authHeader := r.Header.Get("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") {
			return ValidateSessionToken(strings.TrimPrefix(authHeader, "Bearer "), secret)
		}
		return false
	}
	return ValidateSessionToken(cookie.Value, secret)
}
