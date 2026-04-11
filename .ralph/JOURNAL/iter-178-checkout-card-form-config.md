# iter-178 — refactor: consolidate CheckoutModal card form config

## BACKLOG 항목
자가 생성 풀 — CheckoutModal 중복 입력 블록 통합 + CardForm 상태 객체화

## 발견한 원인 / 가설
- dub-flow 실패는 Perso API 500 (upstream-down, exit 77) — 코드 회귀 아님
- CheckoutModal에 3개 거의 동일한 카드 입력 JSX 블록이 반복되고, PricingPage에서 6개 개별 props(3 values + 3 handlers)로 전달

## 변경 파일 목록과 이유
1. `src/components/CheckoutModal.tsx` — CARD_FIELDS 설정 배열 + map() 루프로 3개 입력 블록 통합, CardForm 인터페이스 도입, INPUT_CLASS 상수 추출, props 11→7개
2. `src/pages/PricingPage.tsx` — 3개 개별 useState를 단일 CardForm 상태 객체로 통합, handleCardFormChange 핸들러 추가

## 검증 결과
- build: ✔ (257KB 메인 번들 유지)
- lint: ✔ 0 errors
- test: ✔ 382 passed
- dub-flow: exit 77 (upstream-down, 코드 회귀 아님)
- 배포 후 재검증: Perso API 500 지속 예상

## 다음 루프가 알아야 할 주의사항
- Perso API 여전히 500 상태 — exit 77 지속
- P2 잔여 2개(다운로드 URL HEAD 검증, 다국어 회귀)는 API 복구 필요
- 자가 생성 풀에서 계속 진행
