# iter-167 — merge duplicate select plan buttons

## BACKLOG 항목
자가 생성 풀: PricingPage 중복 selectPlan 버튼 JSX 통합

## 배경
- iteration 167은 dub-flow 회귀 실패 수정으로 지정됨
- 로그 분석 결과 Perso API HTTP 500 (upstream-down, exit 77) — 코드 회귀 아님
- 코드 수정 불필요하므로 자가 생성 풀에서 리팩터 항목 선택

## 변경 파일 및 이유
- `src/pages/PricingPage.tsx`: highlighted/normal 분기로 두 개의 동일한 `<button>` 요소가 있었음 (onClick, children 동일, className만 다름). 하나의 버튼 + 조건부 className으로 통합 (-8줄, +5줄)

## 검증 결과
- `npm run build` — 통과 (257KB 메인 번들 유지)
- `node .ralph/test/dub-flow.mjs` — exit 77 (upstream Perso API 500, 코드 회귀 아님)

## PR/이슈
- Issue: #539
- PR develop: #540 (squash merged)
- PR main: #541 (merge)

## 다음 루프 주의사항
- Perso API 500 지속 중 — dub-flow exit 77은 정상 분류
- P2 미완료 2개(다운로드 URL HEAD 검증, 다국어 회귀)는 API 복구 필요
- 자가 생성 풀에서 계속 진행 가능
