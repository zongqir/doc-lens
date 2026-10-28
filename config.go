package main

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"os"
	"path/filepath"

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
		if err := SaveConfig(configPath, cfg); err != nil {
			return nil, fmt.Errorf("failed to create default config: %w", err)
		}
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
	if cfg.StateDir == "" {
		home, _ := os.UserHomeDir()
		cfg.StateDir = filepath.Join(home, ".local", "state", "doc-lens")
	}
	applyAIProxyDefaults(&cfg.AI.Proxy)
	_ = os.MkdirAll(cfg.StateDir, 0755)

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
	hash, _ := bcrypt.GenerateFromPassword([]byte(defaultPass), bcrypt.DefaultCost)

	home, _ := os.UserHomeDir()
	stateDir := filepath.Join(home, ".local", "state", "doc-lens")

	return &Config{
		Port: 18086,
		Host: "0.0.0.0",
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
				Path:        "./docs",
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

func randomHex(n int) string {
	bytes := make([]byte, n)
	if _, err := rand.Read(bytes); err != nil {
		return "fallback_secret_key_fixed_length_32"
	}
	return hex.EncodeToString(bytes)
}
