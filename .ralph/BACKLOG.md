# BACKLOG

> 사용자가 자리를 비운 동안 자율 모드로 굴러간다. 항목을 위에서부터 하나씩 집고, 끝나면 dub-flow 회귀 테스트로 검증한 뒤 PR → develop → main 머지까지 자동 진행한다.

## P0 — 사용자가 직접 시킨 것
- [x] 두 영상 (test/test_animation.mp4, test/test video.mp4) 모두 더빙 완료 검증 ← 2026-04-10 통과
- [x] 클라이언트 pollProgress 일시적 fetch 오류 회복력 강화 ← 머지 완료
- [x] free 플랜 기본 크레딧 60초 → 360000초(100시간)로 변경 + 기존 60초 사용자 마이그레이션
- [x] Studio 페이지 언어 미선택 시 명확한 가드 (헬프 텍스트, 버튼 상태)
- [x] **회귀 검증 (자율 모드 첫 사이클):** dub-flow 3회 연속 통과 확인 (dashboard/credit 검증은 Firebase auth 미지원으로 제외) ← 2026-04-10

## P1 — 더빙 외 추가 기능 기획 (자가 선택, 한 iteration 에 하나만)
- [x] **자막(.srt) 다운로드 버튼**: 이미 구현되어 있음 (StudioPage.tsx:732) ← 기존 코드 확인 2026-04-10
- [x] **음성만 다운로드 (voiceAudio / voicewithBackgroundAudio) 분리 노출**: 이미 구현되어 있음 (StudioPage.tsx:733) ← 기존 코드 확인 2026-04-10
- [x] **더빙 결과 공유 링크 (1/2)**: publish 후 공유 링크 복사 버튼 추가 (#42, PR #43) ← 2026-04-10
- [x] **더빙 결과 공유 링크 (2/2)**: 개별 프로젝트 뷰 페이지 `/library/:id` 추가 + 공유 링크를 해당 URL로 변경 ← iter-3, #45, PR #46/#47
- [x] **다국어 동시 더빙**: 멀티 체크박스 UI + 크레딧 언어 수 곱셈 ← iter-4, #48, PR #49/#50
- [x] **즐겨찾기/북마크**: projects 테이블에 is_favorite 컬럼 추가, dashboard 에 ⭐ 토글 ← iter-5, #51, PR #52/#53
- [x] **검색 + 필터 강화**: 언어 드롭다운 필터 + 최신/오래된순 정렬 토글 ← iter-6, #54, PR #55/#56
- [x] **사용량 차트**: dashboard에 최근 30일 크레딧 사용량 일별 막대 차트 (recharts) ← iter-7, #57, PR #58/#59
- [x] **온보딩 첫 화면**: 처음 로그인한 사용자에게 짧은 3-step 튜토리얼 ← iter-9, #63, PR #64/#65
- [x] **에러 토스트 통일**: shared Toast 컴포넌트 + zustand 스토어로 통일 ← iter-10, #66, PR #67/#68
- [x] **빈 상태 일러스트**: dashboard 비었을 때 더 친절한 빈 상태 ← iter-11, #69, PR #70/#71

## P0-fix — 회귀 테스트 수정
- [x] **dub-flow 402 quota exceeded 감지**: exit code 78로 외부 한도와 코드 회귀 구분 ← iter-8, #60, PR #61/#62
- [x] **dub-flow 5xx 재시도 + exit 77**: call() 함수에 3회 재시도 + 지수 백오프, persistent 5xx → exit 77 (upstream-down) ← iter-63
- [blocked] **Perso API 복구 대기**: 서버 에러(500) + ENTERPRISE_QUOTA_EXCEEDED — 복구 시 dub-flow exit 0 재확인 필요

## P2 — 인프라/품질
- [x] state.json 에 dub-flow 결과를 구조화 저장 (mediaSeq, projectSeq, downloads URL 등) ← iter-43, #72, PR #73/#74
- [ ] 다운로드 URL 의 실제 HEAD 응답 검증 (file 크기 > 0)
- [ ] dub-flow 다국어 회귀 (en→ko, ja→en 등 추가)
- [x] StudioPage 의 다른 단계도 transient 오류에 약하지 않은지 점검 ← iter-44, #75, PR #76/#77
- [x] 나머지 API 함수 retryWithBackoff 적용 (getScript, translateSentence, generateSentenceAudio, requestLipSync) ← iter-45, #78, PR #79/#80
- [x] getScript / getDownloadLinks 응답 변형 회귀 테스트 ← iter-46, #81, PR #82/#83 (vitest 40개 테스트 + extractProjectIds 배열 버그 수정)
- [x] ESLint 오류 전수 수정 (LibraryDetailPage setState + OnboardingModal export) ← iter-47, #84, PR #85/#86
- [x] Route-level code splitting — 메인 번들 852KB→273KB (68% 감소) ← iter-48, #87, PR #88/#89
- [x] UsageChart lazy import — DashboardPage 367KB→22KB (recharts 별도 분리) ← iter-49, #90, PR #91/#92
- [x] zustand 스토어 + 유틸리티 유닛 테스트 추가 (40→62개) ← iter-50, #93, PR #94/#95
- [x] authStore + dashboard 유틸 + resolvePersoFileUrl 테스트 추가 (62→89개) ← iter-51, #96, PR #97/#98
- [x] i18n 키 동기화 검증 테스트 (ko/en 대칭·빈값·배열 검사, 89→95개) ← iter-52, #99, PR #100/#101
- [x] vite 보안 취약점 패치 (npm audit fix, 11→9 vuln) ← iter-53, #102, PR #103/#104
- [x] firebase mock auth 유닛 테스트 추가 (95→110개) ← iter-54, #105, PR #106/#107
- [x] mapAuthError + getProgressBarColor 유틸 추출 및 테스트 추가 (110→128개) ← iter-55, #108, PR #109/#110
- [x] formatMs 유틸 추출 + auth 헬퍼 테스트 추가 (128→155개) ← iter-56, #111, PR #112/#113
- [x] DashboardPage 필터/정렬 로직 추출 + 테스트 추가 (155→174개) ← iter-57, #114, PR #115/#116
- [x] StudioPage 다운로드/진행률/공유 로직 유틸 추출 + 테스트 추가 (174→187개) ← iter-58, #117, PR #118/#119
- [x] verifyFirebaseToken + ensureUser 유닛 테스트 추가 (187→201개) ← iter-59, #120, PR #121/#122
- [x] API 크레딧 계산 및 DB 행 매퍼 순수 함수 추출 + 테스트 추가 (201→239개) ← iter-60, #123, PR #124/#125
- [x] user/tag/detail/patch 행 매퍼 추출 + 테스트 추가 (239→256개) ← iter-61, #126, PR #127/#128
- [x] Perso API 프록시 유틸 추출 + 테스트 추가 (256→285개) ← iter-62, #129, PR #130/#131

## 자가 생성 풀
BACKLOG 가 비면 다음 중 골라 채울 수 있다:
- 테스트 보강, 문서, 리팩터, 관측성, 타입 강화
- 위 P1 의 미완성 항목 추가 분해
