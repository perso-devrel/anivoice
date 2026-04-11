# iter-156 — extract formatCreditTimeMs helper

## BACKLOG 항목
자가 생성: LibraryPage/LibraryDetailPage 중복 `Math.floor(durationMs / 1000)` 변환 패턴 제거

## 원인 / 가설
dub-flow 실패 원인은 exit 77 (upstream Perso API 500) — 코드 회귀 아님.
남은 BACKLOG P2 항목 2개도 모두 Perso API 필요. 자가 생성 풀에서 중복 제거 항목 선택.

## 변경 파일
- `src/utils/format.ts` — `formatCreditTimeMs(ms, t)` 함수 추가
- `src/pages/LibraryPage.tsx` — import 변경 + 인라인 변환을 `formatCreditTimeMs` 호출로 교체
- `src/pages/LibraryDetailPage.tsx` — 동일
- `src/utils/format.test.ts` — 3개 테스트 추가 (381→384)

## 검증 결과
- `npm run build` — 통과 (257KB 메인 번들)
- `npx vitest run` — 384 passed, 1 todo
- `node .ralph/test/dub-flow.mjs` — exit 77 (upstream-down, Perso API 500 지속)
- PR #487 → develop (squash merge), PR #488 → main (merge)
- Issue #486

## 다음 루프 주의사항
- Perso API 500 지속 중 — exit 77은 코드 회귀가 아님
- 남은 P2 미완료: 다운로드 URL HEAD 검증, 다국어 회귀 (둘 다 API 필요)
- 자가 생성 풀에서 다음 항목 선택 필요
