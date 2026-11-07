# 데스크 셋업 비교 페이지 유지보수 안내

## 위치와 실행

- 이 디렉터리는 부모 `temp-pages` 저장소 안에 별도의 `.git`이 존재하는 중첩 저장소다. 부모 저장소에 이 폴더를 통째로 `git add`하면 임베디드 저장소로 처리될 수 있으므로 아래 배포 절차를 따른다.
- 로컬 작업 원본: `desktop-compare/dist/index.html`, 이미지: `desktop-compare/dist/assets/`.
- GitHub Pages에 배포되는 파일: `desktop-compare/index.html`, `desktop-compare/assets/`. 현재 프로젝트는 빌드 없는 단일 HTML/CSS/JavaScript 페이지다. 부모의 `build.py`는 이 완성된 HTML에 사용하지 않는다.
- 로컬 확인: `dist/index.html`을 브라우저에서 직접 열거나, `dist` 디렉터리에서 `python -m http.server 8000` 실행 후 `http://localhost:8000/`에 접속한다. 확인은 가능하면 데스크탑과 좁은 화면에서 모두 한다.
- 배포 주소: https://jaymunsh.github.io/temp-pages/desktop-compare/

## 수정 방법

`dist/index.html`의 `<style>`, 탭별 `<section>`, 하단 `<script>`를 수정한다. HTML은 대부분 한 줄이므로 UTF-8로 읽고 저장하며, 변경 전후에 해당 구간을 확인한다. 상품 사진은 가능하면 `dist/assets/`에 저장하고 상대 경로를 사용한다. 다른 제품의 사진을 정확한 구매 옵션인 것처럼 표시하지 말고, 대표 이미지라면 그렇게 밝힌다. 구매 링크, 상품 정보, 표시 가격은 출처와 확인 시점을 구분한다. 가격이나 혜택을 새로 확인할 수 없으면 기존 확인일 또는 과거 참고가로 표시한다. 쿠팡 상품에는 적립금을 표시하지 않는다.

- 탭은 `data-tab`과 같은 `id`의 `<section>`으로 연결하며, 선택 상태는 `sessionStorage`의 `setup-note-active-tab`에 저장한다.
- 추천 상품은 카드에 `recommended-card`, 추천 라벨에 `recommended-label`을 쓴다. `EDITOR’S CHOICE`의 가격은 실제 결제액, 결제 예상가, 적립 반영 예상 실구매가를 혼동하지 않도록 구분한다.
- 구매 완료 목록은 `section#purchased`의 `purchase-item` 카드다. 결제한 제품에는 `data-purchase-amount`에 실제 원화 결제금액을 숫자로 넣고, 추천·미구매 제품에는 `data-estimate-amount`에 표시가를 넣는다. 카드의 표시 금액도 함께 수정한다. 하단 스크립트가 각각의 합계와 카드 수를 계산한다.
- 최종 예상금액은 실제 결제금액과 미구매 추천 상품의 표시가 합계이며, 적립금은 차감하지 않는다. 이미 구매한 상품을 미구매 추천 목록에 중복 추가하지 않는다. 적립금 7만~9만 원은 별도의 대략적인 예상치다.
- 구매 완료 탭에는 구매 제품을 먼저, 미구매 추천 제품을 뒤에 표시한다. 상품에서 상세 탭으로 이동하는 링크는 `data-open-tab`을 사용한다. 구매 내역 및 할인 조건은 사용자가 제공한 내용을 우선한다.
- 수정 시 상단 `최근 업데이트`를 한국 시간(KST)으로 분 단위까지 갱신한다. 저장 후 탭 전환, 새로고침 시 탭 유지, 이미지, 외부 링크, 표시 금액과 합계를 검증한다.

## 부모 저장소에 반영 및 배포

사용자가 로컬 작업만 원하면 푸시하지 않는다. 푸시 요청이 있을 때 `temp-pages` 루트의 PowerShell에서 먼저 부모 저장소와 원격 상태를 확인한다. 파일을 복사하기 전에 원본과 대상의 변경사항을 살펴 다른 작업을 덮어쓰지 않도록 한다. 아래는 이 프로젝트의 산출물만 부모 Git 인덱스에 등록하는 방법이다.

```powershell
git status -sb
git fetch origin main
Copy-Item -LiteralPath 'desktop-compare/dist/index.html' -Destination 'desktop-compare/index.html' -Force
Copy-Item -Path 'desktop-compare/dist/assets/*' -Destination 'desktop-compare/assets/' -Force
$paths = @('desktop-compare/index.html', 'desktop-compare/HANDOFF.md') + @(Get-ChildItem 'desktop-compare/dist/assets' -File | ForEach-Object { 'desktop-compare/assets/' + $_.Name })
foreach ($path in $paths) {
  $hash = git hash-object -w -- "$path"
  git update-index --add --cacheinfo "100644,$hash,$path"
}
git diff --cached --stat
git diff --cached -- desktop-compare/index.html desktop-compare/HANDOFF.md
git commit -m 'Update desktop setup guide'
git push origin main
```

`dist/`, `.openai/`, 중첩 `.git`, 임시 압축 파일은 부모 저장소의 배포 파일로 등록하지 않는다. 파일 삭제가 필요한 경우에는 별도로 변경사항을 확인해 인덱스에서도 제거한다. 변경 범위와 기존 작업을 확인하고 커밋 메시지는 실제 변경에 맞춘다.

푸시 후 GitHub Actions의 Pages 배포가 성공했는지 확인하고, 실제 배포 URL의 HTML과 신규 이미지가 최신인지 확인한다. 워크플로가 대기 중이거나 실패했으면 성공으로 보고하지 않는다. 브라우저 캐시로 이전 화면이 보이면 새로고침한다.
