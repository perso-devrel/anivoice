# iter-180 — extract SettingsSection wrapper

## BACKLOG 항목
자가 생성 풀: 중복 JSX 패턴 제거 (SettingsStep.tsx glass panel 래퍼)

## 발견한 원인 / 가설
SettingsStep.tsx에서 `glass rounded-2xl p-5` className이 3개 div에 반복됨 (lines 52, 70, 110).
2개는 `space-y-3` 추가, 1개는 없음.

## 변경 파일 목록과 이유
- `src/components/SettingsStep.tsx`: SettingsSection 내부 컴포넌트 추출, 3개 div를 교체

## 검증 결과
- build: ✔ (257KB 동일)
- dub-flow: exit 77 (upstream Perso API 500 — 코드 회귀 아님)
- 배포 후 재검증: 대기 중 (Perso API down이므로 exit 77 예상)

## 다음 루프가 알아야 할 주의사항
- Perso API 여전히 500 반환 중
- 모든 P0/P1/P2 완료, 자가 생성 풀에서 계속 진행
- issue #604, PR #605 (→develop), PR #606 (→main)
