package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestShareManager(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "doclens_share_test")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	sm := NewShareManager(tmpDir)

	// 1. Create a share without passcode (7 days)
	item, err := sm.CreateShare("world_lens", "geopolitics/korea.md", "朝鲜半岛政治韧性", 7, "")
	if err != nil {
		t.Fatalf("CreateShare failed: %v", err)
	}
	if len(item.ID) != 8 {
		t.Errorf("expected 8 char id, got %s", item.ID)
	}
	if item.DocTitle != "朝鲜半岛政治韧性" {
		t.Errorf("unexpected doc title: %s", item.DocTitle)
	}
	if item.Passcode != "" {
		t.Errorf("expected empty passcode, got %s", item.Passcode)
	}

	// 2. Get share
	got, err := sm.GetShare(item.ID)
	if err != nil {
		t.Fatalf("GetShare failed: %v", err)
	}
	if got.RelPath != "geopolitics/korea.md" {
		t.Errorf("unexpected rel path: %s", got.RelPath)
	}

	// 3. Increment view count
	sm.IncrementViewCount(item.ID)
	got2, _ := sm.GetShare(item.ID)
	if got2.ViewCount != 1 {
		t.Errorf("expected view count 1, got %d", got2.ViewCount)
	}

	// 4. Test ListShares
	list := sm.ListShares("world_lens", "geopolitics/korea.md")
	if len(list) != 1 {
		t.Errorf("expected 1 share in list, got %d", len(list))
	}

	// 5. Test persistence (reload from disk)
	sm2 := NewShareManager(tmpDir)
	gotReloaded, err := sm2.GetShare(item.ID)
	if err != nil {
		t.Fatalf("failed to get reloaded share: %v", err)
	}
	if gotReloaded.ViewCount != 1 {
		t.Errorf("expected reloaded view count 1, got %d", gotReloaded.ViewCount)
	}

	// 6. Test expiration
	expiredItem, err := sm.CreateShare("world_lens", "exp.md", "Expired Doc", -1, "")
	if err != nil {
		t.Fatalf("CreateShare failed: %v", err)
	}
	sm.mu.Lock()
	sm.shares[expiredItem.ID].ExpiresAt = time.Now().Add(-1 * time.Hour).Unix()
	sm.mu.Unlock()

	_, expErr := sm.GetShare(expiredItem.ID)
	if expErr == nil || expErr != ErrShareExpired {
		t.Errorf("expected ErrShareExpired, got %v", expErr)
	}

	// 7. Delete share
	if err := sm.DeleteShare(item.ID); err != nil {
		t.Fatalf("DeleteShare failed: %v", err)
	}
	_, delErr := sm.GetShare(item.ID)
	if delErr != ErrShareNotFound {
		t.Errorf("expected ErrShareNotFound after delete, got %v", delErr)
	}

	// 8. Test single active share overwrite
	item1, _ := sm.CreateShare("world_lens", "single.md", "Single Doc", 7, "")
	item2, _ := sm.CreateShare("world_lens", "single.md", "Single Doc Updated", 30, "1234")
	if _, err := sm.GetShare(item1.ID); err != ErrShareNotFound {
		t.Errorf("expected old share to be deleted upon overwrite, got err: %v", err)
	}
	gotActive := sm.GetDocShare("world_lens", "single.md")
	if gotActive == nil || gotActive.ID != item2.ID || gotActive.Passcode != "1234" {
		t.Errorf("expected new share to be active and have passcode 1234")
	}

	// 9. Test folder share creation
	folderItem, err := sm.CreateShare("world_lens", "geopolitics/series", "地缘政治专栏", 14, "5678", "folder")
	if err != nil {
		t.Fatalf("failed to create folder share: %v", err)
	}
	if folderItem.Type != "folder" {
		t.Errorf("expected type 'folder', got '%s'", folderItem.Type)
	}
	gotFolder, err := sm.GetShare(folderItem.ID)
	if err != nil || gotFolder.Type != "folder" {
		t.Errorf("expected to retrieve folder share with type 'folder'")
	}
}

func TestFolderShareHTTP(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "doclens_folder_share_test")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	repoDir := filepath.Join(tmpDir, "myrepo")
	colDir := filepath.Join(repoDir, "mycolumn")
	_ = os.MkdirAll(colDir, 0755)

	_ = os.WriteFile(filepath.Join(colDir, "01-intro.md"), []byte("# 第一讲 介绍\n\n欢迎来到专栏。"), 0644)
	_ = os.WriteFile(filepath.Join(colDir, "02-detail.md"), []byte("# 第二讲 深入\n\n核心架构剖析。"), 0644)

	stateDir := filepath.Join(tmpDir, ".state")
	sm := NewShareManager(stateDir)
	rm := NewRepoManager([]RepoConfig{
		{
			ID:          "test_repo",
			Name:        "测试仓库",
			Path:        repoDir,
			RoutePrefix: "/test",
		},
	})

	app := &App{
		sm: sm,
		rm: rm,
	}

	// 1. 创建专栏分享
	shareItem, err := sm.CreateShare("test_repo", "mycolumn", "我的专栏", 7, "", "folder")
	if err != nil {
		t.Fatalf("CreateShare folder failed: %v", err)
	}

	// 2. 访问专栏根链接 (默认加载第一篇 01-intro.md)
	req1 := httptest.NewRequest("GET", "/api/share/content?id="+shareItem.ID, nil)
	w1 := httptest.NewRecorder()
	app.handleShareContent(w1, req1)

	if w1.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s (shareItem.Type=%s, shareItem.RelPath=%s)", w1.Code, w1.Body.String(), shareItem.Type, shareItem.RelPath)
	}
	var resp1 map[string]any
	if err := json.Unmarshal(w1.Body.Bytes(), &resp1); err != nil {
		t.Fatalf("failed to parse json response: %v", err)
	}
	if resp1["is_folder"] != true {
		t.Errorf("expected is_folder true, got %v", resp1["is_folder"])
	}
	if resp1["subpath"] != "01-intro.md" {
		t.Errorf("expected default subpath 01-intro.md, got %v", resp1["subpath"])
	}

	// 3. 访问专栏第二讲 02-detail.md
	req2 := httptest.NewRequest("GET", "/api/share/content?id="+shareItem.ID+"&subpath=02-detail.md", nil)
	w2 := httptest.NewRecorder()
	app.handleShareContent(w2, req2)

	if w2.Code != http.StatusOK {
		t.Fatalf("expected 200 for subpath, got %d", w2.Code)
	}
	var resp2 map[string]any
	_ = json.Unmarshal(w2.Body.Bytes(), &resp2)
	if resp2["subpath"] != "02-detail.md" {
		t.Errorf("expected subpath 02-detail.md, got %v", resp2["subpath"])
	}

	// 4. 安全测试：路径穿越尝试
	req3 := httptest.NewRequest("GET", "/api/share/content?id="+shareItem.ID+"&subpath=../etc/passwd", nil)
	w3 := httptest.NewRecorder()
	app.handleShareContent(w3, req3)
	if w3.Code != http.StatusForbidden {
		t.Errorf("expected 403 Forbidden for path traversal, got %d", w3.Code)
	}
}

