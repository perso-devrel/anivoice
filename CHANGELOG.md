# Changelog

## [1.0.0] - 2026-04-22

### Added
- **AI 더빙**: Perso.ai API 기반 다국어 더빙 (8개 언어)
- **립싱크**: 더빙 후 입 모양 자동 보정
- **자막 편집**: 문장 단위 번역 수정 + 음성 재생성
- **라이브러리**: 더빙 결과 공개 및 공유
- **크레딧 시스템**: 영상 길이 기반 크레딧 차감·구매·내역
- **다국어 UI**: 한국어, 영어, 일본어, 중국어
- **인증**: Firebase Authentication + Mock 인증 폴백
- **데이터베이스**: Turso (libSQL) 서버리스 DB
- **Perso API 프록시**: 서버 사이드 API 키 보호
- **대시보드**: 프로젝트 목록, 필터, 정렬, 즐겨찾기, 통계
- **랜딩 페이지**: 히어로, 기능 소개, FAQ, 가격 미리보기
- **설정 페이지**: 프로필 편집, 구독 관리, 계정 설정

### Infrastructure
- Vercel Serverless Functions 배포
- CSP, HSTS, X-Frame-Options 등 보안 헤더
- CodeQL, OSV-Scanner, npm audit 자동화
- Dependabot 의존성 관리
- CI 워크플로우 (lint + typecheck + test + build)

### Documentation
- README (한국어, 영어, 일본어, 중국어)
- ARCHITECTURE.md (Mermaid 다이어그램)
- SECURITY.md + SECURITY-AUDIT.md
- CONTRIBUTING.md + CODE_OF_CONDUCT.md
- Issue / PR 템플릿
