# DocLens 🔍

<p align="center">
  <strong>Modern, Ultra-Lightweight & High-Performance Knowledge Base and Code Projection Engine</strong><br>
  <em>Single Go Binary · Zero npm/Node.js Dependencies · Sub-15MB RAM · Built-in TTS Audio Reader · Async AI Task Engine</em>
</p>

<p align="center">
  <a href="README.md"><strong>English</strong></a> |
  <a href="README_zh.md"><strong>简体中文</strong></a>
</p>

<p align="center">
  <a href="https://golang.org"><img src="https://img.shields.io/badge/Go-1.25+-00ADD8?style=flat&logo=go" alt="Go Version"></a>
  <a href="https://github.com/zongqir/doc-lens/pkgs/container/doc-lens"><img src="https://img.shields.io/badge/Docker-ghcr.io-blue?style=flat&logo=docker" alt="Docker"></a>
  <a href="#"><img src="https://img.shields.io/badge/Idle%20RAM-~15MB-success?style=flat" alt="Idle RAM"></a>
  <a href="#"><img src="https://img.shields.io/badge/Idle%20CPU-0.0%25-brightgreen?style=flat" alt="Idle CPU"></a>
  <a href="#"><img src="https://img.shields.io/badge/Cold%20Start-%3C5ms-blueviolet?style=flat" alt="Cold Start"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat" alt="License"></a>
</p>

---

## 💡 Core Philosophy

Traditional knowledge base setups often introduce heavy runtime stacks, multi-container orchestration, and steep operational overhead.

**DocLens takes an uncompromisingly minimalist and pragmatic approach:**
- **Single Static Binary**: The entire backend, authentication, file scanning, and native vanilla frontend (HTML/CSS/JS) are packed into a single executable via Go `//go:embed`.
- **Direct Filesystem Mapping**: Zero external database. Your Markdown files, folders, and code files are your database. No vendor lock-in.
- **Beyond Plain Text Reading**: Built-in Neural TTS audio player for commuting, Morandi-toned D2 / Mermaid charts, instant mindmaps, and an asynchronous AI task queue with terminal logs.

---

## 📊 Performance & Resource Profile

- **Idle Memory (RAM)**: `~15 MB` (Static silence during idle, ultra-low resource footprint)
- **Idle CPU Usage**: `0.0%` (Event-driven Go runtime without redundant background loops)
- **Cold Start Time**: `< 5 ms` (Instant start, zero compilation or container wait)
- **Database Dependency**: `0` (Zero external database required; reads filesystem directly)
- **Frontend Toolchain**: `0 npm / 0 Node.js` (Pure vanilla HTML5/CSS3/ES6 embedded statically)
- **Offline Asset Guarantee**: Ships with embedded CJK typography packs (~43MB Woff2 fonts) for 100% offline, publication-grade reading.

---

## ✨ Key Features

### 1. 🚀 Extreme Lightweight & Single Binary Delivery
- **~15MB Idle RAM consumption**, zero CPU overhead when idle, and sub-5ms cold startup.
- Deploy in seconds by copying a single binary or launching a single Docker container.
- No database migrations, no Node.js runtime, no `node_modules` dependency hell.

### 2. 🎧 Listen to Articles (TTS) & Playlist Queue
- **Neural Voice Narration**: Turn technical articles and deep-dive research into podcasts with natural voice synthesis (Finance narrator, Documentary tone, Conversational voices).
- **Listen Later Queue**: Drawer-style playlist queue to save and auto-play articles back-to-back during commutes or bedtime.
- **Floating Audio Dock**: Background playback bar with playback rate control (0.75x - 2.0x), quick navigation, and mp3 download.

### 3. 🎨 Morandi D2 Diagrams, Mermaid & Mindmaps
- **D2 Diagram Transpilation**: Converts D2 architectural schemas into elegant Mermaid cards using low-saturation Morandi color palettes and dashed hairline dividers.
- **Instant Mindmaps**: Generate visual hierarchical outline mindmaps for any article with a single click.
- **Curated Typography**: Built-in one-click switcher for system fonts, Alibaba PuHuiTi, LXGW WenKai, and Source Han Serif.

### 4. 🤖 Asynchronous AI Task Engine with Real-Time Terminal Logs
- **Four Targeted Intent Modes**: 
  - `New`: Dispatch deep-dive research drafts.
  - `Append`: Supplement counterarguments, tables, or case studies into current docs.
  - `Modify`: Paragraph rewrites, typo fixing, or structural refactors.
  - `Explain`: Extract core contradictions, balance sheets, and key takeaways.
