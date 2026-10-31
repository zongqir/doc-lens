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

// ShareItem 表示单篇文档或专栏目录的对外只读分享记录
type ShareItem struct {
	ID        string    `json:"id"`         // 8位安全随机短ID，例如 "k8N2vX9m"
	RepoID    string    `json:"repo_id"`    // 对应仓库 ID
	RelPath   string    `json:"rel_path"`   // 仓库内相对路径
	DocTitle  string    `json:"doc_title"`  // 文档或专栏标题（冗余缓存，便于列表查看）
	Type      string    `json:"type"`       // 分享类型: "doc" (单篇文档，默认) 或 "folder" (专栏目录)
	CreatedAt time.Time `json:"created_at"` // 创建时间
	UpdatedAt time.Time `json:"updated_at"` // 更新或状态变更时间
	ExpiresAt int64     `json:"expires_at"` // 过期时间戳（0 = 永久有效）
	Passcode  string    `json:"passcode"`   // 可选的访问提取码（为空表示公开免密）
	ViewCount int       `json:"view_count"` // 累计阅读次数统计
	Disabled  bool      `json:"disabled"`   // 是否已被所有者停用/关闭
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
	ErrShareDisabled = errors.New("share disabled")
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
		// 单篇文档/目录只保留最新的一条有效分享（覆盖旧的）
		cleanRel := filepath.ToSlash(filepath.Clean(item.RelPath))
		cleanRel = strings.TrimPrefix(cleanRel, "/")
		if item.Type == "" {
			item.Type = "doc"
		}
		for oldID, old := range sm.shares {
			if old.RepoID == item.RepoID && old.RelPath == cleanRel {
				if item.CreatedAt.After(old.CreatedAt) {
					delete(sm.shares, oldID)
				}
			}
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

// CreateShare 为文档或专栏目录创建/更新分享链接（每篇文档/目录始终唯一，覆盖之前的分享）
func (sm *ShareManager) CreateShare(repoID, relPath, docTitle string, expireDays int, passcode string, shareType ...string) (*ShareItem, error) {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	sType := "doc"
	if len(shareType) > 0 && shareType[0] != "" {
		sType = shareType[0]
	}

	cleanRel := filepath.ToSlash(filepath.Clean(relPath))
	cleanRel = strings.TrimPrefix(cleanRel, "/")

	// 核心逻辑：若本文档/专栏之前存在旧分享，直接删除并覆盖，避免多条冗余难管
	for oldID, old := range sm.shares {
		if old.RepoID == repoID && old.RelPath == cleanRel {
			delete(sm.shares, oldID)
		}
	}

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

	now := time.Now()
	item := &ShareItem{
		ID:        newID,
		RepoID:    repoID,
		RelPath:   cleanRel,
		DocTitle:  title,
		Type:      sType,
		CreatedAt: now,
		UpdatedAt: now,
		ExpiresAt: expiresAt,
		Passcode:  strings.TrimSpace(passcode),
		ViewCount: 0,
		Disabled:  false,
	}

	sm.shares[newID] = item
	sm.saveShares()

	copyItem := *item
	return &copyItem, nil
}

// GetDocShare 查询指定文档当前的分享记录（包含已关闭或已过期记录，便于统一管理）
func (sm *ShareManager) GetDocShare(repoID, relPath string) *ShareItem {
	sm.mu.RLock()
	defer sm.mu.RUnlock()

	cleanRel := filepath.ToSlash(filepath.Clean(relPath))
	cleanRel = strings.TrimPrefix(cleanRel, "/")

	for _, item := range sm.shares {
		if item.RepoID == repoID && item.RelPath == cleanRel {
			copyItem := *item
			return &copyItem
		}
	}
	return nil
}

// UpdateShare 更新已存在的分享参数（修改有效期、提取码或切换停用/启用状态）
func (sm *ShareManager) UpdateShare(id string, expireDays *int, passcode *string, disabled *bool) (*ShareItem, error) {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	item, exists := sm.shares[id]
	if !exists {
		return nil, ErrShareNotFound
	}

	if expireDays != nil {
		if *expireDays > 0 {
			item.ExpiresAt = time.Now().AddDate(0, 0, *expireDays).Unix()
		} else {
			item.ExpiresAt = 0 // 永久有效
		}
	}
	if passcode != nil {
		item.Passcode = strings.TrimSpace(*passcode)
	}
	if disabled != nil {
		item.Disabled = *disabled
	}
	item.UpdatedAt = time.Now()
	sm.saveShares()

	copyItem := *item
	return &copyItem, nil
}

// GetShare 获取分享记录（自动校验停用与有效期）
func (sm *ShareManager) GetShare(id string) (*ShareItem, error) {
	sm.mu.RLock()
	defer sm.mu.RUnlock()

	item, exists := sm.shares[id]
	if !exists {
		return nil, ErrShareNotFound
	}

	if item.Disabled {
		copyItem := *item
		return &copyItem, ErrShareDisabled
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

// DeleteShare 彻底删除分享链接
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
		copyItem := *item
		result = append(result, &copyItem)
	}

	// 排序策略：
	// 1. 活跃生效中 (未停用且未过期) 排在最前
	// 2. 其次是已停用但未过期
	// 3. 最后是已过期
	// 同一状态下，按 UpdatedAt 或 CreatedAt 倒序排列
	sort.Slice(result, func(i, j int) bool {
		s1 := result[i]
		s2 := result[j]

		isExpired1 := s1.ExpiresAt > 0 && now > s1.ExpiresAt
		isExpired2 := s2.ExpiresAt > 0 && now > s2.ExpiresAt

		statusRank := func(s *ShareItem, isExpired bool) int {
			if !s.Disabled && !isExpired {
				return 0 // 活跃生效
			}
			if s.Disabled && !isExpired {
				return 1 // 已关闭/停用
			}
			return 2 // 已过期
		}

		r1 := statusRank(s1, isExpired1)
		r2 := statusRank(s2, isExpired2)
		if r1 != r2 {
			return r1 < r2
		}

		t1 := s1.UpdatedAt
		if t1.IsZero() {
			t1 = s1.CreatedAt
		}
		t2 := s2.UpdatedAt
		if t2.IsZero() {
			t2 = s2.CreatedAt
		}
		return t1.After(t2)
	})

	return result
}
