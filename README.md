# Bubblegum Game

https://bubblegumgameboy.com/ の静的サイト（GitHub Pages、main に push すると公開）。

## サイトの形（2026-11-11 時点）

- `/`（英語トップ）：ブログが主役。ゲームごとの記事カード → モンスタータイピングの帯 → 自作ゲーム
- `/blog/`：英語ブログ。カテゴリごとの棚。記事は `blog/posts/`、一覧は `blog/posts.json`
- `/games/`：ゲーム一覧と各ゲームのページ（英語）
- `/ja/`：日本語側。モンスタータイピングが主役。`/ja/games/`、図鑑 `/ja/monster-typing/codex/`、設定資料 `/ja/monster-typing/world/`
- 日本語の記事は、はてなブログ（https://babblegum.hatenablog.com/）にあり、このサイトには置かない
- モンスタータイピングは、英語・日本語とも、はてなの記事の中で遊ぶ（セーブを1か所にまとめるため）

メニューは全ページ共通。英語は Home / Games / Blog / About ＋ 日本語、日本語は ホーム / ゲーム / 図鑑 / ブログ / 運営者 ＋ English。

見た目は2系統：遊ぶページは黒×金（`site.css`）、読むページは紙（`blog/blog.css`）。

## 作るもの・直すもの

| やること | 方法 |
|---|---|
| 英語記事を足す | `blog/posts/` に記事を置き、`blog/posts.json` に1件足して `python tools/build_blog.py` |
| トップに出す記事を変える | `blog/posts.json` の `"pick": 1,2,3` を付け替えて `python tools/build_blog.py` |
| 図鑑を作り直す | `node tools/monster_codex/build.mjs`（数値はゲーム側から `read-game.mjs` で読む） |
| 日本語ページの枠を直す | `python tools/build_ja.py`（ゲームページの本文は、ページにあるものを残す） |

`tools/build_blog.py` が書くのは、`blog/index.html`、カテゴリページ、各記事末尾の関連記事、
`index.html` の `blog:start/end` と `myposts:start/end` の間、`sitemap.xml` の不足分、
一覧用の小さい画像（`images/guides/thumbs/`、Pillow が必要）。

手で書いているページ：`index.html` の枠、`ja/index.html`、`games/*.html`、`games/index.html`、
`ja/games/index.html`、`about.html` などの案内ページ、`404.html`。

## 触らないもの

- `site.css` の `/* ads */` 以降、`imobile-ads.js`、`live-stats.js`
- `_ja-archive/`（2026-07 時点の日本語版の控え。公開されない）

公開されないもの（`_config.yml` の exclude）：`test`、`README.md`、`_ja-archive`、`blog/_template.html`、`ura`、`tools`、`blog/posts.json`。

テスト：`node test/reader-flow.test.cjs` など（`test/*.cjs`）。
