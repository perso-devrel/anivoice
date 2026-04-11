# iter-174 — extract toggleArrayItem utility

## BACKLOG 항목
자가 생성 풀 — 중복 패턴 통합

## 원인 / 발견
- StudioPage에서 `handleTargetLanguageToggle`과 `onTagToggle` 인라인 콜백이 동일한 배열 토글 패턴 사용
- `prev.includes(x) ? prev.filter(v => v !== x) : [...prev, x]` 패턴 2곳 중복

## 변경 파일
- `src/utils/studio.ts` — `toggleArrayItem<T>` 제네릭 유틸 함수 추가
- `src/utils/studio.test.ts` — 5개 테스트 추가 (add, remove, strings, empty, immutability)
- `src/pages/StudioPage.tsx` — 2곳 인라인 패턴을 `toggleArrayItem` 호출로 교체

## 검증 결과
- `npm run build` ✔ (257KB 번들, 변동 없음)
- `npx vitest run` ✔ (378개 통과, +5)
- `dub-flow` exit 77 (upstream Perso API 500, 코드 회귀 아님)
- PR #575 → develop squash merge, PR #576 → main merge

## 다음 루프 주의사항
- Perso API 500 지속 — exit 77 계속 예상
- StudioPage 459줄 (3줄 감소)
- ResultStep.tsx 진행률 블록 추출, DashboardPage 인라인 탭 매핑 메모이제이션 등 추가 리팩터 가능
