# DocLens 外部 AI CLI 执行器接口规范 (AI Runner Protocol)

> **设计哲学**：DocLens 拒绝在服务端硬编码任何专有大模型 SDK。我们采用高度解耦的 **Agentic CLI Runner 机制**——将 AI 思考、检索与代码/文档生成的能力交给独立的命令行程序（无论是几行 Python 脚本、本地 Ollama，还是复杂的自主 Agent 如 Claude Code、Antigravity agy、Aider）。  
> 只要符合下述极简契约，任何程序都能立即作为 DocLens 的 AI 知识大脑。

---

## 📋 核心调用契约 (The Contract)

### 1. 调用方式与传参
当用户在前端点击「AI 创作」或派发任务时，DocLens 后台的任务调度器（`task.go`）将通过子进程发起执行：

```bash
<runner_cmd> -p "<full_prompt>"
```

- **参数名**：固定以 `-p`（或 `--prompt`）传递用户组装好的完整提示词。
- **提示词内容**：包含当前操作意图（新增 / 补充 / 修改 / 解剖）、参考上下文文档的相对路径，以及用户输入的具体要求（最大 5,000 字符）。

### 2. 工作目录 (Working Directory)
- **Cwd**：子进程启动时的当前工作目录被**严格锁定为当前目标仓库的物理根目录**（`repo.Path`）。
- **读写规范**：Runner 程序可直接在当前目录下寻找参考文档进行读取，并在此目录下创建新的 Markdown 文件或就地修改目标文档。

### 3. 环境变量与网络代理 (Environment)
- **基础环境**：子进程自动继承 DocLens 主进程的环境变量（包含系统的 `PATH` 等）。
- **网络代理**：如果 `config.yaml` 中配置了 `ai.proxy`，DocLens 会在启动子进程前自动为其注入 `http_proxy`、`https_proxy`、`all_proxy`，确保境内外环境无缝调用大模型。

### 4. 日志捕获与终端流 (Logs & Streaming)
- 子进程的 `stdout`（标准输出）和 `stderr`（标准错误）会被实时写入任务日志文件（`state/logs/<task-id>.log`）。
- 前端界面的**「AI 任务控制台」**会实时长轮询读取该日志，呈现类似黑客终端的打字机流式输出。

### 5. 产出文档识别机制 (Result Detection)
任务完成后，DocLens 需要知道生成或修改了哪篇文档，以便在前端自动高亮目录并一键直达阅读。识别遵循三级优先级：

1. **第一优先级（推荐，精准度最高）**：  
   Runner 脚本在完成文档落盘后，在控制台任意一行输出标准的文件 URI：  
   ```text
   file:///path/to/repo/architecture/system-design.md
   ```
   DocLens 会通过正则捕获该路径并反转义，立即生成前端直达路由。
2. **第二优先级（修改/追加意图兜底）**：  
   若是修改（modify）或补充（append）已有文章，自动重定向至原本的 `TargetFile`。
3. **第三优先级（文件系统 Diff 探针）**：  
   若 Runner 未输出 `file://`，DocLens 会自动扫描仓库，寻找在任务启动时间戳之后被新创建或修改的最新 `.md` 文件。

### 6. 进程退出码 (Exit Code)
- **`0`**：表示任务成功。DocLens 会将任务状态更新为 `completed`，并**自动清理该仓库的目录树缓存**，前端目录树秒级出现新文件。
- **非 `0`**：表示任务失败。DocLens 标记为 `failed`，并记录退出码与错误原因。

---

## 🛠️ 开箱即用参考实现

我们在项目根目录的 [scripts/](file:///home/zongqir/code/tool/doc-lens/scripts/) 中提供了官方参考实现：

### 方案 A：通用 OpenAI 兼容协议脚本（支持 DeepSeek / 智谱 / Kimi / OpenAI）
- 文件路径：[scripts/ai_runner_example.py](file:///home/zongqir/code/tool/doc-lens/scripts/ai_runner_example.py)
- 特点：**纯 Python 3 原生标准库，零 pip 第三方依赖**。
- 配置示例（`config.yaml`）：
  ```yaml
  ai:
    runner_cmd: "python3 scripts/ai_runner_example.py"
  ```
- 环境变量设置：
  ```bash
  export OPENAI_API_KEY="sk-你的密钥"
  export OPENAI_BASE_URL="https://api.deepseek.com/v1"  # 默认为 DeepSeek
  export OPENAI_MODEL="deepseek-chat"
  ```

### 方案 B：本地离线大模型（Ollama）
- 文件路径：[scripts/ai_runner_ollama.sh](file:///home/zongqir/code/tool/doc-lens/scripts/ai_runner_ollama.sh)
- 特点：纯 Bash + curl，开箱即用对接本地运行的 Ollama。
- 配置示例（`config.yaml`）：
  ```yaml
  ai:
    runner_cmd: "bash scripts/ai_runner_ollama.sh"
  ```
- 环境变量支持：
  ```bash
  export OLLAMA_HOST="http://127.0.0.1:11434"
  export OLLAMA_MODEL="qwen2.5:7b"
  ```

### 方案 C：接入自主 Agent CLI
若本地已安装更强大的 CLI 工具（如 Antigravity `agy`、Claude Code、Aider 等）：
```yaml
ai:
  # 直接将命令填入 runner_cmd 即可
  runner_cmd: "agy"
```

---

## 🐳 Docker 容器环境特别说明
Docker 镜像默认基于纯净的 Alpine Linux。如果在 Docker 容器中运行 AI 任务，有两种主流做法：
1. **容器内置 Python 运行**：将 `scripts/ai_runner_example.py` 挂载进容器 `/data` 目录，通过环境变量传入 API Key。
2. **通过宿主机 Runner 执行**：若使用的是宿主机专有环境（如宿主机定制的 Shell 脚本），可将宿主机执行脚本或 Docker socket 挂载映射调用。
