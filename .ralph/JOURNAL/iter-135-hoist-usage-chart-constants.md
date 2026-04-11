# iter-135 — hoist UsageChart inline object literals to module-level constants

## BACKLOG 항목
자가 생성 풀 — 성능/리팩터: UsageChart 인라인 객체 리터럴을 모듈 수준 상수로 추출

## 발견한 원인 / 가설
- dub-flow 실패 원인: Perso API persistent 500 (exit 77, upstream-down). 코드 회귀 아님.
- 코드 개선 대상: UsageChart에서 매 렌더마다 5개 객체 리터럴 + 1개 화살표 함수를 재생성하고 있었음.
- tick 스타일 객체가 XAxis/YAxis에 동일한 값으로 중복 정의되어 있었음.

## 변경 파일 목록과 이유
- `src/components/UsageChart.tsx` — 인라인 객체 5개를 CHART_MARGIN, AXIS_TICK_STYLE, TOOLTIP_CONTENT_STYLE, TOOLTIP_LABEL_STYLE, TOOLTIP_ITEM_STYLE 상수로 추출. labelFormatter를 모듈 수준 formatTooltipLabel 함수로 추출. formatter는 t() 의존성 때문에 컴포넌트 내부에 유지.

## 검증 결과
- `npm run build` ✔ (257KB 메인 번들, 변동 없음)
- `npm run lint` ✔ (0 errors, 0 warnings)
- `node .ralph/test/dub-flow.mjs` → exit 77 (upstream-down, 코드 회귀 아님)
- PR #383 → develop squash merge 완료
- PR #384 → main merge 완료
- GitHub issue: #382

## 다음 루프가 알아야 할 주의사항
- Perso API 여전히 500 반환 중. dub-flow exit 0 확인은 API 복구 시점에 다시 시도 필요.
- BACKLOG P2 미완료 항목 2개 (다운로드 URL HEAD 검증, 다국어 회귀)는 모두 API 필요.
- 자가 생성 풀에서 다음 작업을 선택해야 함.
