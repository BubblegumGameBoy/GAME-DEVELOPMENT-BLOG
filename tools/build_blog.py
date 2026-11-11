"""Build the English blog's lists from blog/posts.json.

Run after adding or editing an entry:  python tools/build_blog.py

Site shape (like a Hatena blog):
  /                 the blog's front: picked posts per game, then Monster Typing and my other games
  /blog/            category links, then every post, newest first
  /blog/<category>/ one list per category, once it has LIST_PAGE_MIN posts
  each new-style post ends with more posts from the same category

What it writes:
  blog/index.html, blog/<category>/index.html   (owned by this script)
  posts.json "spoiler": true keeps a post out of other posts' related lists and the top page
  blog/posts/*.html  only between <!-- related:start --> and <!-- related:end -->
  index.html         only between <!-- blog:start/end --> and <!-- myposts:start/end -->
  sitemap.xml        adds posts and category pages that are missing
"""
import json
import re
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://bubblegumgameboy.com"
CSS = "/blog/blog.css?v=20261111a"
LIST_PAGE_MIN = 3
NL = chr(10)
TYPE_LABEL = {"guide": "Guide", "codes": "Codes", "review": "Review", "diary": "Play diary", "theory": "Story theory", "visit": "Island visit", "event": "Event guide", "dev": "Behind the game"}
NAV = ('<nav aria-label="Site menu"><a href="/">Home</a><a href="/games/">Games</a>'
       '<a href="/blog/" aria-current="true">Blog</a><a href="/about.html">About</a>'
       # (2026-11-11) The blog has no Japanese pages, so the language button goes to the Japanese top page:
       # a button that is on some pages and missing on others reads as broken.
       '<a class="lang" href="/ja/" lang="ja" hreflang="ja">日本語</a></nav>')

data = json.loads((ROOT / "blog/posts.json").read_text(encoding="utf-8"))
GAMES, CATS = data["games"], data["categories"]
POSTS = sorted([p for p in data["posts"] if p.get("show", True)], key=lambda p: (p["date"], p["file"]), reverse=True)
for p in POSTS:
    p["url"] = "/blog/posts/" + p["file"]
    assert (ROOT / "blog/posts" / p["file"]).exists(), p["file"]
    g = GAMES[p["game"]]
    p["cat"] = p["game"] if not g["own_game"] else ("behind" if p["type"] == "dev" else "my-games")
    assert p["cat"] in CATS, p["cat"]


def write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    old = path.read_text(encoding="utf-8") if path.exists() else None
    if old != text:
        path.write_text(text, encoding="utf-8", newline="")
        print("wrote", path.relative_to(ROOT))


def in_cat(c):
    return [p for p in POSTS if p["cat"] == c]


def has_page(c):
    return len(in_cat(c)) >= LIST_PAGE_MIN


def nice_date(d):
    y, m, dd = d.split("-")
    return f'{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][int(m)-1]} {int(dd)}, {y}'


def entry(p):
    """One line in a list: thumbnail, category, title, date, summary."""
    cat = CATS[p["cat"]]["name"]
    chip = (f'<a class="chip" href="/blog/{p["cat"]}/">{escape(cat)}</a>' if has_page(p["cat"])
            else f'<span class="chip">{escape(cat)}</span>')
    game = GAMES[p["game"]]["name"]
    sub = "" if game == cat else f' · {escape(game)}'
    orig = ""
    summary = f'\n      <p class="s">{escape(p["summary"])}</p>' if p.get("summary") else ""
    return f'''  <li class="entry">
    <a class="thumb" href="{p["url"]}" tabindex="-1" aria-hidden="true"><img src="{escape(p.get("image", "/images/site-home.png"))}" alt="" width="160" height="90" loading="lazy"></a>
    <div>
      <p class="m">{chip}{sub} · <time datetime="{p["date"]}">{nice_date(p["date"])}</time>{orig}</p>
      <h2 class="t"><a href="{p["url"]}">{escape(p["title"])}</a></h2>{summary}
    </div>
  </li>'''


def catnav(current):
    items = [("all", "/blog/", "All posts", len(POSTS))]
    for c in CATS:
        if in_cat(c) and has_page(c):
            items.append((c, f"/blog/{c}/", CATS[c]["name"], len(in_cat(c))))
    links = "".join(f'<a href="{u}"{" aria-current=\"page\"" if k == current else ""}>{escape(n)} <span>{cnt}</span></a>'
                    for k, u, n, cnt in items)
    return f'<nav class="catnav" aria-label="Categories">{links}</nav>'


