---
iteration: 127
slug: extract-shared-languages
date: 2026-04-11
backlog_item: "자가생성 — 중복 LANGUAGES 상수 통합"
---

## 이번 iteration

dub-flow 회귀 실패 원인: Perso API 500 (upstream-down, exit 77). 코드 회귀 아님.
BACKLOG P2 잔여 항목 모두 API 필요 → 자가생성 풀에서 작업 선택.

## 발견한 문제

LandingPage.tsx (line 7)와 StudioPage.tsx (line 30)에 동일한 7개 언어 목록이
각각 다른 형태로 중복 정의되어 있었음:
- LandingPage: `{ key, flag }` 객체 배열
- StudioPage: `['auto', 'ja', 'ko', ...]` 문자열 배열 (auto 포함)

## 변경 파일

| 파일 | 변경 |
|---|---|
| `src/constants.ts` | 신규 — `SUPPORTED_LANGUAGES` (key+flag), `LANGUAGE_KEYS` (codes) 익스포트 |
| `src/constants.test.ts` | 신규 — 4개 유닛 테스트 |
| `src/pages/LandingPage.tsx` | 로컬 LANGUAGES 삭제 → `SUPPORTED_LANGUAGES` 임포트 |
| `src/pages/StudioPage.tsx` | 로컬 LANGUAGES 삭제 → `LANGUAGE_KEYS` 임포트, `STUDIO_LANGUAGES` = `['auto', ...LANGUAGE_KEYS]` |

## 검증 결과

- `npm run build` — 0 errors, 257KB 메인 번들 (변동 없음)
- `npm run lint` — 0 errors, 0 warnings
- `npx vitest run` — 376 passed (372→376, +4)
- `node .ralph/test/dub-flow.mjs` — exit 77 (upstream Perso API 500, 코드 회귀 아님)

## PR

- Issue: #347
- PR develop: #348 (squash merge)
- PR main: #349 (merge)

## 다음 루프 참고

- Perso API 500 지속 중 — P2 잔여(다운로드 URL HEAD 검증, 다국어 회귀) 진행 불가
- StudioPage 878줄, TestPage 910줄 — 컴포넌트 분리 대상으로 고려 가능
- SPEAKER_COLORS는 StudioPage에서만 사용 — 공유 추출 불필요
