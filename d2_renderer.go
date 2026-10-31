package main

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"log/slog"
	"strings"
	"sync"
	"time"

	"oss.terrastruct.com/d2/d2graph"
	"oss.terrastruct.com/d2/d2layouts/d2dagrelayout"
	"oss.terrastruct.com/d2/d2lib"
	"oss.terrastruct.com/d2/d2renderers/d2svg"
	"oss.terrastruct.com/d2/d2target"
	"oss.terrastruct.com/d2/d2themes/d2themescatalog"
	d2log "oss.terrastruct.com/d2/lib/log"
	"oss.terrastruct.com/d2/lib/textmeasure"
)

const maxD2CacheSize = 100

type d2CacheEntry struct {
	svg string
}

type D2Engine struct {
	rulerPool  sync.Pool
	compileMu  sync.Mutex
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
		initialRuler, err := textmeasure.NewRuler()
		if err != nil {
			initErr = fmt.Errorf("failed to init D2 text ruler: %w", err)
			return
		}
		engine := &D2Engine{
			cache:      make(map[string]d2CacheEntry),
			cacheOrder: make([]string, 0, maxD2CacheSize),
		}
		engine.rulerPool.New = func() any {
			r, err := textmeasure.NewRuler()
			if err != nil {
				return nil
			}
			return r
		}
		engine.rulerPool.Put(initialRuler)
		globalD2Engine = engine
	})
	if initErr != nil {
		return nil, initErr
	}
	return globalD2Engine, nil
}

func strPtr(s string) *string {
	return &s
}

func (e *D2Engine) Render(ctx context.Context, code string, isDark bool) (resSVG string, retErr error) {
	code = strings.TrimSpace(code)
	if len(code) == 0 {
		return "", fmt.Errorf("empty D2 code")
	}

	// 1. 生成唯一缓存 Key (代码哈希 + 暗黑模式)
	h := sha256.New()
	h.Write([]byte(code))
	h.Write([]byte(fmt.Sprintf("|dark=%v", isDark)))
	cacheKey := hex.EncodeToString(h.Sum(nil))

	// 2. 尝试读取内存缓存 (微秒级)
	e.mu.RLock()
	if entry, found := e.cache[cacheKey]; found {
		e.mu.RUnlock()
		return entry.svg, nil
	}
	e.mu.RUnlock()

	// 3. 防御性 panic 捕获，避免极端畸形语法或底层指针崩溃中断 HTTP 连接
	defer func() {
		if r := recover(); r != nil {
			retErr = fmt.Errorf("D2 内部渲染异常: %v", r)
		}
	}()

	// 4. 从 Ruler Pool 中获取专属 Ruler，用毕放回
	rulerItem := e.rulerPool.Get()
	if rulerItem == nil {
		var err error
		rulerItem, err = textmeasure.NewRuler()
		if err != nil {
			return "", fmt.Errorf("failed to create D2 ruler: %w", err)
		}
	}
	ruler := rulerItem.(*textmeasure.Ruler)
	defer e.rulerPool.Put(ruler)

	// 5. 安全超时限制 (防止死循环或极端异常语法)
	calcCtx, cancel := context.WithTimeout(ctx, 4*time.Second)
	defer cancel()

	// 静默 D2 内部调试日志
	calcCtx = d2log.With(calcCtx, slog.New(slog.NewTextHandler(io.Discard, nil)))

	opts := &d2lib.CompileOptions{
		Ruler: ruler,
		LayoutResolver: func(engine string) (d2graph.LayoutGraph, error) {
			return func(ctx context.Context, g *d2graph.Graph) error {
				for _, obj := range g.Objects {
					// 针对嵌套子节点：大幅收紧内边距，提升信息密度，使容器呈现扁平卡片主角质感
					if obj.Parent != g.Root && !obj.IsContainer() {
						if obj.Height > 32 {
							obj.Height = float64(obj.LabelDimensions.Height + 12)
						}
						if obj.Width > 40 {
							obj.Width = float64(obj.LabelDimensions.Width + 20)
						}
					}
				}
				return d2dagrelayout.Layout(ctx, g, &d2dagrelayout.ConfigurableOpts{
					NodeSep: 18,
					EdgeSep: 8,
				})
			}, nil
		},
	}

	pad := int64(14)
	themeID := d2themescatalog.NeutralGrey.ID

	// 统一与 Mermaid 现代扁平设计风格保持一致：
	// 浅色模式：节点柔和浅灰底 (#f8fafc) + 现代科技蓝边框 (#3b82f6) + 深灰文字 (#0f172a) + 雅致连线 (#64748b)
	// 深色模式：深沉面板底 (#1c1e24) + 精致蓝/灰边框 (#3b82f6/#2d3139) + 浅灰白字 (#ededf0) + 灰调连线 (#9ca3af)
	// 画布底 (N7) 全透明，无缝融入 DocLens 阅读器卡片
	var themeOverrides *d2target.ThemeOverrides
	if isDark {
		themeOverrides = &d2target.ThemeOverrides{
			B1: strPtr("#3b82f6"),     // 核心高亮色 / 箭头色 (Tailwind Blue)
			B2: strPtr("#9ca3af"),     // 连线色 (Slate 400)
			B3: strPtr("#6b7280"),
			B4: strPtr("#2d3139"),     // 容器边框 (Subtle Slate)
			B5: strPtr("#14161a"),     // 内部条目背景 (沉底微透)
			B6: strPtr("#1c1e24"),     // 节点主卡片底色 (Mermaid dark)
			N1: strPtr("#ededf0"),     // 主文本 (白灰)
			N2: strPtr("#9ca3af"),     // 次要/连线标签 (淡灰)
			N7: strPtr("transparent"), // 画布全透，无缝贴合 DocLens 卡片
		}
	} else {
		themeOverrides = &d2target.ThemeOverrides{
			B1: strPtr("#3b82f6"),     // 核心高亮色 / 箭头色 (Tailwind Blue)
			B2: strPtr("#64748b"),     // 连线色 (Slate 500)
			B3: strPtr("#94a3b8"),
			B4: strPtr("#e2e8f0"),     // 容器边框 (Subtle Slate 200)
			B5: strPtr("#ffffff"),     // 内部条目背景 (纯净白底)
			B6: strPtr("#f8fafc"),     // 节点主卡片底色 (Slate 50)
			N1: strPtr("#0f172a"),     // 主文本 (Slate 900)
			N2: strPtr("#64748b"),     // 次要/连线标签 (Slate 500)
			N7: strPtr("transparent"), // 画布全透，无缝贴合 DocLens 卡片
		}
	}

	renderOpts := &d2svg.RenderOpts{
		Pad:            &pad,
		ThemeID:        &themeID,
		ThemeOverrides: themeOverrides,
	}

	// 加锁执行 Compile 以防 D2 内部全局状态竞争
	e.compileMu.Lock()
	diagram, _, err := d2lib.Compile(calcCtx, code, opts, renderOpts)
	e.compileMu.Unlock()
	if err != nil {
		return "", fmt.Errorf("D2 编译解析失败: %w", err)
	}

	svgBytes, err := d2svg.Render(diagram, renderOpts)
	if err != nil {
		return "", fmt.Errorf("D2 矢量渲染失败: %w", err)
	}

	svg := string(svgBytes)

	// 6. 存入 LRU 缓存，容量严格限制为 100 张
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
