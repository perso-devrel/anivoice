# 보안 감사 보고서 (Security Audit Report)

> **최종 갱신:** 2026-04-16 (`@vercel/node@4` 업그레이드 반영)
> **검사 도구:** `npm audit` (GitHub Advisory DB), 수동 리뷰
> **후속 자동 검사:** `.github/workflows/security-audit.yml` (매일 + PR 시 OSV-Scanner + npm audit)

---

## 1. 요약 (Executive Summary)

| 구분 | 취약점 수 |
|------|-----------|
| **프로덕션 런타임 번들 (`--omit=dev`)** | **0 건** ✅ |
| 전체 (dev 포함) | 7 건 (High 3, Moderate 4) |
| Critical | 0 건 |

**결론:** 프로덕션 번들은 **클린(0건)**. 남은 취약점은 전부 `@vercel/node` devDependency 트리 내부 도구 체인에서 유래하며, 최종 빌드 산출물에는 포함되지 않습니다.

### 변경 이력
- **2026-04-16 [이전]** 10 건 (High 6, Moderate 4) — `@vercel/node@3.x`
- **2026-04-16 [현재]** 7 건 (High 3, Moderate 4) — `@vercel/node@^4.0.0` 업그레이드 + `npm audit fix` 적용 후

### @vercel/node@5 검토 결과
v5.7.7 설치 시 transitive `undici` 등의 영향으로 **취약점 수가 오히려 증가**했습니다. 현 시점 최적안은 **v4.0.0**입니다.

---

## 2. 프로덕션 취약점 (Runtime)

`dependencies` 트리에서 감지된 취약점: **없음** ✅

직접 번들링되는 런타임 의존성(React 19, axios, Firebase, `@libsql/client`, i18next, zustand, react-router-dom, tailwindcss, recharts)은 모두 최신 버전을 유지합니다.

---

## 3. 개발 전용 취약점 (devDependencies)

아래 7 건은 `@vercel/node` 내부 빌드 도구 체인에서 유래하며, 프로덕션 번들/서버리스 함수 런타임에 **영향 없음**. CI 환경에서만 실행됩니다.

| 패키지 | 심각도 | Advisory | 비고 |
|--------|--------|----------|------|
| `undici` ≤ 6.23.0 | High | [GHSA-c76h-2ccp-4975](https://github.com/advisories/GHSA-c76h-2ccp-4975) 외 | `@vercel/node` 내부 fetch |
| `tar` ≤ 7.5.10 | High | [GHSA-34x7-hfp2-rc4v](https://github.com/advisories/GHSA-34x7-hfp2-rc4v) | `@mapbox/node-pre-gyp` 의존 |
| `@mapbox/node-pre-gyp` | High | via `tar` | 바이너리 설치 전용 |
| `ajv` 7.x–8.17.1 | Moderate | [GHSA-2g4f-4pwh-qvx6](https://github.com/advisories/GHSA-2g4f-4pwh-qvx6) | `@vercel/static-config` |
| `@vercel/static-config` | Moderate | via `ajv` | 빌드 설정 파서 |
| `esbuild` ≤ 0.24.2 | Moderate | [GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99) | 개발 서버만 영향 |
| (기타 transitive 1건) | - | - | - |

---

## 4. 런타임 의존성 리뷰

| 패키지 | 버전 | 상태 |
|--------|------|------|
| `react` / `react-dom` | ^19.2.4 | ✅ 최신 |
| `react-router-dom` | ^7.14.0 | ✅ 최신 |
| `firebase` | ^12.11.0 | ✅ 최신 |
| `@libsql/client` | ^0.17.2 | ✅ 최신 |
| `axios` | ^1.14.0 | ✅ 최신 (follow-redirects 패치 포함) |
| `i18next` / `react-i18next` | ^26 / ^17 | ✅ 최신 |
| `recharts` | ^3.8.1 | ✅ 최신 |
| `tailwindcss` | ^4.2.2 | ✅ 최신 |
| `zustand` | ^5.0.12 | ✅ 최신 |

---

## 5. 자동화된 보안 통제

| 통제 | 파일 | 트리거 |
|------|------|--------|
| Dependabot alerts | GitHub 기본 + `dependabot.yml` | 실시간 + 주간 |
| Dependabot security updates | `dependabot.yml` | CVE 공개 즉시 |
| CodeQL (security-extended) | `.github/workflows/codeql.yml` | push / PR / 주간 |
| OSV-Scanner | `.github/workflows/security-audit.yml` | 일간 |
| npm audit (PR 게이트, `--omit=dev`) | `.github/workflows/security-audit.yml` | push / PR |
| Secret scanning + push protection | GitHub 설정 | 실시간 |
| Private vulnerability reporting | GitHub 설정 | 항상 |
| Branch protection (`main`) | GitHub 설정 | PR 머지 시 |

---

## 6. 남은 과제 (Open Items)

- **`@vercel/node` 업스트림 추적** — v4에서 `undici`/`tar` 등을 최신으로 끌어올릴 때까지 dev-only 취약점이 남습니다. 다음 v4 minor 업데이트를 Dependabot이 자동 제안.
- **프로덕션 게이트 유지** — CI의 `npm audit --audit-level=high --omit=dev`가 0건을 유지하도록 모니터링.

---

## 7. 다음 재검사

| 항목 | 주기 |
|------|------|
| CVE 자동 스캔 | 매일 09:00 KST |
| CodeQL | 매주 월요일 09:00 KST + 모든 PR |
| 수동 감사 보고서 갱신 | 분기별 또는 중대 취약점 공개 시 |

---

*본 보고서는 오픈소스 공개 투명성을 위해 저장소에 포함됩니다. 갱신 이력은 git 로그를 참조하세요.*