def page(title, desc, canonical, body, og_image=None):
    og = f'\n<meta property="og:image" content="{BASE}{og_image}">' if og_image else ""
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="google-adsense-account" content="ca-pub-2203567155161909">
<link rel="canonical" href="{BASE}{canonical}">
<title>{escape(title)} | Bubblegum Game</title>
<meta name="description" content="{escape(desc)}">
<meta property="og:type" content="website">
<meta property="og:url" content="{BASE}{canonical}">
<meta property="og:title" content="{escape(title)} | Bubblegum Game">
<meta property="og:description" content="{escape(desc)}">{og}
<meta property="og:site_name" content="Bubblegum Game">
<meta property="og:locale" content="en_US">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap"></noscript>
<link rel="stylesheet" href="{CSS}">
<script src="/privacy-controls.js" defer></script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2203567155161909" crossorigin="anonymous"></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-bar"><div class="in">
  <a class="brand" href="/">BUBBLEGUM <span>GAME</span></a>
  {NAV}
</div></header>

<main id="main">
{body}
</main>

<footer class="foot"><div class="in">
  <nav aria-label="Footer menu">
    <a href="/">Home</a>
    <a href="/blog/">Blog</a>
    <a href="/games/monster-typing.html">Monster Typing</a>
    <a href="/games/">All games</a>
    <a href="/about.html">About</a>
    <a href="/privacy.html">Privacy policy</a>
    <a href="/contact.html">Contact</a>
  </nav>
  <p>© 2026 BUBBLEGUM GAME</p>
  <button type="button" data-privacy-choices class="linkish">Ad and cookie settings</button>
