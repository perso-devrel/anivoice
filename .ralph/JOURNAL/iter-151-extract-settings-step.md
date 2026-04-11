# iter-151 — extract SettingsStep component

## BACKLOG 항목
자가 생성 풀: StudioPage 인라인 SettingsStep 함수를 독립 컴포넌트로 추출

## 원인 / 가설
- StudioPage 752줄로 여전히 프로젝트 최대 파일
- UploadStep, SettingsStep, ResultStep 3개 인라인 함수 중 SettingsStep이 ~115줄로 두 번째 규모
- 클로저 의존성을 명시적 props 로 전환하면 테스트/재사용 가능성 향상

## 변경 파일
- `src/components/SettingsStep.tsx` (신규, 138줄): 언어 선택 UI + lip sync 토글 + 더빙 시작 버튼
- `src/pages/StudioPage.tsx` (752→658줄, -94줄): 인라인 함수 제거, 3개 핸들러 분리 (handleSourceLanguageChange, handleTargetLanguageToggle, handleFileReset)

## 검증 결과
- `npm run build` ✔ (583ms)
- `node .ralph/test/dub-flow.mjs` → exit 77 (upstream Perso API 500, 코드 회귀 아님)
- 배포 후 재검증 대기 중

## 다음 루프 주의사항
- 원래 iter-151은 dub-flow 실패 수정 모드였으나, 실패 원인이 exit 77 (upstream-down)이므로 코드 수정 불필요
- UploadStep (~35줄)도 추출 가능하지만 크기가 작아 ROI 낮음
- ResultStep (~170줄)은 이미 SentenceEditList, PublishSection, StepIndicator 하위 추출 완료
- Perso API 500 지속 중 — API 의존 항목은 계속 blocked
