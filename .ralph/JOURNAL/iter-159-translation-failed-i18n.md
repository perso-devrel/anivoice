# iter-159 — fix: replace hardcoded translation-failed error with i18n key

## BACKLOG 항목
자가 생성 (STATE.md에 기록된 StudioPage:111 하드코딩 에러 메시지 발견 사항)

## 원인
StudioPage line 111에서 `Translation failed: ${prog.progressReason}` 하드코딩 영어 문자열 사용.
한국어 모드에서도 영어 에러가 표시되는 i18n 누락 버그.

## 변경 파일
- `src/i18n/en.ts` — `studio.translationFailed` 키 추가 (`Translation failed: {{reason}}`)
- `src/i18n/ko.ts` — `studio.translationFailed` 키 추가 (`번역 실패: {{reason}}`)
- `src/pages/StudioPage.tsx` — `setError(t('studio.translationFailed', { reason }))` 로 교체 + useEffect deps에 `t` 추가

## 검증
- `npm run build` ✔
- `npm run lint` ✔ (0 errors, 0 warnings)
- `npm test` ✔ (384 passed)
- `node .ralph/test/dub-flow.mjs` → exit 77 (upstream Perso API 500, 코드 회귀 아님)

## PR
- Issue: #501
- PR develop: #502 (squash merged)
- PR main: #503 (merge)

## 다음 루프 참고
- Perso API 여전히 500 — exit 77 지속
- 남은 P2 미완료 2개 모두 API 필요 (다운로드 URL HEAD 검증, 다국어 회귀)
- 자가 생성 풀에서 계속 진행 필요
