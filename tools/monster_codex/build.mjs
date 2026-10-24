// Builds the Monster Typing codex and world pages (/ja/monster-typing/) from data.json (the game's own numbers,
// read by read-game.mjs) and lore.mjs (the site's writing). Pictures: thumbs.py. Run: node tools/monster_codex/build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { LORE } from './lore.mjs';
import { WORLD } from './world.mjs';

const ROOT = new URL('../../', import.meta.url);
const SITE = 'https://bubblegumgameboy.com';
const DATA = JSON.parse(readFileSync(new URL('./data.json', import.meta.url), 'utf8'));
const FORM = Object.fromEntries(DATA.out.map(f => [f.id, f]));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const stars = n => n ? '★'.repeat(n) : '—';
const CODEX = '/ja/monster-typing/codex/';
const WORLD_URL = '/ja/monster-typing/world/';
const GAME_PAGE = '/ja/games/monster-typing.html';

function page({ path, title, description, crumbs, h1, subtitle, body, ld }) {
  const url = SITE + path;
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="google-adsense-account" content="ca-pub-2203567155161909">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${url}">
  <link rel="alternate" hreflang="ja" href="${url}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${SITE}/images/monster-typing.png">
  <meta property="og:locale" content="ja_JP">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Shippori+Mincho+B1:wght@700;800&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Shippori+Mincho+B1:wght@700;800&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap"></noscript>
  <link rel="stylesheet" href="/site.css?v=20261024a">
  <link rel="stylesheet" href="/game-page.css">
  <link rel="stylesheet" href="/monster-codex.css?v=20261023f">
  <script src="/privacy-controls.js" defer></script>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2203567155161909" crossorigin="anonymous"></script>
  <script src="/imobile-ads.js?v=20261023a" defer></script><script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
  <a class="skip" href="#main">本文へ</a>
  <nav class="site-nav" aria-label="サイトメニュー"><div class="nav-inner"><a class="brand" href="/ja/">Bubblegum <span>Game</span></a><div class="nav-links"><a href="${GAME_PAGE}">モンスタータイピング</a><a href="/ja/#games">ほかのゲーム</a><a href="https://babblegum.hatenablog.com/">ブログ</a></div></div></nav>
  <main id="main" class="game-main">
    <p class="crumb">${crumbs.map(([text, href]) => href ? `<a href="${href}">${esc(text)}</a>` : esc(text)).join(' / ')}</p>
    <h1>${esc(h1)}</h1>
    <p class="game-subtitle">${esc(subtitle)}</p>
    <aside class="ad-top" aria-label="広告"><p class="ad-label">広告</p><div data-imobile="top"></div></aside>
    <article class="article codex-article">
${body}
    </article>
    <aside class="ad-slot" aria-label="広告"><p class="ad-label">広告</p><div data-imobile="page"></div></aside>
    <aside class="author-box" aria-label="作った人"><p class="author-name">作った人：バブルガム</p><p>個人でブラウザゲームを作っています。攻略記事やゲームレビューは<a href="https://babblegum.hatenablog.com/">はてなブログ「バブルガムのゲームブログ」</a>で書いています。</p><p><a href="/ja/about.html">運営者について</a> · <a href="${GAME_PAGE}">モンスタータイピングを遊ぶ</a></p></aside>
  </main>
  <footer class="site-footer"><div class="footer-inner"><span>© 2026 Bubblegum Game</span><div><a href="/ja/">ホーム</a> · <a href="/ja/about.html">運営者</a> · <a href="/ja/privacy.html">プライバシーポリシー</a> · <a href="/ja/contact.html">お問い合わせ</a></div></div><div class="footer-inner" style="margin-top:12px"><button type="button" data-privacy-choices class="linkish">広告とCookieの設定</button></div></footer>
</body>
</html>
`;
}

const GAME_LD = { '@type': 'VideoGame', name: 'モンスタータイピング', alternateName: 'Monster Typing', url: SITE + GAME_PAGE };
const img = (id, small) => `/images/monster-typing/${id}${small ? '-s' : ''}.webp`;

// What one form's table says: every value from the game.
function evolution(f) {
  const [first, second] = f.forms;
  if (f.forms.length < 2) return '進化しない';
  if (f.id === first) return `${f.line === 'lulu' ? `Lv.${DATA.LULU_LEVEL}` : `Lv.${DATA.EVOLVE_LEVEL}・共闘${DATA.EVOLVE_BONDS}回`}で${FORM[second].name}に進化`;
  return `${FORM[first].name}から進化`;
}
function obtain(f) {
  if (f.line === 'lulu') return f.id === f.forms[0] ? '不明' : '進化';
  if (f.id !== f.forms[0]) return '進化';
  return `召喚（${stars(f.rarity)}）・契約の儀`;
}
const statLine = s => `攻撃 ${s.attack}・まもり ${s.guard}・器用さ ${s.dex}・神秘 ${s.mystic}`;
function formSection(f, paragraphs) {
  const rows = [
    ['図鑑', `No.${f.no}`],
    ['系統・形態', f.human ? '契約者' : f.title.replace(' / ', '・')],
    ['★', `${stars(f.rarity)}${f.rarity ? `　${f.cls}` : ''}`],
    ['型', `${f.style}　<span class="codex-sub">${esc(f.styleLine)}</span>`],
    ['必殺技', `<b>${esc(f.skill)}</b><br>${esc(f.skillText)}`],
    ['特性', f.trait ? `<b>${esc(f.trait)}</b><br>${esc(f.traitText)}` : '—'],
    ['攻撃の速さ', `${f.speed}　<span class="codex-sub">（5段階。大きいほど通常攻撃が速く届く）</span>`],
    ['体高', `${f.height} cm`],
    ['はじめの能力', statLine(f.stats)],
    ['進化', evolution(f)],
    ['入手方法', obtain(f)]
  ];
  return `      <section class="codex-form" id="${f.id}">
        <h2>${esc(f.name)}</h2>
        <div class="codex-head"><img src="${img(f.id)}" alt="${esc(f.name)}" width="192" height="192" loading="lazy"><blockquote class="codex-quote"><p>${esc(f.desc)}</p><cite>ゲーム内の図鑑より</cite></blockquote></div>
        <table><tbody>
${rows.map(([k, v]) => `          <tr><th scope="row">${k}</th><td>${v}</td></tr>`).join('\n')}
        </tbody></table>
${paragraphs.map(p => `        <p>${esc(p)}</p>`).join('\n')}
      </section>`;
}

const NOTE = `      <p class="note">数値は${DATA.read.replace(/^(\d+)-0?(\d+)-0?(\d+)$/, '$1年$2月$3日')}時点のゲームと同じです。育成でふった能力やルーンで、対戦での数値は変わります。言葉の意味は<a href="${WORLD_URL}#terms">用語集</a>にあります。</p>`;
const evoShort = (young, grown) => young.line === 'lulu' ? `Lv.${DATA.LULU_LEVEL}` : `Lv.${DATA.EVOLVE_LEVEL}・共闘${DATA.EVOLVE_BONDS}回`;

// A creature line's page: the lore first (its range, how it lives, its place among people), the game's own words and
// numbers after. Both forms on one page.
function linePage(l) {
  const [young, grown] = l.forms.map(id => FORM[id]);
  // Size comparison (2026-10-23, the maker: 大きさ比べも、モンスターの画像調整して入れてほしい): the cropped pictures and Shio
  // standing on one line, heights in proportion to cm. A form too small to see is drawn larger and says
  // so (×2, ×3).
  const SIZE_PX = 150, MIN_PX = 34, top = Math.max(grown.height, 160);
  const figure = (f, label) => {
    const px = f.height / top * SIZE_PX, zoom = px < MIN_PX ? Math.ceil(MIN_PX / px) : 1;
    return `<figure class="codex-scale"><img src="${img(f.id)}" alt="" style="height:${Math.round(px * zoom)}px"><figcaption><b>${esc(label)}</b>${f.height}cm${zoom > 1 ? `<em>（×${zoom}で表示）</em>` : ''}</figcaption></figure>`;
  };
  // Shio's height is not set in the story; 160cm stands in until the maker decides (2026-10-23).
  const SHIO_CM = 160, shio = `<figure class="codex-scale"><img src="/images/monster-typing/shio.webp" alt="" style="height:${Math.round(SHIO_CM / top * SIZE_PX)}px"><figcaption><b>シオ</b>${SHIO_CM}cm</figcaption></figure>`;
  const pair = (a, b) => a === b ? esc(a) : `${esc(a)}<br>${esc(b)}`;
  const rows = [
    ['図鑑番号', `No.${young.no}（${esc(young.name)}）<br>No.${grown.no}（${esc(grown.name)}）`],
    ['★', `${stars(young.rarity)}　${young.cls}`],
    ['型', pair(young.style, grown.style)],
    ['攻撃の速さ', `${young.speed === grown.speed ? young.speed : `${young.speed} → ${grown.speed}`}（5段階）`],
    ['必殺技', `${esc(young.name)}「${esc(young.skill)}」${esc(young.skillText)}<br>${esc(grown.name)}「${esc(grown.skill)}」${esc(grown.skillText)}`],
    ['特性', `${esc(young.name)}「${esc(young.trait)}」${esc(young.traitText)}<br>${esc(grown.name)}「${esc(grown.trait)}」${esc(grown.traitText)}`],
    ['はじめの能力', `${esc(young.name)}　${statLine(young.stats)}<br>${esc(grown.name)}　${statLine(grown.stats)}`],
    ['進化', `${evoShort(young, grown)}で${esc(young.name)}から${esc(grown.name)}へ`],
    ['入手方法', obtain(young)]
  ];
  return [
    `      <div class="codex-hero"><figure><img src="${img(young.id)}" alt="${esc(young.name)}" width="192" height="192"><figcaption>${esc(young.name)}（幼体）</figcaption></figure><figure><img src="${img(grown.id)}" alt="${esc(grown.name)}" width="192" height="192"><figcaption>${esc(grown.name)}（成体）</figcaption></figure></div>`,
    `      <dl class="codex-quick"><dt>分類</dt><dd>${esc(l.line)}系　${stars(young.rarity)} ${young.cls}</dd><dt>生息地</dt><dd>${esc(l.region)}。${esc(l.place)}</dd><dt>体高</dt><dd>${esc(young.name)} ${young.height}cm　${esc(grown.name)} ${grown.height}cm</dd></dl>`,
    `      <div class="codex-size" aria-label="大きさくらべ">${figure(young, young.name)}${shio}${figure(grown, grown.name)}</div>`,
    l.map ? `      <figure class="codex-range"><img src="/images/monster-typing/map-${l.slug}.webp" alt="世界地図。${esc(l.region)}に赤い丸" width="600" height="400" loading="lazy"><figcaption>すむ場所：${esc(l.region)}</figcaption></figure>` : '',
    `      <h2>${esc(l.head)}</h2>`,
    `      <p>${esc(l.body)}</p>`,
    `      <p>${esc(l.life)}</p>`,
    `      <h2>${esc(l.h2b)}</h2>`,
    `      <p>${esc(l.people)}</p>`,
    `      <p>${esc(l.story)}</p>`,
    `      <h2>ゲームの図鑑の言葉</h2>`,
    ...[young, grown].map(f => `      <blockquote class="codex-quote"><p>${esc(f.desc)}</p><cite>${esc(f.name)}</cite></blockquote>`),
    `      <h2>ゲームでの性能</h2>`,
    `      <table><tbody>\n${rows.map(([k, v]) => `        <tr><th scope="row">${k}</th><td>${v}</td></tr>`).join('\n')}\n      </tbody></table>`,
    NOTE
  ].filter(Boolean).join('\n');
}

// One page per line, in the game's bestiary order. The contractors' page was taken down on 2026-10-23 (the maker:
// 一旦契約者消そうか; they appear in the story, and their lore waits for it).
const pages = LORE.map(l => ({ ...l, title: `${l.line}系`, ids: l.forms }))
  .sort((a, b) => FORM[a.ids[0]].no.localeCompare(FORM[b.ids[0]].no));
mkdirSync(new URL(`.${CODEX}`, ROOT), { recursive: true });
pages.forEach((p, i) => {
  const forms = p.ids.map(id => FORM[id]), prev = pages[i - 1], next = pages[i + 1];
  const names = forms.map(f => f.name).join('・');
  const pager = `      <nav class="codex-pager" aria-label="図鑑のページ送り">${prev ? `<a href="${CODEX}${prev.slug}.html">← ${esc(prev.title)}</a>` : '<span></span>'}<a href="${CODEX}">図鑑の一覧</a>${next ? `<a href="${CODEX}${next.slug}.html">${esc(next.title)} →</a>` : '<span></span>'}</nav>`;
  const body = `${linePage(p)}\n${pager}`;
  const title = `${p.title}（${names}）｜モンスタータイピング図鑑`;
  const description = `モンスタータイピングの${p.title}、${names}。${p.region}にすむ。${p.head}。`;
  writeFileSync(new URL(`.${CODEX}${p.slug}.html`, ROOT), page({
    path: `${CODEX}${p.slug}.html`, title, description, h1: p.title,
    subtitle: `モンスタータイピング図鑑　${names}`,
    crumbs: [['ホーム', '/ja/'], ['モンスタータイピング', GAME_PAGE], ['図鑑', CODEX], [p.title]],
    body,
    ld: { '@context': 'https://schema.org', ...GAME_LD, character: forms.map(f => ({ '@type': 'Person', name: f.name, description: f.desc, image: SITE + img(f.id) })) }
  }));
});

// The list page.
const card = (href, id, name, sub) => `<a class="codex-card" href="${href}"><img src="${img(id, true)}" alt="" width="96" height="96" loading="lazy"><span>${esc(name)}</span><small>${esc(sub)}</small></a>`;
const group = rarity => LORE.filter(l => FORM[l.forms[0]].rarity === rarity)
  .map(l => card(`${CODEX}${l.slug}.html`, l.forms[0], `${l.line}系`, l.forms.map(id => FORM[id].name).join(' → '))).join('');
const others = (from, to) => DATA.others.filter(o => o.no >= from && o.no <= to).map(o => `No.${o.no} ${esc(o.name)}`).join('、');
const listBody = `      <p>モンスタータイピングで仲間になる神話生物の図鑑です。1ページに1系統ずつ、幼体と成体を並べました。どこにすみ、何を食べ、厳しい土地をどうやって生き延びているのかを、ゲームの図鑑文から広げて書いています。</p>
      <p>世界のしくみや言葉の意味は、<a href="${WORLD_URL}">設定資料</a>にまとめています。</p>
      <h2>魔物級（★★★）</h2>
      <p>召喚でいちばんよく出会う神話生物です。</p>
      <div class="codex-grid">${group(3)}</div>
      <h2>神格級（★★★★）</h2>
      <p>時・月・運命・星・王座・封じられた書を司るといわれる神話生物です。</p>
      <div class="codex-grid">${group(4)}</div>
      <h2>名なき王（★★★★★）</h2>
      <div class="codex-grid">${group(5)}</div>
      <h2>召喚で出会える割合</h2>
      <table><tbody>
        <tr><th scope="row">★★★★★</th><td>${Math.round(DATA.RATES[5] * 100)}%</td></tr>
        <tr><th scope="row">★★★★</th><td>${Math.round(DATA.RATES[4] * 100)}%</td></tr>
        <tr><th scope="row">★★★</th><td>${Math.round(DATA.RATES[3] * 100)}%</td></tr>
      </tbody></table>
      <p>召喚で来てくれるのは、いつも幼体です。成体の姿は、育てて進化させると見られます。</p>
      <h2>このほかの仲間</h2>
      <p>物語・トレーニング・レイドで出会う仲間もいます。ここでは名前だけ載せています。</p>
      <ul>
        <li>物語：${others('045', '050')}</li>
        <li>トレーニング：${others('051', '052')}</li>
        <li>レイドの褒賞：${others('053', '057')}</li>
      </ul>`;
writeFileSync(new URL(`.${CODEX}index.html`, ROOT), page({
  path: CODEX, title: 'モンスター図鑑｜モンスタータイピング',
  description: 'モンスタータイピングの神話生物19系統の図鑑。すむ場所、食べるもの、厳しい土地を生き延びる体の仕組みと、ゲームでの必殺技・特性を系統ごとに紹介します。',
  h1: 'モンスター図鑑', subtitle: 'モンスタータイピングの神話生物と契約者',
  crumbs: [['ホーム', '/ja/'], ['モンスタータイピング', GAME_PAGE], ['図鑑']],
  body: listBody,
  ld: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'モンスター図鑑｜モンスタータイピング', url: SITE + CODEX, inLanguage: 'ja', about: GAME_LD,
    hasPart: pages.map(p => ({ '@type': 'WebPage', name: p.title, url: `${SITE}${CODEX}${p.slug}.html` })) }
}));

// The world page.
mkdirSync(new URL(`.${WORLD_URL}`, ROOT), { recursive: true });
writeFileSync(new URL(`.${WORLD_URL}index.html`, ROOT), page({
  path: WORLD_URL, title: '設定資料｜モンスタータイピング',
  description: 'モンスタータイピングの設定資料。世界地図と9つの地方の景色、そこにすむ仲間、勇者一行の物語に出てくる人たちを、ゲームの絵で紹介します。',
  h1: '設定資料', subtitle: 'モンスタータイピングの世界と、そこに生きるもの',
  crumbs: [['ホーム', '/ja/'], ['モンスタータイピング', GAME_PAGE], ['設定資料']],
  body: WORLD({ CODEX, LORE }),
  ld: { '@context': 'https://schema.org', '@type': 'WebPage', name: '設定資料｜モンスタータイピング', url: SITE + WORLD_URL, inLanguage: 'ja', about: GAME_LD }
}));
console.log(`${pages.length} codex pages, the list and the world page`);
