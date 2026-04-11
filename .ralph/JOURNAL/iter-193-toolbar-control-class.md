# iter-193 — extract DashboardToolbar TOOLBAR_CONTROL_CLASS

## BACKLOG 항목
자가 생성 — 중복 className 상수 추출 시리즈 계속

## 원인 / 가설
dub-flow 회귀 테스트 실패가 트리거였으나, exit 77 (Perso API upstream 500)로 코드 회귀 아님. BACKLOG에서 다음 리팩터링 항목 진행.

DashboardToolbar의 input, select, button 3개 컨트롤이 동일한 base className (`py-1.5 rounded-lg bg-surface-800 text-sm border border-surface-700 transition-colors`) 공유.

## 변경 파일
- `src/components/DashboardToolbar.tsx` — TOOLBAR_CONTROL_CLASS 상수 추가, 3개 className에서 공통 부분 교체

## 검증
- `npm run build` ✅ (895ms)
- `node .ralph/test/dub-flow.mjs` → exit 77 (upstream Perso API 500, 코드 회귀 아님)
- PR #667 → develop squash merge, PR #668 → main merge

## 다음 루프 주의사항
- Perso API 500 상태 지속 중 — exit 77은 외부 장애
- 중복 className 상수 추출 시리즈 거의 완료, 남은 패턴 소진 시 다른 카테고리 탐색 필요
