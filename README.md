# Bubblegum Game Boy

ブラウザで遊べる自作ゲームのポータルサイト。
作成したゲームを一覧で公開し、各ゲームへ誘導します。

- 公開ページ: `index.html`（静的サイト / GitHub Pages 配信）
- 独自ドメイン: https://bubblegumgameboy.com （取得・接続済み / HTTPS有効）
- ゲーム配信ドメイン: https://play.bubblegumgameboy.com （`bubblegumgameboy.github.io` リポジトリにカスタムドメイン設定）
- メインブログ: https://babblegum.hatenablog.com/ （AdSense承認済み・別運用、原則触らない）

## 収録ゲーム

| ゲーム | ジャンル | 対応 | リンク |
|---|---|---|---|
| ポップコーンタイピング | タイピング（看板） | PCのみ | https://play.bubblegumgameboy.com/popcorn-typing/ |
| ボスラッシュ スペースキー連打ゲーム | 連打 | PC・スマホ | https://play.bubblegumgameboy.com/spacebar-clicker/ |
| ソルジャータイピング | タイピング | PCのみ | https://play.bubblegumgameboy.com/Bubble-Wars/ |

サムネイル画像は `images/` に配置（`images/<game>.png`）。

各ゲームは別リポジトリ（`bubblegumgameboy/popcorn-typing` / `spacebar-clicker` / `Bubble-Wars`）。
`bubblegumgameboy.github.io` にカスタムドメインを設定しているため、配下の全プロジェクトが
`play.bubblegumgameboy.com/<repo>/` で配信される。

## デザイン

[Claude Design](https://claude.ai/design) で作成したモックを、静的 HTML/CSS として実装。
配色・フォントはメインブログ（バブルガムのゲームブログ）と統一。

- フォント: `M PLUS Rounded 1c` + `DotGothic16`（Google Fonts）
- 配色: bg `#e4f2f8` / teal `#2a9aa3`・`#3bb4bd` / navy `#2c4a6e`・`#14283f` / red `#ef4d52` / yellow `#ffc233`
- 8bitテイスト（ドット系・ピクセルハート・コントローラーロゴ）
- 外部リンクは全て `target="_blank" rel="noopener"`
- 絵文字はバッジに使わない

## 計測・SEO（設定済み）

- Google Analytics 4: `G-17WNKDX3ZB`（ポータル＋全ゲームに設置済み）
- OGP / Twitter Card メタタグ設定済み
- Google Search Console 登録済み（所有権確認済み）
- `sitemap.xml` 送信済み

## 次の作業（予定）

- **ゲームを `<iframe>` でポータル内に埋め込む**
  - 目的: 滞在時間・GA・将来のAdSenseをポータル（bubblegumgameboy.com）に集約する
  - はてなブログの iframe 埋め込みはしない（X-Frame-Options で拒否される＋意味が薄い）
  - はてなへの導線はテキストリンクのまま維持
- 将来: タイピング系ゲームの多言語対応（未着手）
- 将来: ポータルへの AdSense 申請（トラフィックが貯まってから）

## 公開手順（メモ）

1. このリポジトリで GitHub Pages を有効化（Source: `main` / root）
2. 独自ドメイン `bubblegumgameboy.com` は接続済み（DNS: Aレコード4つ + www CNAME）
3. ゲーム配信は `bubblegumgameboy.github.io` リポジトリ側で `play.bubblegumgameboy.com` を設定
