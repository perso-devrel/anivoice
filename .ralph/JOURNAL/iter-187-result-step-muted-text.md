# iter-187 — extract ResultStep duplicate muted text className

## BACKLOG 항목
자가 생성 풀: 중복 className 패턴 제거 (ResultStep.tsx)

## 원인 / 가설
dub-flow 실패 원인: exit 77 — Perso API `/portal/api/v1/spaces` 지속 HTTP 500 반환. 코드 회귀 아님, 외부 장애.
코드 작업: ResultStep.tsx에 `text-sm text-surface-200/60` className이 3곳 중복.

## 변경 파일
- `src/components/ResultStep.tsx`: `RESULT_MUTED_TEXT` 상수 추출, 3곳 교체

## 검증 결과
- `npm run build`: ✔ 통과
- `node .ralph/test/dub-flow.mjs`: exit 77 (upstream-down, Perso API 500 지속)
- PR #639 → develop squash merge, PR #640 → main merge 완료

## 다음 루프 주의사항
- Perso API 500 지속 — dub-flow full pass 불가
- SettingsStep.tsx에도 `text-sm font-medium text-surface-200/80` 라벨 패턴 2~3곳 중복 있음 (다음 후보)
