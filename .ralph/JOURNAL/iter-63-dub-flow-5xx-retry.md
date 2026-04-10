# Iteration 63 — dub-flow 5xx 재시도 + exit 77

## BACKLOG 항목
회귀 테스트 실패 분석 및 수정 (P0-fix)

## 원인 분석
- `GET /portal/api/v1/spaces → HTTP 500` — Perso API 서버 에러 (외부)
- 기존 `call()` 함수는 5xx를 무조건 fail로 처리 → 일시적 500에도 전체 테스트 실패

## 변경 파일
- `.ralph/test/dub-flow.mjs` — `call()` 함수에 5xx 재시도 로직 추가
  - `MAX_RETRIES=3`, 지수 백오프 (5s, 10s, 20s)
  - fetch 네트워크 에러도 재시도 대상
  - 모든 재시도 소진 후에도 5xx → exit 77 (upstream-down, 코드 회귀 아님)
  - exit 코드 체계: 0=성공, 77=외부 API 다운, 78=쿼터 초과, 1=코드 회귀

## 검증 결과
- `npm run build` ✔ (272KB)
- `node .ralph/test/dub-flow.mjs` → auth-guard 4개 전부 통과, listSpaces에서 persistent 500 → exit 77
- Perso API 자체가 500 반환 중이므로 exit 0은 API 복구 후 가능

## 다음 루프 주의사항
- Perso API가 여전히 500 상태 — 복구 시점 미정
- exit 77은 exit 78(quota)과 동일하게 외부 장애로 분류해야 함
