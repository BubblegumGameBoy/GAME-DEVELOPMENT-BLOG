# モンスタータイピング シーズン1「戦国」 実装指示書（Codex 向け）

作成日: 2026-10-18
対象: ゲーム本体リポジトリ（Cloudflare Worker。公開URL `https://rune-typers.bubblegum-island.workers.dev/` と `https://monster.bubblegumgameboy.com/`、同一 Worker）
本体ページ（iframe で埋め込む側）は別リポジトリ GAME-DEVELOPMENT-BLOG。そちらの変更は末尾「ブログ側で行うこと」に分けてある。Codex は触らない。

---

## 0. 背景と目的（これを読んでから着手）

プレイヤーからの声: 「人がいない。代わりに出てくる AI が弱すぎてやることがない」。
今回の方針は「人がいなくても成立する遊び」を先に作り、その上で歴史テーマのシーズン運営に乗せる。

優先順位（この順で実装。各フェーズは単独でデプロイ可能にする）:

1. ドメイン移行ブリッジ（学校ネットワーク対策の前提）
2. 合言葉ルーム（教室で友達と対戦）
3. レイドボス「第六天魔王」（非同期共闘。人がいなくても成立）
4. 混雑ヒートマップ（いつ人がいるかの可視化）
5. bot 強化（KPM 追従 + ゴースト再生）
6. 画像アセット（マップ1、ボス4、報酬モンスター1）

観測済みのコード構成（デプロイ済みバンドルから確認。実ファイル名は手元で照合すること）:

- `src/account.mjs` … ゲストは localStorage キー `mythling-typers.save.v1`、登録者は `mythling-typers.save.v1:<id>` + サーバー同期。セッションは `mythling-typers.session` と `mythling-typers.session-token`。`/api/account/{register,login,logout,recover,save,me}`。
- `src/matchmaking.mjs` … 探索 15 秒（`SEARCH_SECONDS`）+ 最大 5 秒で CPU が代打。人が来たら乱入。
- `src/arena.mjs` … サーバー側ロビー。`src/online.mjs` がブラウザ側。設計は `docs/online.md`。
- `src/online-presence.mjs` … 在席判定（非表示 30 秒、無操作 5 分で切断）。
- `src/cpu-special-timing.mjs`, `src/input-balance.mjs` … CPU の挙動。
- `src/stagecraft.mjs`, `src/fx*.mjs` … 攻撃演出はキャンバス側。モンスター画像は待機 1 枚のみ（`assets/monsters/<name>-{juvenile,adult}-idle.webp`）。
- `src/learning-*.mjs`, `src/learning-data.mjs` … トレーニング（歴史・漢字・科学の出題バンク、出典つき）。
- 戦闘背景は `assets/concepts/battle-arena.webp`（1672×941）を `app.mjs` の `arenaArt` で読み込み。

---

## 1. ドメイン移行ブリッジ

### 目的
本体ページの iframe を `workers.dev` から `monster.bubblegumgameboy.com` に切り替える。`*.workers.dev` は学校フィルタで弾かれやすい。切り替えるとゲストの localStorage が新オリジンから見えなくなるので、一度だけの引き継ぎを入れる。

### 仕様
- `GET /bridge.html` を追加（両オリジンで配信される）。中身:
  - `localStorage` から `mythling-typers.save.v1`、`mythling-typers.save.v1:*`、`mythling-typers.session`、`mythling-typers.session-token`、`mythling-typers.legacy-id` を読む。
  - `window.parent.postMessage({type:'mythling-bridge', data:{...}}, 'https://monster.bubblegumgameboy.com')` で親に渡す。targetOrigin は固定。それ以外には送らない。
  - 親が `postMessage({type:'mythling-bridge-request'})` を送ってきたときだけ応答する（勝手に送らない）。`event.origin` を検証する。
- 起動時（`bootstrap.mjs` または `account.mjs` の初期化）:
  - 自オリジンが `monster.bubblegumgameboy.com` で、`mythling-typers.save.v1` が無く、`mythling-typers.migrated` フラグも無い場合のみ、非表示 iframe で `https://rune-typers.bubblegum-island.workers.dev/bridge.html` を開く。
  - 受信したら各キーをそのまま書き込み、`mythling-typers.migrated = <ISO日時>` を立て、iframe を除去し、通常の起動を続ける（必要ならリロード）。
  - 8 秒以内に届かなければフラグを立てずに通常起動（学校で旧オリジンが弾かれているケース。家で開いたら再試行される）。
  - 新オリジン側に既に保存がある場合は絶対に上書きしない。
