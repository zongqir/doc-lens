package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
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

	// 15分钟内输错超过5次，锁定
	return len(valid) < 5
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

func SetAuthCookie(w http.ResponseWriter, token string, days int) {
	maxAge := days * 24 * 3600
	cookie := &http.Cookie{
		Name:     "doc_lens_session",
		Value:    token,
		Path:     "/",
		MaxAge:   maxAge,
		HttpOnly: true,
		Secure:   false, // 允许反向代理内部 http，浏览器经 https 访问时同样保留
		SameSite: http.SameSiteLaxMode,
	}
	http.SetCookie(w, cookie)
}

func ClearAuthCookie(w http.ResponseWriter) {
	cookie := &http.Cookie{
		Name:     "doc_lens_session",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
	}
	http.SetCookie(w, cookie)
}

func GetClientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		return strings.TrimSpace(parts[0])
	}
	if xri := r.Header.Get("X-Real-IP"); xri != "" {
		return strings.TrimSpace(xri)
	}
	if cfip := r.Header.Get("CF-Connecting-IP"); cfip != "" {
		return strings.TrimSpace(cfip)
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
