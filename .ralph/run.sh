#!/usr/bin/env bash
# .ralph/run.sh
# AniVoice Ralph harness — dub-flow 가 두 영상 모두 통과할 때까지 반복 실행
set -u

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
RALPH_DIR="$PROJECT_DIR/.ralph"
LOG_DIR="$RALPH_DIR/logs"
JOURNAL_DIR="$RALPH_DIR/JOURNAL"
STATE_JSON="$RALPH_DIR/state.json"

MAX_ITERATIONS="${MAX_ITERATIONS:-50}"
COOLDOWN="${COOLDOWN:-10}"
DUB_TIMEOUT="${DUB_TIMEOUT:-1500}"      # 한 번의 dub-flow 실행 최대 25분
MAX_POLL_MINUTES="${MAX_POLL_MINUTES:-15}"

mkdir -p "$LOG_DIR" "$JOURNAL_DIR"
cd "$PROJECT_DIR" || exit 1

echo "[$(date)] Ralph harness start" | tee -a "$LOG_DIR/harness.log"
echo '{"done": false, "iteration": 0}' > "$STATE_JSON"

iteration=0
while (( iteration < MAX_ITERATIONS )); do
  iteration=$((iteration + 1))
  ts="$(date +%Y%m%d-%H%M%S)"
  log_file="$LOG_DIR/run-iter${iteration}-${ts}.log"

  touch "$RALPH_DIR/heartbeat"

  echo "" | tee -a "$LOG_DIR/harness.log"
  echo "════ iter $iteration @ $ts ════" | tee -a "$LOG_DIR/harness.log"

  # dub-flow 실행
  timeout --signal=SIGTERM "$DUB_TIMEOUT" \
    env MAX_POLL_MINUTES="$MAX_POLL_MINUTES" \
    node "$RALPH_DIR/test/dub-flow.mjs" \
    > "$log_file" 2>&1
  exit_code=$?

  echo "[iter $iteration] exit=${exit_code} log=${log_file}" | tee -a "$LOG_DIR/harness.log"

  # 성공 판정
  if grep -q "ALL VIDEOS DUBBED SUCCESSFULLY" "$log_file"; then
    echo "[iter $iteration] ✔ SUCCESS — both videos dubbed" | tee -a "$LOG_DIR/harness.log"
    cat > "$STATE_JSON" <<EOF
{"done": true, "iteration": ${iteration}, "log": "${log_file}", "ts": "${ts}"}
EOF
    echo "[$(date)] Ralph harness done after ${iteration} iteration(s)" | tee -a "$LOG_DIR/harness.log"
    exit 0
  fi

  # 실패 — Claude 에게 다음 iteration 에서 분석/수정하도록 PROMPT 주입
  echo "[iter $iteration] ✗ FAIL — invoking Claude to analyze and fix" | tee -a "$LOG_DIR/harness.log"

  claude_log="$LOG_DIR/claude-iter${iteration}-${ts}.log"

  # PROMPT 에 직전 실패 로그 경로를 주입
  prompt_file="$RALPH_DIR/.runtime-prompt.md"
  {
    cat "$RALPH_DIR/PROMPT.md"
    echo ""
    echo "## 이번 iteration ($iteration) 의 dub-flow 실패 로그"
    echo ""
    echo "경로: $log_file"
    echo ""
    echo "마지막 80줄:"
    echo '```'
    tail -80 "$log_file"
    echo '```'
  } > "$prompt_file"

  if command -v claude >/dev/null 2>&1; then
    timeout --signal=SIGTERM 1500 \
      claude -p \
        --dangerously-skip-permissions \
        --output-format stream-json \
        --verbose \
        < "$prompt_file" \
        >> "$claude_log" 2>&1 || true
  else
    echo "[iter $iteration] ⚠ claude CLI not found in PATH — pausing for human intervention" | tee -a "$LOG_DIR/harness.log"
  fi

  cat > "$STATE_JSON" <<EOF
{"done": false, "iteration": ${iteration}, "lastFail": "${log_file}", "ts": "${ts}"}
EOF

  sleep "$COOLDOWN"
done

echo "[$(date)] Ralph harness reached MAX_ITERATIONS=$MAX_ITERATIONS without success" \
  | tee -a "$LOG_DIR/harness.log"
exit 2
