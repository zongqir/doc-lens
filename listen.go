package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

const defaultListenVoice = "zh-CN-YunyangNeural"

type ListenItem struct {
	ID       string  `json:"id"`
	RepoID   string  `json:"repo_id"`
	Path     string  `json:"path"`
	Route    string  `json:"route"`
	Title    string  `json:"title"`
	Position float64 `json:"position"`
	Status   string  `json:"status"`
	AddedAt  int64   `json:"added_at"`
}

type ListenQueue struct {
	CurrentID string       `json:"current_id"`
	Items     []ListenItem `json:"items"`
}

type ListenQueueManager struct {
	mu        sync.Mutex
	file      string
	queue     ListenQueue
	rm        *RepoManager
	tts       *TTSManager
	preparing map[string]bool
}

func NewListenQueueManager(stateDir string, rm *RepoManager, tts *TTSManager) *ListenQueueManager {
	lm := &ListenQueueManager{file: filepath.Join(stateDir, "listen_queue.json"), rm: rm, tts: tts, preparing: make(map[string]bool)}
	data, err := os.ReadFile(lm.file)
	if err == nil {
		_ = json.Unmarshal(data, &lm.queue)
	}
	if lm.queue.Items == nil {
		lm.queue.Items = []ListenItem{}
	}
	return lm
}

func (lm *ListenQueueManager) saveLocked() error {
	data, err := json.MarshalIndent(lm.queue, "", "  ")
	if err != nil {
		return err
	}
	tmp := lm.file + ".tmp"
	if err := os.WriteFile(tmp, data, 0644); err != nil {
		return err
	}
	return os.Rename(tmp, lm.file)
}

func (lm *ListenQueueManager) snapshot() ListenQueue {
	lm.mu.Lock()
	defer lm.mu.Unlock()
	q := lm.queue
	q.Items = append([]ListenItem(nil), lm.queue.Items...)
	return q
}

func (lm *ListenQueueManager) add(repoID, relPath, title string) (ListenItem, bool, error) {
	repo, err := lm.rm.GetRepoByID(repoID)
	if err != nil {
		return ListenItem{}, false, err
	}
	resolved, err := lm.rm.SafeResolve(repo, relPath)
	if err != nil {
		return ListenItem{}, false, err
	}
	info, err := os.Stat(resolved)
	if err != nil || info.IsDir() {
		return ListenItem{}, false, errors.New("document does not exist")
	}
	rel, err := filepath.Rel(repo.Path, resolved)
	if err != nil {
		return ListenItem{}, false, err
	}
	rel = filepath.ToSlash(rel)

	lm.mu.Lock()
	defer lm.mu.Unlock()
	for _, item := range lm.queue.Items {
		if item.RepoID == repoID && item.Path == rel {
			return item, false, nil
		}
	}
	if strings.TrimSpace(title) == "" {
		title = strings.TrimSuffix(filepath.Base(rel), filepath.Ext(rel))
	}
	item := ListenItem{
		ID: randomHex(12), RepoID: repoID, Path: rel,
		Route: "/" + strings.Trim(repo.RoutePrefix, "/") + "/" + strings.TrimPrefix(rel, "/"),
		Title: title, Status: "pending", AddedAt: time.Now().Unix(),
	}
	lm.queue.Items = append(lm.queue.Items, item)
	if lm.queue.CurrentID == "" {
		lm.queue.CurrentID = item.ID
	}
	return item, true, lm.saveLocked()
}

func (lm *ListenQueueManager) remove(id string) error {
	lm.mu.Lock()
	defer lm.mu.Unlock()
	items := lm.queue.Items[:0]
	for _, item := range lm.queue.Items {
		if item.ID != id {
			items = append(items, item)
		}
	}
	lm.queue.Items = items
	if lm.queue.CurrentID == id {
		lm.queue.CurrentID = ""
		if len(items) > 0 {
			lm.queue.CurrentID = items[0].ID
		}
	}
	return lm.saveLocked()
}

func (lm *ListenQueueManager) progress(id string, position float64, status string) error {
	lm.mu.Lock()
	defer lm.mu.Unlock()
	for i := range lm.queue.Items {
		if lm.queue.Items[i].ID == id {
			if position >= 0 {
				lm.queue.Items[i].Position = position
			}
			if status != "" {
				lm.queue.Items[i].Status = status
			}
			lm.queue.CurrentID = id
			return lm.saveLocked()
		}
	}
	return errors.New("queue item not found")
}

func (lm *ListenQueueManager) prepare(item ListenItem) {
	lm.mu.Lock()
	if lm.preparing[item.ID] {
		lm.mu.Unlock()
		return
	}
	lm.preparing[item.ID] = true
	lm.mu.Unlock()
	go func() {
		defer func() { lm.mu.Lock(); delete(lm.preparing, item.ID); lm.mu.Unlock() }()
		repo, err := lm.rm.GetRepoByID(item.RepoID)
		if err != nil {
			return
		}
		full, err := lm.rm.SafeResolve(repo, item.Path)
		if err != nil {
			return
		}
		content, err := os.ReadFile(full)
		if err != nil {
			return
		}
		info, err := os.Stat(full)
		if err != nil {
			return
		}
		for attempt, delay := range []time.Duration{0, 5 * time.Second, 15 * time.Second} {
			if delay > 0 {
				time.Sleep(delay)
			}
			ctx, cancel := context.WithTimeout(context.Background(), 8*time.Minute)
			_, err = lm.tts.Synthesize(ctx, item.RepoID, item.Path, defaultListenVoice, info.ModTime().Unix(), string(content))
			cancel()
			if err == nil {
				return
			}
			if attempt == 2 {
				fmt.Printf("[ListenQueue] audio preparation failed for %s: %v\n", item.Path, err)
			}
		}
	}()
}

func (a *App) handleListenQueue(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	switch r.Method {
	case http.MethodGet:
		_ = json.NewEncoder(w).Encode(a.lq.snapshot())
	case http.MethodPost:
		var req struct{ RepoID, Path, Title string }
		if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 64<<10)).Decode(&req); err != nil {
			http.Error(w, `{"error":"invalid request"}`, 400)
			return
		}
		item, added, err := a.lq.add(req.RepoID, req.Path, req.Title)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error":%q}`, err.Error()), 400)
			return
		}
		if added {
			a.lq.prepare(item)
		}
		_ = json.NewEncoder(w).Encode(map[string]any{"item": item, "added": added})
	case http.MethodDelete:
		if err := a.lq.remove(r.URL.Query().Get("id")); err != nil {
			http.Error(w, `{"error":"remove failed"}`, 400)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}

func (a *App) handleListenProgress(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	var req struct {
		ID       string  `json:"id"`
		Position float64 `json:"position"`
		Status   string  `json:"status"`
	}
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 64<<10)).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request"}`, 400)
		return
	}
	if err := a.lq.progress(req.ID, req.Position, req.Status); err != nil {
		http.Error(w, `{"error":"not found"}`, 404)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