- セッショントークンも渡すので登録者はログインし直し不要。サーバーのセッション検証は両オリジン共通なので変更不要のはず。要確認。
- レスポンスヘッダー:
  - `Content-Security-Policy: frame-ancestors 'self' https://bubblegumgameboy.com https://*.bubblegumgameboy.com https://babblegum.hatenablog.com https://*.hatenablog.com`
  - はてなブログの埋め込みが実際にどのドメインから iframe しているか確認してから最終決定。
- **最上位リダイレクトはフラグで無効のまま入れておく**: `window.top === window` かつオリジンが `workers.dev` か `monster.〜` のとき `location.replace('https://bubblegumgameboy.com/ja/games/monster-typing.html')`。ブログ側の iframe 切り替えが完了するまで有効化しない（有効化は後日。環境変数か `build-flags.mjs` のフラグで切る）。`/bridge.html` 自体はリダイレクト対象外。

### 受け入れ条件
- 旧オリジンでゲストとして進めた状態で、新オリジンを iframe 内で開くと進行が引き継がれる。
- 新オリジンに保存がある状態では旧オリジンの内容で上書きされない。
- 旧オリジンに到達できない環境でも新オリジンは白画面にならず通常起動する。
- 旧オリジンは当面残す（最低 3 か月）。

---

## 2. 合言葉ルーム

### 目的
平日昼に学生が教室から同時に来ている。隣の友達と戦いたい層をマッチング母数の問題から切り離す。

### 仕様
- 「対戦相手を探す」画面に「合言葉で対戦」を追加。4〜8 文字（英数かな）。
- 同じ合言葉を入れた者同士のみマッチ。合言葉ルーム内では CPU 代打は出さない（待ち続ける）。待機中に「同じ合言葉で待っている人数」を表示。
- ロビーは `src/arena.mjs` に合言葉キーを足す形。合言葉はサーバーでハッシュ化して保持し、生の文字列はログに残さない。
- 合言葉は端末に記憶（localStorage）し、次回は 1 タップで再入室。
- 試合後の「もう一回」は同じ合言葉で即再マッチ。
- ログイン不要で遊べること（共有 PC 前提）。

### 受け入れ条件
- 2 ブラウザで同じ合言葉を入れると 5 秒以内にマッチする。違う合言葉同士は当たらない。
- 合言葉ルームでは CPU が出ない。

---

## 3. レイドボス「第六天魔王・信長」

### 目的
同時接続が 1 人でも「他の誰かが打っている」実感を出す。非同期共闘。週替わり。

### 仕様
- サーバー: Durable Object（または KV + 原子的加算）で `raid` 状態を 1 つ持つ。
  - `{ season:1, week:1, boss:'nobunaga', hp:N, maxHp:N, startedAt, endsAt, contributors:{<playerKey>:damage}, defeated:boolean }`
  - `playerKey` はログイン ID、ゲストは端末生成 UUID（既存のプレイヤー識別があればそれを使う。`src/player-profile.mjs` を確認）。
- ダメージの定義: 全モード共通で **正しく打った 1 打鍵 = 1 ダメージ**。対戦・トレーニング・ストーリー・合言葉ルームすべて加算。
  - クライアントは試合（またはステージ）終了時にまとめて `POST /api/raid/hit {keystrokes, mode}` を送る。サーバー側で上限（1 送信あたり 3000、1 分あたり 1 件）をかけて改ざん耐性を持たせる。
- 週替わり: 月曜 0:00 JST に次のボスへ。順番は 信長 → 秀吉 → 家康 → 信玄（4 週 = シーズン 1）。画像が揃うまでは信長を 4 週使い回してよい（HP と報酬だけ変える）。
- HP の初期値: 直近 7 日間の総打鍵数 × 1.2 を目安に自動設定（初週は固定値、例 500,000）。
- 討伐成功（週末までに hp ≤ 0）: 参加者（1 以上のダメージ）全員にオーブ 500。貢献上位 10% に報酬モンスター（§6 の「九尾の戦狐」色違い）。未討伐でも参加者に 100 オーブ。
- UI:
  - ホーム画面に常設バナー: ボス画像、HP バー、**「今週の貢献者 ○人」**、残り日数。貢献者数は同時接続数より強い生存シグナルなので必ず出す。
  - 試合後リザルトに「今回の貢献 ○ダメージ」「ボスの残り HP」を表示。
  - 週明けに前週の結果画面（倒した/残 HP、自分の順位）。
