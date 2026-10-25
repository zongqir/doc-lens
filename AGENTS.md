# DocLens Agent 开发指南与架构速查手册 (AGENTS.md)

本文件是为 AI 编程助手（Agent）定制的**项目全局架构地图与操作规范**。每次进入本仓库，请优先参考本文档，**严禁无意义的全库盲搜与过度探测**，直接直达目标文件。

---

## 1. 核心架构与文件职责速查

DocLens 是一个轻量级、单二进制的本地技术文档/代码透视知识库系统（Go 后端 + 原生前端 SPA + `//go:embed` 打包）。

### 前端模块 (`web/`)
所有前端文件在编译时通过 `//go:embed web/*` 嵌入二进制，修改后必须重新编译并重启服务。

| 文件路径 | 职责范围 | 关键定位与函数 |
| :--- | :--- | :--- |
| **`web/index.html`** | SPA 骨架与 DOM 结构 | `#articleHeader`（文档头部）、`#articleBody`（正文）、`#sidebar`（目录树）、各种 Modal 弹窗 |
| **`web/css/style.css`** | 全局样式与响应式断点 | • 前半部：主题变量、排版、卡片、按钮规范(`.btn`)<br>• `~L2234`: `@media (max-width: 900px)`（平板/目录折叠）<br>• `~L2279`: `@media (max-width: 640px)`（手机端优化、`.article-actions` 单行排版） |
| **`web/js/app.js`** | 纯原生 JS 业务逻辑与渲染控制器 | • `renderDocContent()`: 文档正文与头部操作按钮渲染<br>• `toggleFavorite()`: 文档/目录收藏状态切换<br>• `renderTree()`: 左侧目录树高性能递归与过滤<br>• `openAiTaskModal()`: AI 知识库任务派发与操作流模态框<br>• `openQuickSearch()`: 跨库快速全局检索弹窗 |

### 后端模块 (`*.go`)
| 文件路径 | 职责范围 |
| :--- | :--- |
| **`main.go`** | HTTP 路由注册、中间件鉴权、嵌入式静态资源分发（`webFS`）、API 接口定义 |
| **`repo.go`** | 知识库目录扫描、文档读取（Markdown/HTML/代码）、目录树内存构建与检索 |
| **`task.go`** | 异步 AI 写作与深度解剖任务队列、状态轮询与存储 |
| **`auth.go`** | Session Cookie 校验、密码验证与安全性检查 |
| **`config.go` / `config.yaml`** | 仓库配置、端口监听（默认 18086）、用户密码 Hash 与知识库映射 |

---

## 2. 编译构建与热重启标准流程 (Runbook)

由于前端资源采用 Go 内置嵌入，修改 `web/` 或 `*.go` 后请直接执行以下标准构建命令：

```bash
# 1. 统一编译命令（指定环境已就绪的 Go 工具链）：
/home/zongqir/go/pkg/mod/golang.org/toolchain@v0.0.1-go1.26.0.linux-amd64/bin/go build -o bin/doc-lens .

# 2. 重启 systemd 用户服务：
systemctl --user restart doc-lens

# 3. 验证服务状态（确保 active 即可）：
systemctl --user is-active doc-lens
```

> **注意**：
> - 勿运行 `go vet` 或尝试重新下载 Go 工具链。
> - 服务运行在系统用户级服务 `doc-lens.service`，监听端口以 `config.yaml` 为准（当前为 `18086`）。

---

## 3. Agent 行为准则 (Rules for AI)

1. **拒绝盲搜**：遇到样式或文案修改，直接定位 `web/css/style.css` 或 `web/js/app.js`，禁止全盘地毯式 grep。
2. **保持轻量**：前端坚持纯原生（No Node/Webpack/Vite 依赖），保持毫秒级加载。
3. **改完即闭环**：修改前端代码后，必须完成「编译 -> 重启服务 -> 校验端口」，让用户刷新页面即可见到效果，不要只改文件不部署。

---

## 4. 远程备份与版本控制 (Git)
- **远程仓库**：`git@gitee.com:zongqir-os/doc-lens.git`（分支 `main`）
- **编译产物**：已配置 `.gitignore` 排除 `bin/` 二进制。
- **提交与推送**：功能修改闭环后，执行 `git add . && git commit -m "..." && git push origin main` 备份。
