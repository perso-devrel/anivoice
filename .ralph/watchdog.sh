#!/usr/bin/env bash
# .ralph/watchdog.sh — heartbeat 가 너무 오래 갱신 안 되면 stuck 으로 간주하고 dub-flow 만 kill
set -u
RALPH_DIR="$(cd "$(dirname "$0")" && pwd)"
HEARTBEAT="$RALPH_DIR/heartbeat"
LOG="$RALPH_DIR/logs/watchdog.log"
THRESHOLD="${THRESHOLD:-1800}"  # 30분

mkdir -p "$RALPH_DIR/logs"
echo "[$(date)] watchdog start (threshold=${THRESHOLD}s)" >> "$LOG"

while true; do
  if [ -f "$HEARTBEAT" ]; then
    now=$(date +%s)
    if stat -c %Y "$HEARTBEAT" >/dev/null 2>&1; then
      mtime=$(stat -c %Y "$HEARTBEAT")
    else
      mtime=$(stat -f %m "$HEARTBEAT")
    fi
    age=$(( now - mtime ))
    if (( age > THRESHOLD )); then
      echo "[$(date)] STALL detected (age=${age}s) — killing dub-flow & claude" >> "$LOG"
      pkill -f "dub-flow.mjs" 2>/dev/null || true
      pkill -f "claude -p" 2>/dev/null || true
      touch "$HEARTBEAT"
    fi
  fi
  sleep 60
done
