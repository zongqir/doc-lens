package main

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"log/slog"
	"sync"
	"time"

	"oss.terrastruct.com/d2/d2graph"
	"oss.terrastruct.com/d2/d2layouts/d2dagrelayout"
	"oss.terrastruct.com/d2/d2lib"
	"oss.terrastruct.com/d2/d2renderers/d2svg"
	"oss.terrastruct.com/d2/d2themes/d2themescatalog"
	d2log "oss.terrastruct.com/d2/lib/log"
	"oss.terrastruct.com/d2/lib/textmeasure"
)

const maxD2CacheSize = 100

type d2CacheEntry struct {
	svg string
}

type D2Engine struct {
	ruler      *textmeasure.Ruler
	mu         sync.RWMutex
	cache      map[string]d2CacheEntry
	cacheOrder []string // LRU 队列 (严格上限 100 张)
}

var (
	globalD2Engine *D2Engine
	d2InitOnce     sync.Once
)

func GetD2Engine() (*D2Engine, error) {
	var initErr error
	d2InitOnce.Do(func() {
		ruler, err := textmeasure.NewRuler()
		if err != nil {
			initErr = fmt.Errorf("failed to init D2 text ruler: %w", err)
			return
		}
		globalD2Engine = &D2Engine{
			ruler:      ruler,
			cache:      make(map[string]d2CacheEntry),
			cacheOrder: make([]string, 0, maxD2CacheSize),
		}
	})
	if initErr != nil {
		return nil, initErr
	}
	return globalD2Engine, nil
}

func (e *D2Engine) Render(ctx context.Context, code string, isDark bool, sketch bool) (string, error) {
	if len(code) == 0 {
		return "", fmt.Errorf("empty D2 code")
	}

	// 1. 生成唯一缓存 Key (代码哈希 + 主题 + 草图配置)
	h := sha256.New()
	h.Write([]byte(code))
	h.Write([]byte(fmt.Sprintf("|dark=%v|sketch=%v", isDark, sketch)))
	cacheKey := hex.EncodeToString(h.Sum(nil))

	// 2. 尝试读取内存缓存 (微秒级)
	e.mu.RLock()
	if entry, found := e.cache[cacheKey]; found {
		e.mu.RUnlock()
		return entry.svg, nil
	}
	e.mu.RUnlock()

	// 3. 安全超时限制 (防止死循环或极端异常语法)
	calcCtx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	// 静默 D2 内部调试日志
	calcCtx = d2log.With(calcCtx, slog.New(slog.NewTextHandler(io.Discard, nil)))

	opts := &d2lib.CompileOptions{
		Ruler: e.ruler,
		LayoutResolver: func(engine string) (d2graph.LayoutGraph, error) {
			return d2dagrelayout.DefaultLayout, nil
		},
	}

	pad := int64(20)
	themeID := d2themescatalog.NeutralDefault.ID
	if isDark {
		themeID = d2themescatalog.DarkFlagshipTerrastruct.ID
	}

	renderOpts := &d2svg.RenderOpts{
		Pad:     &pad,
		ThemeID: &themeID,
	}
	if sketch {
		isSketch := true
		renderOpts.Sketch = &isSketch
	}

	diagram, _, err := d2lib.Compile(calcCtx, code, opts, renderOpts)
	if err != nil {
		return "", fmt.Errorf("D2 编译解析失败: %w", err)
	}

	svgBytes, err := d2svg.Render(diagram, renderOpts)
	if err != nil {
		return "", fmt.Errorf("D2 矢量渲染失败: %w", err)
	}

	svg := string(svgBytes)

	// 4. 存入 LRU 缓存，容量严格限制为 100 张
	e.mu.Lock()
	if _, exists := e.cache[cacheKey]; !exists {
		if len(e.cacheOrder) >= maxD2CacheSize {
			oldestKey := e.cacheOrder[0]
			e.cacheOrder = e.cacheOrder[1:]
			delete(e.cache, oldestKey)
		}
		e.cache[cacheKey] = d2CacheEntry{svg: svg}
		e.cacheOrder = append(e.cacheOrder, cacheKey)
	}
	e.mu.Unlock()

	return svg, nil
}