- **Detached Execution**: Close your browser or lock your phone; background AI tasks continue executing reliably.
- **Terminal Control Console**: View live streaming logs, traffic-light status indicators, and execution history.

### 5. 📱 Pixel-Perfect Mobile Touch Experience
- **Responsive Architecture**: Collapsible sidebar, bottom-sheet TOC navigation drawer, and level-filtered outline toggles.
- **Dual FAB Floating Stack**: Purple gradient AI pen + Blue TOC launcher with touch drag, snap-to-edge elasticity, and auto-dimming during scroll.
- **Zero-Cramped Mobile Toolbar**: Compact 34×34 pure icon action buttons and chevron pagination (`‹` / `›`) designed specifically for one-handed thumb reach.

### 6. 🛡️ Secure Sharing & Long-Lived Sessions
- **Read-Only Public Sharing**: Generate unique tokenized links (`/s/:id`) with configurable expiration (1 hour, 1 day, 7 days, permanent) and optional passcodes.
- **Strict Role Isolation**: Shared links automatically strip editing capabilities, AI controls, and workspace exploration.
- **180-Day Safe Session**: Salted bcrypt password verification and HttpOnly session cookies.

---

## 🚀 Quick Start

### Option 1: Docker / Docker Compose (Recommended)

#### Mode A: Single Data Volume (Easiest - Auto initializes config and docs)
```bash
docker run -d \
  --name doc-lens \
  -p 18086:18086 \
  -v ./data:/data \
  ghcr.io/zongqir/doc-lens:latest
```
> **Note**: DocLens automatically generates `config.yaml`, `docs/`, and `state/` inside `./data`. Backups and migrations require only copying this single folder!

#### Mode B: Mount Your Existing Markdown Folder Directly
```bash
docker run -d \
  --name doc-lens \
  -p 18086:18086 \
  -v /path/to/your/markdown/notes:/docs \
  ghcr.io/zongqir/doc-lens:latest
```

#### With Docker Compose:
```yaml
services:
  doc-lens:
    image: ghcr.io/zongqir/doc-lens:latest
    container_name: doc-lens
    restart: unless-stopped
    ports:
      - "18086:18086"
    volumes:
      # Mode A: Single unified data volume (Recommended)
      - ./data:/data
      # Mode B: Mount existing notes directly (Optional)
      # - /path/to/my/notes:/docs
    environment:
      - TZ=Asia/Shanghai
      # Optional environment overrides:
      # - DOCLENS_INITIAL_PASSWORD=admin888
```
Run `docker compose up -d` and visit `http://localhost:18086`.  
*Default login password: `admin888` (customizable in config.yaml or via DOCLENS_INITIAL_PASSWORD).*

---

### Option 2: Pre-compiled Binary

1. Download the latest binary for your OS and architecture from [GitHub Releases](https://github.com/zongqir/doc-lens/releases).
2. Run the executable:
```bash
./doc-lens
```

---

### Option 3: Build from Source

```bash
# Clone the repository
git clone https://github.com/zongqir/doc-lens.git
cd doc-lens

# Build single static binary
go build -o bin/doc-lens .

# Start the service
./bin/doc-lens
```

---

## ⚙️ Configuration (`config.yaml`)

```yaml
port: 18086
host: "0.0.0.0"

auth:
  initial_password: "admin888"   # Automatically hashed into bcrypt on first launch
  session_secret: ""             # Auto-generated 32-byte high-entropy key if empty
  session_days: 180              # Persistent session duration

repositories:
  - id: docs
    name: "Tech Knowledge Hub"
    path: "./docs"               # Path to your local Markdown repository
    route_prefix: "/docs"        # Web route prefix
    description: "Core Architecture & Engineering Notes"
    writable: true               # Allow AI additions and edits
    ignore_dirs:
      - ".git"
      - "node_modules"

ai:
  runner_cmd: "dagu-ai"          # External AI CLI tool or proxy script
  max_queue: 10                  # Max concurrent queuing tasks
```

---

## 🐧 Systemd Service (Linux)

Create `~/.config/systemd/user/doc-lens.service`:

```ini
[Unit]
Description=DocLens Knowledge Base Service
After=network.target

[Service]
Type=simple
WorkingDirectory=/path/to/doc-lens
ExecStart=/path/to/doc-lens/bin/doc-lens -config /path/to/doc-lens/config.yaml
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
```

Manage the service:
```bash
systemctl --user daemon-reload
systemctl --user enable --now doc-lens
systemctl --user status doc-lens
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
