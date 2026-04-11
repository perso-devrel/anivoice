# Iteration 188 — extract AuthPage/Footer duplicate classNames

## BACKLOG 항목
자가 생성 풀: 중복 className 상수 추출 (AuthPage + Footer)

## 원래 트리거
iter-188 은 dub-flow 실패 분석으로 시작했으나, exit 77 (upstream Perso API 500) 확인 → 코드 회귀 아님.
코드 수정 불필요하므로 자가 생성 항목으로 전환.

## 발견한 원인
1. AuthPage: iter-182에서 AUTH_INPUT_CLASS 상수를 추출했으나 email/password 입력 2개에 인라인 className이 남아 있었음
2. AuthPage: `block text-sm text-gray-300 mb-1.5` 라벨 className이 3곳에 중복
3. Footer: `text-sm font-semibold text-gray-300 mb-3` 헤딩 className이 3곳에 중복
4. Footer: `space-y-2` 섹션 className이 3곳에 중복

## 변경 파일
- `src/pages/AuthPage.tsx`: AUTH_LABEL_CLASS 상수 추가, 누락된 AUTH_INPUT_CLASS 사용 2건 수정
- `src/components/layout/Footer.tsx`: FOOTER_HEADING_CLASS + FOOTER_SECTION_CLASS 상수 추가

## 검증 결과
- `npm run build` ✔ (900ms)
- `node .ralph/test/dub-flow.mjs` → exit 77 (upstream Perso API 500, 코드 회귀 아님)
- PR #644 squash merge → develop, PR #645 merge → main

## 다음 루프 주의사항
- Perso API 500 지속 중 — dub-flow 는 exit 77 계속 예상
- AuthPage/Footer 중복 className 정리 완료
