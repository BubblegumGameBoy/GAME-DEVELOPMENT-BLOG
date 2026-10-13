"""Build the Japanese companion pages for the English game site."""
from html import escape
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
JA = ROOT / "ja"
BASE = "https://bubblegumgameboy.com"


def page(title, description, body, path, english=None, image="/images/mythos-slayer-2026-09-10.png", game=False):
    canonical = BASE + "/ja/" + path
    alternate = (f'<link rel="alternate" hreflang="ja" href="{canonical}">\n'
                 f'<link rel="alternate" hreflang="en" href="{BASE}/{english}">\n'
                 f'<link rel="alternate" hreflang="x-default" href="{BASE}/{english}">') if english else ""
    switch = f'<a class="lang" href="/{english}" lang="en" hreflang="en">English</a>' if english else '<a class="lang" href="/" lang="en">English</a>'
    scripts = '<script src="/game-page.js" defer></script>' if game else ""
    game_css = '<link rel="stylesheet" href="/game-page.css">' if game else ""
    html = f'''<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="google-adsense-account" content="ca-pub-2203567155161909">
  <title>{escape(title)}｜Bubblegum Game</title>
  <meta name="description" content="{escape(description, quote=True)}">
  <link rel="canonical" href="{canonical}">
  {alternate}
  <meta property="og:type" content="website">
  <meta property="og:url" content="{canonical}">
  <meta property="og:title" content="{escape(title, quote=True)}｜Bubblegum Game">
  <meta property="og:description" content="{escape(description, quote=True)}">
  <meta property="og:image" content="{BASE}{image}">
  <meta property="og:locale" content="ja_JP">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500;700;800;900&family=DotGothic16&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/ja/ja.css">
  {game_css}
  <script src="/privacy-controls.js" defer></script>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2203567155161909" crossorigin="anonymous"></script>
  {scripts}
</head>
<body>
  <a class="skip" href="#main">本文へ</a>
  <nav class="site-nav" aria-label="サイトメニュー"><div class="nav-inner"><a class="brand" href="/ja/">Bubblegum <span>Game</span></a><div class="nav-links"><a href="/ja/#games">ゲーム一覧</a><a href="/ja/updates.html">更新履歴</a><a href="https://babblegum.hatenablog.com/">ブログ</a>{switch}</div></div></nav>
  <main id="main" class="game-main">
    <p class="crumb"><a href="/ja/">ホーム</a> / {escape(title)}</p>
    {body}
  </main>
  <footer class="site-footer"><div class="footer-inner"><span>© 2026 Bubblegum Game</span><div><a href="/ja/">ホーム</a> · <a href="/ja/about.html">運営者</a> · <a href="/ja/privacy.html">プライバシーポリシー</a> · <a href="/ja/contact.html">お問い合わせ</a></div></div><div class="footer-inner" style="margin-top:12px"><button type="button" data-privacy-choices style="border:0;background:none;color:#c5e9f4;text-decoration:underline;font:inherit;cursor:pointer;padding:0">広告とCookieの設定</button></div></footer>
</body>
</html>
'''
    target = JA / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(html.replace("\n  \n", "\n\n"), encoding="utf-8")


