# iter-141 — hoist Navbar inline navLinks to module-level constant

## BACKLOG 항목
자가 생성 풀 — 인라인 배열 모듈 수준 상수 추출 (Navbar navLinks)

## 원인 / 가설
dub-flow 실패 로그가 exit 77 (upstream Perso API 500)로 코드 회귀 아님 확인.
Navbar 컴포넌트의 `navLinks` 배열이 매 렌더마다 새 배열을 생성하는 패턴 발견.

## 변경 파일 및 이유
- `src/components/layout/Navbar.tsx`: 인라인 `navLinks` 조건 분기를 모듈 수준 `NAV_LINK_KEYS` 상수 + `authOnly` 플래그 필터링으로 교체. i18n 키는 렌더 시점에 `t()` 해석.

## 검증 결과
- `npm run build` ✔ (257KB 메인 번들 유지)
- `node .ralph/test/dub-flow.mjs` → exit 77 (upstream-down, Perso API 500 지속)
- 배포 후 재검증 대기 중

## 다음 루프 주의사항
- Perso API 500 지속 — exit 77은 외부 장애
- SettingsPage billingHistory 인라인 배열도 동일 패턴 적용 가능 (다음 iter 후보)
- TestPage targets 배열도 hoisting 가능하나 dev-only 페이지로 우선순위 낮음
