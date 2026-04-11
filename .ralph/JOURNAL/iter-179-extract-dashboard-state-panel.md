# iter-179 — extract DashboardPage StatePanel

## BACKLOG 항목
자가 생성 풀 — DashboardPage 중복 상태 패널 래퍼 추출

## 배경
직전 dub-flow 회귀 테스트(iter-179 시작 시) exit 77 — Perso API 500 persistent.
코드 회귀 아님. 자가 생성 풀에서 리팩터링 항목 선택.

## 발견한 원인 / 가설
DashboardPage의 loading/error/empty/no-results 4개 상태 패널이 `glass rounded-2xl flex-col items-center justify-center text-center` 클래스 문자열을 동일하게 반복. padding만 p-16, p-12 sm:p-16, p-12로 차이.

## 변경 파일 목록과 이유
- `src/pages/DashboardPage.tsx`: StatePanel 내부 컴포넌트 추가, 4개 인라인 div를 StatePanel로 교체 (padding prop으로 차이 처리)

## 검증 결과
- `npm run build` ✔ (257KB 메인 번들, 변동 없음)
- `npx vitest run` ✔ 382개 테스트 통과
- `node .ralph/test/dub-flow.mjs` exit 77 (upstream-down, 코드 회귀 아님)

## PR
- Issue: #599
- PR develop: #600 (squash merge)
- PR main: #601 (merge)

## 다음 루프가 알아야 할 주의사항
- Perso API 500 지속 중 — exit 77 계속 예상
- DashboardPage 294→302줄 (StatePanel 함수 추가로 미미한 증가, 4곳 중복 제거)
