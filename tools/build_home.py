"""Build the Monster Typing-first top pages: /ja/index.html and /index.html.

Both share /site.css and the same layout; only the copy differs. The other
games are listed as extras under Monster Typing.
"""
import json
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://bubblegumgameboy.com"
BLOG = "https://babblegum.hatenablog.com/"
FONTS = "https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Shippori+Mincho+B1:wght@700;800&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap"

# slug, name, thumbnail
GAMES = [
    ("clicker", "Mythos Slayer", "mythos-slayer-2026-09-10"),
    ("soldier-typing-2", "Soldier Typing 2", "soldier-typing-2"),
    ("dig-planet", "Dig Planet", "dig-planet"),
    ("creature-fishing", "Creature Fishing", "creature-fishing"),
    ("creature-raising-kit", "Creature Raising Kit", "creature-raising-kit"),
    ("five-hundred-million-years", "500 Million Years", "five-hundred-million-years"),
    ("cthulhu-typing", "Cthulhu Typing", "cthulhu-typing"),
    ("piano-typing", "Piano Typing", "piano-typing"),
    ("popcorn-typing", "Popcorn Typing", "popcorn-typing"),
    ("soldier-typing", "Soldier Typing", "soldier-typing"),
]

POSTS = [
    ("entry/2026/10/01/143320", "モンスタータイピングの紹介とアップデート情報"),
    ("entry/2026/10/05/142948", "制作記：タイピングゲームでオンライン対戦を作りたかった理由"),
    ("entry/2026/10/08/154310", "フリック入力で遊べるようになった話"),
    ("entry/2026/10/16/093455", "漢字や日本史を学べる練習モードを追加した話"),
]

