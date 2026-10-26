package main

import (
	"os"
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
}
