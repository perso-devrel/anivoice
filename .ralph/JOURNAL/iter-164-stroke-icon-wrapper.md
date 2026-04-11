# iter-164 — StrokeIcon 래퍼 추출

## BACKLOG 항목
- P2 자가생성: icons.tsx 29개 stroke 아이콘의 반복 SVG 속성을 StrokeIcon 내부 래퍼로 추출

## 배경
- 직전 dub-flow 회귀 실패 로그 분석 → exit 77 (upstream Perso API 500), 코드 회귀 아님
- P2 미완료 중 API 의존 항목만 남아 자가 생성 풀에서 아이콘 리팩터 선택

## 변경
- `src/components/icons.tsx`: 내부 `StrokeIcon` 래퍼 컴포넌트 추가
  - viewBox, fill, stroke, strokeLinecap, strokeLinejoin을 한 번만 선언
  - 29개 아이콘에서 반복 속성 제거 (path에서 strokeLinecap/strokeLinejoin 삭제 — SVG 상속)
  - 비표준 6개(PlayIcon, SpinnerIcon, StarIcon, LoadingSpinner, EmptyProjectsIcon, GoogleIcon) 유지

## 검증
- `npm run build` ✔ (257KB 메인 번들 유지)
- `npm run lint` ✔ (0 errors)
- `npm test` ✔ (372 passed)
- dub-flow → exit 77 (upstream-down, Perso API 500 지속)

## PR
- Issue: #526
- PR develop: #527 (squash merge)
- PR main: #528 (merge)

## 다음 루프 참고
- Perso API 500 지속 중 — API 의존 항목(다운로드 URL HEAD 검증, 다국어 회귀) 여전히 blocked
- icons.tsx 297→267줄 (10% 감소), 추가 아이콘 추가 시 StrokeIcon 재사용 가능
