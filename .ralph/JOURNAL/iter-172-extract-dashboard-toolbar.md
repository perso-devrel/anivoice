# iter-172 — extract DashboardToolbar component

## BACKLOG 항목
자가 생성 풀 — 컴포넌트 분해 (DashboardPage toolbar 추출)

## 원인 / 가설
- dub-flow 실패 로그 분석: exit 77 (upstream-down), Perso API 500 지속 → 코드 회귀 아님
- DashboardPage 335줄에서 검색/언어필터/정렬/탭 툴바 섹션 ~55줄 인라인 JSX로 남아 있었음
- iter-171에서 SettingsPage 분해 완료 후 자연스러운 다음 분해 후보

## 변경 파일 목록과 이유
- `src/components/DashboardToolbar.tsx` (신규, 84줄) — 검색 입력, 언어 필터 드롭다운, 정렬 토글, 탭 바를 독립 컴포넌트로 추출
- `src/pages/DashboardPage.tsx` (수정, 335→298줄) — 인라인 toolbar JSX 제거, 미사용 SortIcon import 정리

## 검증 결과
- `npm run build` ✔ 통과 (DashboardPage 17.15KB)
- `node .ralph/test/dub-flow.mjs` → exit 77 (upstream Perso API 500, 코드 회귀 아님)
- 배포 후 재검증 대기 중

## PR
- Issue: #565
- PR develop: #566 (squash merge)
- PR main: #567 (merge)

## 다음 루프가 알아야 할 주의사항
- Perso API 500 지속 — exit 77 계속 예상
- DashboardPage 298줄, 추가 분해 가능: 데이터 fetching 로직을 커스텀 훅으로 추출, 또는 로딩/에러/빈 상태 섹션 추출
- StudioPage 462줄이 여전히 최대 파일, 대부분 핸들러 로직
- LandingPage 382줄이 그 다음 분해 후보
