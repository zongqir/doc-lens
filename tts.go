package main

import (
	"context"
	"crypto/sha256"
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
	"time"
)

type VoiceOption struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Tag         string `json:"tag"`
}

var AvailableVoices = []VoiceOption{
	{
		ID:          "zh-CN-YunyangNeural",
		Name:        "云扬 · 沉稳解说",
		Description: "中低音沉稳权威，历史纪录片与大国博弈推演首选",
		Tag:         "推荐 · 智库解说",
	},
	{
		ID:          "zh-CN-YunxiNeural",
		Name:        "云希 · 财经叙事",
		Description: "清亮扎实，宏观经济与深度观察长视频标配",
		Tag:         "爆款 · 财经叙事",
	},
	{
		ID:          "zh-CN-YunjianNeural",
		Name:        "云健 · 沉郁旁白",
		Description: "铿锵有力，战事推演与高对抗话题深度旁白",
		Tag:         "纪实 · 战事旁白",
	},
	{
		ID:          "zh-CN-XiaoxiaoNeural",
		Name:        "晓晓 · 清澈知性",
		Description: "温和自然，随身随听日常研读与知识速览",
		Tag:         "温和 · 知识速览",
	},
}

type TTSManager struct {
	cacheDir string
	mu       sync.Mutex
	active   map[string]chan struct{}
}

func NewTTSManager(stateDir string) *TTSManager {
	cacheDir := filepath.Join(stateDir, "audio_cache")
	_ = os.MkdirAll(cacheDir, 0755)
	return &TTSManager{
		cacheDir: cacheDir,
		active:   make(map[string]chan struct{}),
	}
}

// sanitizeMarkdownForSpeech 清理技术文档与 Markdown 标记，转化为适合人类听觉自然停顿的口语文本
func sanitizeMarkdownForSpeech(content string) string {
	text := content

	// 1. 去除首部 YAML frontmatter (--- ... ---)
	if strings.HasPrefix(text, "---") {
		parts := strings.SplitN(text, "---", 3)
		if len(parts) >= 3 {
			text = parts[2]
		}
	}

	// 2. 去除代码块 (```...```) 替换为提示语，防止 TTS 机械朗诵语法符号
	reCodeBlock := regexp.MustCompile("(?s)```[^\n]*\n.*?```")
	text = reCodeBlock.ReplaceAllString(text, "\n[此处为代码块]\n")

	// 3. 去除行内行代码 `code`
	reInlineCode := regexp.MustCompile("`([^`]+)`")
	text = reInlineCode.ReplaceAllString(text, "$1")

	// 4. 去除图片 ![alt](url)
	reImage := regexp.MustCompile(`!\[([^\]]*)\]\([^)]+\)`)
	text = reImage.ReplaceAllString(text, "")

	// 5. 转换链接 [文字](url) -> 文字
	reLink := regexp.MustCompile(`\[([^\]]+)\]\([^)]+\)`)
	text = reLink.ReplaceAllString(text, "$1")

	// 6. 去除 HTML 标签 <...>
	reHTML := regexp.MustCompile(`<[^>]+>`)
	text = reHTML.ReplaceAllString(text, "")

	// 7. 处理粗体和斜体
	reBoldItalic := regexp.MustCompile(`\*{1,3}([^*]+)\*{1,3}`)
	text = reBoldItalic.ReplaceAllString(text, "$1")

	// 8. 逐行规整：处理标题、引用、列表、表格
	lines := strings.Split(text, "\n")
	var result []string
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" {
			continue
		}

		// 表格分隔线 (|---|---|) 直接丢弃
		if strings.HasPrefix(trimmed, "|") && strings.Contains(trimmed, "---") {
			continue
		}

		// 表格行 (| a | b |) -> 转为自然顿读
		if strings.HasPrefix(trimmed, "|") && strings.HasSuffix(trimmed, "|") {
			trimmed = strings.Trim(trimmed, "|")
			cols := strings.Split(trimmed, "|")
			var validCols []string
			for _, c := range cols {
				ct := strings.TrimSpace(c)
				if ct != "" {
					validCols = append(validCols, ct)
				}
			}
			if len(validCols) > 0 {
				result = append(result, strings.Join(validCols, "，")+"。")
			}
			continue
		}

		// Markdown 标题 (# 一级标题 -> 标题。)
		if strings.HasPrefix(trimmed, "#") {
			heading := strings.TrimLeft(trimmed, "#")
			heading = strings.TrimSpace(heading)
			if heading != "" {
				result = append(result, heading+"。")
			}
			continue
		}

		// 引用行 (> 引用内容)
		if strings.HasPrefix(trimmed, ">") {
			quote := strings.TrimPrefix(trimmed, ">")
			quote = strings.TrimSpace(quote)
			if quote != "" {
				result = append(result, quote)
			}
			continue
		}

		// 无序列表 (*, -)
		if strings.HasPrefix(trimmed, "* ") || strings.HasPrefix(trimmed, "- ") || strings.HasPrefix(trimmed, "+ ") {
			item := strings.TrimSpace(trimmed[2:])
			if item != "" {
				result = append(result, item)
			}
			continue
		}

		result = append(result, trimmed)
	}

	cleaned := strings.Join(result, "\n\n")

	// 9. 规范标点与多余空隙
	reMultiSpaces := regexp.MustCompile(`[ \t]+`)
	cleaned = reMultiSpaces.ReplaceAllString(cleaned, " ")

	return strings.TrimSpace(cleaned)
}

