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
- [x] **dub-flow 5xx 재시도 + exit 77**: call() 함수에 3회 재시도 + 지수 백오프, persistent 5xx → exit 77 (upstream-down) ← iter-63, #132, PR #133/#134
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
- [x] 라이브러리 쿼리 빌더 추출 + 테스트 추가 (285→298개) ← iter-64, #135, PR #136/#137
- [x] 프로젝트 쿼리 빌더 추출 + 테스트 추가 (298→310개) ← iter-65, #138, PR #139/#140
- [x] extractApiErrorMessage 내보내기 + 테스트 추가 (310→321개) ← iter-66, #141, PR #142/#143
- [x] PricingPage·LibraryPage 하드코딩 한국어 → i18n 키 교체 ← iter-67, #144, PR #145/#146
- [x] SettingsPage·PricingPage 잔여 하드코딩 한국어 → i18n 키 교체 ← iter-68, #147, PR #148/#149
- [x] 아이콘 전용 버튼에 aria-label 추가 (접근성 개선) ← iter-69, #150, PR #151/#152
- [x] StudioPage 인라인 리셋 핸들러를 handleResetProject 함수로 추출 ← iter-70, #153, PR #154/#155
- [x] 8개 페이지 최상위 래퍼를 시맨틱 `<main>` 태그로 변경 ← iter-71, #156, PR #157/#158
- [x] formatSeconds 하드코딩 한국어를 i18n 키로 교체 (영어 모드 버그) ← iter-72, #161, PR #162/#163
- [x] persoApi 디버그 console.log 제거 (API 응답 노출 방지) ← iter-73, #164, PR #165/#166
- [x] persoApi 에러 메시지 하드코딩 한국어를 영어로 교체 ← iter-74, #167, PR #168/#169
- [x] API 라우트 하드코딩 한국어 에러/설명 문자열 영어 교체 (perso.ts, credits/) ← iter-75, #170, PR #171/#172
- [x] TestPage 하드코딩 한국어를 영어로 교체 (개발자 도구 전체) ← iter-76, #173, PR #174/#175
- [x] React ErrorBoundary 추가 (lazy-load 실패 graceful fallback UI) ← iter-77, #176, PR #177/#178
- [x] Escape 키로 OnboardingModal·모바일 메뉴 닫기 (키보드 접근성) ← iter-78, #179, PR #180/#181
- [x] `<html lang>` 속성 언어 전환 동기화 (접근성·SEO) ← iter-79, #182, PR #183/#184
- [x] Footer 하드코딩 영어 문자열 i18n 키 교체 (8개 문자열) ← iter-80, #185, PR #186/#187
- [x] LandingPage 하드코딩 문자열 i18n 키 교체 (FAQ·영상 비교·Popular 배지 13개) ← iter-81, #188, PR #189/#190
- [x] StudioPage 하드코딩 문자열 i18n 키 교체 (Speaker 라벨·Pro plan 안내 2개) ← iter-82, #191, PR #192/#193
- [x] StudioPage 잔여 하드코딩 문자열 i18n 교체 (자동감지·Pro 배지·공개하기 3개) ← iter-83, #194, PR #195/#196
- [x] StudioPage 에러 메시지 4개 i18n 교체 (workspace·file·projectId) ← iter-84, #197, PR #198/#199
- [x] 페이지별 동적 document.title 설정 (usePageTitle 훅 + i18n 키 9개) ← iter-85, #200, PR #201/#202
- [x] usePageTitle 테스트 미사용 변수 빌드 에러 수정 ← iter-83, #203, PR #204/#205
- [x] 페이지별 동적 meta description 설정 (usePageTitle 확장 + pageDesc i18n 키 9개) ← iter-84, #206, PR #207/#208
- [x] skip-to-content 링크 추가 (키보드 접근성 WCAG 2.4.1) ← iter-85, #209, PR #210/#211
- [x] 페이지 전환 시 스크롤 최상단 복원 (ScrollToTop) ← iter-86, #212, PR #213/#214
- [x] 모달·메뉴 ARIA role/aria-modal 속성 추가 (OnboardingModal, PricingPage, Navbar) ← iter-87, #215, PR #216/#217
- [x] useFocusTrap 훅으로 모달 포커스 트래핑 구현 (OnboardingModal, PricingPage) ← iter-88, #218, PR #219/#220
- [x] 검색·번역 입력 필드 aria-label 추가 (DashboardPage, LibraryPage, StudioPage) ← iter-89, #221, PR #222/#223
- [x] useFocusTrap 테스트 미사용 변수 lint 에러 수정 ← iter-86, #224, PR #225/#226
- [x] prefers-reduced-motion 미디어 쿼리 추가 (접근성 WCAG 2.3.3) ← iter-87, #227, PR #228/#229
- [x] Open Graph 및 Twitter Card 메타 태그 추가 (SEO·소셜 공유) ← iter-88, #230, PR #231/#232
- [x] 잔여 한국어 주석 영어 변환 (persoApi, auth, db) ← iter-89, #233, PR #234/#235
- [x] vercel.json 보안 헤더 추가 (X-Content-Type-Options, X-Frame-Options, Referrer-Policy 등) ← iter-90, #236, PR #237/#238
- [x] 불필요한 @types/react-router-dom devDependency 제거 (v7 자체 타입 번들) ← iter-91, #239, PR #240/#241
- [x] robots.txt + theme-color 메타 태그 추가 (SEO baseline) ← iter-92, #242, PR #243/#244
- [x] 404 Not Found 페이지 추가 (catch-all route + i18n) ← iter-93, #245, PR #246/#247
- [x] sitemap.xml 추가 + robots.txt Sitemap 디렉티브 ← iter-94, #248, PR #249/#250
- [x] usePageTitle에 canonical URL 동적 설정 (SEO) ← iter-95, #251, PR #252/#253
- [x] `<noscript>` 폴백 메시지 추가 (접근성/SEO) ← iter-96, #254, PR #255/#256
- [x] publish handler 쿼리 빌더 추출 + 테스트 추가 (348→359개) ← iter-97, #257, PR #258/#259
- [x] 중복 SVG 아이콘 컴포넌트를 공유 icons.tsx 모듈로 추출 ← iter-98, #260, PR #261/#262
- [x] 인라인 SVG 스피너를 SpinnerIcon 공유 컴포넌트로 교체 (AuthPage, LibraryPage, PricingPage) ← iter-99, #263, PR #264/#265
- [x] mapProjectRow 에 누락된 subtitleUrl 필드 추가 + DbProject 인터페이스 동기화 ← iter-100, #266, PR #267/#268
- [x] 미사용 @tanstack/react-query 의존성 제거 (메인 번들 283→258KB, 8.6% 감소) ← iter-101, #269, PR #270/#271
- [x] formatSeconds/formatChartDay를 utils/format.ts로 통합 + formatChartDay 테스트 추가 (359→362개) ← iter-102, #272, PR #273/#274
- [x] StudioPage ZIP 다운로드 버튼 하드코딩 라벨 i18n 키 교체 ← iter-103, #275, PR #276/#277
- [x] 인라인 X/닫기 SVG를 공유 XIcon 컴포넌트로 교체 (Toast, OnboardingModal, Navbar) ← iter-104, #278, PR #279/#280
- [x] 인라인 PlusIcon/AlertCircleIcon SVG를 공유 아이콘으로 교체 (DashboardPage, StudioPage) ← iter-105, #281, PR #282/#283
- [x] 인라인 UploadIcon/CheckCircleIcon/ArrowRightIcon SVG를 공유 아이콘으로 추출 (OnboardingModal, LandingPage, DashboardPage) ← iter-106, #284, PR #285/#286
- [x] useClipboard 훅 추출로 3개 파일 중복 clipboard 패턴 통합 + 4개 테스트 추가 (362→366개) ← iter-107, #287, PR #288/#289
- [x] 인라인 체크마크 SVG 5개를 공유 CheckmarkIcon 컴포넌트로 추출 (Toast, PricingPage, SettingsPage) ← iter-108, #290, PR #291/#292
- [x] PricingPage 인라인 clock SVG를 공유 ClockIcon으로 교체 ← iter-109, #293, PR #294/#295
- [x] Toast InfoIcon + Navbar MenuIcon 인라인 SVG를 공유 아이콘으로 추출 ← iter-110, #296, PR #297/#298
- [x] DashboardPage 인라인 SearchIcon SVG 2개를 공유 아이콘으로 교체 ← iter-111, #299, PR #300/#301
- [x] DashboardPage 인라인 StarIcon SVG를 공유 아이콘으로 추출 ← iter-112, #302, PR #303/#304
- [x] ChevronLeftIcon, ArrowLeftIcon 추출 + StudioPage 인라인 LinkIcon 교체 ← iter-113, #305, PR #306/#307
- [x] SettingsPage 인라인 UserIcon SVG를 공유 아이콘으로 추출 ← iter-114, #308, PR #309/#310
- [x] DashboardPage 인라인 WalletIcon/RefreshIcon SVG를 공유 아이콘으로 추출 ← iter-115, #311, PR #312/#313
- [x] LandingPage 인라인 VoiceIcon/GlobeIcon/LipSyncIcon/EditIcon/SettingsIcon을 공유 아이콘으로 추출 ← iter-116, #314, PR #315/#316
- [x] OnboardingModal TranslateIcon + DashboardPage SortIcon/VideoPlayIcon 공유 아이콘으로 추출 + 정렬 아이콘 dead ternary 제거 ← iter-117, #317, PR #318/#319
- [x] projects CREATE TABLE에 is_favorite 컬럼 통합 (ALTER TABLE 폴백 스키마 불일치 해소) ← iter-118, #320, PR #321/#322
- [x] migrate() redundant ALTER TABLE is_favorite 폴백 dead code 제거 ← iter-119, #323, PR #324/#325
- [x] en.ts/ko.ts 미사용 i18n 키 9개 삭제 (studio.urlInput 등) ← iter-120, #326, PR #327/#328
- [x] getErrorMessage 유틸 추출로 7개 중복 에러 변환 패턴 제거 + 6개 테스트 추가 (366→372개) ← iter-121, #329, PR #330/#331
- [x] StudioPage/LibraryPage 잔여 하드코딩 문자열 3개 i18n 교체 (공개하기 버튼, 클립보드 에러, 라이브러리 로딩 에러) ← iter-122, #332, PR #333/#334
- [x] LibraryPage useEffect missing `t` dependency 수정 (lint 경고 0건 달성) ← iter-123, #335, PR #336/#337
- [x] select 요소 aria-label 추가 (DashboardPage/LibraryPage/StudioPage 언어 드롭다운 3개) ← iter-124, #338, PR #339/#340
- [x] LandingPage 인라인 SVG 4개를 공유 아이콘 컴포넌트로 교체 (IconDownload/IconPlay/IconCheck/IconChevron 제거) ← iter-125, #341, PR #342/#343
- [x] StudioPage useEffect eslint-disable 제거 (searchParams deps 정리) ← iter-126, #344, PR #345/#346
- [x] 중복 LANGUAGES 상수를 src/constants.ts로 추출 + 4개 테스트 추가 (372→376개) ← iter-127, #347, PR #348/#349
- [x] formatDuration을 dashboard.ts에서 format.ts로 이동 (모듈 응집도 개선) ← iter-128, #351, PR #352/#353
- [x] DashboardPage 인라인 빈 상태 SVG를 공유 EmptyProjectsIcon으로 추출 ← iter-129, #354, PR #355/#356
- [x] 인라인 CSS 로딩 스피너 6개를 공유 LoadingSpinner 컴포넌트로 추출 ← iter-130, #359, PR #360/#361
- [x] AuthPage 인라인 Google 로고 SVG를 공유 GoogleIcon 컴포넌트로 추출 ← iter-131, #364, PR #365/#366
- [x] Footer 하드코딩 copyright 문자열 i18n 키 교체 ← iter-132, #369, PR #370/#371
- [x] 썸네일 이미지 loading="lazy" + decoding="async" 추가 (DashboardPage, LibraryPage) ← iter-133, #373, PR #374/#375
- [x] 인라인 instanceof Error 패턴을 공유 getErrorMessage()로 통합 + fallback 파라미터 추가 (376→378 tests) ← iter-134, #377, PR #378/#379
- [x] UsageChart 인라인 객체 리터럴 5개를 모듈 수준 상수로 추출 (중복 tick 스타일 통합) ← iter-135, #382, PR #383/#384

## 자가 생성 풀
BACKLOG 가 비면 다음 중 골라 채울 수 있다:
- 테스트 보강, 문서, 리팩터, 관측성, 타입 강화
- 위 P1 의 미완성 항목 추가 분해
