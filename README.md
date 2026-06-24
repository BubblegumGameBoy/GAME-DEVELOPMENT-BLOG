# Bubblegum Game

ブラウザで遊べる自作ゲームのポータルサイト。
作成したゲームを一覧で公開し、各ゲームへ誘導します。

- 公開ページ: `index.html`（静的サイト / GitHub Pages 配信）
- 独自ドメイン: https://bubblegumgameboy.com （取得・接続済み / HTTPS有効）
- ゲーム配信ドメイン: https://play.bubblegumgameboy.com （`bubblegumgameboy.github.io` リポジトリにカスタムドメイン設定）
- メインブログ: https://babblegum.hatenablog.com/ （AdSense承認済み・別運用、原則触らない）

> 2026-06 リニューアル: Claude Design のモックをもとに UI を刷新。サイト名を
> 「Bubblegum Game Boy」→「**Bubblegum Game**」に変更。新着情報・サイト内記事・
> ゲームの iframe 埋め込み・裏サイト（丑三つ掲示板）を追加。

## ディレクトリ構成

```
index.html                     トップページ（ヒーロー / いちおし / 新着 / ゲーム一覧 / about / プライバシー / お問い合わせフォーム）
about.html                     運営者プロフィール（E-E-A-T / AdSense 向けの運営者情報ページ）
games/
  clicker.html                 クリック連打ゲーム「レイドボスラッシュ」（iframe 埋め込み）
  popcorn-typing.html          パチパチタイピング（iframe 埋め込み）
  soldier-typing.html          ソルジャータイピング（iframe 埋め込み）
blog/
  index.html                   記事一覧
  _template.html               記事テンプレート（コピー元・公開しない）
  posts/
    2026-06-01-site-renewal.html   サンプル記事
ura/
  index.html                   裏サイト：オカルト超常現象板 ＠ 丑三つ掲示板
  sasanaki.html                実況スレ体験「ささなき駅」（きさらぎ駅オマージュ・全文自作）
images/                        スクリーンショット等
sitemap.xml / CNAME
```

各ページとも素の静的 HTML（フレームワーク・ビルド不要）。GitHub Pages にそのまま載る。

## 収録ゲーム

| ゲーム | ジャンル | 対応 | サイト内ページ | 配信元(iframe) |
|---|---|---|---|---|
| クリック連打ゲーム「レイドボスラッシュ」 | 放置（いちおし） | PC・スマホ | `games/clicker.html` | https://play.bubblegumgameboy.com/spacebar-clicker/ |
| パチパチタイピング | タイピング | PCのみ | `games/popcorn-typing.html` | https://play.bubblegumgameboy.com/popcorn-typing/ |
| ソルジャータイピング | タイピング | PCのみ | `games/soldier-typing.html` | https://play.bubblegumgameboy.com/Bubble-Wars/ |

サムネイル画像は `images/` に配置：
`spacebar-clicker.png`（クリック連打ゲーム「レイドボスラッシュ」） / `popcorn-typing.png` / `soldier-typing.png`。

ゲーム本体は別リポジトリ（`bubblegumgameboy/popcorn-typing` / `spacebar-clicker` / `Bubble-Wars`）。
`bubblegumgameboy.github.io` にカスタムドメインを設定しているため、配下の全プロジェクトが
`play.bubblegumgameboy.com/<repo>/` で配信され、それを各ゲームページが `<iframe>` で埋め込む。
（目的：滞在時間・GA・将来の AdSense をポータルに集約）

## 記事の追加方法（サイト内ブログ）

3ステップ。HTML を少し触るだけで、ビルド作業は不要です。

1. **記事ファイルを作る**
   `blog/_template.html` を `blog/posts/` にコピーし、`日付-スラッグ.html` にリネーム
   （例 `blog/posts/2026-07-01-popcorn-update.html`）。
   ファイル冒頭コメントの【ここを書き換える】箇所（title / description / og / canonical /
   日付・タグ・タイトル・本文）をすべて埋める。本文は `<article class="prose">` の中に
   `<h2> <p> <ul>` などで書くだけ。
2. **一覧に載せる**
   `blog/index.html` の「▼▼▼ 記事一覧 …」ブロック内の `<a>…</a>` カードを1つコピーし、
   先頭に貼って日付・タグ・タイトル・リンク先・要約を書き換える。
3. **（任意）トップの新着情報に出す**
   `index.html` の「▼▼▼ 新着情報 …」ブロック内の `<a>…</a>` を1つコピーして先頭に貼る。

仕上げに `sitemap.xml` へ新記事の `<url>` を1件追加すると、検索エンジンに拾われやすくなります。

タグは「新ゲーム」(`#2a9aa3`) /「更新」(`#e08a1e`) /「お知らせ」(`#7a93ad`) を推奨。

## デザイン

[Claude Design](https://claude.ai/design) で作成したモックを、素の静的 HTML/CSS として実装。
配色・フォントはメインブログ（バブルガムのゲームブログ）と統一。

- フォント: `M PLUS Rounded 1c` + `DotGothic16`（Google Fonts）。裏サイトのみ MS Pゴシック系。
- 配色: bg `#e4f2f8` / teal `#2a9aa3`・`#3bb4bd` / navy `#2c4a6e`・`#14283f` / red `#ef4d52` / yellow `#ffc233`
- 8bitテイスト（ドット系・ピクセルハート）
- 外部リンクは全て `target="_blank" rel="noopener"`
- 絵文字はバッジに使わない
- デザインのプロトタイプは Claude Design ランタイム（`<x-dc>` / `support.js`）前提だったため、
  `style-hover` → CSS `:hover`、`<sc-for>`/`<sc-if>` → 静的 HTML に変換して実装。

## 計測・SEO（設定済み）

- Google Analytics 4: `G-17WNKDX3ZB`（全ページに設置）
- OGP / Twitter Card メタタグ・JSON-LD 構造化データ設定済み
- Google Search Console 登録済み（所有権確認済み）
- `sitemap.xml` 送信済み（全ページ収録）

## TODO / メモ

- OGP 画像 `images/ogp.png`（横長の専用バナー）は未作成。暫定で各スクショを `og:image` に使用中。
- 広告：忍者AD（admax / `adm.shinobi.jp`）の枠は **全ページから撤去済み**（AdSense 審査のため他社広告ネットワークを排除）。AdSense 承認後に、発行された `<script ... adsbygoogle.js?client=ca-pub-XXXX>` を各ページに設置する。
- 裏サイト「ささなき駅」は実画像（`station.png` / `tunnel.png`）未設置でも SVG にフォールバックして動作。
- 将来: タイピング系ゲームの多言語対応 / ポータルへの AdSense 申請。

## 公開手順（メモ）

1. このリポジトリで GitHub Pages を有効化（Source: `main` / root）
2. 独自ドメイン `bubblegumgameboy.com` は接続済み（DNS: Aレコード4つ + www CNAME）
3. ゲーム配信は `bubblegumgameboy.github.io` リポジトリ側で `play.bubblegumgameboy.com` を設定