func (tm *TTSManager) getAudioCachePath(repoID, relPath, voice string, modTime int64) string {
	h := sha256.New()
	_, _ = h.Write([]byte(fmt.Sprintf("%s:%s:%s:%d", repoID, relPath, voice, modTime)))
	hashStr := fmt.Sprintf("%x", h.Sum(nil))[:20]
	return filepath.Join(tm.cacheDir, fmt.Sprintf("%s_%s.mp3", hashStr, voice))
}

func findEdgeTTSCommand() (string, []string) {
	// 1. 优先检查 PATH 中的 edge-tts
	if p, err := exec.LookPath("edge-tts"); err == nil {
		return p, nil
	}
	// 2. 检查 ~/.local/bin/edge-tts
	home, _ := os.UserHomeDir()
	candidate := filepath.Join(home, ".local", "bin", "edge-tts")
	if _, err := os.Stat(candidate); err == nil {
		return candidate, nil
	}
	// 3. 回退至 python3 -m edge_tts
	if p, err := exec.LookPath("python3"); err == nil {
		return p, []string{"-m", "edge_tts"}
	}
	return "edge-tts", nil
}

// Synthesize 异步/防并发单飞生成文档音频
func (tm *TTSManager) Synthesize(ctx context.Context, repoID, relPath, voice string, modTime int64, rawMarkdown string) (string, error) {
	if voice == "" {
		voice = "zh-CN-YunyangNeural"
	}

	cacheFile := tm.getAudioCachePath(repoID, relPath, voice, modTime)

	// 1. 检查是否存在有效缓存
	if fi, err := os.Stat(cacheFile); err == nil && fi.Size() > 1024 {
		return cacheFile, nil
	}

	// 2. 单飞互斥：同一篇文档同一音色同时只能有一个进程在生成
	cacheKey := fmt.Sprintf("%s:%s:%s", repoID, relPath, voice)
	tm.mu.Lock()
	waitCh, inProgress := tm.active[cacheKey]
	if inProgress {
		tm.mu.Unlock()
		select {
		case <-waitCh:
			// 上一个协程完成，直接返回生成好的缓存文件
			if fi, err := os.Stat(cacheFile); err == nil && fi.Size() > 1024 {
				return cacheFile, nil
			}
			return "", fmt.Errorf("audio generation finished but file invalid")
		case <-ctx.Done():
			return "", ctx.Err()
		}
	}

	waitCh = make(chan struct{})
	tm.active[cacheKey] = waitCh
	tm.mu.Unlock()

	defer func() {
		tm.mu.Lock()
		delete(tm.active, cacheKey)
		close(waitCh)
		tm.mu.Unlock()
	}()

	// 3. 规整文本
	speechText := sanitizeMarkdownForSpeech(rawMarkdown)
	if strings.TrimSpace(speechText) == "" {
		return "", fmt.Errorf("document has no readable text for TTS")
	}

	// 4. 调用 edge-tts 生成音频至临时文件
	tmpFile := cacheFile + ".tmp." + fmt.Sprintf("%d", time.Now().UnixNano())
	defer func() {
		_ = os.Remove(tmpFile)
	}()

	cmdPath, extraArgs := findEdgeTTSCommand()
	args := append(extraArgs, "--voice", voice, "--file", "-", "--write-media", tmpFile)

	ttsCmd := exec.CommandContext(ctx, cmdPath, args...)
	stdin, err := ttsCmd.StdinPipe()
	if err != nil {
		return "", fmt.Errorf("failed to open stdin pipe: %w", err)
	}

	go func() {
		defer stdin.Close()
		_, _ = io.WriteString(stdin, speechText)
	}()

	output, err := ttsCmd.CombinedOutput()
	if err != nil {
		log.Printf("[TTS] edge-tts error: %v, output: %s", err, string(output))
		return "", fmt.Errorf("edge-tts synthesis failed: %v", err)
	}

	// 5. 校验临时文件并原子替换
	fi, err := os.Stat(tmpFile)
	if err != nil || fi.Size() < 1024 {
		return "", fmt.Errorf("edge-tts generated empty or truncated audio file")
	}

	if err := os.Rename(tmpFile, cacheFile); err != nil {
		return "", fmt.Errorf("failed to save audio cache: %w", err)
	}

	log.Printf("[TTS] Successfully synthesized: %s (voice: %s, size: %d bytes)", relPath, voice, fi.Size())
	return cacheFile, nil
}
