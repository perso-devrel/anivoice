# iter-134 — use shared getErrorMessage utility

## BACKLOG 항목
자가 생성: 중복 `instanceof Error` 패턴을 공유 `getErrorMessage()` 유틸리티로 통합

## 원인 / 가설
dub-flow 실패 로그 분석 → exit 77 (Perso API upstream 500). 코드 회귀 아님.
BACKLOG P0/P1/P2 완료 항목만 남아 자가 생성 풀에서 코드 품질 항목 선택.

LibraryPage.tsx, TestPage.tsx에 `err instanceof Error ? err.message : String(e)` 인라인 패턴 5개가 이미 추출된 `getErrorMessage()` 유틸리티를 사용하지 않고 있었음.

## 변경 파일
| 파일 | 이유 |
|---|---|
| `src/utils/format.ts` | `getErrorMessage()`에 optional `fallback` 파라미터 추가 |
| `src/utils/format.test.ts` | fallback 동작 테스트 2개 추가 (376→378개) |
| `src/pages/LibraryPage.tsx` | 인라인 패턴 → `getErrorMessage(err, t('library.loadError'))` |
| `src/pages/TestPage.tsx` | 인라인 패턴 4개 → `getErrorMessage(e)` |

## 검증
- `npm run build` ✅
- `npm run lint` ✅ (0 errors)
- `npx vitest run` ✅ (378 tests pass)
- `node .ralph/test/dub-flow.mjs` → exit 77 (upstream Perso API 500, not code regression)

## PR
- Issue: #377
- PR develop: #378 (squash merged)
- PR main: #379 (merge)

## 다음 루프 참고
- Perso API 여전히 500 상태 — exit 77 지속
- `instanceof Error` 패턴 완전 제거됨 (production code 기준)
- 테스트 378개로 증가
