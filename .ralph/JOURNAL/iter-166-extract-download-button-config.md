# iter-166 — extract download button config

## BACKLOG 항목
자가 생성 풀: ResultStep.tsx 인라인 다운로드 버튼 배열을 모듈 수준 상수로 추출

## 배경
- 원래 iteration 166은 dub-flow 회귀 실패 수정으로 지정됨
- 로그 분석 결과 Perso API HTTP 500 (upstream-down, exit 77) — 코드 회귀 아님
- 코드 수정 불필요하므로 자가 생성 풀에서 리팩터 항목 선택

## 변경 파일 및 이유
- `src/components/ResultStep.tsx`: 인라인 다운로드 버튼 config 배열(4개 객체)을 모듈 수준 `DOWNLOAD_BUTTONS` 상수로 추출, 가용성 체크를 `isDownloadAvailable()` 헬퍼 함수로 분리

## 검증 결과
- `npm run build` — 통과 (257KB 메인 번들 유지)
- `node .ralph/test/dub-flow.mjs` — exit 77 (upstream Perso API 500, 코드 회귀 아님)

## PR/이슈
- Issue: #534
- PR develop: #535 (squash merged)
- PR main: #536 (merge)

## 다음 루프 주의사항
- Perso API 500 지속 중 — dub-flow exit 77은 정상 분류
- P2 미완료 2개(다운로드 URL HEAD 검증, 다국어 회귀)는 API 복구 필요
- 자가 생성 풀에서 계속 진행 가능
