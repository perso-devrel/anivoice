# iter-129 — extract EmptyProjectsIcon

## BACKLOG 항목
자가 생성 풀: 인라인 SVG 아이콘 공유 컴포넌트 추출

## 원인 / 가설
dub-flow 회귀 실패 원인은 Perso API 서버 에러 (HTTP 500, exit 77) — 코드 회귀 아님.
코드 변경 작업으로 DashboardPage에 남아있던 마지막 인라인 SVG를 공유 아이콘으로 추출.

## 변경 파일
- `src/components/icons.tsx` — EmptyProjectsIcon 컴포넌트 추가 (20줄)
- `src/pages/DashboardPage.tsx` — 인라인 SVG 15줄 → EmptyProjectsIcon 1줄로 교체

## 검증 결과
- `npm run build` ✔ (257KB 메인 번들 유지)
- `node .ralph/test/dub-flow.mjs` → exit 77 (upstream Perso API 500, 코드 회귀 아님)
- PR #355 → develop squash merge, PR #356 → main merge

## 다음 루프 주의사항
- Perso API 여전히 500 반환 — 외부 장애 지속
- DashboardPage 455줄, StudioPage 879줄 — StudioPage 로직 추출이 다음 후보
- gradient id를 `emptyProjGrad`로 변경하여 DOM id 충돌 방지
