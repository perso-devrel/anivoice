# iter-136: hoist StudioPage stage constants to module level

## BACKLOG 항목
자가 생성 풀 — StudioPage 인라인 정적 배열을 모듈 수준 상수로 추출

## 원인 / 가설
- `ResultStep` 내부에 `stageOrder` 배열과 `progressLabels` 배열이 매 렌더마다 재생성
- iter-135에서 UsageChart에 동일 패턴 적용한 것의 연장선

## 변경 파일
- `src/pages/StudioPage.tsx` — `STAGE_ORDER`, `PROGRESS_STAGE_I18N` 상수 추출, `ResultStep` 내부 코드 단순화

## 검증 결과
- `npm run build` ✓ (257KB 메인 번들 유지)
- `dub-flow` exit 77 (upstream Perso API 500 지속, 코드 회귀 아님)

## 이슈/PR
- Issue: #387
- PR develop: #388 (squash merge)
- PR main: #389 (merge)

## 다음 루프 참고
- Perso API 500 지속 — exit 77 upstream-down
- dub-flow 통과(exit 0) 불가 상태 지속, 코드 변경 없는 외부 장애
