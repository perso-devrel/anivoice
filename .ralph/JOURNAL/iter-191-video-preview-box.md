# iter-191 — extract LandingPage VideoPreviewBox component

## BACKLOG 항목
자가 생성 풀: 중복 JSX 패턴 제거 (LandingPage video comparison section)

## 모드
fix → upstream-down 확인 후 자가생성 풀 리팩터로 전환

## 발견한 원인 / 가설
- dub-flow exit 77: Perso API `/portal/api/v1/spaces` 지속 500 에러 (upstream-down)
- 코드 회귀 아님. auth-guard + SPA fallback 모두 정상 통과
- LandingPage의 Original/Dubbed 비디오 미리보기 박스가 5+ 동일 className 중복 사용

## 변경 파일 목록과 이유
- `src/pages/LandingPage.tsx`: VideoPreviewBox 서브컴포넌트 추출 (42 추가, 24 제거)
  - 중복 className 5개: video container, gradient overlay, PlayIcon size, bottom badge, aspect-ratio box
  - badgeClass, badgeLabel, langLabel, waveformData, waveformColor props로 차이화

## 검증 결과
- `npm run build`: 통과 (807ms)
- `node .ralph/test/dub-flow.mjs`: exit 77 (upstream-down, 코드 회귀 아님)
- 배포 후 재검증: 대기 중

## PR
- Issue: #656
- PR develop: #657 (squash merged)
- PR main: #658 (merge)

## 다음 루프가 알아야 할 주의사항
- Perso API 500 지속 중 — exit 77 계속 예상
- LandingPage 추가 중복: section padding className(`px-4 py-20 md:py-28`)이 5개 섹션에 반복되나 max-width가 다름 (5xl/6xl/3xl) — 상수 추출 가능성 있음
- `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6` lines 280, 348도 중복이나 섹션 맥락이 다름
