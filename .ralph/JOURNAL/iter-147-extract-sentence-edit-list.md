# Iteration 147 — extract sentence editing list to SentenceEditList component

## BACKLOG 항목
자가 생성: StudioPage 882줄에서 sentence editing JSX를 SentenceEditList 컴포넌트로 분리

## 원인 / 가설
- iter-147은 원래 dub-flow 회귀 실패 수정 모드였으나, 로그 분석 결과 exit 77 (upstream Perso API 500) — 코드 회귀 아님
- BACKLOG P2 미완료 항목 2개는 모두 Perso API 필요 → 자가 생성 풀에서 리팩터 선택
- StudioPage ResultStep 내 sentence editing section (~55줄 JSX)이 독립적 UI 단위로 추출 가능

## 변경 파일
- `src/components/SentenceEditList.tsx` (신규): SPEAKER_COLORS, SentenceEditList 컴포넌트
- `src/pages/StudioPage.tsx`: SentenceEditList import 추가, 인라인 sentence editing JSX 제거, SPEAKER_COLORS 상수 제거, 미사용 formatMs import 제거

## 검증 결과
- `npm run build` ✔ (0 errors, StudioPage 19.21KB)
- `node .ralph/test/dub-flow.mjs` → exit 77 (upstream-down, Perso API 500 지속)
- deploy 후 재검증 대기 중

## 다음 루프 주의사항
- Perso API 500 지속 — exit 77/78 모두 외부 장애
- StudioPage 아직 ~830줄 — UploadStep, SettingsStep, ResultStep 추가 분리 가능
- TestPage 911줄도 분리 후보