T = {
    "ja": dict(
        path="ja/index.html", prefix="/ja/", canonical=BASE + "/ja/", other_lang=("en", "/", "English"),
        title="Bubblegum Game｜モンスタータイピングと無料ブラウザゲーム",
        desc="オンライン対戦タイピングゲーム「モンスタータイピング」を無料公開中。ローマ字を打ってモンスターで戦い、召喚・育成もできます。スマホのフリック入力にも対応。ほかの自作ブラウザゲームも遊べます。",
        og_title="モンスタータイピング｜Bubblegum Game",
        og_desc="ローマ字を打ってモンスターで戦う、無料のオンライン対戦タイピングゲーム。スマホのフリック入力にも対応。",
        skip="本文へ", menu="サイトメニュー",
        nav=[("#how", "遊び方"), ("#updates", "アップデート"), ("#articles", "攻略・制作記"), ("#games", "ほかのゲーム"), (BLOG, "ブログ")],
        eyebrow="ONLINE TYPING BATTLE", h1="モンスタータイピング",
        sub="ひらがなをローマ字で打つと、モンスターが攻撃する。ほかのプレイヤーとリアルタイムで対戦できる、無料のブラウザゲーム。",
        play="今すぐ無料で遊ぶ", how_btn="遊び方を見る", art_alt="モンスタータイピングのキービジュアル",
        chips=["オンライン対戦", "モンスター召喚・育成", "スマホのフリック入力対応"],
        how_title="遊び方",
        features=[("I", "打って攻撃", "画面のひらがなをローマ字で打つと、モンスターが攻撃します。"),
                  ("II", "必殺技", "ゲージが満タンになったら、Spaceキーで必殺技を出せます。"),
                  ("III", "乱入対戦", "相手がいないあいだはCPUと練習。ほかのプレイヤーが来ると乱入してきます。"),
                  ("IV", "召喚と育成", "魔晶で仲間のモンスターを召喚して育てます。ストーリーとトレーニングも。")],
        play2="モンスタータイピングを遊ぶ",
        log_title="戦いの記録",
        updates=[("2026-10-16", "10.16", "トレーニングモードと、漢字や日本史を学べる練習モードを追加"),
                 ("2026-10-12", "10.12", "深淵の星核の最終進化の攻撃演出を修正"),
                 ("2026-10-10", "10.10", "コンボ攻撃を追加。攻撃回数に応じてモーションが変わります"),
                 ("2026-10-08", "10.08", "フリック入力での対戦に対応"),
                 ("2026-10-05", "10.05", "ストーリーモードを追加")],
        follow='最新情報は <a href="https://x.com/monster_typing" rel="noopener">X（@monster_typing）</a> と <a href="https://www.tiktok.com/@monster_typing" rel="noopener">TikTok</a> で発信しています。',
        posts_title="攻略・制作記",
        posts_lead="攻略のコツや制作の裏話は、同じ作者のはてなブログ「バブルガムのゲームブログ」で書いています。",
        posts_more="はてなブログで攻略・ゲームレビューを読む →",
        games_title="ほかのゲームも遊べます", games_lead="どれも無料、ブラウザですぐ遊べる自作ゲームです。",
        guide=("/ja/play-guide.html", "遊ぶゲームの選び方を見る →"),
        news_title="サイトのお知らせ",
        news=[("2026-10-17", "2026年10月17日", "サイトをモンスタータイピング中心に作り直しました。"),
              ("2026-10-13", "2026年10月13日", '<a href="/ja/play-guide.html">はじめての方へ</a>を公開しました。'),
              ("2026-09-02", "2026年9月2日", "Soldier Typing 2を公開しました。")],
        news_more=("/ja/updates.html", "更新履歴を見る →"),
        about_title="このサイトについて",
        about='バブルガムが個人で作った無料のブラウザゲームを公開しています。不具合や感想は<a href="/ja/contact.html">お問い合わせ</a>から送れます。',
        about_more=("/ja/about.html", "運営者について →"),
        ad="広告", ad_close="広告を閉じる",
        foot=[("/ja/games/monster-typing.html", "モンスタータイピング"), ("#games", "ゲーム一覧"), ("/ja/updates.html", "更新履歴"), (BLOG, "はてなブログ"), ("/ja/about.html", "運営者"), ("/ja/privacy.html", "プライバシーポリシー"), ("/ja/contact.html", "お問い合わせ")],
        privacy="広告とCookieの設定", footmenu="フッターメニュー",
        site_desc="オンライン対戦タイピングゲーム「モンスタータイピング」をはじめ、個人開発の無料ブラウザゲームを公開しているサイト",
        locale="ja_JP",
    ),
    "en": dict(
        path="index.html", prefix="/", canonical=BASE + "/", other_lang=("ja", "/ja/", "日本語"),
        title="Bubblegum Game | Monster Typing and free browser games",
        desc="Monster Typing is a free online typing battle game: type Japanese in romaji to make your monsters attack, summon and raise new ones, and fight other players in real time. Plus more free browser games by the same solo developer.",
        og_title="Monster Typing | Bubblegum Game",
        og_desc="A free online typing battle game: type Japanese in romaji to make your monsters attack.",
        skip="Skip to content", menu="Site menu",
        nav=[("#how", "How to play"), ("#updates", "Updates"), ("#games", "More games"), (BLOG, "Blog (JP)")],
        eyebrow="ONLINE TYPING BATTLE", h1="Monster Typing",
        sub="Type Japanese hiragana in romaji and your monsters strike. Battle other players in real time in this free browser game.",
        play="Play free now", how_btn="How to play", art_alt="Monster Typing key art",
        chips=["Online battles", "Summon and raise monsters", "Japanese typing practice"],
        how_title="How to play",
        features=[("I", "Type to attack", "Type the hiragana on screen in romaji and your monster attacks."),
                  ("II", "Special move", "When the gauge is full, press Space for a special move."),
                  ("III", "Drop-in battles", "Practice against the CPU until another player joins your fight."),
                  ("IV", "Summon and raise", "Summon companion monsters and raise them. Story and training modes too.")],
        play2="Play Monster Typing",
        log_title="Battle log",
        updates=[("2026-10-16", "10.16", "Added training mode and a practice mode for kanji and Japanese history"),
                 ("2026-10-12", "10.12", "Fixed an attack effect on a final evolution"),
                 ("2026-10-10", "10.10", "Added combo attacks"),
                 ("2026-10-08", "10.08", "Battles now work with phone flick input"),
                 ("2026-10-05", "10.05", "Added story mode")],
        follow='News on <a href="https://x.com/monster_typing" rel="noopener">X (@monster_typing)</a> and <a href="https://www.tiktok.com/@monster_typing" rel="noopener">TikTok</a>.',
        posts_title=None,
        games_title="More games to play", games_lead="All free, all made by one developer, all playable in your browser.",
        guide=("/play-guide.html", "Help choosing a game →"),
        news_title="Site news",
        news=[("2026-10-17", "Oct 17, 2026", "The site now puts Monster Typing first."),
              ("2026-09-02", "Sep 2, 2026", "Soldier Typing 2 is out.")],
        news_more=("/updates.html", "All updates →"),
        about_title="About",
        about='Bubblegum makes free browser games solo. Bug reports and feedback are welcome on the <a href="/contact.html">contact page</a>.',
        about_more=("/about.html", "About the developer →"),
        ad="Advertisement", ad_close="Close ad",
        foot=[("/games/monster-typing.html", "Monster Typing"), ("#games", "All games"), ("/updates.html", "Updates"), ("/about.html", "About"), ("/privacy.html", "Privacy policy"), ("/contact.html", "Contact")],
        privacy="Ad and cookie settings", footmenu="Footer menu",
        site_desc="Free browser games by a solo developer, led by the online typing battle game Monster Typing",
        locale="en_US",
    ),
}


