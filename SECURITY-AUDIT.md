# DocLens 安全审计报告

> 审计时间：2026-10-25 | 审计范围：全量源码 + 网络暴露面 + 运行时验证

---

## 一、当前安全现状总览

```
公网暴露链路：
用户浏览器 → Cloudflare CDN → Cloudflare Tunnel → localhost:18086 (doc-lens)
                  ↑                    ↑
            无 Access 拦截        无 WAF / 无速率限制
            （刻意关闭，避免       应用层必须自行硬扛
              跨国认证延迟）
```

**设计约束**：`doc.zongqir.com` 不启用 Cloudflare Access（跨国 302 认证延迟严重影响体验），安全防线全部下沉到应用层。这意味着应用层代码必须对公网直接暴露的攻击面做到零容忍。

---

## 二、漏洞清单

### 🔴 致命级 (Critical)

#### C1. 请求体无大小限制 — OOM 打崩进程

| 字段 | 详情 |
|:---|:---|
| **位置** | `main.go:205`（login）、`main.go:367`（task submit） |
| **问题** | `json.NewDecoder(r.Body).Decode()` 直接读取 Body，**无 `http.MaxBytesReader` 限制**。 |
| **实测** | 发送 10MB prompt → 进程 RSS 从 ~2MB 飙到 **112MB**，`tasks.json` 膨胀至 **9.6MB** 持久化到磁盘。重复发送可 OOM Kill。 |
| **攻击成本** | 一条 `curl` 命令，零认证即可打 login 接口；认证后可打 tasks 接口。 |
| **修复** | 在 `json.NewDecoder` 前包装 `http.MaxBytesReader`（login 1KB / task 10KB）。 |

#### C2. AI 任务 Prompt 注入 — 无长度/内容校验

| 字段 | 详情 |
|:---|:---|
| **位置** | `task.go:92-133` |
| **问题** | `prompt` 字段仅检查非空，无长度上限（实测可写入 10M 字符），无敏感内容过滤。任务持久化到 `tasks.json` 后**每次重启都会全量加载到内存**。 |
| **影响** | 持续提交大 prompt → 磁盘填满 + 启动时 OOM。 |
| **修复** | prompt 硬限制 5000 字符 + tasks.json 只保留 prompt 前 500 字符摘要。 |

#### C3. Login 速率限制仅基于内存 — 重启即失效

| 字段 | 详情 |
|:---|:---|
| **位置** | `auth.go:21-28` |
| **问题** | `RateLimiter` 是纯内存 map。进程 crash/restart 后所有计数器归零。攻击者先触发 C1 的 OOM → 进程自动重启 → 限流清空继续爆破。 |
| **修复** | 加全局 API 速率限制中间件（令牌桶），覆盖所有 `/api/*`；login 限流是补充层。 |

### 🟠 高危级 (High)

#### H1. Login 接口可被 DDoS 吃 CPU

| 字段 | 详情 |
|:---|:---|
| **位置** | `main.go:190-229` |
| **问题** | bcrypt（cost=10）单次 ~70ms CPU。并发 1000 请求/秒 → NAS CPU 满载。IP 限流仅 5 次/15 分钟，多 IP 可绕过。 |
| **修复** | 全局速率限制中间件。 |

#### H2. 日志文件 tailBytes 无上限

| 字段 | 详情 |
|:---|:---|
| **位置** | `main.go:403-405` |
| **问题** | `tail` 参数用户可控且无上限校验。传 `?tail=999999999999` 即可让 `io.ReadAll` 尝试全量读取。 |
| **修复** | 硬限制 512KB。 |

#### H3. HTML Raw 渲染存在 XSS 风险

| 字段 | 详情 |
|:---|:---|
| **位置** | `main.go:339-343` |
| **问题** | `/raw/` 端点 CSP 包含 `'unsafe-inline' 'unsafe-eval'`，等于没有 CSP。知识库中若存在恶意 HTML 可触发 XSS。 |
| **修复** | 收紧 CSP 或将 HTML 当纯文本返回。 |

---

## 三、已有的安全防线

| 防线 | 状态 | 评价 |
|:---|:---|:---|
| bcrypt 密码存储 | ✅ | cost=10，无明文存储 |
| HMAC-SHA256 Session Token | ✅ | 时效 180 天，签名不可伪造 |
| 路径穿越防护 (SafeResolve) | ✅ | `filepath.Clean` + `EvalSymlinks` + 前缀检查，实测 `../../etc/passwd` 被拦截 |
| HTTP Server 超时 | ✅ | Read 30s / Write 60s / Idle 120s |
| 文件大小限制 | ✅ | `ReadFile` 拒绝超过 10MB 的文件 |
| 文件扩展名白名单 | ✅ | 只暴露文档/代码类文件 |
| 目录忽略列表 | ✅ | `.git`, `vault`, `node_modules` 等敏感目录被排除 |

