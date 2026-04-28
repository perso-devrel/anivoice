# KoeDub 서비스 재현 프롬프트

> 이 프롬프트를 Claude에 보내면 KoeDub 서비스를 처음부터 구축할 수 있습니다.

---

## 프롬프트 시작

다음 명세를 따라 **KoeDub** — 일본 애니메이션 AI 더빙 웹 서비스를 만들어주세요.

---

## 1. 프로젝트 개요

KoeDub는 일본 애니메이션 영상을 업로드하면 캐릭터 음성을 보존한 채 8개 언어로 AI 더빙하는 웹 서비스입니다. [Perso.ai](https://developers.perso.ai) API를 활용하여 번역, 더빙, 립싱크를 수행합니다.

**핵심 가치:** 원본 캐릭터 음성 톤을 유지하면서 다국어 더빙을 제공하는 것.

---

## 2. 기술 스택

```
프론트엔드: React 19 + TypeScript + Vite + Tailwind CSS 4
상태 관리: Zustand
라우팅: React Router 7
인증: Firebase Authentication (+ Mock 인증 폴백)
데이터베이스: Turso (libSQL)
AI 더빙 엔진: Perso.ai API
배포: Vercel (Serverless Functions)
테스트: Vitest
i18n: i18next (한국어, 영어, 일본어, 중국어)
HTTP 클라이언트: Axios
차트: Recharts
아이콘: @phosphor-icons/react (Phosphor Icons)
```

---

## 3. 프로젝트 구조

```
KoeDub/
├── api/                          # Vercel Serverless Functions (백엔드)
│   ├── _lib/
│   │   ├── auth.ts               # Firebase 토큰 검증 + 헬퍼
│   │   ├── db.ts                 # Turso DB 클라이언트 + 마이그레이션
│   │   ├── credits.ts            # 크레딧 차감 계산 로직
│   │   ├── library.ts            # 라이브러리 쿼리 빌더
│   │   ├── projects.ts           # 프로젝트 쿼리 빌더
│   │   ├── mappers.ts            # DB row → 객체 매퍼
│   │   ├── publish.ts            # 게시 로직
│   │   └── proxy.ts              # Perso API 프록시 헬퍼
│   ├── user/me.ts                # GET /api/user/me
│   ├── projects/
│   │   ├── index.ts              # GET/POST /api/projects
│   │   └── [id]/
│   │       ├── index.ts          # GET/PATCH/DELETE /api/projects/:id
│   │       └── publish.ts        # POST /api/projects/:id/publish
│   ├── library/
│   │   ├── index.ts              # GET /api/library
│   │   └── [id].ts              # GET /api/library/:id
│   ├── credits/
│   │   ├── deduct.ts             # POST /api/credits/deduct
│   │   ├── history.ts            # GET /api/credits/history
│   │   ├── purchase.ts           # POST /api/credits/purchase
│   │   └── transactions.ts       # GET /api/credits/transactions
│   ├── tags/index.ts             # GET /api/tags
│   └── perso.ts                  # Perso API 프록시 (모든 메서드)
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.tsx        # Navbar + Outlet + Footer + Toast
│   │   │   ├── Navbar.tsx        # 네비게이션 + 언어 전환 + 사용자 메뉴
│   │   │   └── Footer.tsx
│   │   ├── CheckoutModal.tsx     # 결제 모달 (카드 입력)
│   │   ├── DashboardToolbar.tsx  # 검색, 필터, 정렬
│   │   ├── ErrorBoundary.tsx     # React 에러 바운더리
│   │   ├── icons.tsx             # @phosphor-icons/react 래퍼 (아이콘 컴포넌트)
│   │   ├── LibraryCard.tsx       # 라이브러리 아이템 카드
│   │   ├── OnboardingModal.tsx   # 첫 사용자 가이드
│   │   ├── ProfileTab.tsx        # 프로필 편집 탭
│   │   ├── ProjectCard.tsx       # 프로젝트 카드 (상태/진행률)
│   │   ├── PublishSection.tsx    # 게시 + 태그 선택
│   │   ├── ResultStep.tsx        # 결과 표시 + 다운로드
│   │   ├── SentenceEditList.tsx  # 자막 문장별 편집
│   │   ├── SettingsStep.tsx      # 언어 선택 + 립싱크 토글
│   │   ├── StepIndicator.tsx     # 스튜디오 단계 표시
│   │   ├── SubscriptionTab.tsx   # 크레딧/구독 관리
│   │   ├── Toast.tsx             # 토스트 알림
│   │   ├── UploadStep.tsx        # 파일 드래그앤드롭 업로드
│   │   └── UsageChart.tsx        # 사용량 차트 (Recharts)
│   ├── pages/
│   │   ├── LandingPage.tsx       # 히어로, 기능, FAQ, 가격 미리보기
│   │   ├── AuthPage.tsx          # 로그인/회원가입 (이메일 + Google)
│   │   ├── DashboardPage.tsx     # 프로젝트 목록, 즐겨찾기, 통계
│   │   ├── StudioPage.tsx        # 핵심: 업로드→설정→편집→결과
│   │   ├── LibraryPage.tsx       # 공개 프로젝트 탐색
│   │   ├── LibraryDetailPage.tsx # 게시 프로젝트 상세
│   │   ├── PricingPage.tsx       # 크레딧 패키지 + 결제
│   │   ├── SettingsPage.tsx      # 프로필, 구독, 계정
│   │   ├── TestPage.tsx          # 개발 테스트 도구
│   │   └── NotFoundPage.tsx      # 404
│   ├── services/
│   │   ├── persoApi.ts           # Perso.ai API 클라이언트 (전체)
│   │   ├── firebase.ts           # Firebase 인증 + Mock 인증 폴백
│   │   └── koedubApi.ts        # KoeDub 백엔드 클라이언트
│   ├── stores/
│   │   ├── authStore.ts          # Zustand: 사용자 상태
│   │   ├── uiStore.ts            # Zustand: UI 상태 (사이드바, 언어)
│   │   └── toastStore.ts         # Zustand: 토스트 알림
│   ├── hooks/
│   │   ├── useClipboard.ts
│   │   ├── useFocusTrap.ts
│   │   └── usePageTitle.ts
│   ├── utils/
│   │   ├── auth.ts               # Firebase 에러 코드 매핑
│   │   ├── format.ts             # 시간/duration 포맷팅
│   │   ├── dashboard.ts          # 프로젝트 필터링/정렬
│   │   ├── onboarding.ts         # 온보딩 로직
│   │   ├── pricing.ts            # 가격 상수
│   │   └── studio.ts             # 더빙 워크플로우 유틸
│   ├── i18n/
│   │   ├── index.ts              # i18next 설정
│   │   ├── ko.ts                 # 한국어 (기본)
│   │   ├── en.ts                 # 영어
│   │   ├── ja.ts                 # 일본어
│   │   └── zh.ts                 # 중국어
│   ├── types/index.ts            # 모든 TypeScript 타입
│   ├── constants.ts              # 지원 언어 상수
│   ├── App.tsx                   # 라우터 + 레이아웃
│   ├── main.tsx                  # React 진입점
│   └── index.css                 # Tailwind 스타일
├── .env.example
├── vercel.json
├── vite.config.ts
└── package.json
```

---

## 4. 데이터베이스 스키마

Turso (libSQL/SQLite) 사용. `api/_lib/db.ts`에서 `migrate()` 실행 시 자동 생성.

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,                              -- Firebase UID
  email TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  credit_seconds INTEGER NOT NULL DEFAULT 0,
  language TEXT NOT NULL DEFAULT 'ko',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL DEFAULT '',
  original_file_name TEXT,
  source_language TEXT NOT NULL DEFAULT 'auto',
  target_language TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'uploading',          -- uploading|analyzing|dubbing|lip-syncing|completed|failed
  progress INTEGER NOT NULL DEFAULT 0,               -- 0-100
  duration_ms INTEGER NOT NULL DEFAULT 0,
  perso_project_seq INTEGER,
  perso_space_seq INTEGER,
  thumbnail_url TEXT,
  video_url TEXT,
  audio_url TEXT,
  subtitle_url TEXT,
  zip_url TEXT,
  is_public INTEGER NOT NULL DEFAULT 0,
  is_favorite INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_public ON projects(is_public) WHERE is_public = 1;

CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  display_name_ko TEXT,
  display_name_en TEXT
);

