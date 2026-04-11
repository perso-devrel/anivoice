# Iteration 190 — LibraryDetailPage PAGE_SHELL_CLASS 추출

## BACKLOG 항목
자가 생성 풀 — 중복 className 상수 추출 (P2 리팩터)

## 원인/배경
- dub-flow 실패 원인은 Perso API 500 (exit 77, upstream-down) — 코드 회귀 아님
- 코드 개선 항목으로 전환: LibraryDetailPage에서 `min-h-screen bg-surface-950 pt-24 pb-16` className이 loading/error/normal 3개 `<main>` 요소에 반복
- PAGE_SHELL_CLASS 상수로 추출

## 변경 파일
- `src/pages/LibraryDetailPage.tsx`: PAGE_SHELL_CLASS 상수 추가, 3개 `<main>` className 교체

## 검증 결과
- `npm run build` ✔ (823ms)
- `node .ralph/test/dub-flow.mjs` → exit 77 (upstream-down, Perso API 500 지속)
- PR #652 → develop squash merge ✔
- PR #653 → main merge ✔

## 주의사항
- Perso API 500 지속 중 — dub-flow exit 0 불가 (외부 장애)
- Issue #651, PR #652/#653
