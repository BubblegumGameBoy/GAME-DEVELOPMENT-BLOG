# Bubblegum Game Boy

ブラウザで遊べる自作ゲームのポータルサイト。
作成したゲームを一覧で公開し、各ゲーム（GitHub Pages）へ誘導します。

- 公開ページ: `index.html`（静的サイト / GitHub Pages 配信想定）
- 予定独自ドメイン: `bubblegumgameboy.com`
- メインブログ: https://babblegum.hatenablog.com/

## 収録ゲーム

| ゲーム | ジャンル | 対応 | リンク |
|---|---|---|---|
| ポップコーンタイピング | タイピング（看板） | PCのみ | https://bubblegumgameboy.github.io/popcorn-typing/ |
| ボスラッシュ スペースキー連打ゲーム | 連打 | PC・スマホ | https://bubblegumgameboy.github.io/spacebar-clicker/ |
| ソルジャータイピング | タイピング | PCのみ | https://bubblegumgameboy.github.io/Bubble-Wars/ |

サムネイル画像は `images/` に配置（`images/<game>.png`）。

## デザイン

[Claude Design](https://claude.ai/design) で作成したモックを、静的 HTML/CSS として実装。
配色・フォントはメインブログ（バブルガムのゲームブログ）と統一。

## 公開手順（メモ）

1. このリポジトリで GitHub Pages を有効化（Source: `main` / root）
2. DNS 設定後、独自ドメイン `bubblegumgameboy.com` を接続（`CNAME` 追加）