-- 기본 태그: action, romance, comedy, fantasy, sci-fi, horror, drama, sports, slice-of-life, mecha

CREATE TABLE project_tags (
  project_id INTEGER NOT NULL REFERENCES projects(id),
  tag_id INTEGER NOT NULL REFERENCES tags(id),
  PRIMARY KEY (project_id, tag_id)
);

CREATE TABLE credit_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,                                -- dubbing_deduct, purchase 등
  amount_seconds INTEGER NOT NULL,                   -- 음수 가능 (차감)
  balance_after INTEGER NOT NULL,
  description TEXT,
  project_id INTEGER REFERENCES projects(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_credit_txn_user ON credit_transactions(user_id);
```

---

## 5. TypeScript 타입 정의

```typescript
// --- 앱 타입 ---

interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  creditSeconds: number;
  language: SupportedLanguage;
  createdAt: string;
}

type SupportedLanguage = 'ja' | 'ko' | 'en' | 'es' | 'pt' | 'id' | 'ar' | 'zh';
type ProjectStatus = 'uploading' | 'analyzing' | 'dubbing' | 'lip-syncing' | 'completed' | 'failed';

interface Project {
  id: string;
  userId: string;
  title: string;
  originalFileName: string;
  originalLanguage: SupportedLanguage;
  targetLanguages: SupportedLanguage[];
  status: ProjectStatus;
  progress: number;
  duration: number;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  spaceSeq?: number;
  projectSeq?: number;
}

// --- Perso API 타입 ---

interface PersoSpaceBanner {
  spaceSeq: number;
  spaceName: string;
  planName: string;
  tier: string;
  logo: string;
  memberCount: number;
  seat: number;
  isDefaultSpaceOwned: boolean;
  memberRole: string;
  useVideoTranslatorEdit: boolean;
}

interface PersoUploadedFile {
  seq: number;
  originalName: string;
  videoFilePath: string;
  thumbnailFilePath: string;
  size: number;
  durationMs: number;
}

interface PersoProgress {
  projectSeq: number;
  progress: number;           // 0-100
  progressReason: string;     // COMPLETED | FAILED | CANCELED | 기타
  hasFailed: boolean;
  speedType: string;
  expectedRemainingTimeMinutes: number;
  isCancelable: boolean;
}

