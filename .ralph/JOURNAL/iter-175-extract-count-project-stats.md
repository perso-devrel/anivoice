# iter-175 — extract countProjectStats utility

## BACKLOG 항목
자가 생성 풀 — 중복 패턴 통합

## 원인 / 발견
- DashboardPage에서 `inProgressCount`/`completedCount`를 인라인 `.filter().length`로 계산 (6줄)
- 동일한 필터 조건이 dashboard.ts `filterProjects`의 'in-progress'/'completed' 탭 로직에도 존재
- dub-flow 실패는 exit 77 (upstream Perso API 500) — 코드 회귀 아님

## 변경 파일
- `src/utils/dashboard.ts` — `countProjectStats` 함수 추가 (single-pass loop, inProgress/completed 반환)
- `src/utils/dashboard.test.ts` — 4개 테스트 추가 (mixed statuses, empty, all-failed, all-active)
- `src/pages/DashboardPage.tsx` — 인라인 filter를 `countProjectStats` 호출로 교체 (6줄→1줄)

## 검증 결과
- `npm run build` ✔ (257KB 번들, 변동 없음)
- `npx vitest run` ✔ (382개 통과, +4)
- `dub-flow` exit 77 (upstream Perso API 500, 코드 회귀 아님)
- PR #580 → develop squash merge, PR #581 → main merge

## 다음 루프 주의사항
- Perso API 500 지속 — exit 77 계속 예상
- DashboardPage 294줄 (4줄 감소, 298→294)
- StatCard를 별도 파일로 추출하거나 LandingPage 서브컴포넌트 분리 등 추가 리팩터 가능
