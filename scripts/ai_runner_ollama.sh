#!/usr/bin/env bash
# ==============================================================================
# DocLens AI Runner 官方参考实现 (Ollama 本地大模型 Shell 版)
# ==============================================================================
# 协议契约：接受 -p "<prompt>" 入参，在当前工作目录下读写文件，并输出 file:/// 路径。
# ==============================================================================

set -euo pipefail

PROMPT=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    -p|--prompt)
      PROMPT="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

if [[ -z "$PROMPT" ]]; then
  echo "[ERROR] 未指定 -p 提示词" >&2
  exit 1
fi

OLLAMA_HOST="${OLLAMA_HOST:-http://127.0.0.1:11434}"
OLLAMA_MODEL="${OLLAMA_MODEL:-qwen2.5:7b}"

echo "[doc-lens-runner] Invoking local Ollama ($OLLAMA_MODEL) at $OLLAMA_HOST..."

# 调用 Ollama 生成内容
RESPONSE=$(curl -sS "${OLLAMA_HOST}/api/generate" \
  -H "Content-Type: application/json" \
  -d "$(jq -n --arg model "$OLLAMA_MODEL" --arg prompt "$PROMPT" \
    '{model: $model, prompt: $prompt, stream: false}')" | jq -r '.response // empty')

if [[ -z "$RESPONSE" ]]; then
  echo "[ERROR] Ollama 返回内容为空或服务未启动" >&2
  exit 1
fi

# 在当前仓库目录下写入新文件
TIMESTAMP=$(date +"%Y-%m-%d-%H%M%S")
OUTPUT_FILE="$(pwd)/${TIMESTAMP}-ollama-draft.md"

echo "$RESPONSE" > "$OUTPUT_FILE"

echo "[doc-lens-runner] 文档写入成功: $OUTPUT_FILE"
# 核心协议：输出标准 file:// 路径以便 DocLens 识别重定向
echo "file://${OUTPUT_FILE}"
exit 0
