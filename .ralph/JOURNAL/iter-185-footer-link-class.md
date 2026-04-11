# iter-185 — Footer 중복 링크 className 상수 추출

## BACKLOG 항목
자가 생성: Footer.tsx 중복 className 패턴 정리

## 원인 / 가설
Footer.tsx에서 `"block text-sm text-gray-500 hover:text-gray-300"` className이 8개 링크에 동일하게 반복.
기존 iter-182~184와 동일한 className 상수 추출 패턴 적용.

## 변경 파일
- `src/components/layout/Footer.tsx` — FOOTER_LINK_CLASS 모듈 수준 상수 추출, 8개 인라인 문자열 교체

## 검증 결과
- `npm run build` ✔ (852ms, 번들 사이즈 변화 없음)
- `node .ralph/test/dub-flow.mjs` → exit 77 (upstream-down, Perso API 500 지속 — 코드 회귀 아님)
- PR #630 → develop squash merge ✔
- PR #631 → main merge ✔

## 다음 루프 주의사항
- Perso API 500 상태 지속 — dub-flow exit 77은 외부 장애
- 중복 className 추출 시리즈 계속 가능 (DashboardPage gradient button 등)
