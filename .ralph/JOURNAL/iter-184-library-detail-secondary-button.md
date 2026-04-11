# iter-184 — LibraryDetailPage SECONDARY_BUTTON_CLASS extraction

## BACKLOG 항목
자가 생성: LibraryDetailPage 중복 버튼 className 제거

## 발견한 원인 / 가설
- dub-flow 회귀 테스트 exit 77 (Perso API 500 upstream-down) — 코드 회귀 아님
- LibraryDetailPage lines 153/164/172에 audio download, subtitle download, copy link 버튼 3개의 동일한 className 문자열이 중복
- `inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-700 text-white text-sm font-medium hover:bg-surface-600 transition-colors` 3회 반복

## 변경 파일 목록과 이유
- `src/pages/LibraryDetailPage.tsx`: SECONDARY_BUTTON_CLASS 모듈 수준 상수 추출 + 3개 버튼에서 참조 (6 ins, 3 del)

## 검증 결과
- `npm run build` ✔ (257KB 메인 번들 유지)
- `npx vitest run` → 381 passed, 1 todo ✔
- `dub-flow.mjs` → exit 77 (upstream-down, Perso API 500 지속)
- 배포 후 재검증 → exit 77 (동일)

## 다음 루프가 알아야 할 주의사항
- Perso API 500 장애 여전히 지속 중
- P2 미완료 2개(다운로드 URL HEAD 검증, 다국어 회귀)는 여전히 API 필요
- 탐색 결과 추가 중복 제거 후보: modal overlay class (CheckoutModal/OnboardingModal), tab group class (DashboardToolbar/SettingsPage), section header class (PublishSection/SentenceEditList)
