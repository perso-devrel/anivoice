# iter-176: unify LibraryPage duplicate tag filter buttons

## BACKLOG 항목
자가 생성 풀 — 중복 JSX 패턴 통합

## 발견한 원인 / 가설
- dub-flow 실패 로그: exit 77 (Perso API 500 upstream-down), 코드 회귀 아님
- LibraryPage.tsx에서 'All' 태그 버튼과 개별 태그 `.map()` 버튼이 동일한 className 로직 + onClick 패턴을 중복 사용

## 변경 파일 목록과 이유
- `src/pages/LibraryPage.tsx` — 두 블록을 하나의 combined 배열 + 단일 `.map()`으로 통합 (8줄 감소)

## 검증 결과
- `npm run build` ✅
- `npm run test` → 382 passed ✅
- `dub-flow.mjs` → exit 77 (upstream Perso API 500, 코드 회귀 아님)

## PR
- Issue: #584
- PR → develop: #585 (squash merge)
- PR → main: #586 (merge)

## 다음 루프가 알아야 할 주의사항
- Perso API 500 지속 — exit 77 외부 장애
- LibraryPage 219→211줄
