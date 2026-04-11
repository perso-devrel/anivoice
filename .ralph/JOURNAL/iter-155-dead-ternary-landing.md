# iter-155 — remove dead ternary in LandingPage PlanCard

## BACKLOG item
자가 생성 풀 — 코드 품질 개선 (dead code 제거)

## 원인/가설
- LandingPage PlanCard의 `highlight ? 'text-white' : 'text-white'` 조건문이 양쪽 분기 동일
- 불필요한 런타임 조건 → 정적 className으로 교체
- 인접 `<p>` 태그의 `highlight ? 'text-white' : 'gradient-text'`는 정상 분기로 유지

## 변경 파일
- `src/pages/LandingPage.tsx` — line 143 dead ternary → static className

## 검증 결과
- `npm run build` 통과
- `npm run test` 381 passed
- `node .ralph/test/dub-flow.mjs` exit 77 (upstream Perso API 500 지속, 코드 회귀 아님)

## PR
- Issue: #481
- PR develop: #482 (squash merge)
- PR main: #483 (merge)

## 다음 루프 참고
- dub-flow 회귀: Perso API 500 지속 — exit 77 외부 장애
- 추가 발견: StudioPage:111 하드코딩 에러 문자열, PricingPage:355 "CVC" 비i18n, PricingPage 중복 !user 가드
