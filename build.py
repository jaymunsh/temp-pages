#!/usr/bin/env python3
"""아티팩트용 조각 HTML을 단독 실행 가능한 페이지로 감싼다.
아티팩트는 배포 시 doctype/charset/viewport를 자동으로 붙여주지만,
정적 호스팅에서는 직접 넣어야 한다. viewport가 없으면 모바일이
980px 가상 뷰포트로 렌더링해 미디어쿼리가 죽는다.

사용: python3 build.py <조각.html> <출력.html>"""
import sys

HEAD = '''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  html{-webkit-text-size-adjust:100%}
  body{margin:0}
  img{max-width:100%}
  [hidden]{display:none!important}
</style>
'''

src, out = sys.argv[1], sys.argv[2]
frag = open(src, encoding="utf-8").read()
assert "<!doctype" not in frag.lower(), "이미 완성된 문서입니다"
open(out, "w", encoding="utf-8").write(HEAD + "</head>\n<body>\n" + frag + "\n</body>\n</html>\n")
print("built:", out)
