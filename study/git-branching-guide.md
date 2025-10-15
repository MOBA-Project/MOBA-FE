# Git Branch Workflow Guide

이 문서는 새 작업을 시작할 때의 브랜치 전략과 터미널 명령 예시를 정리합니다. 이 폴더(`study/`)는 .gitignore에 의해 커밋 대상에서 제외됩니다.

## 새 브랜치 생성/전환

- 최신 `main` 기준으로 시작
  - `git fetch origin`
  - `git switch main`  (또는 `git checkout main`)
  - `git pull --ff-only`
- 새 브랜치 만들고 전환
  - 권장: `git switch -c feat/slide-sorting`
  - 대안: `git checkout -b feat/slide-sorting`
- 원격 업스트림 설정(최초 푸시)
  - `git push -u origin feat/slide-sorting`
- 이미 존재하는 브랜치로 전환
  - `git switch feat/slide-sorting` (또는 `git checkout feat/slide-sorting`)

참고: `git branch -b`는 잘못된 명령입니다. 새 브랜치 생성+전환은 `git switch -c` 또는 `git checkout -b`를 사용하세요.

## 작업 중 변경을 새 브랜치로 옮기기

- 현재 변경사항을 그대로 가져가고 싶을 때
  - `git switch -c feat/your-task` (현재 작업물이 그대로 새 브랜치로 따라옵니다)
- 깔끔하게 옮기고 싶을 때(스태시 사용)
  - `git stash -u`
  - `git switch -c feat/your-task`
  - `git stash pop`

## 네이밍/규칙

- 목적별로 작은 브랜치를 권장: 한 브랜치 = 한 목적(기능/버그/문서 등)
- 접두사 예시: `feat/`, `fix/`, `chore/`, `docs/`, `refactor/`, `perf/`
- 커밋은 작게, 의미 있게. 필요 시 `git add -p`로 선택적 스테이징.

## 푸시/PR 생성

- 푸시: `git push -u origin <branch>`
- 웹에서 PR 생성: 레포 페이지 → “Compare & pull request”
- GitHub CLI를 사용할 경우(선택)
  - 설치 후 로그인: `gh auth login`
  - PR 생성: `gh pr create -B main -H <branch> -t "title" -b "내용"`

## 병합 후 정리(선택)

- 로컬 브랜치 삭제: `git branch -d <branch>`
- 원격 브랜치 삭제: `git push origin --delete <branch>`

## 충돌 발생 시

- 병합 중 충돌 해결 → 수정 파일 `git add` → `git commit` → 다시 푸시
- 리베이스 흐름일 경우: 충돌 해결 → `git rebase --continue`

---

질문이 생기면 이 파일에 추가 메모를 남기거나 새로운 노트를 생성하세요.
