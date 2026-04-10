# BACKLOG

> 사용자가 자리를 비운 동안 자율 모드로 굴러간다. 항목을 위에서부터 하나씩 집고, 끝나면 dub-flow 회귀 테스트로 검증한 뒤 PR → develop → main 머지까지 자동 진행한다.

## P0 — 사용자가 직접 시킨 것
- [x] 두 영상 (test/test_animation.mp4, test/test video.mp4) 모두 더빙 완료 검증 ← 2026-04-10 통과
- [x] 클라이언트 pollProgress 일시적 fetch 오류 회복력 강화 ← 머지 완료
- [x] free 플랜 기본 크레딧 60초 → 360000초(100시간)로 변경 + 기존 60초 사용자 마이그레이션
- [x] Studio 페이지 언어 미선택 시 명확한 가드 (헬프 텍스트, 버튼 상태)
- [ ] **회귀 검증 (자율 모드 첫 사이클):** Ralph 가 dub-flow 를 한 번 더 돌려 두 영상이 모두 통과하고, dashboard 에 history 행이 잘 뜨고, 잔여 크레딧이 차감되는지 직접 호출로 확인

## P1 — 더빙 외 추가 기능 기획 (자가 선택, 한 iteration 에 하나만)
- [ ] **자막(.srt) 다운로드 버튼**: getDownloadLinks 가 이미 srtFile 을 반환하니 result step 에 다운로드 링크만 노출하면 됨. 아주 작은 PR.
- [ ] **음성만 다운로드 (voiceAudio / voicewithBackgroundAudio) 분리 노출**: 이미 fetchDownloadTarget 으로 받고 있음. UI 만 추가.
- [ ] **더빙 결과 공유 링크**: 이미 publish API (api/projects/[id]/publish.ts) 가 있음. dashboard 에 토글 버튼 + 공유 링크 복사.
- [ ] **다국어 동시 더빙**: targetLanguageCodes 배열에 여러 언어를 넣으면 Perso 가 동시에 처리. UI 에서 단일 라디오 → 멀티 체크박스로 전환 (단, 크레딧 차감은 언어 수만큼 늘어나야 함)
- [ ] **즐겨찾기/북마크**: projects 테이블에 is_favorite 컬럼 추가, dashboard 에 ⭐ 토글
- [ ] **검색 + 필터 강화**: dashboard 의 status filter 에 더해 제목/언어/날짜 검색
- [ ] **사용량 차트**: settings 또는 dashboard 에 최근 30일간 차감된 크레딧을 일별 막대 차트로
- [ ] **온보딩 첫 화면**: 처음 로그인한 사용자에게 짧은 3-step 튜토리얼
- [ ] **에러 토스트 통일**: 현재 에러는 페이지마다 표시 방식이 다름. shared toast 컴포넌트로 통일
- [ ] **빈 상태 일러스트**: dashboard 비었을 때 더 친절한 빈 상태

## P2 — 인프라/품질
- [ ] state.json 에 dub-flow 결과를 구조화 저장 (mediaSeq, projectSeq, downloads URL 등)
- [ ] 다운로드 URL 의 실제 HEAD 응답 검증 (file 크기 > 0)
- [ ] dub-flow 다국어 회귀 (en→ko, ja→en 등 추가)
- [ ] StudioPage 의 다른 단계도 transient 오류에 약하지 않은지 점검
- [ ] getScript / getDownloadLinks 응답 변형 회귀 테스트

## 자가 생성 풀
BACKLOG 가 비면 다음 중 골라 채울 수 있다:
- 테스트 보강, 문서, 리팩터, 관측성, 타입 강화
- 위 P1 의 미완성 항목 추가 분해