interface PersoScriptSentence {
  seq: number;
  speakerOrderIndex: number;
  offsetMs: number;
  durationMs: number;
  originalText: string;
  translatedText: string;
  audioUrl?: string;
  matchingRate?: { level: number; levelType: string };
}

interface PersoDownloadLinks {
  videoFile?: { videoDownloadLink: string };
  audioFile?: {
    voiceAudioDownloadLink: string;
    backgroundAudioDownloadLink: string;
    voiceWithBackgroundAudioDownloadLink: string;
  };
  srtFile?: {
    originalSubtitleDownloadLink: string;
    translatedSubtitleDownloadLink: string;
  };
  zippedFileDownloadLink?: string;
}
```

---

## 6. Perso.ai API 연동 (핵심)

### 6.1 아키텍처

Perso API 키(`XP-API-KEY`)는 **서버 사이드에서만** 사용합니다. 클라이언트 요청은 프록시를 통해 전달됩니다.

```
[브라우저] → /api/perso/* → [Vite 프록시 or Vercel Function] → api.perso.ai
                              (XP-API-KEY 헤더 주입)
```

**Vite 개발 프록시 설정 (`vite.config.ts`):**
```typescript
server: {
  proxy: {
    '/api/perso': {
      target: process.env.PERSO_API_BASE_URL || 'https://api.perso.ai',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/perso/, ''),
      configure: (proxy) => {
        proxy.on('proxyReq', (proxyReq) => {
          proxyReq.setHeader('XP-API-KEY', process.env.XP_API_KEY || '');
        });
      },
    },
  },
}
```

**Vercel Serverless 프록시 (`api/perso.ts`):**
- 모든 HTTP 메서드 지원 (GET, POST, PUT, PATCH, DELETE)
- 쿼리 파라미터 `_path`로 실제 Perso 경로 전달
- 요청에 `XP-API-KEY` 헤더 주입
- 응답을 클라이언트에 그대로 전달

### 6.2 Perso API 엔드포인트

클라이언트에서 `persoApi.ts`를 통해 호출하는 전체 엔드포인트:

| 기능 | 메서드 | 엔드포인트 |
|------|--------|-----------|
| 스페이스 목록 | GET | `/portal/api/v1/spaces` |
| 스페이스 상세 | GET | `/portal/api/v1/spaces/{spaceSeq}` |
| SAS 토큰 발급 | GET | `/file/api/upload/sas-token?fileName={name}` |
| Azure 업로드 | PUT | `{blobSasUrl}` (직접 Azure로) |
| 비디오 등록 | PUT | `/file/api/upload/video` |
| 큐 초기화 | PUT | `/video-translator/api/v1/projects/spaces/{spaceSeq}/queue` |
| 번역 요청 | POST | `/video-translator/api/v1/projects/spaces/{spaceSeq}/translate` |
| 진행률 폴링 | GET | `/video-translator/api/v1/projects/{projectSeq}/space/{spaceSeq}/progress` |
| 프로젝트 취소 | POST | `/video-translator/api/v1/projects/{projectSeq}/spaces/{spaceSeq}/cancel` |
| 스크립트 조회 | GET | `/video-translator/api/v1/projects/{projectSeq}/spaces/{spaceSeq}/script` |
| 문장 수정 | PATCH | `/video-translator/api/v1/project/{projectSeq}/audio-sentence/{sentenceSeq}` |
| 음성 재생성 | PATCH | `/video-translator/api/v1/project/{projectSeq}/audio-sentence/{sentenceSeq}/generate-audio` |
| 문장 초기화 | PUT | `/video-translator/api/v1/project/{projectSeq}/audio-sentence/{sentenceSeq}/reset` |
| 교정 요청 | POST | `/video-translator/api/v1/project/{projectSeq}/space/{spaceSeq}/proofread` |
| 립싱크 요청 | POST | `/video-translator/api/v1/projects/{projectSeq}/spaces/{spaceSeq}/lip-sync` |
| 다운로드 링크 | GET | `/video-translator/api/v1/projects/{projectSeq}/spaces/{spaceSeq}/download?target={target}` |
| 지원 언어 | GET | `/video-translator/api/v1/languages` |
| 프로젝트 목록 | GET | `/video-translator/api/v1/projects/spaces/{spaceSeq}` |
| 쿼타 상태 | GET | `/video-translator/api/v1/projects/spaces/{spaceSeq}/plan/status` |
| 쿼타 예측 | GET | `/video-translator/api/v1/projects/spaces/{spaceSeq}/media/quota` |
| 피드백 제출 | POST | `/video-translator/api/v1/projects/feedbacks` |

### 6.3 파일 업로드 흐름

```
1. getSasToken(fileName)       → Azure SAS URL 발급
2. uploadToAzure(sasUrl, file) → Azure Blob Storage에 직접 업로드
3. registerVideo(spaceSeq, fileUrl, fileName) → Perso에 파일 등록, mediaSeq 반환
```

- `fileUrl`은 SAS URL에서 `?` 이전 부분 (순수 blob URL)
- 업로드 실패 시 exponential backoff 재시도 (기본 2초, 최대 3회)

### 6.4 번역/더빙 요청

```typescript
// 번역 요청 페이로드
{
  mediaSeq: number,           // registerVideo에서 받은 seq
  isVideoProject: true,
  sourceLanguageCode: string, // 'auto' 또는 언어 코드
  targetLanguageCodes: string[], // 대상 언어 배열
  numberOfSpeakers: 0,        // 자동 감지
  withLipSync: boolean,
  preferredSpeedType: 'GREEN' // 일반 속도
}
```

### 6.5 진행률 폴링

```
- 폴링 간격: 5초 고정 (API 명세 준수, POLL_INTERVAL_MS = 5000)
- 네트워크 에러 허용: 최대 30회 연속 실패까지 재시도
- 완료 조건: progressReason === 'COMPLETED' 또는 progress >= 100
- 실패 조건: hasFailed === true 또는 progressReason === 'FAILED'
```

### 6.6 다운로드 링크 조회

개별 target으로 호출하고 결과를 병합합니다 (`target=all`은 zip만 반환):

```typescript
const targets = ['dubbingVideo', 'voiceAudio', 'voicewithBackgroundAudio', 'translatedSubtitle', 'all'];
// Promise.allSettled로 병렬 호출 후 merged 객체 생성
```

### 6.7 에러 처리

- `isTransientError()`: 5xx, 408, 429, 네트워크 에러 → 재시도 대상
- `retryWithBackoff(fn, maxRetries=3, baseDelay=1000)`: exponential backoff
- 401/403 + `/file/api/` + 쓰기 메서드: Perso File API 권한 부족 전용 메시지
- `unwrapResult()`: Perso 응답이 `{ result: ... }` 래핑인 경우 추출
- `extractProjectIds()`: 다양한 응답 형태에서 projectSeq 배열 추출

### 6.8 파일 URL 해석

Perso에서 반환하는 파일 경로가 상대 경로일 경우 `https://perso.ai`를 앞에 붙입니다.

```typescript
function resolvePersoFileUrl(path?: string | null) {
  if (!path) return undefined;
  return path.startsWith('http') ? path : `https://perso.ai${path}`;
}
```

---

## 7. 인증 시스템

### 7.1 Firebase 인증 (프로덕션)

- 이메일/비밀번호 로그인·회원가입
- Google 로그인 (Firebase 팝업)
- `onAuthStateChanged`로 상태 감시
- ID 토큰을 모든 API 요청의 `Authorization: Bearer {token}` 헤더에 첨부

### 7.2 Mock 인증 (개발용 폴백)

`VITE_FIREBASE_API_KEY`가 없으면 자동으로 Mock 모드:

- 인메모리 계정 DB
- localStorage 영속성
- 기본 계정: `demo@example.com` / `demo1234`
- 가짜 JWT 토큰 생성

### 7.3 서버 사이드 토큰 검증

`api/_lib/auth.ts`에서 Firebase ID 토큰을 검증합니다 (firebase-admin 대신 경량 구현으로 cold start 최소화):

```
1. Authorization 헤더에서 Bearer 토큰 추출
2. Google 공개 키로 JWT 서명 검증
3. exp(만료), aud(audience = FIREBASE_PROJECT_ID), sub(uid) 검증
4. 유효하면 { sub, email, name, picture } 반환
```

> 프로덕션 배포 시에는 반드시 JWT 서명을 Google의 공개 키(https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com)로 검증해야 합니다.

### 7.4 사용자 동기화

로그인 후 `/api/user/me` 호출 → DB에 사용자 upsert → 실제 `creditSeconds` 반환.

---

## 8. 라우팅

```typescript
// App.tsx - React Router 설정
<Routes>
  <Route element={<Layout />}>
    {/* 공개 라우트 */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<AuthPage />} />      {/* mode=login */}
    <Route path="/signup" element={<AuthPage />} />      {/* mode=signup */}
    <Route path="/library" element={<LibraryPage />} />
    <Route path="/library/:id" element={<LibraryDetailPage />} />
    <Route path="/pricing" element={<PricingPage />} />

    {/* 보호 라우트 */}
    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    <Route path="/studio" element={<ProtectedRoute><StudioPage /></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

    {/* 404 */}
    <Route path="*" element={<NotFoundPage />} />
  </Route>
</Routes>
```

**ProtectedRoute:** 로딩 중이면 스피너, 미인증이면 `/login`으로 리다이렉트 (원래 위치 state 전달).

모든 페이지는 `lazy()` + `Suspense`로 코드 스플리팅.

---

## 9. 상태 관리 (Zustand)

### authStore

```typescript
interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser(user: User | null): void;
  setLoading(loading: boolean): void;
  setCreditSeconds(seconds: number): void;
  addCreditSeconds(seconds: number): void;
}
```

### uiStore

```typescript
type UILanguage = 'ko' | 'en' | 'ja' | 'zh';