- 既存のモンスター表示と同じく待機画像 1 枚で動かす。被弾や撃破の演出は既存の fx（色相変化・振動・フラッシュ）で足す。新規の攻撃画像は作らない。

### 受け入れ条件
- 2 つの端末から打った分が同じ HP バーに反映される。
- 不正な大量送信がサーバーで弾かれる。
- 月曜切り替えが JST で動く（Cron Trigger を使ってよい）。

---

## 4. 混雑ヒートマップ

### 目的
「いつ人がいるか」を見せて、自然発生している周期（平日昼の学生、21〜23 時）を増幅する。固定イベント時間は作らない。

### 仕様
- サーバー: 10 分ごとに同時接続数を記録（`src/arena.mjs` の接続数。既に同時接続数は出せている）。保持は直近 28 日。
- `GET /api/presence/heatmap` → `{ grid: number[7][24] (平均接続数), now: number, usualNow: number, nextPeaks: [{dow,hour}] }`。
- UI（対戦相手を探す画面の脇）:
  - 7×24 のヒートマップ。色は接続数で 4 段階。今のマスを強調。
  - 2 行表示「今 ○人 / いつもの今頃は ○人」。
  - 1 行「次に混む時間帯: 平日 12:30 ごろ / 21:00 ごろ」（上位 2 枠）。
- データが 7 日未満のときはヒートマップを隠し、2 行表示だけ出す。

---

## 5. bot 強化

### 目的
高 KPM のプレイヤーに CPU が追いつかず、やることがなくなる問題への直接対応。

### 仕様
- **KPM 追従**: プレイヤーの直近 5 試合の平均 KPM（分あたり正打鍵）を端末に保持。CPU の打鍵速度をその 0.9〜1.1 倍のランダムで設定し、勝率が 5〜6 割に収まるようにする。初回は現行の難易度から開始。
- **ゴースト再生**: 対戦（人対人）終了時に、各プレイヤーの打鍵タイムスタンプ列（相対 ms、正誤フラグ、必殺技の発動タイミング）を匿名で `POST /api/ghost` に送る（同意表示を 1 回出す。名前は送らない）。サーバーは KPM 帯ごとに最大 50 本保持。
  - CPU 代打のときは、プレイヤーの KPM 帯 ±15% のゴーストがあればそれを再生する。無ければ KPM 追従 bot。
  - ゴースト対戦中の表示名は「幻影の◯◯」のようにして、人ではないことを隠さない。
- 乱入は従来どおり有効（ゴースト中に人が来たら切り替わる）。

### 受け入れ条件
- KPM 300 と KPM 600 のプレイヤーで、それぞれ CPU の勝率が 40〜60% の範囲に入る（ローカルで自動対戦させて確認）。

---

## 6. 画像アセット（シーズン 1）

学習用の既存画像（スタイル参照。生成時に添付する）:

| 用途 | パス |
|---|---|
| 戦闘背景 | `assets/concepts/battle-arena.webp` |
| 背景の別例 | `assets/concepts/training-stage.webp` |
| 獣型モンスター例 | `assets/abyss-guardian-starter-idle.webp` |
| 獣型モンスター例 2 | `assets/monsters/riftclock-juvenile-idle.webp` |
| 成体例 | `assets/monsters/inkcrown-adult-idle.webp` |

出力仕様:
- 背景: 1672×941、webp、`assets/concepts/battle-arena-sengoku.webp`。
- ボス・モンスター: 1250×1250 前後、透過 webp、待機ポーズ 1 枚のみ。`assets/raid/<name>-idle.webp`。
- 各 4 候補生成 → シルエットが小さくても読める 1 枚を選ぶ → 同プロンプトで image-to-image 弱めで 1 回整えて終了。

共通スタイル文（全プロンプト先頭）:

