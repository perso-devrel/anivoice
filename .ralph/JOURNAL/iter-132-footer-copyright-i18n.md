# Iteration 132 — Footer copyright i18n

## BACKLOG 항목
자가 생성: Footer 하드코딩 copyright 문자열 i18n 교체

## 원인 / 가설
- dub-flow 실패 로그 분석: exit 77 (Perso API 500 upstream-down) — 코드 회귀 아님
- 남은 P2 항목 2개 모두 API 필요 → 자가 생성 풀에서 작업 선택
- Footer line 55: `&copy; 2026 AniVoice. All rights reserved.` 하드코딩 발견

## 변경 파일
- `src/i18n/en.ts` — `footer.allRights` 키 추가
- `src/i18n/ko.ts` — `footer.allRights` 키 추가 (법적 문구 동일)
- `src/components/layout/Footer.tsx` — 하드코딩 → `t('footer.allRights')`

## 검증 결과
- `npm run build` ✔ (257KB 메인 번들)
- `npm run test` ✔ (376 passed)
- `dub-flow` exit 77 (upstream Perso API 500, 코드 회귀 아님)

## 이슈/PR
- Issue #369, PR #370 (develop), PR #371 (main)

## 다음 루프 주의사항
- Perso API 500 지속 중 — API 의존 항목은 blocked
- 인라인 SVG 전수 완료, 나머지 자가생성 풀에서 선택 필요
- `formatMs`/`formatDuration` 유사하지만 padding 차이로 의도적 분리 확인됨
