# iter-183 — TestPage integration input config array

## BACKLOG 항목
자가 생성: TestPage 중복 JSX 제거 (integration state input 3개)

## 발견한 원인 / 가설
- dub-flow 회귀 테스트 exit 77 (Perso API 500 upstream-down) — 코드 회귀 아님
- TestPage lines 273-287에 spaceSeq/mediaSeq/projectSeq 3개의 동일 label+input JSX 블록이 중복
- className `w-24 bg-surface-900 border border-surface-700 rounded px-2 py-1 text-white text-xs`가 3회 반복

## 변경 파일 목록과 이유
- `src/pages/TestPage.tsx`: INTEGRATION_INPUT_CLASS 모듈 수준 상수 추출 + config 배열 + .map() 교체 (12 ins, 15 del)

## 검증 결과
- `npm run build` ✔ (257KB 메인 번들 유지)
- `npx vitest run` → 381 passed, 1 todo ✔
- `dub-flow.mjs` → exit 77 (upstream-down, Perso API 500 지속)

## 다음 루프가 알아야 할 주의사항
- Perso API 500 장애 여전히 지속 중
- TestPage 911줄 → ~908줄 (미미한 감소). 추가 중복 제거 가능 (summary dots 3개, 동일 test-row 패턴 등)
- BACKLOG의 남은 P2 미완료 항목 2개는 모두 API 필요 (다운로드 URL HEAD 검증, 다국어 회귀)
