package main

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"os"
	"path/filepath"
	"strconv"

	"golang.org/x/crypto/bcrypt"
	"gopkg.in/yaml.v3"
)

type Config struct {
	Port         int          `yaml:"port"`
	Host         string       `yaml:"host"`
	Auth         AuthConfig   `yaml:"auth"`
	Repositories []RepoConfig `yaml:"repositories"`
	AI           AIConfig     `yaml:"ai"`
	StateDir     string       `yaml:"state_dir"`
}

type AuthConfig struct {
	PasswordHash  string `yaml:"password_hash"`
	InitialPass   string `yaml:"initial_password,omitempty"`
	SessionSecret string `yaml:"session_secret"`
	SessionDays   int    `yaml:"session_days"`
}

type RepoConfig struct {
	ID          string   `yaml:"id"`
	Name        string   `yaml:"name"`
	Path        string   `yaml:"path"`
	RoutePrefix string   `yaml:"route_prefix"`
	Description string   `yaml:"description"`
	Writable    bool     `yaml:"writable"`
	IgnoreDirs  []string `yaml:"ignore_dirs,omitempty"`
}

type AIConfig struct {
	RunnerCmd string        `yaml:"runner_cmd"`
	MaxQueue  int           `yaml:"max_queue"`
	Proxy     AIProxyConfig `yaml:"proxy"`
}

type AIProxyConfig struct {
	Enabled *bool  `yaml:"enabled"`
	HTTP    string `yaml:"http"`
	HTTPS   string `yaml:"https"`
	All     string `yaml:"all"`
}

func LoadConfig(configPath string) (*Config, error) {
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		cfg := createDefaultConfig()
		_ = os.MkdirAll(filepath.Dir(configPath), 0755)
		if err := SaveConfig(configPath, cfg); err != nil {
			return nil, fmt.Errorf("failed to create default config: %w", err)
		}
		initDefaultDocs(cfg)
		return cfg, nil
	}

	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	var cfg Config
	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return nil, fmt.Errorf("failed to parse yaml config: %w", err)
	}

	if cfg.Port == 0 {
		cfg.Port = 18086
	}
	if cfg.Host == "" {
		cfg.Host = "0.0.0.0"
	}
	if cfg.Auth.SessionDays == 0 {
		cfg.Auth.SessionDays = 180
	}
	if cfg.Auth.SessionSecret == "" {
		cfg.Auth.SessionSecret = randomHex(32)
		_ = SaveConfig(configPath, &cfg)
	}

	// Environment variable overrides
	if envPort := os.Getenv("DOCLENS_PORT"); envPort != "" {
		if p, err := strconv.Atoi(envPort); err == nil && p > 0 {
			cfg.Port = p
		}
	}
	if envHost := os.Getenv("DOCLENS_HOST"); envHost != "" {
		cfg.Host = envHost
	}
	if envState := os.Getenv("DOCLENS_STATE_DIR"); envState != "" {
		cfg.StateDir = envState
	} else if envData := os.Getenv("DOCLENS_DATA_DIR"); envData != "" {
		cfg.StateDir = filepath.Join(envData, "state")
	}

	if cfg.StateDir == "" {
		if _, err := os.Stat("/data"); err == nil {
			cfg.StateDir = "/data/state"
		} else {
			home, _ := os.UserHomeDir()
			cfg.StateDir = filepath.Join(home, ".local", "state", "doc-lens")
		}
	}
	applyAIProxyDefaults(&cfg.AI.Proxy)
	_ = os.MkdirAll(cfg.StateDir, 0755)

	// Smart repository path fallback and override
	var envDocs string
	if d := os.Getenv("DOCLENS_DOCS_DIR"); d != "" {
		envDocs = d
	} else if d := os.Getenv("DOCLENS_DOCS_PATH"); d != "" {
		envDocs = d
	}

	if envDocs != "" {
		if len(cfg.Repositories) == 0 {
			cfg.Repositories = append(cfg.Repositories, RepoConfig{
				ID:          "docs",
				Name:        "技术知识库 (Docs)",
				Path:        envDocs,
				RoutePrefix: "/docs",
				Description: "默认技术文档与 Markdown 知识库",
				Writable:    true,
			})
		} else {
			cfg.Repositories[0].Path = envDocs
		}
	} else {
		for i := range cfg.Repositories {
			p := cfg.Repositories[i].Path
			if p == "./docs" || p == "docs" {
				if _, err := os.Stat(p); os.IsNotExist(err) {
					if _, err := os.Stat("/docs"); err == nil {
						cfg.Repositories[i].Path = "/docs"
					} else if _, err := os.Stat("/data/docs"); err == nil {
						cfg.Repositories[i].Path = "/data/docs"
					}
				}
			}
		}
	}

	initDefaultDocs(&cfg)

	return &cfg, nil
}

func boolPtr(v bool) *bool {
	return &v
}

