# iter-152 — extract upload step to dedicated UploadStep component

## BACKLOG 항목
자가 생성 풀: 중복 JSX 제거 시리즈 — StudioPage 인라인 UploadStep 함수 추출

## 배경
- 직전 dub-flow 회귀 테스트가 exit 77 (upstream-down) — Perso API 500 지속
- 코드 회귀 아님, 별도 리팩터링 진행

## 변경 파일
- `src/components/UploadStep.tsx` (신규, 59줄): 독립 UploadStep 컴포넌트
- `src/pages/StudioPage.tsx` (658→609줄, -49줄): 인라인 UploadStep 함수 제거, isDragOver/fileInputRef 캡슐화

## 원인 / 가설
- StudioPage에 남아있던 인라인 UploadStep 함수를 SettingsStep과 같은 패턴으로 독립 컴포넌트로 추출
- isDragOver 상태와 fileInputRef는 UploadStep에서만 사용되므로 컴포넌트 내부로 이동

## 검증 결과
- `npm run build` ✔ (580ms)
- `npm run lint` ✔ (0 errors)
- `npm run test` ✔ (378 passed)
- `dub-flow.mjs` → exit 77 (upstream Perso API 500, 코드 회귀 아님)

## PR
- Issue: #466
- PR develop: #467 (squash merged)
- PR main: #468 (merge)

## 다음 루프 주의사항
- Perso API 500 지속 중 — API 필요 작업(다운로드 URL HEAD 검증, 다국어 회귀)은 보류
- StudioPage 609줄 — ResultStep 내부 함수(170줄)가 다음 추출 후보