GAMES = {
    "clicker": ("Mythos Slayer", "兵士を増やし、装備を鍛えてボスを倒すクリッカーゲーム。PCとスマホで遊べます。", "/images/mythos-slayer-2026-09-10.png", "タップやクリックで敵を攻撃し、手に入れたゴールドで兵士や装備を強化します。戦力が整ったら、ボスに挑んでください。", "40体のボスが登場します。行き詰まったら強化項目を見直し、転生で次の周回を進めてみてください。", "マウス・タップで操作します。", "https://babblegum.hatenablog.com/entry/2026/06/12/144156"),
    "soldier-typing-2": ("Soldier Typing 2", "文字を打って兵士を送り出す、全6ウェーブのタイピングゲーム。PC向け。", "/images/soldier-typing-2.png", "画面に表示された文字をキーボードで打つと、兵士が現れて敵を攻撃します。まずは全6ウェーブのクリアを目指してください。", "クリア後に開くルートや隠しボスも用意しています。前作を遊んでいなくても始められます。", "キーボードでローマ字を入力します。スマホでは遊びにくいため、PCをおすすめします。", ""),
    "creature-fishing": ("Creature Fishing", "小さな島で釣りをして、172種類の魚や生きものを集めるゲーム。", "/images/creature-fishing.png", "釣り場に糸を垂らし、魚がかかったら引き上げます。釣った魚は図鑑に記録されます。", "実在の魚のほか、神話に出てくる生きものも登場します。まずは近くの釣り場から始め、図鑑を少しずつ埋めてください。", "ゲーム内の案内に従い、マウスまたはタップで釣りを進めます。", "https://babblegum.hatenablog.com/entry/2026/07/24/193327"),
    "creature-raising-kit": ("Creature Raising Kit", "島で生きものを育て、ほかのプレイヤーとボトルメールを交わすゲーム。", "/images/creature-raising-kit.png", "小さな島で生きものに食べ物を与えて育てます。島を眺めたり、カメラを動かしたりしながら過ごせます。", "ボトルメールを使うと、ほかのプレイヤーと手紙をやり取りできます。個人情報は書き込まないでください。", "ゲーム内の案内に従って操作してください。", "https://babblegum.hatenablog.com/entry/2026/07/21/140911"),
    "cthulhu-typing": ("Cthulhu Typing", "単語を打って兵士を呼び、日替わりのボスと戦うタイピングゲーム。PC向け。", "/images/cthulhu-typing.png", "画面に出る単語をキーボードで打つと兵士が現れます。兵士を送り出してボスの体力を削ってください。", "ボスは日替わりです。短い単語から慣れ、正確に入力することを意識すると進めやすくなります。", "キーボードで入力します。PCでのプレイをおすすめします。", ""),
    "piano-typing": ("Piano Typing", "光ったキーを押して曲を進める、ピアノのタイピングゲーム。", "/images/piano-typing.png", "画面で光ったキーを押すと、次の音へ進みます。曲の速さに合わせて打つ必要はありません。", "キーの位置を確かめながら、一音ずつ弾いてみてください。通常のタイピングゲームとは入力方法が違います。", "キーボードを使います。PCで遊んでください。", ""),
    "popcorn-typing": ("Popcorn Typing", "ローマ字を打ってポップコーンを作るタイピングゲーム。PC向け。", "/images/popcorn-typing.png", "画面に表示された文字をローマ字で打つと、ポップコーンが弾けます。続けて正しく打つとコンボがつながります。", "作ったポップコーンで設備を増やし、次の目標に進めます。最初は速さより正確さを意識してみてください。", "キーボードでローマ字を入力します。PCで遊んでください。", ""),
    "soldier-typing": ("Soldier Typing", "ローマ字を打って兵士を送り出し、敵を倒すタイピングゲーム。PC向け。", "/images/soldier-typing.png", "表示された文字を打つと兵士が現れて前進します。入力を続けて敵を押し返してください。", "前作の雰囲気が気に入ったら、続編のSoldier Typing 2にも挑戦できます。", "キーボードでローマ字を入力します。PCで遊んでください。", ""),
}

for slug, (name, desc, image, how, more, controls, blog) in GAMES.items():
    original = (ROOT / "games" / (slug + ".html")).read_text(encoding="utf-8")
    match = re.search(r'data-game-src="([^"]+)"', original)
    if not match:
        raise ValueError(f"Game URL not found: {slug}")
    game_url = match.group(1).replace("?lang=en", "?lang=ja").replace("&amp;", "&")
    safe_url = escape(game_url, quote=True)
    blog_line = f'<h2>制作の話</h2><p>制作中に考えたことや更新内容は<a href="{blog}">はてなブログの記事</a>に書いています。</p>' if blog else ""
    ime_note = '<p class="note">日本語入力（IME）はオフにして、画面に表示されるローマ字を入力してください。</p>' if slug in ("soldier-typing-2", "cthulhu-typing", "popcorn-typing", "soldier-typing") else ""
    article = f'''<h1>{name}</h1>
    <p class="game-subtitle">{escape(desc)}</p>
    <div class="game-shell"><div class="game-actions"><button type="button" id="fs-btn">⛶ 全画面で遊ぶ</button></div>
      <div class="game-stage" data-play-height="clamp(560px,84vh,960px)"><div id="game-launch" class="game-launch"><img src="{image}" alt="{name}のゲーム画面" width="320" height="180"><p>ボタンを押すとゲームを読み込みます。</p><button type="button" id="game-start" disabled>{name}を遊ぶ</button><noscript><p><a href="{safe_url}">ゲームを直接開く</a></p></noscript></div><iframe id="game-frame" src="about:blank" data-game-src="{safe_url}" title="{name}のゲーム画面" loading="lazy" allow="fullscreen; autoplay" allowfullscreen></iframe></div>
    </div>
    <button id="game-close" class="game-close" type="button" hidden>全画面を閉じる ×</button>
    <div class="game-links"><p id="game-status" role="status">「遊ぶ」を押すとゲームを読み込みます。</p><a href="{safe_url}" target="_blank" rel="noopener">別タブで遊ぶ ↗</a></div>
    <article class="article"><h2>どんなゲーム？</h2><p>{escape(desc)}</p><h2>遊び方</h2><p>{escape(how)}</p><h2>遊ぶときのヒント</h2><p>{escape(more)}</p><h2>操作</h2><p>{escape(controls)}</p>{ime_note}{blog_line}<h2>よくある質問</h2><h3>無料で遊べますか？</h3><p>はい。登録やインストールは不要です。</p><h3>ゲームが表示されないときは？</h3><p>上の「別タブで遊ぶ」からゲームを開いてください。</p></article>'''
    page(name, desc, article, f"games/{slug}.html", f"games/{slug}.html", image, game=True)


