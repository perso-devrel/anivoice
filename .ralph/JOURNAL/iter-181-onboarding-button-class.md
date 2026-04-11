# iter-181 — extract OnboardingModal duplicate button className

## BACKLOG 항목
자가 생성 풀 — 중복 CSS 클래스 상수 추출

## 원인 / 가설
OnboardingModal의 "Start Now" Link(line 115)와 "Next" button(line 123)에 동일한 gradient 버튼 className 문자열이 그대로 중복됨. 기존 iteration에서 인라인 배열/객체는 hoisting 완료했으나, 중복 className 문자열은 아직 처리되지 않음.

## 변경 파일
- `src/components/OnboardingModal.tsx`: 중복 className을 모듈 수준 `PRIMARY_BUTTON_CLASS` 상수로 추출

## 검증 결과
- `npm run build` ✔ 통과
- `node .ralph/test/dub-flow.mjs` → exit 77 (Perso API upstream 500, 코드 회귀 아님)
- PR #610 → develop squash merge ✔
- PR #611 → main merge ✔

## 다음 루프 주의사항
- Perso API 500 지속 — exit 77 upstream-down
- dub-flow exit 0 검증은 API 복구 시까지 불가
- 유사한 중복 className 패턴이 다른 컴포넌트에도 존재할 수 있음 (LibraryCard/SentenceEditList badge classes 등)
