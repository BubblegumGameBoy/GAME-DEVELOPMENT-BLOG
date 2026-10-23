// Builds the Monster Typing codex and world pages (/ja/monster-typing/) from data.json (the game's own numbers,
// read by read-game.mjs) and lore.mjs (the site's writing). Pictures: thumbs.py. Run: node tools/monster_codex/build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { LORE, CONTRACTORS } from './lore.mjs';
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
  <link rel="stylesheet" href="/site.css?v=20261018b">
  <link rel="stylesheet" href="/game-page.css">
  <link rel="stylesheet" href="/monster-codex.css?v=20261023">
  <script src="/privacy-controls.js" defer></script>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2203567155161909" crossorigin="anonymous"></script>
  <script src="/imobile-ads.js?v=20261018b" defer></script><script type="application/ld+json">${JSON.stringify(ld)}</script>
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

const GLOSSARY_NOTE = `      <p class="note">数値はゲームの図鑑と同じもの（${DATA.read} 時点）。育成でふった能力やルーンによって、実際の対戦の数値は変わる。言葉の説明は<a href="${WORLD_URL}#terms">用語集</a>にある。</p>`;

// One page per line (and one for the contractors), in the game's bestiary order.
const pages = [...LORE.map(l => ({ ...l, ids: Object.keys(l.forms) })), { ...CONTRACTORS, line: 'contractors', ids: Object.keys(CONTRACTORS.forms) }]
  .sort((a, b) => FORM[a.ids[0]].no.localeCompare(FORM[b.ids[0]].no));
mkdirSync(new URL(`.${CODEX}`, ROOT), { recursive: true });
pages.forEach((p, i) => {
  const forms = p.ids.map(id => FORM[id]), prev = pages[i - 1], next = pages[i + 1];
  const names = forms.map(f => f.name).join('・');
  const lead = p.line === 'contractors' ? '人の仲間4人' : forms.map(f => f.name).join('から') + 'へ';
  const body = [
    `      <p>${esc(p.intro)}</p>`,
    GLOSSARY_NOTE,
    ...forms.map(f => formSection(f, p.forms[f.id])),
    p.suits ? `      <h2>どんな人に向くか</h2>\n      <p>${esc(p.suits)}</p>` : '',
    p.match ? `      <h2>ほかの型との相性</h2>\n      <p>${esc(p.match)}</p>` : '',
    `      <nav class="codex-pager" aria-label="図鑑のページ送り">${prev ? `<a href="${CODEX}${prev.slug}.html">← ${esc(prev.title)}</a>` : '<span></span>'}<a href="${CODEX}">図鑑の一覧</a>${next ? `<a href="${CODEX}${next.slug}.html">${esc(next.title)} →</a>` : '<span></span>'}</nav>`
  ].filter(Boolean).join('\n');
  const title = `${p.title}（${names}）｜モンスタータイピング図鑑`;
  const description = `モンスタータイピングの${p.title}。${lead}。必殺技・特性・型・体高・入手方法と、見た目や戦い方の解説。`;
  writeFileSync(new URL(`.${CODEX}${p.slug}.html`, ROOT), page({
    path: `${CODEX}${p.slug}.html`, title, description, h1: p.title,
    subtitle: `モンスタータイピング図鑑 — ${names}`,
    crumbs: [['ホーム', '/ja/'], ['モンスタータイピング', GAME_PAGE], ['図鑑', CODEX], [p.title]],
    body,
    ld: { '@context': 'https://schema.org', ...GAME_LD, character: forms.map(f => ({ '@type': 'Person', name: f.name, description: f.desc, image: SITE + img(f.id) })) }
  }));
});

// The list page.
const card = (href, id, name, sub) => `<a class="codex-card" href="${href}"><img src="${img(id, true)}" alt="" width="96" height="96" loading="lazy"><span>${esc(name)}</span><small>${esc(sub)}</small></a>`;
const linePages = LORE.map(l => ({ l, first: FORM[Object.keys(l.forms)[0]] }));
const group = rarity => linePages.filter(({ l, first }) => l.line !== 'lulu' && first.rarity === rarity)
  .map(({ l }) => card(`${CODEX}${l.slug}.html`, Object.keys(l.forms)[0], l.title, Object.keys(l.forms).map(id => FORM[id].name).join(' → '))).join('');
