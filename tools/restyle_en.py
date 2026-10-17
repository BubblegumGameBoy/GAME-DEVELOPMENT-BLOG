"""Move the English game pages (games/*.html) onto /site.css and the
blog-style ad layout used by the Japanese pages.

The page copy (intro, guide, tips, FAQ, credits) is kept as written; only the
header, footer, game frame and ads change. Pages already converted are skipped.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
V = "20261017b"
FONTS = "https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Shippori+Mincho+B1:wght@700;800&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap"
AD = "Advertisement"
AD_TOP = f'<aside class="ad-top" aria-label="{AD}"><p class="ad-label">{AD}</p><div data-imobile="top"></div></aside>'
AD_BELOW = f'<aside class="ad-below" aria-label="{AD}"><p class="ad-label">{AD}</p><div class="ad-row"><div data-imobile="belowA"></div><div data-imobile="belowB"></div></div></aside>'
AD_SLOT = f'<aside class="ad-slot" aria-label="{AD}"><p class="ad-label">{AD}</p><div data-imobile="page"></div></aside>'
ANCHOR = f'<aside class="ad-anchor" aria-label="{AD}"><button type="button" class="ad-anchor-close" aria-label="Close ad">×</button><div data-imobile="anchor"></div></aside>'
AUTHOR = ('<aside class="author-box" aria-label="Made by"><p class="author-name">Made by Bubblegum</p>'
          '<p>A solo developer making free browser games. Strategy notes and game reviews are on the '
          '<a href="https://babblegum.hatenablog.com/">Bubblegum game blog</a> (Japanese).</p>'
          '<p><a href="/about.html">About the developer</a> · <a href="/games/monster-typing.html">Play Monster Typing</a> · <a href="/#games">More games</a></p></aside>')
FOOTER = ('<footer class="site-footer"><div class="footer-inner"><span>© 2026 Bubblegum Game</span><div>'
          '<a href="/">Home</a> · <a href="/about.html">About</a> · <a href="/privacy.html">Privacy policy</a> · <a href="/contact.html">Contact</a>'
          '</div></div><div class="footer-inner" style="margin-top:12px"><button type="button" data-privacy-choices class="linkish">Ad and cookie settings</button></div></footer>')


def nav(ja_href):
    return ('<nav class="site-nav" aria-label="Site menu"><div class="nav-inner"><a class="brand" href="/">Bubblegum <span>Game</span></a>'
            '<div class="nav-links"><a href="/games/monster-typing.html">Monster Typing</a><a href="/#games">More games</a><a href="/blog/">Blog</a>'
            f'<a class="lang" href="{ja_href}" lang="ja" hreflang="ja">日本語</a></div></div></nav>')


def convert(path):
    s = path.read_text(encoding="utf-8")
    if "/site.css" in s:
        return "skipped"
    # head
    s = re.sub(r'<link href="https://fonts.googleapis.com/css2[^"]*" rel="stylesheet">', f'<link href="{FONTS}" rel="stylesheet">', s, count=1)
    s = re.sub(r'<style>.*?</style>\n?', '', s, count=1, flags=re.S)
    s = s.replace('<link rel="stylesheet" href="/game-page.css">', f'<link rel="stylesheet" href="/site.css?v={V}">\n<link rel="stylesheet" href="/game-page.css">', 1)
    s = s.replace('<script src="/game-page.js" defer></script>', f'<script src="/game-page.js?v={V}" defer></script>\n<script src="/imobile-ads.js?v={V}" defer></script>', 1)

    ja = re.search(r'<a href="(/ja/[^"]+)" lang="ja"', s).group(1)
    main = re.search(r'<main[^>]*>(.*)</main>', s, flags=re.S).group(1)

    # game frame: drop the full-screen row and close button, mark the frame, add ads
    main = re.sub(r'<div style="display:flex;justify-content:flex-end;[^"]*">(?:(?!</div>).)*id="fs-btn"(?:(?!</div>).)*</div>\s*', '', main, count=1, flags=re.S)
    main = re.sub(r'<button id="game-close"[^>]*>.*?</button>', '', main, count=1, flags=re.S)
    stage = main.index('<div class="game-stage"')
    opener = list(re.finditer(r'<div style="[^"]*">', main[:stage]))[-1]
    assert '</div>' not in main[opener.end():stage], path
    main = main[:opener.start()] + AD_TOP + '\n    <div class="game-shell">' + main[opener.end():]
    main = re.sub(r'<div class="game-stage"[^>]*>', '<div class="game-stage">', main, count=1)
    main = re.sub(r'(<div class="game-links">(?:(?!</div>).)*</div>)', lambda m: m.group(1) + '\n    ' + AD_BELOW, main, count=1, flags=re.S)
    # page copy takes the site look: no inline colours (iframes keep their size)
    main = re.sub(r'(<(?!iframe)[a-z0-9]+\b[^>]*?) style="[^"]*"', r'\1', main)
    main = main.replace('<section class="detail">', '<section class="detail article">')
    main = main.replace('<!-- game embed -->', '')
    body = (f'<body>\n  <a class="skip" href="#main">Skip to content</a>\n  {nav(ja)}\n'
            f'  <main id="main" class="game-main">{main}\n    {AD_SLOT}\n    {AUTHOR}\n  </main>\n  {FOOTER}\n  {ANCHOR}\n</body>')
    s = re.sub(r'<body>.*</body>', lambda m: body, s, count=1, flags=re.S)
    path.write_text(s, encoding="utf-8")
    return "converted"


if __name__ == "__main__":
    files = [Path(a) for a in sys.argv[1:]] or sorted((ROOT / "games").glob("*.html"))
    for f in files:
        print(f.name, convert(f))