def info_page(path, title, desc, content, english):
    page(title, desc, f'<h1>{escape(title)}</h1><article class="article">{content}</article>', path, english)


info_page("play-guide.html", "はじめての方へ", "操作方法と対応端末を目安に、最初のゲームを選べます。", '''
<p>このサイトには10本の無料ブラウザゲームがあります。どれも登録やインストールは不要です。</p>
<h2>スマホで遊ぶなら</h2><p><a href="/ja/games/clicker.html">Mythos Slayer</a>は、タップで戦いながら兵士や装備を強くするゲームです。<a href="/ja/games/dig-planet.html">Dig Planet</a>は、ほかの人と同じ惑星を掘るゲームです。</p>
<h2>キーボードで遊ぶなら</h2><p>ローマ字入力に慣れたいなら<a href="/ja/games/popcorn-typing.html">Popcorn Typing</a>。タイピングしながら戦いたいなら<a href="/ja/games/soldier-typing.html">Soldier Typing</a>か<a href="/ja/games/soldier-typing-2.html">Soldier Typing 2</a>をどうぞ。<a href="/ja/games/piano-typing.html">Piano Typing</a>は光ったキーを一つずつ押す方式です。</p>
<h2>集めたり、眺めたりするなら</h2><p><a href="/ja/games/creature-fishing.html">Creature Fishing</a>では魚の図鑑を埋められます。<a href="/ja/games/creature-raising-kit.html">Creature Raising Kit</a>では島で生きものを育てます。<a href="/ja/games/five-hundred-million-years.html">500 Million Years</a>は物語をたどるゲームです。</p>
<p><a href="/ja/#games">10本のゲーム一覧を見る →</a></p>
''', "play-guide.html")

info_page("updates.html", "更新履歴", "Bubblegum Gameの新作と主な更新をまとめています。", '''
<ul><li>2026年10月13日：「はじめての方へ」の日本語版を公開しました。</li><li>2026年9月2日：Soldier Typing 2を公開しました。</li><li>2026年8月20日：Dig Planetを公開しました。</li><li>2026年8月11日：Creature Fishing、Creature Raising Kit、500 Million Yearsを追加しました。</li><li>2026年7月4日：Cthulhu Typingを公開しました。</li><li>2026年6月26日：Piano Typingを公開しました。</li><li>2026年6月21日：Mythos Slayerを公開しました。</li><li>2026年6月1日：サイトのデザインを更新しました。</li></ul>
<p>制作の詳しい話は<a href="https://babblegum.hatenablog.com/">はてなブログ</a>に書いています。</p>
''', "updates.html")

info_page("about.html", "運営者について", "Bubblegum Gameを作っている個人制作者の紹介です。", '''
<p>こんにちは、Bubblegumです。ゲームで遊ぶのも作るのも好きで、このサイトでは自作のブラウザゲームを公開しています。</p>
<p>タイピングゲーム、クリッカー、オンラインで同じ世界を共有するゲームなど、思いついたものを少しずつ作っています。JavaScriptで作った作品も、Unityを使った作品もあります。</p>
<p>ゲームの制作過程や更新の話は、<a href="https://babblegum.hatenablog.com/">はてなブログ</a>に書いています。遊んだ感想や不具合は<a href="/ja/contact.html">お問い合わせページ</a>から送れます。</p>
''', "about.html")

FORM = "https://docs.google.com/forms/d/e/1FAIpQLSfaDrcmZZaiC0JEf8ExZ_e1D4ZiTB4FIuP_uEOmXC7nQvuQdw/viewform"
info_page("contact.html", "お問い合わせ", "ゲームの不具合や感想、仕事の相談はこちらから送れます。", f'''
<p>ゲームの不具合、感想、お仕事のご相談は、下のフォームからお送りください。不具合の場合はゲーム名、使った端末やブラウザ、起きたことを書くと確認しやすくなります。</p>
<p>フォームに入力した内容は、お問い合わせへの対応に使います。詳しくは<a href="/ja/privacy.html">プライバシーポリシー</a>をご覧ください。</p>
<h2>お問い合わせフォーム</h2><p>フォームが表示されない場合は、<a href="{FORM}?hl=ja" target="_blank" rel="noopener">別タブで開く</a>ことができます。</p>
<iframe src="{FORM}?embedded=true&amp;hl=ja" width="640" height="646" style="max-width:100%;border:0" loading="lazy" title="お問い合わせフォーム">フォームを読み込み中です。</iframe>
''', "contact.html")