---

## 四、加固措施实施状态 (已全部完成闭环修复)

| 序号 | 漏洞项 | 风险等级 | 加固措施 | 修复文件 | 状态 |
|:---|:---|:---|:---|:---|:---|
| 1 | C1. 请求体无大小限制 (OOM) | 🔴 Critical | Login 接口硬限制 1KB，Task 接口硬限制 32KB (`http.MaxBytesReader`) | `main.go` | ✅ 已修复并通过单测 |
| 2 | C2. Prompt 注入与膨胀 | 🔴 Critical | Prompt 限制 <= 5000 字符；`tasks.json` 持久化仅截断保存前 500 字符摘要，内存保留完整 Prompt 供 Worker 执行 | `main.go`, `task.go` | ✅ 已修复并通过单测 |
| 3 | C3. 纯内存登录限流与内存泄露 | 🔴 Critical | 增加每 5 分钟定时清理过期 IP 字典杜绝内存泄漏；增加全局 API 令牌桶中间件与单 IP 频次拦截 | `auth.go`, `main.go` | ✅ 已修复并通过单测 |
| 4 | H1. Login DDoS 与 CPU 耗尽 | 🟠 High | 增加全局登录限流 (10 req/s) 与单 IP 频次限制 (30s 内最多 10 次)，并在 bcrypt 前拦截 | `auth.go`, `main.go` | ✅ 已修复并通过单测 |
| 5 | H2. tailBytes 无上限 | 🟠 High | 日志尾部读取硬限制最大 512KB (`io.LimitReader`)，防止大日志导致内存暴涨 | `main.go`, `task.go` | ✅ 已修复并通过单测 |
| 6 | H3. Raw HTML/SVG XSS 风险 | 🟠 High | 收紧 `/raw/` 扩展名白名单；强制注入 `sandbox allow-scripts allow-forms`（隔离为独立 null 源）与 `X-Content-Type-Options: nosniff` | `main.go` | ✅ 已修复并通过单测 |
| 7 | C4. 真实客户端 IP 伪造绕过 | 🔴 Critical | 调整 IP 提取优先级：强制优先读取 Cloudflare 注入的 `CF-Connecting-IP`，消除通过伪造 `X-Forwarded-For` 绕过限流的漏洞 | `auth.go` | ✅ 已修复并通过单测 |
| 8 | H4. SafeResolve 软链接回退逻辑缺陷 | 🟠 High | 修复 `EvalSymlinks` 失败时回退直接返回未受限绝对路径的漏洞，强制校验其父目录归属 | `repo.go` | ✅ 已修复并通过单测 |
| 9 | H5. 敏感文件与忽略目录直读穿越 | 🟠 High | 从扩展名白名单剔除 `.env`；在 `SafeResolve` 中深度校验路径段，禁止直接读取 `.git`, `vault`, `.env` 及配置的 `IgnoreDirs` | `repo.go` | ✅ 已修复并通过单测 |
| 10 | M1. Session Cookie 凭据泄露 | 🟡 Medium | 启用动态安全上下文检测（HTTPS/Cloudflare 时标记 `Secure: true`），并将 `SameSite` 升级为 `Strict` | `auth.go` | ✅ 已修复并通过单测 |
| 11 | M2. Tree 强制刷新 I/O 滥用 | 🟡 Medium | 为 `refresh=true` 引入 10 秒防抖限流，防止频繁目录全扫描耗尽 NAS 磁盘 I/O | `repo.go` | ✅ 已修复并通过单测 |
| 12 | M3. Task TargetFile 路径探测 | 🟡 Medium | 在 `SubmitTask` 提交时通过 `SafeResolve` 严密校验目标文件路径与类型 | `task.go` | ✅ 已修复并通过单测 |

---

## 五、验证与回归测试

全量安全回归测试已集成至 `security_test.go`，测试涵盖：
1. `TestSecurity_GetClientIP`：IP 伪造防御与 Cloudflare 真实 IP 优先级校验
2. `TestSecurity_IsSecureRequest`：反向代理与 Cloudflare HTTPS 协议穿透识别
3. `TestSecurity_SafeResolve_And_ForbiddenPaths`：目录穿越、空字节注入、隐藏文件、`vault` 受限目录拦截
4. `TestSecurity_RateLimiters`：全局 API 令牌桶并发限流
5. `TestSecurity_TaskPromptTruncationAndLimits`：Prompt 长度校验与持久化截断
6. `TestSecurity_ReadTaskLogTailLimit`：日志读取 512KB 硬上限截断
7. `TestSecurity_HttpMaxBytesReader`：大 Body 拒绝与 OOM 拒绝服务防护

