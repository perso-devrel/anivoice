# iter-186 — SettingsPage TABLE_HEADER_CLASS 상수 추출

## BACKLOG 항목
자가 생성 풀 — 중복 className 패턴 추출 시리즈 계속

## 원인 / 가설
- dub-flow 실패 로그 분석: exit 77 (upstream Perso API 500), 코드 회귀 아님
- 코드 변경 필요 없으므로 다음 자가생성 항목 진행

## 변경 내역
- `src/pages/SettingsPage.tsx`: 빌링 탭 테이블 헤더 className 중복 3개를 `TABLE_HEADER_CLASS` 상수로 추출
  - 4번째 헤더(status)는 `pr-4` 없이 base 상수만 사용

## 검증 결과
- `npm run build` — 통과 (257KB 메인 번들)
- `node .ralph/test/dub-flow.mjs` — exit 77 (upstream-down, Perso API 500 지속)
- 배포 후 재검증 — exit 77 (동일, 외부 장애)

## PR / 이슈
- Issue: #634
- PR (develop): #635 — squash merge 완료
- PR (main): #636 — merge 완료

## 다음 루프가 알아야 할 사항
- Perso API 여전히 500 — exit 77 지속
- 중복 className 추출 시리즈: LandingPage 섹션 헤더(4x), AuthPage 라벨(3x) 등 남아있음
