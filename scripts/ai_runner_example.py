#!/usr/bin/env python3
"""
DocLens AI Runner 官方参考实现 (Python 版)
=============================================================================
协议规范契约：
1. 接收参数：必须支持 `-p "<prompt>"` 作为用户任务的提示词输入。
2. 工作目录：Cwd 自动为当前仓库根目录 (repo.Path)。在此目录下读写 Markdown 文件。
3. 结果识别：在标准输出 (stdout) 中打印生成或修改的文件绝对路径：
   例如：file:///path/to/repo/topic/2026-11-01-report.md
4. 退出状态：执行成功退出码为 0；失败退出码非 0，并在 stderr/stdout 打印错误信息。

使用说明：
- 兼容所有 OpenAI 协议大模型 (DeepSeek, OpenAI, 智谱, Moonshot, Ollama 等)
- 纯 Python 原生标准库，零第三方依赖 (无需 pip install)
- 环境变量支持：
  export OPENAI_API_KEY="sk-xxxx"
  export OPENAI_BASE_URL="https://api.deepseek.com/v1"   # 可选，默认 DeepSeek
  export OPENAI_MODEL="deepseek-chat"                    # 可选
=============================================================================
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request


def extract_filename(prompt: str, content: str) -> str:
    """根据 Prompt 和生成内容推导合适的文件名"""
    # 尝试匹配第一行大标题 # 标题
    title_match = re.search(r"^#\s+([^\n\r]+)", content, re.MULTILINE)
    if title_match:
        raw_title = title_match.group(1).strip()
        # 清理不合法字符
        clean = re.sub(r'[\\/*?:"<>|]', "", raw_title)
        clean = clean.replace(" ", "-")[:40]
        if clean:
            today = time.strftime("%Y-%m-%d")
            return f"{today}-{clean}.md"

    # 兜底文件名
    return f"{time.strftime('%Y-%m-%d-%H%M%S')}-ai-note.md"


def main():
    parser = argparse.ArgumentParser(description="DocLens External AI CLI Runner")
    parser.add_argument("-p", "--prompt", required=True, help="Task prompt from DocLens")
    args = parser.parse_args()

    api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("DEEPSEEK_API_KEY")
    if not api_key:
        print("[ERROR] 未检测到 OPENAI_API_KEY 或 DEEPSEEK_API_KEY 环境变量！", file=sys.stderr)
        print("请在系统环境变量或启动前 export OPENAI_API_KEY='sk-xxxx'", file=sys.stderr)
        sys.exit(1)

    base_url = (os.environ.get("OPENAI_BASE_URL") or "https://api.deepseek.com/v1").rstrip("/")
    model = os.environ.get("OPENAI_MODEL") or "deepseek-chat"

    prompt = args.prompt
    print(f"[doc-lens-runner] Starting AI Task with model: {model} (Base URL: {base_url})")

    req_body = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": (
                    "你是一个专业的技术智库研究员与文档架构师。请以严谨客观、逻辑严密、深入本质的专业文风撰写文章。"
                    "要求使用标准 GitHub Flavored Markdown 格式，层级标题清晰，支持表格、代码块与结构化大纲。"
                ),
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.4,
    }

    url = f"{base_url}/chat/completions"
    data = json.dumps(req_body).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
            "User-Agent": "DocLens-AI-Runner/1.0",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            resp_data = json.loads(resp.read().decode("utf-8"))
            content = resp_data["choices"][0]["message"]["content"]
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        print(f"[ERROR] API 请求失败 HTTP {e.code}: {err_msg}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"[ERROR] 请求异常: {e}", file=sys.stderr)
        sys.exit(1)

    # 确定保存目录与文件名（当前工作目录为仓库根目录）
    cwd = os.getcwd()

    # 如果 Prompt 指明了特定文档追加或修改
    filename = extract_filename(prompt, content)
    output_path = os.path.join(cwd, filename)

    try:
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(content.strip() + "\n")
    except Exception as e:
        print(f"[ERROR] 写入文件失败: {e}", file=sys.stderr)
        sys.exit(1)

    # 协议关键步：输出 file:/// 协议绝对路径，以便 DocLens 前端立即聚焦跳转
    print(f"\n[doc-lens-runner] 文档生成成功！")
    print(f"file://{output_path}")
    sys.exit(0)


if __name__ == "__main__":
    main()