const lulu = LORE.find(l => l.line === 'lulu');
const others = (from, to) => DATA.others.filter(o => o.no >= from && o.no <= to).map(o => `No.${o.no} ${esc(o.name)}`).join('、');
const listBody = `      <p>モンスタータイピングで仲間になる神話生物と契約者の図鑑。神話生物は幼体から育ち、条件を満たすと成体に進化する。ここでは系統ごとに、幼体と成体を一つのページにまとめた。</p>
      <p>各ページには、ゲーム内の図鑑と同じ図鑑文・必殺技・特性・型・体高と、見た目の由来や戦い方の解説を載せている。世界のなりたちや言葉の意味は<a href="${WORLD_URL}">設定資料</a>にまとめた。</p>
      <h2>はじまりの仲間</h2>
      <div class="codex-grid">${card(`${CODEX}${lulu.slug}.html`, 'lulu-starter', lulu.title, 'ルル → 守り手ルル')}</div>
      <h2>契約者（★★★★）</h2>
      <p>人の仲間。姿は一つで、ほかにない特性をもつ。</p>
      <div class="codex-grid">${CONTRACTORS && Object.keys(CONTRACTORS.forms).map(id => card(`${CODEX}${CONTRACTORS.slug}.html#${id}`, id, FORM[id].name, '契約者')).join('')}</div>
      <h2>魔物級（★★★）</h2>
      <p>召喚でいちばんよく現れる神話生物。必殺技のあとに働く特性をもつ。</p>
      <div class="codex-grid">${group(3)}</div>
      <h2>神格級（★★★★）</h2>
      <p>時・月・運命・星・王座・封じられた書を司る神話生物。特性がめずらしい時に働く。</p>
      <div class="codex-grid">${group(4)}</div>
      <h2>名なき王（★★★★★）</h2>
      <div class="codex-grid">${group(5)}</div>
      <h2>召喚で現れる割合</h2>
      <table><tbody>
        <tr><th scope="row">★★★★★</th><td>${Math.round(DATA.RATES[5] * 100)}%</td></tr>
        <tr><th scope="row">★★★★</th><td>${Math.round(DATA.RATES[4] * 100)}%</td></tr>
        <tr><th scope="row">★★★</th><td>${Math.round(DATA.RATES[3] * 100)}%</td></tr>
      </tbody></table>
      <p>召喚で現れるのは、いつも最初の姿（幼体）。成体には育てて進化させる。</p>
      <h2>このほかの仲間</h2>
      <p>物語・トレーニング・レイドで出会う仲間もいる。ここでは名前だけを載せる。</p>
      <ul>
        <li>物語：${others('045', '050')}</li>
        <li>トレーニング：${others('051', '052')}</li>
        <li>レイドの褒賞：${others('053', '057')}</li>
      </ul>`;
writeFileSync(new URL(`.${CODEX}index.html`, ROOT), page({
  path: CODEX, title: 'モンスター図鑑｜モンスタータイピング',
  description: 'モンスタータイピングの仲間の図鑑。神話生物19系統と契約者4人の必殺技・特性・型・体高・入手方法を、系統ごとに幼体と成体を並べて紹介。',
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
  description: 'モンスタータイピングの世界の設定資料。契約者と神話生物、魔晶、鍛冶屋、位階の碑、レイドのしくみと、契約者4人の紹介、用語集。',
  h1: '設定資料', subtitle: 'モンスタータイピングの世界と言葉',
  crumbs: [['ホーム', '/ja/'], ['モンスタータイピング', GAME_PAGE], ['設定資料']],
  body: WORLD({ CODEX, FORM, DATA, esc }),
  ld: { '@context': 'https://schema.org', '@type': 'WebPage', name: '設定資料｜モンスタータイピング', url: SITE + WORLD_URL, inLanguage: 'ja', about: GAME_LD }
}));
console.log(`${pages.length} codex pages, the list and the world page`);
