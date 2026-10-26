package main

import (
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

// ShareItem 表示单篇文档的对外只读分享记录
type ShareItem struct {
	ID        string    `json:"id"`         // 8位安全随机短ID，例如 "k8N2vX9m"
	RepoID    string    `json:"repo_id"`    // 对应仓库 ID
	RelPath   string    `json:"rel_path"`   // 仓库内相对路径
	DocTitle  string    `json:"doc_title"`  // 文档标题（冗余缓存，便于列表查看）
	CreatedAt time.Time `json:"created_at"` // 创建时间
	ExpiresAt int64     `json:"expires_at"` // 过期时间戳（0 = 永久有效）
	Passcode  string    `json:"passcode"`   // 可选的访问提取码（为空表示公开免密）
	ViewCount int       `json:"view_count"` // 累计阅读次数统计
}

type ShareManager struct {
	stateDir string
	filePath string
	mu       sync.RWMutex
	shares   map[string]*ShareItem
}

var (
	ErrShareNotFound = errors.New("share not found")
	ErrShareExpired  = errors.New("share expired")
)

const shareAlphabet = "23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"

func generateShareID(length int) string {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		// 回退方案
		return fmt.Sprintf("%x", time.Now().UnixNano())[:length]
	}
	result := make([]byte, length)
	alphaLen := byte(len(shareAlphabet))
	for i, b := range bytes {
		result[i] = shareAlphabet[b%alphaLen]
	}
	return string(result)
}

func NewShareManager(stateDir string) *ShareManager {
	sm := &ShareManager{
		stateDir: stateDir,
		filePath: filepath.Join(stateDir, "shares.json"),
		shares:   make(map[string]*ShareItem),
	}
	_ = os.MkdirAll(stateDir, 0755)
	sm.loadShares()
	return sm
}

func (sm *ShareManager) loadShares() {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	data, err := os.ReadFile(sm.filePath)
	if err != nil {
		return
	}

	var list []*ShareItem
	if err := json.Unmarshal(data, &list); err != nil {
		return
	}

	now := time.Now().Unix()
	for _, item := range list {
		if item == nil || item.ID == "" {
			continue
		}
		// 自动清理过期超过 60 天的历史废弃分享记录，避免状态文件无限膨胀
		if item.ExpiresAt > 0 && now-item.ExpiresAt > 60*86400 {
			continue
		}
		sm.shares[item.ID] = item
	}
}

func (sm *ShareManager) saveShares() {
	list := make([]*ShareItem, 0, len(sm.shares))
	for _, item := range sm.shares {
		list = append(list, item)
	}

	data, err := json.MarshalIndent(list, "", "  ")
	if err != nil {
		return
	}

	tmpFile := sm.filePath + ".tmp"
	if err := os.WriteFile(tmpFile, data, 0644); err == nil {
		_ = os.Rename(tmpFile, sm.filePath)
	}
}

// CreateShare 创建新的分享链接
func (sm *ShareManager) CreateShare(repoID, relPath, docTitle string, expireDays int, passcode string) (*ShareItem, error) {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	cleanRel := filepath.ToSlash(filepath.Clean(relPath))
	cleanRel = strings.TrimPrefix(cleanRel, "/")

	var expiresAt int64 = 0
	if expireDays > 0 {
		expiresAt = time.Now().AddDate(0, 0, expireDays).Unix()
	}

	// 8位唯一短 ID
	var newID string
	for i := 0; i < 10; i++ {
		id := generateShareID(8)
		if _, exists := sm.shares[id]; !exists {
			newID = id
			break
		}
	}
	if newID == "" {
		return nil, errors.New("failed to generate unique share id")
	}

	title := strings.TrimSpace(docTitle)
	if title == "" {
		title = filepath.Base(cleanRel)
	}

	item := &ShareItem{
		ID:        newID,
		RepoID:    repoID,
		RelPath:   cleanRel,
		DocTitle:  title,
		CreatedAt: time.Now(),
		ExpiresAt: expiresAt,
		Passcode:  strings.TrimSpace(passcode),
		ViewCount: 0,
	}

	sm.shares[newID] = item
	sm.saveShares()

	copyItem := *item
	return &copyItem, nil
}

// GetShare 获取分享记录（自动校验有效期）
func (sm *ShareManager) GetShare(id string) (*ShareItem, error) {
	sm.mu.RLock()
	defer sm.mu.RUnlock()

	item, exists := sm.shares[id]
	if !exists {
		return nil, ErrShareNotFound
	}

	if item.ExpiresAt > 0 && time.Now().Unix() > item.ExpiresAt {
		return nil, ErrShareExpired
	}

	copyItem := *item
	return &copyItem, nil
}

// IncrementViewCount 递增阅读计数
func (sm *ShareManager) IncrementViewCount(id string) {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	if item, exists := sm.shares[id]; exists {
		item.ViewCount++
		sm.saveShares()
	}
}

// DeleteShare 撤销/删除分享链接
func (sm *ShareManager) DeleteShare(id string) error {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	if _, exists := sm.shares[id]; !exists {
		return ErrShareNotFound
	}

	delete(sm.shares, id)
	sm.saveShares()
	return nil
}

// ListShares 查询分享记录列表（可按 repoID 和 relPath 过滤）
func (sm *ShareManager) ListShares(repoID, relPath string) []*ShareItem {
	sm.mu.RLock()
	defer sm.mu.RUnlock()

	cleanRel := filepath.ToSlash(filepath.Clean(relPath))
	cleanRel = strings.TrimPrefix(cleanRel, "/")

	var result []*ShareItem
	now := time.Now().Unix()

	for _, item := range sm.shares {
		if repoID != "" && item.RepoID != repoID {
			continue
		}
		if relPath != "" && item.RelPath != cleanRel {
			continue
		}
		// 复制对象，避免并发读写污染
		copyItem := *item
		// 标识是否已过期
		if copyItem.ExpiresAt > 0 && now > copyItem.ExpiresAt {
			// 仍然在管理端可见，方便知道已被过期
		}
		result = append(result, &copyItem)
	}

	// 按创建时间倒序排列（最新创建排在最前）
	sort.Slice(result, func(i, j int) bool {
		return result[i].CreatedAt.After(result[j].CreatedAt)
	})

	return result
}
