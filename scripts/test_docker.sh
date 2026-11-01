#!/usr/bin/env bash
# ==============================================================================
# DocLens Docker 本地真机冒烟测试脚本
# 用法：./scripts/test_docker.sh
# 作用：在本地构建临时镜像并启动独立容器，验证端口连通性、配置自动初始化与脚本可用性
# ==============================================================================

set -euo pipefail

TEST_IMAGE="doc-lens-smoke:local"
CONTAINER_NAME="doc-lens-smoke-test"
TEST_PORT="28086"
TEST_DIR="/tmp/doclens-test-$(date +%s)"

echo "=== [1/4] 构建本地测试 Docker 镜像 ==="
docker build -t "${TEST_IMAGE}" .

echo "=== [2/4] 启动测试容器 (映射端口 ${TEST_PORT}, 挂载数据卷 ${TEST_DIR}) ==="
mkdir -p "${TEST_DIR}"
docker run -d \
  --name "${CONTAINER_NAME}" \
  -p "${TEST_PORT}:18086" \
  -v "${TEST_DIR}:/data" \
  -e DOCLENS_INITIAL_PASSWORD=smoke_test_pass \
  "${TEST_IMAGE}"

trap 'echo "=== 清理测试环境 ==="; docker stop "${CONTAINER_NAME}" >/dev/null 2>&1 || true; docker rm "${CONTAINER_NAME}" >/dev/null 2>&1 || true; docker run --rm -v /tmp:/tmp alpine rm -rf "${TEST_DIR}" >/dev/null 2>&1 || true; echo "=== 测试环境已清理完毕 ==="' EXIT

echo "=== [3/4] 验证容器服务健康状态 ==="
sleep 2

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${TEST_PORT}/")
if [ "${HTTP_CODE}" -eq 200 ]; then
  echo "✅ 端口连通性测试通过 (HTTP 200 OK)"
else
  echo "❌ 端口连通性测试失败 (HTTP ${HTTP_CODE})"
  docker logs "${CONTAINER_NAME}"
  exit 1
fi

echo "=== [4/4] 验证容器内置 AI 运行环境与脚本 ==="
docker exec "${CONTAINER_NAME}" python3 --version
docker exec "${CONTAINER_NAME}" python3 /app/scripts/ai_runner_example.py -h >/dev/null
echo "✅ AI Runner 脚本与 Python 运行时测试通过"

if [ -f "${TEST_DIR}/config.yaml" ] && [ -d "${TEST_DIR}/docs" ]; then
  echo "✅ 容器自动数据初始化测试通过 (/data/config.yaml & /data/docs/ 生成正常)"
else
  echo "❌ 容器数据卷初始化异常"
  exit 1
fi

echo ""
echo "🎉 所有 Docker 真机冒烟测试全部通过！Docker 镜像质量 100% 达标！"