```text
Style reference: match the attached images exactly. Dark high-fantasy JRPG concept art, painterly anime illustration, crisp rim light, deep navy and teal shadows with warm ember and gold accents, glowing gem cores, fine ornamental linework. No text, no watermark, no UI.
```

### 6-1. 戦闘マップ

```text
[共通スタイル] Battle arena background for a typing game, 16:9, 1672x941. Two empty circular stone fighting platforms left and right in the foreground, wide empty gap between them for combat effects, matching the attached arena layout. Setting: Sengoku-era Japan at dusk. Behind: a burning hilltop castle (tenshu) with layered roofs, torii gates, rows of war banners (nobori) in dark indigo and gold, drifting smoke and mist, distant mountains, a large red moon. Torches on both platforms. Center is open and dim so sprites read clearly. Dark palette, ember highlights.
```

### 6-2. ボス（獣型・クトゥルフ寄り。人型にしない）

共通文（各ボスの前に付ける）:

```text
[共通スタイル] Creature sprite, transparent background, square 1250x1250, full body, idle pose facing slightly left, feet or base touching the bottom edge, same framing as the attached creature sprites. A Sengoku warlord reimagined as a cosmic-horror beast, not humanoid. Samurai armor plates grow out of the flesh like shell. One glowing gem core. Palette strictly three colors. Clean readable silhouette, no clutter, no background.
```

- 信長（第 1 週）:
  `Creature: "Nobunaga, the Sixth Heaven Demon King". A hulking six-limbed wolf-like body wrapped in black lacquered armor plates. Head is a horned demon kabuto fused to the skull, with a vertical cluster of three cold golden eyes. Shoulders trail black smoke and embers forming a torn cape. A red-moon gem core burns in the chest. Tendrils of ash spill from the jaw. Palette: black, crimson, ember gold.`
- 秀吉（第 2 週）:
  `Creature: "Hideyoshi, the Golden Ape Sovereign". A long-armed ape-like beast plated in gold and white armor, a cluster of glowing gourds (sennari byotan) hanging from its back like a hive, sunburst crest fused to the brow, many small bright eyes along the arms. Green gem core. Palette: gold, white, jade green.`
- 家康（第 3 週）:
  `Creature: "Ieyasu, the Patient Shell Leviathan". A low, immensely heavy tortoise-like beast whose shell is layered bronze and deep green armor plates engraved with the hollyhock crest, fog pouring from under the shell, a single calm pale eye. Blue gem core. Palette: deep green, bronze, pale blue.`
- 信玄（第 4 週）:
  `Creature: "Shingen, the Mountain Stormhorse". A red-lacquered armored horse-serpent with a white horsehair mane that streams into wind and lightning, a war fan embedded in the chest as the gem core, four banner-spines on the back. Palette: red, white, storm orange.`

### 6-3. 報酬モンスター（討伐貢献上位）

```text
[共通スタイル] Creature sprite, transparent background, 1250x1250, idle pose, same framing as the attached creatures. A fox-spirit war mount fused with samurai armor plates and a torn war banner on its back, nine tails of blue fire, glowing lantern eyes, gem core in the chest. Shiny variant palette: silver and crimson.
```

名前案: 九尾の戦狐（くびのいくさぎつね）。通常色（藍と金）と色違い（銀と紅）の 2 枚。

---

## 7. デプロイ順と確認

1. §1 ブリッジ + frame-ancestors をデプロイ（最上位リダイレクトはオフのまま）。
2. ブログ側で iframe 先を切り替え（下記）。1 週間様子を見る。
3. 最上位リダイレクトをオンにする。
4. §2 合言葉ルーム → §3 レイド（信長画像だけ先に） → §4 ヒートマップ → §5 bot。
5. 残り 3 ボスと報酬モンスターの画像は §3 稼働後に差し替え。

各フェーズで `docs/online.md` に追記し、既存テストに合わせてユニットテストを足す（特に §3 のダメージ上限と週切り替え、§5 の勝率）。

---

## ブログ側で行うこと（Codex は触らない。GAME-DEVELOPMENT-BLOG リポジトリ）

- `ja/games/monster-typing.html` と `games/monster-typing.html` の `data-game-src` を `https://monster.bubblegumgameboy.com/` に変更。§1 デプロイ後に実施。
- アップデート履歴に「シーズン 1 戦国」「レイドボス」「合言葉ルーム」を追加。
