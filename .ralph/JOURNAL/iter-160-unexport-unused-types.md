# iter-160 — unexport unused DownloadType and TimeLabels types

## BACKLOG item
자가 생성 풀: unused export 정리 (dead code surface reduction)

## 원인 / 가설
- `DownloadType` (studio.ts) 와 `TimeLabels` (format.ts) 가 `export` 되어 있으나 외부 파일에서 import 하지 않음
- 둘 다 해당 파일 내부 함수의 파라미터 타입으로만 사용 — public API surface 불필요하게 넓힘

## 발견 경위
- dub-flow 실패 로그가 exit 77 (Perso API 500 upstream-down) — 코드 회귀 아님
- 코드 회귀 없으므로 자가 생성 풀에서 unused export 정리 선택
- src/ 전체 exported symbol grep → 2건 발견

## 변경 파일
- `src/utils/studio.ts` — `export type DownloadType` → `type DownloadType`
- `src/utils/format.ts` — `export interface TimeLabels` → `interface TimeLabels`

## 검증
- `npm run build` 통과 (257KB 번들 변경 없음)
- `npm test` 384개 전수 통과
- `dub-flow.mjs` exit 77 (upstream-down, 코드 회귀 아님)
- PR #507 → develop squash merge, PR #508 → main merge 완료

## 다음 루프 주의사항
- Perso API 500 지속 중 — exit 77 계속 예상
- 남은 P2 항목 (다운로드 URL HEAD 검증, 다국어 회귀) 모두 API 복구 필요
- 자가 생성 풀에서 계속 진행
