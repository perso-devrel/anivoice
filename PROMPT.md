# AniVoice 서비스 재현 프롬프트

> 이 프롬프트를 Claude에 보내면 AniVoice 서비스를 처음부터 구축할 수 있습니다.

---

## 프롬프트 시작

다음 명세를 따라 **AniVoice** — 일본 애니메이션 AI 더빙 웹 서비스를 만들어주세요.

---

## 1. 프로젝트 개요

AniVoice는 일본 애니메이션 영상을 업로드하면 캐릭터 음성을 보존한 채 8개 언어로 AI 더빙하는 웹 서비스입니다. [Perso.ai](https://developers.perso.ai) API를 활용하여 번역, 더빙, 립싱크를 수행합니다.

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
```

---

## 3. 프로젝트 구조

```
anivoice/
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
│   │   ├── icons.tsx             # 공유 아이콘 (LoadingSpinner 등)
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
│   │   └── anivoiceApi.ts        # AniVoice 백엔드 클라이언트
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
- 기본 간격: 5초
- ETA > 3분: 10초 간격
- ETA > 1분: 7초 간격
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

- 히어로 섹션: 타이틀, 부제, CTA 버튼 → `/studio`
- 기능 카드 4개: 음성 보존, 다국어, 립싱크, 편집
- 작동 방식 3단계: 업로드 → 더빙 → 다운로드
- FAQ 아코디언
- 샘플 영상 미리보기 (원본 vs 더빙)
- 가격 개요

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
- 라이브러리 게시 (태그 선택)

### 10.3 DashboardPage

- 프로젝트 목록 (탭: 전체, 즐겨찾기, 진행중, 완료)
- 검색 (제목, 언어)
- 언어 필터
- 정렬 (최신순, 오래된순)
- 사용량 차트 (최근 30일, Recharts)
- 크레딧/통계 카드
- 신규 사용자 온보딩 모달
- 프로젝트 카드: 상태 표시, 즐겨찾기 토글

### 10.4 LibraryPage

- 공개 프로젝트 탐색
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

- 프로필 탭: 이름, 이메일, 프로필 사진
- 구독/크레딧 탭
- 계정 관리

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
| GET | `/api/projects` | 필수 | 내 프로젝트 목록 |
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
  landing: { heroTitle, heroSubtitle, features, howItWorks, faq, ... },
  dashboard: { myProjects, favorites, inProgress, completed, search, ... },
  library: { popular, latest, allTags, noResults, ... },
  studio: { upload, settings, dubbing, result, selectLanguage, lipSync, ... },
  pricing: { title, perMinute, timePack10, timePack50, timePack100, ... },
  settings: { profile, subscription, account, ... },
  pageTitle: { dashboard, studio, library, pricing, settings, ... },
}
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
        target: process.env.VITE_ANIVOICE_API_URL || 'http://localhost:3000',
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
VITE_ANIVOICE_API_URL=https://your-app.vercel.app
```

---

## 16. 디자인 가이드라인

- **다크 테마** 기본 (bg-surface-950 배경)
- **모바일 퍼스트** 반응형 레이아웃
- **실제 서비스 수준** 말투와 UX (데모 느낌 제거)
- Tailwind CSS 유틸리티 클래스 사용
- 무한 로딩, 빈 상태, 에러 상태 모두 UI로 표현
- 토스트 알림으로 사용자 피드백
- 그라데이션 플레이스홀더 (썸네일 없을 때)
- `@` alias로 import 경로 단순화

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
