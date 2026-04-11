# Iteration 177 — fix: replace hardcoded Toast aria-label and Untitled fallback with i18n keys

## BACKLOG 항목
자가 생성 풀 — 잔여 하드코딩 UI 문자열 i18n 교체

## 발견한 원인 / 가설
- Toast 컴포넌트의 닫기 버튼에 `aria-label="Close"` 하드코딩 → 한국어 모드에서 스크린 리더가 영어로 읽음
- StudioPage의 `createProject` 호출 시 `'Untitled'` 폴백 하드코딩 → 한국어 모드에서 영어로 표시

## 변경 파일 목록과 이유
| 파일 | 변경 |
| --- | --- |
| `src/components/Toast.tsx` | `useTranslation` 추가, `aria-label="Close"` → `t('common.close')` |
| `src/pages/StudioPage.tsx` | `'Untitled'` → `t('studio.untitled')` |
| `src/i18n/en.ts` | `studio.untitled: 'Untitled'` 추가 |
| `src/i18n/ko.ts` | `studio.untitled: '제목 없음'` 추가 |

## 검증 결과
- `npm run build` ✔ (257KB 번들)
- `npx vitest run` ✔ (382 tests)
- `dub-flow.mjs` → exit 77 (upstream Perso API 500, 코드 회귀 아님)

## 다음 루프가 알아야 할 주의사항
- Perso API 500 지속 중 — exit 77
- 잔여 하드코딩 문자열: AuthPage placeholder (you@example.com, ••••••••), CheckoutModal placeholder (0000 0000 0000 0000, MM/YY, 123) — 포맷 힌트로 i18n 불필요 판단
- handleStartDubbing (122줄) 분해는 다음 리팩터 후보

## PR / Issue
- Issue: #589
- PR develop: #590
- PR main: #591
