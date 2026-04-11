# iter-168 — extract PricingPage checkout modal

## BACKLOG 항목
자가 생성 풀 — PricingPage 컴포넌트 분해 (404줄 → 335줄)

## 원인 / 가설
- 이번 iteration은 mode: fix로 시작했으나 dub-flow 실패 원인은 exit 77 (Perso API 500 upstream-down)
- 코드 회귀 아님 — auth-guard/SPA fallback 모두 정상
- Perso API 서버 에러가 지속되는 동안 코드 품질 개선 항목 선택

## 변경 파일 목록과 이유
- `src/components/CheckoutModal.tsx` (신규): 결제 모달 UI 독립 컴포넌트로 추출
  - useFocusTrap, SpinnerIcon 등 모달 전용 의존성 포함
  - 카드 입력 필드, 취소/결제 버튼, ARIA dialog 속성
- `src/pages/PricingPage.tsx` (수정): 인라인 모달 JSX 제거, CheckoutModal import
  - useFocusTrap import 제거 (모달이 자체 관리)
  - SpinnerIcon import 제거
  - 404줄 → 335줄

## 검증 결과
- `npm run build` ✔ (빌드 성공, PricingPage 10.12KB)
- `node .ralph/test/dub-flow.mjs` → exit 77 (upstream-down, 코드 회귀 아님)
- 배포 후 재검증: 대기 중

## 다음 루프가 알아야 할 주의사항
- Perso API 500 상태 여전히 지속
- P2 미완료 2개 (다운로드 URL HEAD 검증, 다국어 회귀)는 API 복구 필요
- PricingPage 335줄로 축소 완료, 추가 분해 여지 적음
- issue #544, PR #545/#546
