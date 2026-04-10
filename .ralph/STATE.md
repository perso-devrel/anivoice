# 현재 상태

- **모드:** 무한 자율 (Ralph harness 구동 중)
- **목표:** BACKLOG 의 P0 → P1 → 자가생성풀 순으로 끝없이 처리
- **회귀 기준:** `node .ralph/test/dub-flow.mjs` 가 `ALL VIDEOS DUBBED SUCCESSFULLY` 출력
- **최근 사람 변경:** free 플랜 100시간(360000초) 적용 + 언어 미선택 가드 + dub-flow 에 auth-guard / spa-fallback 추가 검증 + PROMPT 자율모드 강화
- **다음 루프가 기대하는 출발점:**
  - 새 코드가 main 에 머지되고 Vercel 배포가 끝나면 dub-flow 가 통과해야 함
  - dashboard 에 더빙 history 가 표시되고 잔여 크레딧이 100h 부근으로 보여야 함
  - Studio 페이지에서 언어 미선택 시 버튼이 명확히 비활성/안내 텍스트 표시
- **알려진 잠재 이슈:**
  - dub-flow.mjs 는 Firebase 토큰 없이 호출하므로 createProject / deductCredits 단계는 직접 검증 못 함 (브라우저 흐름에서만 가능). 별도의 deduct 검증은 P2 로 BACKLOG 에 등록 가능.
- **운영 메모:**
  - develop / main 영구 브랜치는 절대 삭제 금지 (`delete_branch_on_merge=false`)
  - develop → main PR 머지 시 `--delete-branch` 옵션 사용 금지 (사고 이력 있음)
  - 매 iteration 후 sleep 90 으로 Vercel 배포 대기
