# iter-170 — extract SettingsPage profile tab to ProfileTab component

## BACKLOG 항목
자가 생성 풀: 컴포넌트 분해 (SettingsPage 프로필 탭)

## 원인 / 가설
- 직전 dub-flow 실패는 exit 77 (Perso API upstream 500) — 코드 회귀 아님
- SettingsPage가 299줄로 4개 탭 내용을 모두 포함, 프로필 탭이 가장 자기 완결적 (로컬 state 3개 + handler 1개)

## 변경 파일 및 이유
- `src/components/ProfileTab.tsx` (신규, 82줄): 아바타, displayName 입력, email 읽기전용, 저장 버튼 + 관련 state/handler
- `src/pages/SettingsPage.tsx` (299→233줄): ProfileTab import 후 inline JSX 제거, UserIcon/updateUserProfile import 제거

## 검증 결과
- `npm run build` ✔ (SettingsPage 번들 10.2KB→7.8KB)
- `node .ralph/test/dub-flow.mjs` → exit 77 (upstream-down, 코드 회귀 아님)
- 배포 후 재검증 대기 중

## 다음 루프 주의사항
- Perso API 여전히 500 — dub-flow exit 0 불가, exit 77은 정상 분류
- P2 미완료 2개(다운로드 URL HEAD 검증, 다국어 회귀)는 API 복구 필요
- SettingsPage 잔여 3개 탭(subscription, billing, language)도 추출 가능하나 각각 작아서 우선순위 낮음
