# Iteration 146 — extract StatCard component

## BACKLOG item
자가 생성 풀: DashboardPage 중복 stat card JSX를 StatCard 서브컴포넌트로 추출

## 원인 / 가설
- iter-146은 원래 dub-flow 회귀 실패 수정 모드였으나, 실패 원인이 Perso API 서버 500 (exit 77)으로 코드 회귀가 아닌 업스트림 장애
- BACKLOG의 P2 잔여 항목 2개 모두 API 의존 → 자가 생성 풀에서 리팩터링 선택

## 변경 파일 및 이유
- `src/pages/DashboardPage.tsx`: 3개 stat card (크레딧 잔액, 진행 중, 완료)의 동일한 glass+icon+label+value JSX 구조를 `StatCard` 함수 컴포넌트로 추출. +37/-45줄 (순 -8줄)

## 검증 결과
- `npm run build` → 통과 (DashboardPage 16.76KB, 이전 18.3KB에서 감소)
- `node .ralph/test/dub-flow.mjs` → exit 77 (upstream Perso API 500, 코드 회귀 아님)
- 배포 후 재검증: exit 77 예상 (동일 업스트림 장애)

## PR / 이슈
- Issue: #438
- PR (develop): #439 — squash merge 완료
- PR (main): #440 — merge 완료

## 다음 루프 주의사항
- Perso API 500 지속 중 — dub-flow exit 77은 외부 장애, 코드 문제 아님
- DashboardPage 번들 크기 16.76KB로 감소 (이전 18.3KB)
