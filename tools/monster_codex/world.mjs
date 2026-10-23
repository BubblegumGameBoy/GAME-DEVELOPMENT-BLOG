// The world page (2026-10-23, the maker: 画像や世界地図を紹介するだけでそれっぽくなる。ゲームの設定画面じゃない).
// A picture book of the world: the map, each region with the game's own art and who lives there, and the people of
// the story. No game rules here (raid, forge, rank): those are the game's to show. Story facts come from
// docs/story-mode/script-v6.md only, and stop before its turns. Pictures: tools/monster_codex/world_images.py.
const PIC = name => `/images/monster-typing/world/${name}.webp`;

// The regions, numbered as on the map. lines: codex slugs of the creatures that live there (tools/monster_codex/lore.mjs).
const REGIONS = [
  { name: '海霧の離島', pic: 'harbor-town', caption: '港町の市場', lines: ['lanternroot', 'inkcrown'],
    text: '一年の半分以上、海霧がかかる島です。港町の石畳には朝から屋台が並び、町の外に広がる首輪の森では、木々のあいだに緑の灯がともります。' },
  { name: '牙の島', pic: 'fang-island', caption: '牙の闘技場', lines: [],
    text: '港町の南の沖に、牙のような岩山がそびえる島があります。首輪から逃げてきた魔物と人間がいっしょに暮らす島で、すり鉢の形の闘技場では牙闘祭が開かれます。勝ち残った者は、島の主に願いを一つ出せます。' },
  { name: '大陸西部の森林', pic: 'west-forest', caption: '巨樹の神殿', lines: ['moonspore-idol', 'duskwood-strider'],
    text: '巨樹が何重にも枝を広げる森です。奥には巨樹の神殿があり、霧の深い谷では、骨の仮面をつけた獣が灯をともして駆けていきます。' },
  { name: '大陸中央の平原', pic: 'central-plain', caption: '古代の城塞', lines: ['stormquill', 'nullfin-angler', 'moss-reliquary'],
    text: '川がいく筋も流れる広い平原で、真ん中に古代の城塞が残っています。夏には一日に何百回も雷が落ち、深い湖の底には金色の灯が沈んでいます。' },
  { name: '南の砂漠', pic: null, caption: '', lines: ['needlechoir'],
    text: '赤い岩の谷が続く砂漠です。雨は年に3回ほどしか降らず、雨の夜にだけ、砂の下で眠っていた虫たちがいっせいに顔を出します。' },
  { name: '南海の群島', pic: 'south-sea', caption: '海上要塞', lines: ['tidebell', 'tideglass', 'abyssal-shellback'],
    text: '小さな島が散らばる南の海で、沖には海上要塞が建っています。浅い干潟と、陸の見えない外海と、沈んだ港の眠る海の底とでは、すんでいるものがまるで違います。' },
  { name: '北東の雪山', pic: 'snow-mountains', caption: '氷峰の塔', lines: ['riftclock', 'pyrecoil'],
    text: '氷の峰が連なる雪山で、尾根には氷峰の塔が立っています。山の中ほどには赤い火口があり、雪と溶岩がすぐ隣り合っています。' },
  { name: '北の浮島', pic: 'floating-isles', caption: '雲の上の島', lines: ['moonveil', 'dusk-archive-moth', 'vesper-oracle'],
    text: '雲の上に浮かぶ島々です。冬は夜がとても長く、崩れかけた崖の縁には、新月の夜になると雲の下から強い風が吹き上がります。' },
  { name: '南東の島国', pic: 'southeast-isles', caption: '海を望む岬', lines: ['cinderhorn', 'unwritten-sovereign'],
    text: '大陸の南東に浮かぶ島国です。年に一度、50日続く大雨の季節があり、沖には光の届かない深い海が口を開けています。' }
];