info_page("privacy.html", "プライバシーポリシー", "広告、アクセス解析、お問い合わせ情報の取り扱いについて説明します。", '''
<p>このページでは、Bubblegum Game（https://bubblegumgameboy.com/）における個人情報の取り扱いを説明します。</p>
<h2>サイト情報</h2><p>サイト名：Bubblegum Game<br>運営者：Bubblegum（個人）<br>お問い合わせ：<a href="/ja/contact.html">お問い合わせフォーム</a></p>
<h2>広告</h2><p>当サイトにはGoogle AdSenseのコードを設置しており、広告掲載を申請しています。広告が配信される場合、Googleとそのパートナーが広告の配信や効果測定のためにデータを処理することがあります。</p>
<p>Googleなどの第三者配信事業者は、当サイトや他のサイトへの過去のアクセス情報に基づき、Cookieを使って広告を表示することがあります。Cookie、端末識別子、IPアドレス、閲覧情報などが処理される場合があります。氏名を入力していなくても、ブラウザや端末を識別できる情報です。</p>
<p>パーソナライズ広告は<a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Googleの広告設定</a>で無効にできます。詳しくは<a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener">Googleのサービスを利用するサイトやアプリから収集した情報の利用</a>をご覧ください。</p>
<h2>アクセス解析</h2><p>利用状況を調べるため、Google Analyticsを使用しています。閲覧ページ、端末情報、ブラウザの識別子などがCookieを通じて収集されることがあります。これらの情報を完全に匿名のものとしては扱いません。同意が必要な地域では、必要な選択がなされていない場合や拒否された場合、Analyticsを読み込みません。</p>
<p>収集を避けたい場合はブラウザでCookieを無効にするか、<a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">Google Analyticsオプトアウトアドオン</a>をご利用ください。</p>
<h2>お問い合わせで受け取る情報</h2><p>Googleフォームでは、名前（ハンドルネームで構いません）、メールアドレス、メッセージを入力いただく場合があります。受け取った情報は、返信、依頼された情報の提供、ゲームの不具合対応に使います。フォームの提供者であるGoogleも送信内容を処理します。法令で求められる場合を除き、メッセージや連絡先を公開しません。</p>
<p>保有する情報の確認、訂正、削除を希望される場合は、<a href="/ja/contact.html">お問い合わせフォーム</a>からご連絡ください。</p>
<h2>欧州経済領域、英国、スイスからのアクセス</h2><p>対象地域では、Googleの同意画面から広告や測定について同意、拒否、設定の変更ができます。ページ下部の「広告とCookieの設定」から、選択内容を変更または撤回できます。</p>
<h2>カリフォルニア州からのアクセス</h2><p>広告パートナーがパーソナライズ広告のためにデータを使う場合があります。該当する場合は、Googleのプライバシー画面に表示される販売・共有の拒否リンクをご利用ください。</p>
<h2>オンラインゲームのデータ</h2><p>オンライン機能を使うゲームは、ゲームを配信するサービスへデータを送ります。ランキングには、送信されたプレイヤー名とスコアが表示されます。Dig Planetでは、名前、チャット、発見したもの、行動が同じ世界のほかのプレイヤーに共有されます。公開名やチャットに個人情報を書かないでください。</p>
<h2>免責事項</h2><p>内容やゲームの正確さには注意していますが、誤りや古い情報が残る場合があります。当サイトの利用によって生じた損害について責任を負いかねます。外部サイトの情報やサービスについても同様です。</p>
<p>保存方法はゲームごとに異なります。ブラウザ内に進行状況を保存するゲームもあります。Dig Planetの共有世界とオンラインの進行状況はサーバーに保存され、ブラウザ内の識別子で再接続します。サイトデータを消すと、ローカルのセーブやオンラインの記録に接続するための識別子が失われる場合があります。端末を変える前にDig Planetの引き継ぎ機能を使ってください。</p>
<h2>著作権</h2><p>当サイトのゲームと文章の著作権はBubblegum、またはクレジットに記載した素材の制作者に帰属します。無断転載、複製、再配布はお控えください。引用する場合は出典へのリンクを記載してください。</p>
<h2>改定</h2><p>法令やサービスの変更に応じて、この方針を改定する場合があります。改定後の内容は、このページに掲載した時点から適用します。</p>
<p>制定：2026年6月1日<br>最終更新：2026年10月13日</p>
''', "privacy.html")
