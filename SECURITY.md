# Security Policy

AniVoice 팀은 보안 취약점 보고를 환영합니다. 책임 있는 공개 절차에 협조해 주시면 감사드립니다.

## Supported Versions

| 버전 | 지원 여부 |
|------|-----------|
| `main` (latest) | ✅ 보안 패치 제공 |
| 이전 릴리스 | ❌ 최신 `main`으로 업그레이드 권장 |

## Reporting a Vulnerability

**공개 이슈로 보고하지 마세요.** 다음 경로 중 하나를 사용해 주세요.

### 1. GitHub Private Vulnerability Reporting (권장)

1. 이 저장소의 **Security** 탭 → **Report a vulnerability** 클릭
2. 비공개 advisory 작성 후 제출

### 2. 이메일

- `security@perso.ai` (제목에 `[AniVoice Security]` 포함)
- 가능하면 재현 스크립트 / PoC 첨부

## 보고 시 포함해 주세요

- 영향 받는 버전 / 커밋 해시
- 취약점 분류 (XSS, CSRF, SSRF, 인증 우회, 의존성 CVE 등)
- 재현 단계 (Reproduction steps)
- 영향 범위 (데이터 유출 / 권한 상승 / DoS 등)
- 제안 패치 (선택)

## 응답 SLA

| 단계 | 목표 시간 |
|------|-----------|
| 접수 확인 | 영업일 기준 2일 이내 |
| 초기 분석 | 7일 이내 |
| 패치 릴리스 | 심각도에 따라 조정 (Critical: 7일, High: 30일, Medium: 90일) |
| 공개 advisory | 패치 배포 후 |

## Scope

**In scope:**

- AniVoice 웹 앱 (`src/`, `api/`)
- CI / GitHub Actions 워크플로 (`.github/workflows/`)
- 의존성 CVE (`package.json` 직/간접 의존성)

**Out of scope:**

- 외부 서비스 취약점 (Perso.ai API, Firebase, Turso, Vercel) — 해당 벤더에 직접 보고
- 소셜 엔지니어링 / 피싱
- `node_modules/` 내 dev-only 도구의 취약점이 프로덕션 번들에 포함되지 않는 경우 (참고 자료로만 수집)

## Automated Security Controls

본 저장소는 다음의 자동화된 보안 통제를 운영합니다.

- **Dependabot alerts** — 의존성 CVE 자동 감지 (`.github/dependabot.yml`)
- **CodeQL** — 소스 코드 정적 분석 (`.github/workflows/codeql.yml`)
- **Secret scanning + push protection** — 시크릿 유출 방지 (GitHub Advanced Security)
- **OSV-Scanner + npm audit** — 주간 CVE 스캔 (`.github/workflows/security-audit.yml`)
- **Branch protection** — `main` 브랜치는 owner 승인 필수, force push 금지

감사합니다. AniVoice 사용자를 보호하는 데 기여해 주셔서 진심으로 감사드립니다.
