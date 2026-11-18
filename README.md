# 시간 여행 여권

이 폴더는 GitHub Pages용 정적 사이트입니다. `index.html`은 게임 파일을 열도록 연결합니다.

## 배포

이 폴더를 독립 GitHub 저장소의 루트로 올린 뒤, 저장소에서 **Settings → Pages → Build and deployment → Source: GitHub Actions**를 선택하세요. `main` 브랜치에 푸시하거나 Actions 탭에서 **Deploy static site to GitHub Pages**를 수동 실행하면 배포됩니다.

> 현재 폴더가 다른 저장소 안의 하위 폴더라면, GitHub은 이 안의 `.github/workflows/pages.yml`을 워크플로로 감지하지 않습니다. 이 제한을 해결하려면 폴더를 독립 저장소로 만들거나 저장소 루트에 배포 워크플로를 추가해야 합니다. 요청 범위에 맞춰 이 폴더 밖의 파일은 수정하지 않았습니다.
