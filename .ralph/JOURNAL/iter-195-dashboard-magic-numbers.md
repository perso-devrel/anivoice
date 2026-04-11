# iter-195 — extract DashboardPage magic numbers to named constants

## BACKLOG 항목
자가 생성 — 매직 넘버 상수 추출

## 원인 / 가설
dub-flow 회귀 테스트 실패가 트리거였으나, exit 77 (Perso API upstream 500)로 코드 회귀 아님. BACKLOG에서 다음 리팩터링 항목 진행.

DashboardPage의 `listMyProjects(20, 0)`과 `getCreditHistory(30)`에 매직 넘버가 하드코딩되어 있어 의미를 파악하려면 함수 시그니처를 봐야 했음. 모듈 수준 상수로 추출하여 가독성 개선.

## 변경 파일
- `src/pages/DashboardPage.tsx` — `PROJECT_PAGE_SIZE = 20`, `CREDIT_HISTORY_DAYS = 30` 상수 추가, 호출부 교체

## 검증
- `npm run build` ✅ (875ms)
- `node .ralph/test/dub-flow.mjs` → exit 77 (upstream Perso API 500, 코드 회귀 아님)
- PR #676 → develop squash merge, PR #677 → main merge

## 다음 루프 주의사항
- Perso API 500 상태 지속 중 — exit 77은 외부 장애
- 매직 넘버 추출 패턴 추가 가능: ProfileTab setTimeout(2000), persoApi.ts에도 일부 남아 있을 수 있음
- 모달 backdrop 중복 (CheckoutModal / OnboardingModal) 추출도 후보
