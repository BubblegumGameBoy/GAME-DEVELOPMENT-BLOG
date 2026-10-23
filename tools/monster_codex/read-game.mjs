// Reads the Monster Typing codex out of the game's own code into data.json, so the site shows the game's numbers.
// Run from anywhere: node tools/monster_codex/read-game.mjs (the game repository sits at G below).
const G='file:///C:/Users/Kazuya/Documents/ゲーム開発/mythling-typers-shared/src/';
const {LINES,CODEX,form,traitOf,classOf,describe,thumbArt}=await import(G+'roster.mjs');
const {BESTIARY}=await import(G+'bestiary.mjs');
const {moveOf}=await import(G+'moves.mjs');
const {SPECIAL_TYPES}=await import(G+'core.mjs');
const {STYLES,specialLine}=await import(G+'texts.mjs');
const {INITIAL_STATS}=await import(G+'initial-stats.mjs');
const {RATES}=await import(G+'summon.mjs');
const {EVOLVE_LEVEL,EVOLVE_BONDS,LULU_LEVEL}=await import(G+'evolution.mjs');
const keep=['lulu','marsh-alchemist','moon-medium','foxfire-envoy','vampire-scout','riftclock','lanternroot','needlechoir','tidebell','pyrecoil','moonveil','stormquill','inkcrown','dusk-archive-moth','seal-eater-archive','cinderhorn','moonspore-idol','tideglass','vesper-oracle','nullfin-angler','duskwood-strider','moss-reliquary','abyssal-shellback','unwritten-sovereign'];
const out=[];
CODEX.forEach((e,i)=>{ if(!keep.includes(e.line))return;
  const f=form(e.id),s=BESTIARY[e.id],m=moveOf(e.id),sp=SPECIAL_TYPES[m.special],st=STYLES[m.special]||STYLES.burst,t=traitOf(e.id);
  out.push({no:String(i+1).padStart(3,'0'),id:e.id,line:e.line,rarity:e.rarity,cls:classOf(e.line),name:f.name,title:f.title,desc:describe(e.id),height:s.heightCm,
    style:st.name,styleLine:st.line,skill:f.skill,skillText:specialLine(sp),trait:t?.name,traitText:t?.text,speed:f.speed,human:!!f.human,thumb:thumbArt(e.id),
    forms:LINES[e.line].forms,stats:INITIAL_STATS[e.id],attackNote:s.attackNote});
});
// The rest of the game's bestiary (story, training and raid companions): names only on the list page.
const others=CODEX.filter(e=>!keep.includes(e.line)).map(e=>({no:String(CODEX.indexOf(e)+1).padStart(3,'0'),id:e.id,line:e.line,name:form(e.id).name}));
const {writeFileSync}=await import('node:fs');
writeFileSync(new URL('./data.json',import.meta.url),JSON.stringify({read:new Date().toISOString().slice(0,10),RATES,EVOLVE_LEVEL,EVOLVE_BONDS,LULU_LEVEL,out,others},null,1)+'\n');
