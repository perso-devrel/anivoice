# iter-171 — extract SubscriptionTab component

## BACKLOG 항목
자가 생성 풀 — 컴포넌트 분해 (SettingsPage subscription tab 추출)

## 원인 / 가설
- dub-flow 실패 로그 분석: exit 77 (upstream-down), Perso API 500 지속 → 코드 회귀 아님
- SettingsPage 233줄에서 subscription 탭이 ~37줄 인라인 JSX로 남아 있었음
- iter-170에서 ProfileTab 추출 후 자연스러운 후속 작업

## 변경 파일 목록과 이유
- `src/components/SubscriptionTab.tsx` (신규) — subscription 탭 UI를 독립 컴포넌트로 추출, BASIC_FEATURE_KEYS 상수 포함
- `src/pages/SettingsPage.tsx` (수정) — 인라인 subscription 탭 JSX 제거, 미사용 Link/formatCreditTime import 정리 (233→196줄)

## 검증 결과
- `npm run build` ✔ 통과 (SettingsPage 7.90KB)
- `node .ralph/test/dub-flow.mjs` → exit 77 (upstream Perso API 500, 코드 회귀 아님)
- 배포 후 재검증 대기 중

## PR
- Issue: #560
- PR develop: #561 (squash merge)
- PR main: #562 (merge)

## 다음 루프가 알아야 할 주의사항
- Perso API 500 지속 — exit 77 계속 예상
- SettingsPage 196줄, BillingTab(~50줄)과 LanguageTab(~33줄) 추가 추출 가능
- DashboardPage 335줄로 다음 분해 후보
