#!/usr/bin/env bash
# .ralph/run.sh
# KoeDub Ralph harness — 무한 자율 모드.
#
# 매 iteration 마다:
#   1. dub-flow 회귀 테스트를 돌려 현재 회귀가 깨졌는지 확인
#   2. 실패하면 Claude 를 호출해 분석/수정 (Claude CLI 가 PATH 에 있을 때)
#   3. 성공하면 BACKLOG 처리를 위해 Claude 를 호출 (P1 새 기능 / 후속 작업)
#   4. 어떤 경우든 다음 iteration 으로
#
# 종료 조건: MAX_ITERATIONS 또는 사용자가 SIGINT (Ctrl-C)
set -u

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
RALPH_DIR="$PROJECT_DIR/.ralph"
LOG_DIR="$RALPH_DIR/logs"
JOURNAL_DIR="$RALPH_DIR/JOURNAL"
STATE_JSON="$RALPH_DIR/state.json"

MAX_ITERATIONS="${MAX_ITERATIONS:-200}"
COOLDOWN="${COOLDOWN:-15}"
DUB_TIMEOUT="${DUB_TIMEOUT:-1500}"        # 한 번 dub-flow 최대 25분
CLAUDE_TIMEOUT="${CLAUDE_TIMEOUT:-1800}"  # Claude 한 회 호출 최대 30분
MAX_POLL_MINUTES="${MAX_POLL_MINUTES:-15}"

mkdir -p "$LOG_DIR" "$JOURNAL_DIR"
cd "$PROJECT_DIR" || exit 1

echo "[$(date)] Ralph harness start (MAX_ITERATIONS=$MAX_ITERATIONS)" | tee -a "$LOG_DIR/harness.log"
echo '{"done": false, "iteration": 0}' > "$STATE_JSON"

# claude CLI 존재 여부 캐싱
HAS_CLAUDE=0
if command -v claude >/dev/null 2>&1; then
  HAS_CLAUDE=1
  echo "[$(date)] claude CLI detected — autonomous mode active" | tee -a "$LOG_DIR/harness.log"
else
  echo "[$(date)] ⚠ claude CLI not in PATH — running regression-only mode" | tee -a "$LOG_DIR/harness.log"
fi

# 한 번 Claude 호출 (실패 분석 또는 BACKLOG 처리)
invoke_claude() {
  local mode="$1"          # "fix" or "backlog"
  local iter="$2"
  local fail_log="${3:-}"

  if [ "$HAS_CLAUDE" -eq 0 ]; then
    return 0
  fi

  local ts="$(date +%Y%m%d-%H%M%S)"
  local claude_log="$LOG_DIR/claude-${mode}-iter${iter}-${ts}.log"
  local prompt_file="$RALPH_DIR/.runtime-prompt.md"

  {
    cat "$RALPH_DIR/PROMPT.md"
    echo ""
    echo "## 이번 iteration (${iter}) — mode: ${mode}"
    echo ""
    if [ "$mode" = "fix" ] && [ -n "$fail_log" ]; then
      echo "직전 dub-flow 회귀 테스트가 실패했다. 원인을 분석해 수정하고 PR 머지까지 진행하라."
      echo ""
      echo "실패 로그 마지막 100줄 ($fail_log):"
      echo '```'
      tail -100 "$fail_log"
      echo '```'
    else
      echo "회귀 테스트는 통과했다. BACKLOG.md 의 가장 위 미완료 항목을 한 단위로 진행하라."
      echo "한 iteration 한 결함만, build + dub-flow 통과 후 develop → main 까지 머지."
    fi
  } > "$prompt_file"

  echo "[iter $iter] invoking Claude (mode=$mode) → $claude_log" | tee -a "$LOG_DIR/harness.log"
  timeout --signal=SIGTERM "$CLAUDE_TIMEOUT" \
    claude -p \
      --dangerously-skip-permissions \
      --output-format stream-json \
      --verbose \
      < "$prompt_file" \
      >> "$claude_log" 2>&1 || true
}

iteration=0
while (( iteration < MAX_ITERATIONS )); do
  iteration=$((iteration + 1))
  ts="$(date +%Y%m%d-%H%M%S)"
  log_file="$LOG_DIR/run-iter${iteration}-${ts}.log"

  touch "$RALPH_DIR/heartbeat"

  echo "" | tee -a "$LOG_DIR/harness.log"
  echo "════ iter $iteration @ $ts ════" | tee -a "$LOG_DIR/harness.log"

  # 1) 빌드 점검 (직전 iter 의 변경이 깨뜨렸을 수 있음)
  if [ -f "$PROJECT_DIR/package.json" ]; then
    npm run build > "$LOG_DIR/build-iter${iteration}-${ts}.log" 2>&1
    build_exit=$?
    if [ "$build_exit" -ne 0 ]; then
      echo "[iter $iteration] ✗ npm run build FAILED — invoking Claude to recover" | tee -a "$LOG_DIR/harness.log"
      invoke_claude "fix" "$iteration" "$LOG_DIR/build-iter${iteration}-${ts}.log"
      sleep "$COOLDOWN"
      continue
    fi
  fi

  # 2) dub-flow 회귀 테스트 실행
  timeout --signal=SIGTERM "$DUB_TIMEOUT" \
    env MAX_POLL_MINUTES="$MAX_POLL_MINUTES" \
    node "$RALPH_DIR/test/dub-flow.mjs" \
    > "$log_file" 2>&1
  exit_code=$?

  echo "[iter $iteration] dub-flow exit=${exit_code} log=${log_file}" | tee -a "$LOG_DIR/harness.log"

  if grep -q "ALL VIDEOS DUBBED SUCCESSFULLY" "$log_file"; then
    echo "[iter $iteration] ✔ regression PASSED" | tee -a "$LOG_DIR/harness.log"
    cat > "$STATE_JSON" <<EOF
{"done": false, "iteration": ${iteration}, "lastPass": "${log_file}", "ts": "${ts}", "mode": "backlog"}
EOF
    # 회귀 통과 → BACKLOG 처리 단계
    invoke_claude "backlog" "$iteration"
  else
    echo "[iter $iteration] ✗ regression FAILED" | tee -a "$LOG_DIR/harness.log"
    cat > "$STATE_JSON" <<EOF
{"done": false, "iteration": ${iteration}, "lastFail": "${log_file}", "ts": "${ts}", "mode": "fix"}
EOF
    invoke_claude "fix" "$iteration" "$log_file"
  fi

  sleep "$COOLDOWN"
done

echo "[$(date)] Ralph harness reached MAX_ITERATIONS=$MAX_ITERATIONS" | tee -a "$LOG_DIR/harness.log"
exit 0