</div></footer>
</body>
</html>
'''


INTRO = ("Guides for games I play and games I make, and notes from building browser games on my own. "
         "Everything here comes from my own play or my own build logs.")

# ---- blog home ---------------------------------------------------------------
# (2026-11-10) A shelf per category, four posts each, instead of one list by date: the dates are the Japanese
# originals', so seventeen posts on one game sat on top and the other game's fourteen were out of sight.
SHELF = 4
shelves = []
for c, meta in CATS.items():
    ps = in_cat(c)
    if not ps:
        continue
    shown = [q for q in ps if not q.get("spoiler")][:SHELF]
    head = (f'<a href="/blog/{c}/">{escape(meta["name"])}</a>' if has_page(c) else escape(meta["name"]))
    more = (f'\n  <p class="more-link"><a href="/blog/{c}/">All {len(ps)} posts in {escape(meta["name"])} →</a></p>'
            if has_page(c) and len(ps) > len(shown) else "")
    rows = "\n".join(entry(q).replace('<h2 class="t">', '<h3 class="t">').replace('</a></h2>', '</a></h3>') for q in shown)
    shelves.append(f'<section class="shelf" aria-labelledby="shelf-{c}">\n  <h2 class="shelf-h" id="shelf-{c}">{head}</h2>\n'
                   f'  <p class="shelf-lede">{escape(meta["lede"])}</p>\n  <ul class="entries">\n' + rows + f'\n  </ul>{more}\n</section>')
body = (f'<p class="kicker">Bubblegum Game</p>\n<h1>Blog</h1>\n<p class="dek">{INTRO}</p>\n{catnav("all")}\n' + "\n".join(shelves))
write(ROOT / "blog/index.html", page(
    "Blog", "Guides for games I play and games I make, plus notes on building browser games alone. Written from my own play and my own build logs, with my own screenshots.",
    "/blog/", body, POSTS[0].get("image")))

# ---- category pages ----------------------------------------------------------
cat_pages = []
for c, meta in CATS.items():
    ps = in_cat(c)
    if len(ps) < LIST_PAGE_MIN:
        continue
    cat_pages.append(f"/blog/{c}/")
    body = (f'<p class="kicker"><a href="/blog/">Blog</a></p>\n<h1>{escape(meta["name"])}</h1>\n'
            f'<p class="dek">{escape(meta["lede"])}</p>\n{catnav(c)}\n'
            '<ul class="entries">\n' + "\n".join(entry(p) for p in ps) + "\n</ul>")
    write(ROOT / f"blog/{c}/index.html", page(meta["name"], meta["lede"], f"/blog/{c}/", body, ps[0].get("image")))

# ---- the block at the end of each new-style post -----------------------------
REL = re.compile(r"<!-- related:start -->.*?<!-- related:end -->", re.S)
for p in POSTS:
    path = ROOT / "blog/posts" / p["file"]
    html = path.read_text(encoding="utf-8")
    if "<!-- related:start -->" not in html:
        continue
    # posts marked "spoiler": true never show up under other posts, and never on the top page
    same = [q for q in in_cat(p["cat"]) if q is not p and not q.get("spoiler")][:3]
    head = f'More in {CATS[p["cat"]]["name"]}' if same else "More from the blog"
    items = same or [q for q in POSTS if q is not p and not q.get("spoiler")][:3]
    more_url = f'/blog/{p["cat"]}/' if same and has_page(p["cat"]) else "/blog/"
    block = ('<!-- related:start -->\n<aside class="related" aria-label="Related posts">\n'
             f'  <h2>{escape(head)}</h2>\n  <ul class="entries">\n' + "\n".join(entry(q) for q in items) +
             f'\n  </ul>\n  <p class="more-link"><a href="{more_url}">See all →</a></p>\n'
             '  <p class="note">I also make <a href="/games/monster-typing.html">Monster Typing</a>, a typing battle game where you '
             'type Japanese hiragana in romaji to attack. If you are learning Japanese, it doubles as reading practice.</p>'
             "\n</aside>\n<!-- related:end -->")
    html = REL.sub(lambda m: block, html)
    html = re.sub(r'<nav aria-label="Site menu">.*?</nav>', NAV, html, count=1, flags=re.S)
    html = re.sub(r'/blog/blog\.css\?v=[0-9a-z]+', CSS, html)
    write(path, html)

# ---- the top page ---------------------------------------------------------------
# (2026-11-11) The English top page is the blog's front: guides first, the games after. Two blocks are owned here:
#   blog:start/end     a row of three cards per outside-game category (posts.json "pick": 1,2,3 first, then newest)
#   myposts:start/end  the posts about my own games, as plain rows
# Posts marked "spoiler" never appear in either.
top = ROOT / "index.html"
html = top.read_text(encoding="utf-8")


def top_posts(c, n):
    ps = [q for q in in_cat(c) if not q.get("spoiler")]
    picked = sorted([q for q in ps if q.get("pick")], key=lambda q: q["pick"])
    return (picked + [q for q in ps if not q.get("pick")])[:n]


if "<!-- blog:start -->" in html:
    secs, first = [], True
    for c, meta in CATS.items():
        if GAMES.get(c, {}).get("own_game", True) or not in_cat(c):
            continue
        cards = []
        for q in top_posts(c, 3):
            lazy = "" if first else ' loading="lazy"'
            cards.append(f'      <a class="hc" href="{q["url"]}"><img src="{escape(q.get("image", "/images/site-home.png"))}" alt="" '
                         f'width="400" height="225"{lazy} decoding="async"><span>{TYPE_LABEL.get(q["type"], "Post")}</span>'
                         f'<b>{escape(q["title"])}</b></a>')
        first = False
        secs.append(f'<section class="hs" aria-labelledby="hs-{c}">' + NL +
                    f'    <h2 id="hs-{c}"><a href="/blog/{c}/">{escape(meta["name"])}</a></h2>' + NL +
                    f'    <p class="hs-lede">{escape(meta["lede"])}</p>' + NL +
                    '    <div class="hcards">' + NL + NL.join(cards) + NL + '    </div>' + NL +
                    f'    <p class="more-link"><a href="/blog/{c}/">All {len(in_cat(c))} posts in {escape(meta["name"])} →</a></p>' + NL +
                    '  </section>')
    html = re.sub(r"<!-- blog:start -->.*?<!-- blog:end -->", lambda m: "<!-- blog:start -->" + (NL + "  ").join(secs) + "<!-- blog:end -->", html, flags=re.S)
if "<!-- myposts:start -->" in html:
    cols = []
    for c in ("my-games", "behind"):
        rows = "".join(f'<li><a href="{q["url"]}">{escape(q["title"])}</a></li>' for q in top_posts(c, 3))
        cols.append(f'<div><h3><a href="/blog/{c}/">{escape(CATS[c]["name"])}</a></h3><ul class="hrows">{rows}</ul>'
                    f'<p class="more-link"><a href="/blog/{c}/">All {len(in_cat(c))} →</a></p></div>')
    html = re.sub(r"<!-- myposts:start -->.*?<!-- myposts:end -->", lambda m: "<!-- myposts:start -->" + (NL + "      ").join(cols) + "<!-- myposts:end -->", html, flags=re.S)
write(top, html)

# ---- sitemap -------------------------------------------------------------------
sm = ROOT / "sitemap.xml"
xml = sm.read_text(encoding="utf-8")
add = [f"  <url><loc>{BASE}{u}</loc><lastmod>{d}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n"
       for u, d in [(p["url"], p["date"]) for p in POSTS] + [(u, POSTS[0]["date"]) for u in cat_pages]
       if f"<loc>{BASE}{u}</loc>" not in xml]
if add:
    write(sm, xml.replace("</urlset>", "".join(add) + "</urlset>"))
print("done:", len(POSTS), "posts,", len(cat_pages), "category pages:", ", ".join(cat_pages))
