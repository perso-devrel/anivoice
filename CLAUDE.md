# AniVoice Project Context

## 프로젝트 설명
Perso.ai API를 활용한 애니메이션 AI 더빙 서비스.
일본 애니메이션 영상을 업로드하면 캐릭터 음성을 보존한 채 6개 이상 언어로 더빙.

## 기술 스택
React + TypeScript + Vite + Tailwind CSS / React Native (Expo)

## 핵심 규칙
- 실제 서비스 수준의 말투와 UX 텍스트 사용 (데모 느낌 제거)
- 모든 API 키는 환경변수로 관리
- 반응형 디자인 (모바일 퍼스트)
- 한국어/영어 다국어 지원
- Perso API 호출 시 에러 핸들링 필수
- 무한 로딩, 빈 상태, 에러 상태 모두 UI로 표현

## API 참고
- Perso AI Docs: https://developers.perso.ai/docs
- 주요 엔드포인트: Space, File, Dubbing, Editing, Lip Sync, Language

## 빌드 & 실행
- `npm run dev` — 개발 서버
- `npm run build` — 프로덕션 빌드
- `npm run lint` — ESLint 실행
