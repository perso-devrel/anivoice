# iter-153 — extract ResultStep component

## BACKLOG 항목
자가 생성 풀: StudioPage 중복 JSX 추출 시리즈 계속 (ResultStep)

## 원인 / 배경
- dub-flow 실패 원인: exit 77 (Perso API upstream 500), 코드 회귀 아님
- StudioPage의 마지막 인라인 함수 `ResultStep` (~170줄)을 독립 컴포넌트로 추출

## 변경 파일
- `src/components/ResultStep.tsx` — 신규: ResultStep 컴포넌트 (238줄)
- `src/pages/StudioPage.tsx` — ResultStep 인라인 함수 제거, props 전달 방식으로 교체

## 검증 결과
- `npm run build` ✔ (StudioPage 20.84KB gzip)
- `npx vitest run` ✔ (378 tests passed)
- `node .ralph/test/dub-flow.mjs` → exit 77 (upstream Perso API 500, 코드 회귀 아님)
- 배포 후 재검증 예정

## 수치
- StudioPage: 609→462줄 (-147줄, -24%)
- 메인 번들: 257KB (변동 없음)

## PR
- Issue: #471
- PR develop: #472
- PR main: #473

## 다음 루프가 알아야 할 사항
- StudioPage 462줄 — 인라인 JSX 추출 시리즈 완료 (UploadStep, SettingsStep, SentenceEditList, StepIndicator, PublishSection, ResultStep 모두 독립)
- StudioPage에서 추가 추출할 만한 대형 인라인 함수는 없음
- Perso API 500 지속 — API 의존 항목(다운로드 URL HEAD 검증, 다국어 회귀)은 [blocked]
- 다음 자가 생성 항목으로 DashboardPage(335줄) 또는 PricingPage(395줄) 리팩터 고려