// applyAIProxyDefaults preserves the historical proxy behavior for configs
// that do not yet contain an ai.proxy block.
func applyAIProxyDefaults(proxy *AIProxyConfig) {
	if proxy.Enabled == nil {
		proxy.Enabled = boolPtr(true)
	}
	if proxy.HTTP == "" {
		proxy.HTTP = "http://127.0.0.1:7890"
	}
	if proxy.HTTPS == "" {
		proxy.HTTPS = "http://127.0.0.1:7890"
	}
	if proxy.All == "" {
		proxy.All = "socks5://127.0.0.1:7891"
	}
}

func SaveConfig(configPath string, cfg *Config) error {
	data, err := yaml.Marshal(cfg)
	if err != nil {
		return err
	}
	dir := filepath.Dir(configPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}
	return os.WriteFile(configPath, data, 0600)
}

func createDefaultConfig() *Config {
	secret := randomHex(32)
	defaultPass := "admin888"
	if envPass := os.Getenv("DOCLENS_INITIAL_PASSWORD"); envPass != "" {
		defaultPass = envPass
	}
	hash, _ := bcrypt.GenerateFromPassword([]byte(defaultPass), bcrypt.DefaultCost)

	stateDir := ""
	docsPath := "./docs"

	// Smart container default detection
	if _, err := os.Stat("/data"); err == nil {
		stateDir = "/data/state"
		docsPath = "/data/docs"
	} else {
		home, _ := os.UserHomeDir()
		stateDir = filepath.Join(home, ".local", "state", "doc-lens")
	}

	if envState := os.Getenv("DOCLENS_STATE_DIR"); envState != "" {
		stateDir = envState
	} else if envData := os.Getenv("DOCLENS_DATA_DIR"); envData != "" {
		stateDir = filepath.Join(envData, "state")
	}

	if envDocs := os.Getenv("DOCLENS_DOCS_DIR"); envDocs != "" {
		docsPath = envDocs
	} else if envDocs := os.Getenv("DOCLENS_DOCS_PATH"); envDocs != "" {
		docsPath = envDocs
	} else if _, err := os.Stat("/docs"); err == nil && docsPath == "./docs" {
		docsPath = "/docs"
	}

	port := 18086
	if envPort := os.Getenv("DOCLENS_PORT"); envPort != "" {
		if p, err := strconv.Atoi(envPort); err == nil && p > 0 {
			port = p
		}
	}

	host := "0.0.0.0"
	if envHost := os.Getenv("DOCLENS_HOST"); envHost != "" {
		host = envHost
	}

	return &Config{
		Port: port,
		Host: host,
		Auth: AuthConfig{
			PasswordHash:  string(hash),
			InitialPass:   defaultPass,
			SessionSecret: secret,
			SessionDays:   180,
		},
		Repositories: []RepoConfig{
			{
				ID:          "docs",
				Name:        "技术知识库 (Docs)",
				Path:        docsPath,
				RoutePrefix: "/docs",
				Description: "默认技术文档与 Markdown 知识库",
				Writable:    true,
			},
		},
		AI: AIConfig{
			RunnerCmd: "dagu-ai",
			MaxQueue:  10,
			Proxy: AIProxyConfig{
				Enabled: boolPtr(true),
				HTTP:    "http://127.0.0.1:7890",
				HTTPS:   "http://127.0.0.1:7890",
				All:     "socks5://127.0.0.1:7891",
			},
		},
		StateDir: stateDir,
	}
}

// initDefaultDocs ensures repositories have valid folders and creates a welcoming guide if empty.
func initDefaultDocs(cfg *Config) {
	for _, r := range cfg.Repositories {
		_ = os.MkdirAll(r.Path, 0755)
		entries, err := os.ReadDir(r.Path)
		if err == nil && len(entries) == 0 {
			welcomeFile := filepath.Join(r.Path, "README.md")
			welcomeContent := `# 欢迎使用 DocLens 知识库 🔍

这是您的全新技术知识库空间。

### 🚀 快速开始
1. **添加文章**：直接将 Markdown 文件（.md）、架构图（.d2）或代码文件放入本目录。
2. **多端阅读**：支持手机端自适应抽屉、全要素 Mermaid 渲染与四大文人字体风格。
3. **AI 写作与解剖**：点击右下角紫色创作笔，可派发课题扩写、修改与深度提炼任务。
4. **听文章**：支持智库旁白语音播报，随时加入稍后听队列连续播放。

*祝您阅读与思考愉快！*
`
			_ = os.WriteFile(welcomeFile, []byte(welcomeContent), 0644)
		}
	}
}

func randomHex(n int) string {
	bytes := make([]byte, n)
	if _, err := rand.Read(bytes); err != nil {
		return "fallback_secret_key_fixed_length_32"
	}
	return hex.EncodeToString(bytes)
}