interface UIState {
  sidebarOpen: boolean;
  language: UILanguage;
  toggleSidebar(): void;
  setSidebarOpen(open: boolean): void;
  setLanguage(lang: UILanguage): void;
}
```

### toastStore

```typescript
type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  toasts: Toast[];
  addToast(message: string, type?: ToastType): void;
  removeToast(id: string): void;
}
// 토스트 자동 해제: 4초
```

---

## 10. 핵심 페이지별 명세

### 10.1 LandingPage

- **스크롤 애니메이션**: 모든 섹션이 `RevealSection` 컴포넌트로 감싸져 IntersectionObserver 기반 fade-in + translate-y 애니메이션 적용 (threshold: 0.12, `prefers-reduced-motion` 존중)
- 히어로 섹션: `bg-void`, 스캔라인+필름그레인 효과, 대형 `font-display` 타이틀(`leading-[1.05]`, `clamp(32px, 8vw, 180px)`) + `chromatic-hover`, CTA 버튼(`bg-lucy`) → `/studio`, 보조 CTA → `/library` (아카이브)
- 샘플 영상(01 DEMO): 원본(일본어) vs 더빙(영어) 나란히, `border-2 border-bone` 비디오 박스 + 재생/일시정지
- 기능 카드 4개(02 FEATURES): `bg-ink border-2 border-bone`, 아이콘 박스(`bg-bone`→호버`bg-david`), 일본 효과음 장식(声/語/口/書)
- 작동 방식 3단계(03 HOW IT WORKS): `bg-ink` 카드에 거대한 효과음(ドン/バン/ズキュン), 스텝 번호(`font-mono`), 화살표 연결
- 지원 언어(04 LANGUAGES), 가격(05 PRICING), FAQ(06 FAQ), 하단 CTA(07 START NOW)
- FAQ 아코디언: `bg-ink border-2 border-bone`, 열기/닫기 `ChevronDownIcon` 회전
- 가격 카드: `font-display font-black` 가격, `text-david` 강조, 오프셋 그림자
- 하단 CTA: `bg-david text-void` 버튼, `leading-[1.1]`

### 10.2 StudioPage (핵심 — 4단계 워크플로우)

**단계 1: 업로드**
- Perso 스페이스 목록 조회 (최소 1개 필요)
- 파일 드래그앤드롭 또는 클릭 선택
- MP4, MOV, WebM 허용
- Azure SAS 토큰 → Azure Blob 업로드 → Perso 파일 등록
- `mediaSeq`와 `durationMs` 획득

**단계 2: 설정**
- 원본 언어 선택 (auto 또는 수동)
- 대상 언어 다중 선택
- 립싱크 ON/OFF 토글
- 크레딧 차감: `ceil(durationMs / 1000) × max(1, floor(languageCount))`
- 잔액 부족 시 차단

**단계 3: 더빙 진행**
- `ensureSpaceQueue(spaceSeq)` 호출
- `requestTranslation(spaceSeq, payload)` → projectSeq 배열 반환
- `pollProgress(projectSeq, spaceSeq, onProgress)` → 실시간 진행률
- 립싱크 ON이면 더빙 완료 후 `requestLipSync()` → 추가 폴링
- UI: 프로그레스 바 + 예상 시간 + 취소 버튼

**단계 4: 결과**
- `getScript(projectSeq, spaceSeq)` → 번역 스크립트 조회
- 문장별 인라인 편집 (`translateSentence()`) + 음성 재생성 (`generateSentenceAudio()`)
- `getDownloadLinks()` → 다운로드 버튼 생성 (영상, 음성, 자막, ZIP)
- 공유 링크 생성
- 아카이브 공개/비공개 토글 (태그 선택, 언제든 전환 가능)
- 기존 프로젝트 재진입 시 DB에서 `dbProjectId`, `isPublished` 자동 조회 (`getProjectByPersoSeq`)

### 10.3 DashboardPage

- 프로젝트 목록 (탭: 전체, 즐겨찾기, 진행중, 완료)
- 검색 (제목, 언어)
- 언어 필터
- 정렬 (최신순, 오래된순)
- 사용량 차트 (최근 30일, Recharts)
- 크레딧/통계 카드
- 신규 사용자 온보딩 모달
- 프로젝트 테이블: STATUS/PROGRESS/DATE 중앙 정렬
- 즐겨찾기 활성 시 `text-david` 색상, 비활성 시 `text-bone/20`
- **실시간 폴링**: 진행 중 프로젝트(uploading/dubbing/lip-syncing/analyzing)만 5초 간격으로 `getProgress` API 호출, progress bar 실시간 업데이트. 완료/실패 시 자동 폴링 중단
- 용어: OWNER, ACTIVE PROJECTS, NEW VIDEO, PROJECT (Mission/Runner 사용 안 함)

### 10.4 LibraryPage (아카이브)

- 공개 프로젝트 탐색 (아카이브)
- 태그 필터링
- 언어 필터링
- 검색
- 정렬 (인기순, 최신순)
- 그라데이션 플레이스홀더 카드

### 10.5 AuthPage

- 로그인/회원가입 전환
- 이메일/비밀번호 입력
- Google 로그인 버튼
- 이메일 유효성 검사
- 에러 메시지 표시
- 로그인 성공 → `/dashboard` 이동

### 10.6 PricingPage

- 크레딧 패키지 3종:
  - 10분 = $10 (분당 $1)
  - 50분 = $50
  - 100분 = $100
- 결제 모달 (카드 입력 폼)
- 구매 API 호출

### 10.7 SettingsPage

- 프로필 탭 (MY PROFILE): 이름, 이메일, 프로필 사진
- 구독/크레딧 탭
- 결제 내역 탭
- 언어 설정 탭
- DANGER ZONE: 로그아웃

---

## 11. 백엔드 API 명세

### 11.1 인증 미들웨어

모든 보호 엔드포인트에서:
1. `Authorization: Bearer {token}` 헤더 검증
2. Firebase 토큰 디코딩
3. `ensureUser(token)` — DB에 사용자 upsert (FK 위반 방지)

### 11.2 엔드포인트

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| GET | `/api/user/me` | 필수 | 현재 사용자 조회/생성 |
| GET | `/api/projects` | 필수 | 내 프로젝트 목록 (persoProjectSeq, persoSpaceSeq 쿼리로 특정 프로젝트 조회 가능) |
| POST | `/api/projects` | 필수 | 프로젝트 생성 |
| GET | `/api/projects/:id` | 필수 | 프로젝트 상세 |
| PATCH | `/api/projects/:id` | 필수 | 프로젝트 업데이트 |
| DELETE | `/api/projects/:id` | 필수 | 프로젝트 삭제 |
| POST | `/api/projects/:id/publish` | 필수 | 라이브러리 게시 |
| GET | `/api/library` | 없음 | 공개 프로젝트 목록 |
| GET | `/api/library/:id` | 없음 | 공개 프로젝트 상세 |
| POST | `/api/credits/deduct` | 필수 | 크레딧 차감 |
| POST | `/api/credits/purchase` | 필수 | 크레딧 구매 |
| GET | `/api/credits/history` | 필수 | 사용량 히스토리 |
| GET | `/api/credits/transactions` | 필수 | 거래 내역 |
| GET | `/api/tags` | 없음 | 태그 목록 |
| * | `/api/perso` | 프록시 | Perso API 프록시 |

### 11.3 크레딧 차감 로직

```typescript
function computeDeductSeconds(durationMs: number, languageCount: number): number {
  return Math.ceil(durationMs / 1000) * Math.max(1, Math.floor(languageCount));
}
```

차감 시:
1. 현재 잔액 확인
2. 잔액 < 차감량이면 402 반환
3. `users.credit_seconds -= deductAmount`
4. `credit_transactions` 에 기록 (type: 'dubbing_deduct', amount_seconds: -deductAmount)

---

## 12. i18n (다국어)

### 설정

```typescript
// src/i18n/index.ts
i18next.use(initReactI18next).init({
  resources: { ko: { translation: ko }, en: { translation: en }, ja: { translation: ja }, zh: { translation: zh } },
  lng: 'ko',
  fallbackLng: 'ko',
  interpolation: { escapeValue: false },
});
```

### 번역 키 구조

```typescript
{
  common: { appName, login, signup, logout, save, cancel, delete, loading, error, ... },
  auth: { email, password, loginTitle, signupTitle, googleLogin, ... },
  landing: { heroTitle, heroSubtitle, ctaPrimary('시작하기'), ctaSecondary('공개 영상 보기'), features, howItWorks, faq, ... },
  dashboard: { myProjects, favorites, inProgress, completed, search, ... },
  library: { title('더빙 아카이브'), popular, latest, allTags, noResults, ... },
  studio: { upload, settings, dubbing, result, selectLanguage, lipSync, publishTitle, unpublishTitle, ... },
  pricing: { title, perMinute, timePack10, timePack50, timePack100, ... },
  settings: { profile, subscription, account, ... },
  pageTitle: { dashboard, studio, library, pricing, settings, ... },
}
```

### 용어 규칙

| 사용 | 미사용 |
|------|--------|
| 아카이브 (Archive) | 라이브러리 (Library) |
| 프로젝트 (Project) | 미션 (Mission) |
| 오너 (Owner) | 러너 (Runner) |
| 시작하기 (Get started) | 무료로 시작하기 |
| 공개 영상 보기 (Browse archive) | 데모 영상 보기 |
```