def build(lang):
    t = T[lang]
    game = f'{t["prefix"]}games/monster-typing.html'
    other_code, other_href, other_label = t["other_lang"]
    ld = {"@context": "https://schema.org", "@type": "WebSite", "name": "Bubblegum Game", "url": t["canonical"],
          "inLanguage": lang, "description": t["site_desc"],
          "publisher": {"@type": "Person", "name": "バブルガム", "alternateName": "Bubblegum",
                        "url": BASE + "/ja/about.html", "sameAs": [BLOG]}}
    nav = "\n".join(f'      <a href="{h}">{escape(l)}</a>' for h, l in t["nav"])
    feats = "\n".join(f'      <article class="feature"><p class="num" aria-hidden="true">{n}</p><h3>{escape(a)}</h3><p>{escape(b)}</p></article>' for n, a, b in t["features"])
    ups = "\n".join(f'      <li><time datetime="{d}">{s}</time><span>{escape(x)}</span></li>' for d, s, x in t["updates"])
    games = "\n".join(f'      <a class="mini" href="{t["prefix"]}games/{slug}.html"><img src="/images/thumbs/{img}.webp" alt="" loading="lazy" decoding="async" width="160" height="96"><span>{escape(name)}</span></a>' for slug, name, img in GAMES)
    news = "\n".join(f'        <li><time datetime="{d}">{s}</time> {x}</li>' for d, s, x in t["news"])
    foot = "\n".join(f'      <a href="{h}">{escape(l)}</a>' for h, l in t["foot"])
    chips = "".join(f"<li>{escape(c)}</li>" for c in t["chips"])
    if t["posts_title"]:
        posts = "\n".join(f'        <a href="{BLOG}{u}">{escape(x)}</a>' for u, x in POSTS)
        right = f'''    <div>
      <h2>{t["posts_title"]}</h2>
      <p class="lead">{t["posts_lead"]}</p>
      <div class="post-list">
{posts}
      </div>
      <a class="more" href="{BLOG}">{t["posts_more"]}</a>
    </div>'''
        articles_id = ' id="articles"'
    else:
        right = f'''    <div>
      <h2>{t["about_title"]}</h2>
      <p class="lead">{t["about"]}</p>
      <a class="more" href="{t["about_more"][0]}">{t["about_more"][1]}</a>
    </div>'''
        articles_id = ""
    html = f'''<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="google-adsense-account" content="ca-pub-2203567155161909">
<link rel="canonical" href="{t["canonical"]}">
<link rel="alternate" hreflang="en" href="{BASE}/">
<link rel="alternate" hreflang="ja" href="{BASE}/ja/">
<link rel="alternate" hreflang="x-default" href="{BASE}/">
<title>{escape(t["title"])}</title>
<meta name="description" content="{escape(t["desc"], quote=True)}">
<meta property="og:type" content="website">
<meta property="og:url" content="{t["canonical"]}">
<meta property="og:title" content="{escape(t["og_title"], quote=True)}">
<meta property="og:description" content="{escape(t["og_desc"], quote=True)}">
<meta property="og:image" content="{BASE}/images/monster-typing.png">
<meta property="og:site_name" content="Bubblegum Game">
<meta property="og:locale" content="{t["locale"]}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@monster_typing">
<meta name="twitter:image" content="{BASE}/images/monster-typing.png">
<link rel="preload" as="image" href="/images/monster-typing-banner.webp">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="{FONTS}" rel="stylesheet">
<link rel="stylesheet" href="/site.css?v=20261017">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<script src="/privacy-controls.js" defer></script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2203567155161909" crossorigin="anonymous"></script>
<script src="/imobile-ads.js?v=20261017" defer></script>
</head>
<body>
<a class="skip" href="#main">{t["skip"]}</a>
<header class="top">
  <div class="top-inner">
    <a class="brand" href="{t["prefix"]}">BUBBLEGUM <span>GAME</span></a>
    <nav aria-label="{t["menu"]}" class="menu">
{nav}
      <a class="lang" href="{other_href}" lang="{other_code}" hreflang="{other_code}">{other_label}</a>
    </nav>
  </div>
</header>

<main id="main">
<section class="hero" aria-labelledby="mt-title">
  <div class="hero-inner">
    <p class="eyebrow">{t["eyebrow"]}</p>
    <h1 id="mt-title">{escape(t["h1"])}</h1>
    {'<p class="latin">MONSTER TYPING</p>' if lang == "ja" else ""}
    <div class="divider" aria-hidden="true"><span></span></div>
    <p class="hero-sub">{escape(t["sub"])}</p>
    <div class="cta-row">
      <a class="btn-blood" href="{game}">{t["play"]}</a>
      <a class="btn-ghost" href="#how">{t["how_btn"]}</a>
    </div>
    <a class="hero-art" href="{game}"><img src="/images/monster-typing-banner.webp" width="720" height="240" alt="{t["art_alt"]}" fetchpriority="high"></a>
    <ul class="chips">{chips}</ul>
  </div>
</section>

<section id="how" class="block" aria-labelledby="how-title">
  <div class="wrap">
    <h2 id="how-title" class="center">{t["how_title"]}</h2>
    <div class="features">
{feats}
    </div>
    <p class="center"><a class="btn-blood" href="{game}">{t["play2"]}</a></p>
  </div>
</section>

<aside class="ad-top" aria-label="{t["ad"]}"><p class="ad-label">{t["ad"]}</p><div data-imobile="top"></div></aside>

<section id="updates" class="block"{articles_id if False else ""}>
  <div class="wrap two-col">
    <div>
      <h2>{t["log_title"]}</h2>
      <ol class="timeline">
{ups}
      </ol>
      <p class="follow">{t["follow"]}</p>
    </div>
{right.replace("<div>", "<div" + articles_id + ">", 1)}
  </div>
</section>

<section id="games" class="block" aria-labelledby="gm-title">
  <div class="wrap">
    <h2 id="gm-title">{t["games_title"]}</h2>
    <p class="lead">{t["games_lead"]}</p>
    <div class="mini-grid">
{games}
    </div>
    <p class="center"><a class="more" href="{t["guide"][0]}">{t["guide"][1]}</a></p>
  </div>
</section>

<aside class="ad-slot" aria-label="{t["ad"]}"><p class="ad-label">{t["ad"]}</p><div data-imobile="page"></div></aside>

<section class="block" aria-labelledby="news-title">
  <div class="wrap two-col">
    <div><h2 id="news-title">{t["news_title"]}</h2>
      <ul class="news">
{news}
      </ul>
      <a class="more" href="{t["news_more"][0]}">{t["news_more"][1]}</a></div>
    <div><h2>{t["about_title"]}</h2><p>{t["about"]}</p><a class="more" href="{t["about_more"][0]}">{t["about_more"][1]}</a></div>
  </div>
</section>
</main>

<footer class="foot">
  <div class="foot-inner">
    <nav aria-label="{t["footmenu"]}">
{foot}
      <a href="{other_href}" lang="{other_code}" hreflang="{other_code}">{other_label}</a>
    </nav>
    <p class="latin" style="margin:0;letter-spacing:.1em">© 2026 BUBBLEGUM GAME</p>
    <button type="button" data-privacy-choices class="linkish">{t["privacy"]}</button>
  </div>
</footer>
<aside class="ad-anchor" aria-label="{t["ad"]}"><button type="button" class="ad-anchor-close" aria-label="{t["ad_close"]}">×</button><div data-imobile="anchor"></div></aside>
</body>
</html>
'''
    (ROOT / t["path"]).write_text(html, encoding="utf-8")


if __name__ == "__main__":
    import sys
    for lang in (sys.argv[1:] or ["ja", "en"]):
        build(lang)
