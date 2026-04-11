# iter-161 — extract magic numbers to named constants in persoApi.ts

## BACKLOG 항목
자가 생성 풀: persoApi.ts 매직 넘버를 명명 상수로 추출 (코드 가독성 개선)

## 배경
- iter-161 모드는 fix (직전 dub-flow 실패 원인 분석)
- 실패 원인: Perso API 500 (exit 77, upstream-down) — 코드 회귀 아님
- 코드 수정 불필요하므로 자가 생성 풀에서 리팩터링 항목 선택

## 변경 파일
- `src/services/persoApi.ts` — 12개 매직 넘버를 모듈 수준 상수로 추출
  - UPLOAD_RETRY_BASE_DELAY_MS (2000)
  - DEFAULT_POLL_INTERVAL_MS (5000)
  - LONG_ETA_POLL_INTERVAL_MS (10000)
  - MEDIUM_ETA_POLL_INTERVAL_MS (7000)
  - LONG_ETA_THRESHOLD_MINUTES (3)
  - MEDIUM_ETA_THRESHOLD_MINUTES (1)
  - MAX_CONSECUTIVE_POLL_ERRORS (30)
  - COMPLETION_PROGRESS (100)
  - ERROR_SNIPPET_LENGTH (500)
  - SAS_ERROR_SNIPPET_LENGTH (200)
  - SCRIPT_FETCH_SIZE (10000)
  - DEFAULT_PROJECT_LIST_SIZE (20)

## 검증 결과
- `npm run build` — 통과 (257KB 메인 번들)
- `npx vitest run` — 384 tests passed
- `node .ralph/test/dub-flow.mjs` — exit 77 (upstream-down, Perso API 500 지속)

## PR
- Issue: #512
- PR: #513 (develop), #514 (main)
- 둘 다 머지 완료

## 다음 루프 주의사항
- Perso API 500 상태 지속 중 — dub-flow exit 0 확인은 API 복구 시 가능
- persoApi.ts의 console.warn (pollProgress 내부) 1개 남아있으나 의도적 디버그 로그 (transient error 추적용)
