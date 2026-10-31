# DocLens 🔍

<p align="center">
  <strong>现代极简、高性能的轻量级技术文档与 Markdown 知识库系统</strong><br>
  <em>单 Go 二进制交付 · 零 npm/Node.js 外部依赖 · 内存常驻仅 ~15MB · 原生 TTS 听书与稍后听 · 异步 AI 任务引擎</em>
</p>

<p align="center">
  <a href="README.md"><strong>English</strong></a> |
  <a href="README_zh.md"><strong>简体中文</strong></a>
</p>

<p align="center">
  <a href="https://golang.org"><img src="https://img.shields.io/badge/Go-1.25+-00ADD8?style=flat&logo=go" alt="Go Version"></a>
  <a href="https://github.com/zongqir/doc-lens/pkgs/container/doc-lens"><img src="https://img.shields.io/badge/Docker-ghcr.io-blue?style=flat&logo=docker" alt="Docker"></a>
  <a href="#"><img src="https://img.shields.io/badge/内存常驻-~15MB-success?style=flat" alt="Idle RAM"></a>
  <a href="#"><img src="https://img.shields.io/badge/待机CPU-0.0%25-brightgreen?style=flat" alt="Idle CPU"></a>
  <a href="#"><img src="https://img.shields.io/badge/冷启动-%3C5ms-blueviolet?style=flat" alt="Cold Start"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat" alt="License"></a>
</p>

---

## 💡 核心设计理念

传统的知识库方案往往依赖庞大的运行时环境和多层外部数据库堆叠。

**DocLens 坚持走极致克制且实用的极简主义路线：**
- **单二进制交付**：Go 后端、安全鉴权、目录索引与纯原生前端（HTML/CSS/JS）通过 `//go:embed` 完整打包进单个独立二进制。
- **直读本地目录**：不依赖任何外部数据库。你的 Markdown 文件与代码仓库就是你的知识库，永无数据孤岛与供应商绑定。
- **超越传统纯文本**：原生内置智库级 TTS 听书与稍后听连播队列、低饱和度莫兰迪色 D2 / Mermaid 架构图、一键思维导图，以及带终端执行日志的异步 AI 生产力引擎。

---

## 📊 性能与资源规格 (Performance Profile)

- **待机内存常驻**：`~15 MB`（无高并发请求时纯粹静默，极低开销）
- **待机 CPU 消耗**：`0.0%`（Go 原生高效事件调度，无后台无效事件循环）
- **冷启动耗时**：`< 5 ms`（毫秒级极速直出，开箱立即可用）
- **数据库依赖**：`0`（零外部数据库，直读磁盘 Markdown 与代码结构）
- **前端构建链**：`0 npm / 0 Node.js`（纯原生单体嵌入，无构建泥潭）
- **离线资产保障**：内置全量离线精美中文字体包（霞鹜文楷、阿里普惠等 ~43MB），完全断网环境下依然享有出版级排版。

---

## ✨ 核心特性一览

### 1. 🚀 极致轻量与单二进制极速交付
- **内存常驻仅 ~15MB**，待机 CPU 占用 0.0%，冷启动时间小于 5ms。
- 复制单个二进制文件或一条 Docker 命令即可完成部署，无任何数据库迁移与 `node_modules` 泥潭。

### 2. 🎧 听文章（TTS）与稍后听播放队列
- **智库级语音解说**：支持云希（冷峻财经叙事）、云健（沉郁知性旁白）、晓晓（清澈温和）等多重质感音色，把技术文章与研报直接变成通勤播客。
- **稍后听抽屉队列**：支持将文章加入队列，通勤或睡前按顺序连续播放。
- **悬浮音频控制条**：支持 0.75x ~ 2.0x 调速、章节快速翻篇、MP3 音频直接下载。

### 3. 🎨 莫兰迪 D2 架构图、Mermaid 与思维导图
- **D2 图表原生降解转换**：将 D2 架构草图优雅转译为 Mermaid 卡片，采用莫兰迪低饱和度配色与细虚线边框，视觉高级舒适。
- **一键思维导图**：自动解析文章层级大纲，秒级生成清晰的全局大纲脑图。
- **出版级排版审美**：内置霞鹜文楷、阿里普惠、思源宋体与系统原生 4 种字型风格，深浅双色主题自由切换。

### 4. 🤖 异步离线 AI 写作与文档深度解剖
- **四大精准意图模式**：
  - `新增 (New)`：派发全篇深度研报或架构课题沉淀任务。
  - `补充 (Append)`：结合当前文档，补充反方论点、客观账本或对比案例。
  - `修改 (Modify)`：段落重构、术语纠错与结构重塑。
  - `解剖 (Explain)`：提炼核心矛盾、潜在盲点与核心账本总结。
