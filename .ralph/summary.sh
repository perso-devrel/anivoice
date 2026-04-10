#!/usr/bin/env bash
# .ralph/summary.sh — 야간 실행 결과를 5분 안에 리뷰할 수 있도록 요약
cd "$(dirname "$0")/.." || exit 1

echo "# Ralph 리포트 — $(date)"
echo
echo "## state.json"
cat .ralph/state.json 2>/dev/null || echo "(없음)"
echo
echo
echo "## 현재 브랜치"
git branch --show-current
echo
echo "## 커밋 (지난 16시간)"
git log --oneline --since="16 hours ago"
echo
echo "## 최근 5개 dub-flow 로그 마지막 줄"
ls -1t .ralph/logs/run-iter*.log 2>/dev/null | head -5 | while read -r f; do
  echo "### $f"
  tail -3 "$f"
  echo
done
echo
echo "## STATE"
cat .ralph/STATE.md
echo
echo "## BACKLOG"
cat .ralph/BACKLOG.md
echo
echo "## JOURNAL (최근 3개)"
ls -1t .ralph/JOURNAL/*.md 2>/dev/null | head -3 | while read -r f; do
  echo "### $f"
  cat "$f"
  echo
done
