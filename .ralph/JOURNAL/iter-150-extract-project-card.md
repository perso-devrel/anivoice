# iter-150 — extract ProjectCard component

## BACKLOG 항목
자가 생성: DashboardPage 인라인 프로젝트 카드 JSX를 별도 ProjectCard 컴포넌트로 추출

## 원래 모드
fix 모드로 지정됐으나, dub-flow 실패 원인이 exit 77 (Perso API 500, upstream-down)으로 코드 회귀가 아님.
코드 수정 불필요 → 자가 생성 풀에서 리팩터링 항목 선택.

## 변경 파일
- `src/components/ProjectCard.tsx` (신규) — 프로젝트 카드 렌더링 + STATUS_CONFIG 이동
- `src/pages/DashboardPage.tsx` — 인라인 카드 JSX 제거, ProjectCard 임포트 (451→371줄, −80줄)

## 검증 결과
- `npm run build` ✔ (581ms)
- `node .ralph/test/dub-flow.mjs` → exit 77 (upstream-down, Perso API 500 지속)
- 배포 후 재검증: exit 77 예상 (Perso API 미복구)

## PR/이슈
- Issue: #456
- PR develop: #457 (squash merge)
- PR main: #458 (merge)

## 다음 루프 주의사항
- Perso API 500 지속 — dub-flow full pass 불가
- DashboardPage 371줄로 축소, 추가 추출 여지 적음
- StudioPage 752줄 — UploadStep/SettingsStep 추출 가능하나 closure 의존이 많아 props 비대 가능성