- **脱壳异步运行**：派发任务后手机锁屏或关闭网页，后台依然稳步运行，随时回到网页查看。
- **终端控制台**：带红黄绿交通灯状态指示、多任务排队锁，以及打字机式的实时终端执行日志。

### 5. 📱 手机触控端极致打磨
- **三层触控响应式布局**：侧边抽屉、底部大纲 Bottom Sheet，支持 1级/2级/全部大纲一键收缩。
- **智能双悬浮球（FAB Stack）**：紫色 AI 创作笔 + 科技蓝目录球，支持左右贴边吸附（Snap-to-Edge）、位置持久化记忆与向下滚动防遮挡微缩。
- **防挤爆工具栏**：采用 34×34 精致纯图标按钮与翻页纯箭头（`‹` / `›`），单手操作防误触。

### 6. 🛡️ 专属免密安全分享与会话保障
- **单篇只读分享**：一键生成独立分享链接（`/s/:id`），支持 1小时/1天/7天/永久有效期及提取码校验。
- **严格权限隔离**：访客进入只读分享模式后，全库目录、AI 工具和敏感修改均自动隐藏剥离。
- **180 天长效免密**：采用 bcrypt 密码加盐哈希与 HttpOnly Cookie 签名防篡改机制。

---

## 🚀 快速上手 (Quick Start)

### 方式一：Docker 一键运行（推荐）

#### 模式 A：单数据卷模式（最简方案，自动初始化配置与文档）
```bash
docker run -d \
  --name doc-lens \
  -p 18086:18086 \
  -v ./data:/data \
  ghcr.io/zongqir/doc-lens:latest
```
> **说明**：DocLens 会自动在 `./data` 下生成 `config.yaml`（配置文件）、`docs/`（文档库）和 `state/`（状态与日志）。迁移备份只需拷贝这一个文件夹！

#### 模式 B：直接挂载现有 Markdown 笔记目录
```bash
docker run -d \
  --name doc-lens \
  -p 18086:18086 \
  -v /本地已有Markdown笔记绝对路径:/docs \
  ghcr.io/zongqir/doc-lens:latest
```

#### 使用 Docker Compose：
```yaml
services:
  doc-lens:
    image: ghcr.io/zongqir/doc-lens:latest
    container_name: doc-lens
    restart: unless-stopped
    ports:
      - "18086:18086"
    volumes:
      # 模式 A：统一数据卷（推荐）
      - ./data:/data
      # 模式 B：挂载现有本地笔记（可选）
      # - /path/to/my/notes:/docs
    environment:
      - TZ=Asia/Shanghai
      # 可选环境变量覆盖：
      # - DOCLENS_INITIAL_PASSWORD=admin888
```
执行 `docker compose up -d` 即可在后台启动，浏览器打开 `http://IP:18086` 访问。  
*默认初始登录密码：`admin888`（首次登录后可在 config.yaml 或环境变量中自定义）。*

---

### 方式二：直接下载预编译二进制

1. 前往 [GitHub Releases](https://github.com/zongqir/doc-lens/releases) 下载适合您操作系统的预编译包；
2. 运行二进制即可：
```bash
./doc-lens
```

---

### 方式三：源码编译

```bash
# 1. 克隆代码仓库
git clone https://github.com/zongqir/doc-lens.git
cd doc-lens

# 2. 编译为单二进制文件
go build -o bin/doc-lens .

# 3. 运行服务
./bin/doc-lens
```

---

## ⚙️ 配置文件说明 (`config.yaml`)

```yaml
port: 18086
host: "0.0.0.0"

auth:
  initial_password: "admin888"   # 首次登录密码，启动后自动转换为 bcrypt 加密哈希
  session_secret: ""             # 留空时系统首次启动自动生成 32 字节高熵随机密钥
  session_days: 180              # 登录 Cookie 保持天数

repositories:
  - id: docs
    name: "技术知识库 (Docs)"
    path: "./docs"               # 本地 Markdown/代码仓库路径
    route_prefix: "/docs"        # Web 访问路由前缀
    description: "团队内部核心技术架构与实战文档"
    writable: true               # 是否允许 AI 扩写回写
    ignore_dirs:
      - ".git"
      - "node_modules"

ai:
  runner_cmd: "dagu-ai"          # 外部 AI 命令行工具或脚本
  max_queue: 10                  # 最大并发排队任务数
```

---

## 🐧 Linux 生产环境 Systemd 托管

创建用户级服务配置文件 `~/.config/systemd/user/doc-lens.service`：

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

管理控制命令：
```bash
systemctl --user daemon-reload
systemctl --user enable --now doc-lens
systemctl --user status doc-lens
```

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 协议开源。