### 언어 전환

Navbar에서 언어 버튼으로 전환 → `uiStore.setLanguage()` → `i18n.changeLanguage()` → `document.documentElement.lang` 업데이트.

---

## 13. Vite 설정

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': '/src' } },
  server: {
    proxy: {
      '/api/perso': {
        target: process.env.PERSO_API_BASE_URL || 'https://api.perso.ai',
        changeOrigin: true,
        secure: process.env.PERSO_API_PROXY_SECURE !== 'false',
        rewrite: (path) => path.replace(/^\/api\/perso/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('XP-API-KEY', process.env.XP_API_KEY || '');
          });
        },
      },
      '/api': {
        target: process.env.VITE_KOEDUB_API_URL || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  test: { environment: 'node', globals: true },
});
```

---

## 14. Vercel 배포 설정

```json
{
  "functions": {
    "api/**/*.ts": { "includeFiles": "api/_lib/**" }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    },
    { "source": "/api/(.*)", "headers": [{ "key": "Cache-Control", "value": "no-store" }] },
    { "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }
  ],
  "rewrites": [
    { "source": "/api/perso/:path*", "destination": "/api/perso?_path=:path*" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

---

## 15. 환경변수

```env
# Perso API (서버 사이드 — 필수)
XP_API_KEY=your_perso_api_key
PERSO_API_BASE_URL=https://api.perso.ai

# Perso 프록시 경로 (클라이언트)
VITE_PERSO_PROXY_PATH=/api/perso

# Firebase 인증 (클라이언트)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id

# Firebase (서버 — 토큰 검증)
FIREBASE_PROJECT_ID=your_project_id

# Turso 데이터베이스
TURSO_DATABASE_URL=libsql://your_db.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token

# 백엔드 URL (프리뷰/프로덕션)
VITE_KOEDUB_API_URL=https://your-app.vercel.app
```

---

## 16. 디자인 가이드라인 — EDGERUNNERS 테마

### 16.1 디자인 컨셉

사이버펑크: 에지러너스에서 영감을 받은 "네오-브루탈리즘 + 일본 만화 타이포그래피" 디자인. 둥근 모서리 없이, 날카로운 직선 보더와 오프셋 그림자, 스캔라인·필름 그레인 등 아날로그 효과를 사용합니다.

### 16.2 컬러 팔레트 (EDGERUNNERS palette)

```css
--color-void: #0A0A0A;       /* 기본 배경 — 순수 블랙에 가까움 */
--color-ink: #1A1A1A;         /* 카드/컨테이너 배경 */
--color-bone: #F5F0E6;        /* 텍스트/보더 — 따뜻한 오프화이트 */
--color-lucy: #FF4FA3;        /* 주 강조 — 핫핑크 (CTA, 활성 상태, 링크) */
--color-david: #FCEE0A;       /* 보조 강조 — 일렉트릭 옐로 (가격, 중요 수치) */
--color-rebecca: #FF2E63;     /* 경고/위험 */
--color-wire: #00F0FF;        /* 정보/사이버 — 시안 */
--color-edge: #FF6B00;        /* 오렌지 포인트 */
```

레거시 토큰 (`primary-*`, `accent-*`, `surface-*`)도 유지되지만, 새로운 UI는 EDGERUNNERS 팔레트를 사용합니다.

### 16.3 타이포그래피

```css
--font-display: 'Space Grotesk', 'Pretendard Variable', system-ui, sans-serif;  /* 제목, 로고, CTA */
--font-body: 'Pretendard Variable', 'Space Grotesk', system-ui, sans-serif;     /* 본문 */
--font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;  /* 라벨, 네비 */
--font-jp: 'Noto Sans JP', 'Pretendard Variable', sans-serif;                   /* 일본어 효과음 */
```

웹폰트 CDN:
- Pretendard Variable: `cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9`
- Space Grotesk, JetBrains Mono, Noto Sans JP: Google Fonts

### 16.4 UI 스타일 규칙

- **배경**: `bg-void` (페이지), `bg-ink` (카드/컨테이너)
- **보더**: `border-2 border-bone` — 항상 2px, 둥근 모서리(rounded) 사용 금지
- **텍스트 색상**: `text-bone` (기본), `text-bone/60` (보조), `text-bone/30` (비활성)
- **강조**: `text-lucy` (활성 링크/선택), `text-david` (가격/수치), `text-wire` (정보)
- **버튼 스타일**: 배경 채움 + 보더, 호버 시 반전 (예: `bg-david text-void` → 호버 `bg-void text-david`)
- **오프셋 그림자**: `.offset-lucy`, `.offset-david-sm` 등 — 그라데이션 없는 단색 블록 그림자
- **네비게이션 링크**: `font-mono text-xs uppercase tracking-[0.15em]`
- **라벨/뱃지**: `font-mono text-[10px] uppercase tracking-widest`
- **카드 호버**: `hover:-translate-x-1 hover:-translate-y-1` + 오프셋 그림자 조합

### 16.5 특수 효과 유틸리티

| 클래스 | 효과 | 사용처 |
|--------|------|--------|
| `.scanlines` | 반투명 수평 스캔라인 오버레이 | 히어로 섹션 배경 |
| `.film-grain` | SVG 노이즈 텍스처 | 히어로 섹션 배경 |
| `.chromatic-hover` | 호버 시 색수차 텍스트 쉐도우 (wire + rebecca) | 제목 텍스트 |
| `.text-outline-bone` | 외곽선만 있는 텍스트 (-webkit-text-stroke) | 장식용 카타카나 |
| `.corner-marks` | 코너 브라켓 장식 | 섹션 프레임 |
| `.flicker-on-hover` | 호버 시 한 번 깜빡임 | 인터랙티브 요소 |
| `.sfx-pop` | 스케일+회전 팝 애니메이션 | 효과음 텍스트 |
| `.slash-divider` / `.slash-divider-r` | 대각선 클리핑 | 히어로 패널 구분 |
| `.offset-{color}` / `.offset-{color}-sm` | 10px/5px 블록 그림자 | 카드 호버 |

### 16.6 일본어 효과음 타이포그래피

랜딩페이지에서 만화 스타일 효과음을 사용합니다:
- 스텝 카드: `ドン` (쿵), `バン` (빵), `ズキュン` (쿵쿵) — `font-jp font-black text-[7rem]`, 각각 `text-lucy`, `text-wire`, `text-david`
- 피처 카드: `声` (목소리), `語` (언어), `口` (입), `書` (쓰기) — `font-jp text-[5rem]`
- 회전/오프셋 배치: `rotate(-6deg)`, 오른쪽 상단 절대 위치, `opacity-90`

### 16.7 아이콘 시스템

`@phosphor-icons/react` 라이브러리를 사용합니다. `src/components/icons.tsx`에서 래퍼 컴포넌트로 내보냅니다:

```typescript
// Phosphor 아이콘을 import하고 className prop으로 래핑
import { Play as PhPlay } from '@phosphor-icons/react';

export function PlayIcon({ className = 'w-10 h-10' }: IconProps) {
  return <PhPlay className={className} weight="fill" />;
}
```

주요 아이콘 목록: FileIcon, PlayIcon, DownloadIcon, CheckIcon, SpinnerIcon(커스텀), SearchIcon, ChevronDownIcon, ClockIcon, XIcon, PlusIcon, AlertCircleIcon, UploadIcon, CheckCircleIcon, ArrowRightIcon, InfoIcon, MenuIcon, StarIcon, LinkIcon, ChevronLeftIcon, ArrowLeftIcon, WalletIcon, RefreshIcon, VoiceIcon, GlobeIcon, LipSyncIcon, EditIcon, SettingsIcon, TranslateIcon, SortIcon, VideoPlayIcon, UserIcon, LoadingSpinner(커스텀), EmptyProjectsIcon(커스텀 SVG), GoogleIcon(커스텀 SVG)

SpinnerIcon은 Phosphor 대신 CSS `border` + `animate-spin` + `steps(8)`으로 디지털 느낌을 구현합니다.

### 16.8 컴포넌트 패턴

**Navbar**: 고정 상단, `bg-void/95 backdrop-blur-sm border-b-2 border-bone`. 로고는 대각선 분할 lucy/david 디자인 (`clipPath: polygon`으로 삼각형 분할) + 중앙 "A" 글자 + `chromatic-hover`. Footer도 동일한 로고. 모바일 메뉴는 전체 너비 드롭다운.

**카드**: `bg-ink border-2 border-bone p-6/p-8`. 호버 시 `-translate-x-1 -translate-y-1` + offset shadow. 내부 아이콘 박스는 `bg-bone text-void` → 호버 시 `bg-david`/`bg-lucy`.

**모달**: `bg-ink border-2 border-bone` + 배경 오버레이 `bg-void/80`.

**입력 필드**: `bg-void border-2 border-bone/40 text-bone font-mono` → 포커스 시 `border-lucy`.

**텍스트 선택**: `::selection { background: lucy; color: void; }`

### 16.9 기타 원칙

- **모바일 퍼스트** 반응형 레이아웃
- **실제 서비스 수준** 말투와 UX (데모 느낌 제거)
- Tailwind CSS 유틸리티 클래스 사용
- 무한 로딩, 빈 상태, 에러 상태 모두 UI로 표현
- 토스트 알림으로 사용자 피드백
- `@` alias로 import 경로 단순화
- `prefers-reduced-motion` 미디어 쿼리로 애니메이션 비활성화 지원

---

## 17. 지원 언어 상수

```typescript
const SUPPORTED_LANGUAGES = [
  { key: 'ja', flag: '🇯🇵' },
  { key: 'ko', flag: '🇰🇷' },
  { key: 'en', flag: '🇺🇸' },
  { key: 'es', flag: '🇪🇸' },
  { key: 'pt', flag: '🇧🇷' },
  { key: 'id', flag: '🇮🇩' },
  { key: 'ar', flag: '🇸🇦' },
] as const;
```

UI 언어 (4종): ko, en, ja, zh  
더빙 언어 (8종): ja, ko, en, es, pt, id, ar, zh

---

## 18. 주요 유틸리티 함수

### format.ts
- `formatMs(ms)` — 밀리초를 MM:SS로 포맷
- `formatCreditTime(seconds, t)` — 로컬라이즈된 시간 ("10분 30초")
- `formatDuration(ms)` — M:SS 형식
- `getErrorMessage(err, fallback)` — 에러 메시지 추출

### studio.ts
- `computeDubbingProgress(pollProgress)` — Perso 진행률 → UI 진행률 매핑
- `getDownloadUrl(type, links)` — 다운로드 링크 추출
- `buildShareUrl(origin, dbProjectId)` — 공유 URL 생성
- `toggleArrayItem(arr, item)` — 배열 토글
- `computeDeductSeconds(durationMs, languageCount)` — 크레딧 차감 계산

### dashboard.ts
- `filterProjects(projects, opts)` — 쿼리/언어/상태 필터
- `sortProjects(projects, order)` — 정렬
- `mapDbStatus(project)` — DB 상태 → ProjectStatus 매핑
- `extractAvailableLanguages(projects)` — 고유 언어 추출
- `countProjectStats(projects)` — 진행중/완료 카운트
- `getProgressBarColor(status)` — 상태별 프로그레스바 색상

---

## 19. 구현 우선순위

1. 프로젝트 초기화 (Vite + React + TypeScript + Tailwind)
2. 프로젝트 구조 + 타입 정의
3. i18n 설정 + 기본 번역
4. Zustand 스토어 3개
5. Firebase 인증 (+ Mock 폴백)
6. Perso API 프록시 (Vite dev + Vercel serverless)
7. Perso API 클라이언트 (persoApi.ts — 전체 함수)
8. 데이터베이스 스키마 + 마이그레이션
9. 백엔드 API 라우트 (user, projects, library, credits, tags)
10. Layout + Navbar + Footer
11. LandingPage
12. AuthPage (로그인/회원가입)
13. StudioPage (핵심 4단계 워크플로우)
14. DashboardPage
15. LibraryPage + LibraryDetailPage
16. PricingPage
17. SettingsPage
18. 커스텀 훅 + 유틸리티
19. 에러 바운더리 + Toast
20. Vercel 배포 설정

---

이 명세를 따라 전체 서비스를 구축해주세요. 모든 파일을 생성하고, 실제 서비스 수준의 완성도를 유지해주세요.
