# iter-194 — extract ResultStep RESULT_CENTER_CLASS

## BACKLOG 항목
자가 생성 — 중복 className 상수 추출 시리즈 계속

## 원인 / 가설
dub-flow 회귀 테스트 실패가 트리거였으나, exit 77 (Perso API upstream 500)로 코드 회귀 아님. BACKLOG에서 다음 리팩터링 항목 진행.

ResultStep.tsx의 3개 early-return 블록(loading, processing, error)이 동일한 centering className `max-w-lg mx-auto text-center py-12`을 공유. 각 블록은 spacing variant만 다름 (space-y-4 또는 space-y-8).

## 변경 파일
- `src/components/ResultStep.tsx` — RESULT_CENTER_CLASS 상수 추가, 3개 className에서 공통 부분 교체

## 검증
- `npm run build` ✅ (879ms)
- `node .ralph/test/dub-flow.mjs` → exit 77 (upstream Perso API 500, 코드 회귀 아님)
- PR #672 → develop squash merge, PR #673 → main merge

## 다음 루프 주의사항
- Perso API 500 상태 지속 중 — exit 77은 외부 장애
- 중복 className 상수 추출 패턴 거의 소진됨, 다른 카테고리 탐색 필요 (TestPage 리팩터링, useAsyncLoad 훅 등)
