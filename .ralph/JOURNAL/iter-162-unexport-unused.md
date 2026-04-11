# iter-162 — unexport unused TranslateRequest, DbUser, and formatSeconds

## BACKLOG 항목
자가 생성 풀: 미사용 export 정리 (iter-160 후속)

## 배경
- iter-162 모드는 fix (직전 dub-flow 실패 원인 분석)
- 실패 원인: Perso API 500 (exit 77, upstream-down) — 코드 회귀 아님
- 코드 수정 불필요하므로 자가 생성 풀에서 unused export 정리 선택

## 변경 파일
- `src/services/persoApi.ts` — `TranslateRequest` interface export 제거 (내부 전용)
- `src/services/anivoiceApi.ts` — `DbUser` interface export 제거 (내부 전용)
- `src/utils/format.ts` — `formatSeconds` function export 제거 (formatCreditTime 내부에서만 사용)
- `src/utils/format.test.ts` — formatSeconds 테스트 블록 12개 + 미사용 ko/en 상수 제거

## 검증 결과
- `npm run build` — 통과 (257KB 메인 번들)
- `npx vitest run` — 372 tests passed (12개 formatSeconds 테스트 제거, formatCreditTime 통해 간접 커버리지 유지)
- `node .ralph/test/dub-flow.mjs` — exit 77 (upstream-down, Perso API 500 지속)

## 다음 루프가 알아야 할 주의사항
- Perso API 500 지속 — exit 77은 외부 장애
- 테스트 수 384 → 372 (formatSeconds 직접 테스트 제거, 간접 커버)