// The people of the story, as the script first shows them.
const PEOPLE = [
  ['volk', '魔王ヴォルク', '北の城の玉座で、勇者たちを待っていた魔王です。'],
  ['garo', '渡し守ガロ', '霧の海を小舟で渡る渡し守です。舟の底にはいつも水がたまっていて、片手で櫂をこぎながら、足で桶を寄せてかき出します。'],
  ['garmund', '牙王ガルムンド', '牙の島の主です。片目の大猪で、折れた牙の根もとに金の輪がはまっています。'],
  ['beni', '鬼のベニ', '鉄の棍棒を担ぐ鬼の闘士です。勝ちたい気持ちは本物で、試合でも手を抜きません。'],
  ['godon', '岩喰らいのゴドン', '牙闘祭に出る、岩の獣の闘士です。口数は少なく、言うことはまっすぐです。'],
  ['migi-hidari', '霜炎の双蛇', '氷と炎、二つの頭を持つ蛇です。左右の頭は、百年同じ喧嘩を続けています。'],
  ['sera', '騎士セラ', '王国に仕える騎士です。命令には短く、敬語で答えます。'],
  ['eda', '宮廷術師長エダ', '王国の宮廷術師長です。部下にも丁寧な言葉で話します。']
];

export function WORLD({ CODEX, LORE }) {
  const lineName = slug => LORE.find(l => l.slug === slug).line;
  const region = (r, i) => `      <section class="world-region" id="region-${i + 1}">
        <h3><span class="world-no">${i + 1}</span>${r.name}</h3>
${r.pic ? `        <figure class="world-scene"><img src="${PIC(r.pic)}" alt="${r.caption}" width="560" height="315" loading="lazy"><figcaption>${r.caption}</figcaption></figure>\n` : ''}        <p>${r.text}</p>
${r.lines.length ? `        <p class="world-lives">ここにすむ仲間：${r.lines.map(slug => `<a href="${CODEX}${slug}.html">${lineName(slug)}系</a>`).join('・')}</p>\n` : ''}      </section>`;
  return `      <figure class="world-scene world-key"><img src="${PIC('key-visual')}" alt="月夜の浜辺で子を抱く勇者シオ" width="560" height="315"><figcaption>勇者シオ</figcaption></figure>
      <p>物語は、王国が勇者シオ・レイ・ミナの三人を北へ送り出すところから始まります。人の王国と魔物の地は百年にわたって争っていて、北の城にいる魔王ヴォルクを討てばその戦が終わる、と三人は告げられていました。</p>
      <p>このページでは、その世界の地図と、地方ごとの景色、そこにすむ仲間、物語に出てくる人たちを紹介します。物語の筋には触れていません。</p>
      <h2>世界地図</h2>
      <figure class="world-scene"><img src="${PIC('world-map')}" alt="世界地図。9つの地方に番号" width="900" height="600"><figcaption>番号は下の地方の紹介と同じです</figcaption></figure>
      <h2>地方とそこにすむもの</h2>
${REGIONS.map(region).join('\n')}
      <h2>物語の舞台</h2>
      <figure class="world-scene"><img src="${PIC('hero-monument')}" alt="港町の広場に立つ三人の勇者の石像" width="560" height="315" loading="lazy"><figcaption>港町の広場の、三勇士の像</figcaption></figure>
      <p>港町の広場には、魔王を討ちに出た三人の勇者の像が建てられています。旅立ちのころから作られていた像で、帰ってきたら式が開かれるはずでした。</p>
      <figure class="world-scene"><img src="${PIC('demon-castle')}" alt="黒い柱が並ぶ魔王の城の玉座の間" width="560" height="315" loading="lazy"><figcaption>魔王の城、玉座の間</figcaption></figure>
      <p>魔王の城は北の海辺に建っています。外では氷まじりの雨が降っていても、最奥の玉座の間だけはなぜか暖かいのだそうです。</p>
      <p>王国は、鉄の首輪で魔物を従わせています。首輪には術が刻まれていて、はめられた魔物は痛みで命令に逆らえません。けれど物語に出てくる魔物たちは言葉を話し、祭りをして、掟を守って暮らしています。</p>
      <h2>物語に出てくる人たち</h2>
      <div class="world-people">
${PEOPLE.map(([pic, name, text]) => `        <div class="world-person"><img src="${PIC(pic)}" alt="${name}" width="160" height="160" loading="lazy"><b>${name}</b><p>${text}</p></div>`).join('\n')}
      </div>
      <p>この先、勇者たちがどうなるのかは、ゲームの物語モードで確かめてください。仲間になる生き物は<a href="${CODEX}">モンスター図鑑</a>に、ゲームの遊び方は<a href="/ja/games/monster-typing.html">ゲームの紹介ページ</a>にまとめています。</p>
      <h2>制作の話</h2>
      <p>このゲームを作ったきっかけや、オンライン対戦を入れた理由は、ブログの<a href="https://babblegum.hatenablog.com/entry/2026/10/05/142948">制作記</a>に書きました。</p>`;
}
