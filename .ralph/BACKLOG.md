# BACKLOG

## P0 (지금 바로)
- [x] 두 영상이 dub-flow 스크립트로 모두 더빙 완료되는지 1회 검증 (2026-04-10 완료)
- [x] 클라이언트 `pollProgress` 가 1회 fetch 실패로 reject 되는 약점 fix
- [ ] 새 변경(`pollProgress` 회복력)이 main 에 머지된 후 dub-flow 재실행해 회귀 없는지 확인

## P1
- [ ] 더빙 결과 다운로드 URL 에 HEAD 요청을 보내 실제 파일 접근 가능한지 검증
- [ ] dub-flow 에 다국어 (ja → en, en → ko 등) 회귀 케이스 추가
- [ ] dub-flow 결과를 `.ralph/state.json` 에 구조화해 저장 (success/failure, mediaSeq, projectSeq, downloads)

## P2
- [ ] StudioPage 가 `pollProgress` 외 다른 단계에서도 전이적 오류에 약하지 않은지 점검
- [ ] `getScript` / `getDownloadLinks` 응답 변형 회귀 테스트

## 자가 생성 풀
- 테스트 보강, 문서, 리팩터, 관측성, 타입 강화
