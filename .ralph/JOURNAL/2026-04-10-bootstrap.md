# 2026-04-10 · Ralph 부트스트랩 + 첫 회귀 검증

## 한 줄 요약
사람이 직접 dub-flow 스크립트를 작성·실행해 두 영상 모두 더빙 완료를 확인했고, 발견한 한 가지 약점(`pollProgress` 일시적 오류 1회로 reject)을 fix 했다.

## 측정값
- `test/test_animation.mp4` (6 MB) → projectSeq=327922, 254s 만에 COMPLETED, dubbingVideo URL OK
- `test/test video.mp4` (8.5 MB) → projectSeq=327924, 394s 만에 COMPLETED, dubbingVideo URL OK
- 폴링 도중 5분간 fetch failed 25회 발생 (`fetch failed` 라는 generic Node 에러). 이후 자동 회복.

## 적용한 fix
- `src/services/persoApi.ts:pollProgress` — 연속 30회까지 일시적 오류 허용. 1회 실패로 reject 하던 것을 인터벌마다 재시도로 변경. 콘솔에 transient warning 로그.

## 새로 만든 자산
- `.ralph/test/dub-flow.mjs` — Studio 흐름 전체를 Node.js 로 직접 호출하는 회귀 테스트
- `.ralph/run.sh` — dub-flow 를 실패할 때마다 Claude 를 호출해 자동 수정 시도하는 harness
- `.ralph/watchdog.sh` — heartbeat 기반 stuck 감지
- `.ralph/summary.sh` — 야간 실행 결과 요약
- `.ralph/PROMPT.md` — 자율 모드 지시문
- `.ralph/STATE.md`, `.ralph/BACKLOG.md` — 상태/백로그 시드

## 다음 루프가 알아야 할 것
- 환경: Windows + Git Bash, Node 24.x, 사내 CA 환경 → dub-flow 가 `NODE_TLS_REJECT_UNAUTHORIZED=0` 을 자체 설정함
- gh CLI 는 `/c/Program Files/GitHub CLI/gh.exe` 에 있고 `GH_TOKEN` 환경변수로 인증
- Vercel 자동 배포에 60~90 초 걸림 — 머지 후 그만큼 기다려야 새 코드 검증 가능
- main 에 직접 머지 금지. develop → main 은 merge commit (`gh pr merge --merge`), 이슈 브랜치 → develop 은 squash (`gh pr merge --squash --delete-branch`)
- develop 브랜치 자동 삭제 사고가 있었으니 `delete_branch_on_merge=false` 유지 + develop → main PR 머지 시 `--delete-branch` 절대 사용 금지
