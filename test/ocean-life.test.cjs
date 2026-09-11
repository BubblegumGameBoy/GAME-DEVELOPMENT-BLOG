const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
function fixture({reduce = false} = {}) {
  const events = {}, pending = new Map(), classes = new Set();
  let next = 0, observerCallback, draws = 0;
  const whale = {style:{}};
  const encounter = {clientWidth:1200, style:{setProperty(){}}, classList:{toggle(name,on){on ? classes.add(name) : classes.delete(name)}},
    querySelector(selector){return selector === '.whale-traveller' ? whale : water}, getBoundingClientRect(){return {top:200-context.scrollY,height:2200}}};
  const ctx = new Proxy({}, {get(){return () => {draws++}}});
  const canvas = {getContext(){return ctx}};
  const water = {getContext(){return ctx}};
  const scene = {clientWidth:1200, querySelector(){return canvas}};
  const document = {hidden:false, body:{classList:{contains(){return false}}}, getElementById(){return encounter},
    querySelectorAll(){return [scene]},addEventListener(name,fn){events[name]=fn}};
  const media = {matches:reduce, addEventListener(name,fn){events.reduced=fn}};
  const context = {document, innerWidth:1200,innerHeight:900,devicePixelRatio:2,scrollY:0,
    matchMedia(){return media},requestAnimationFrame(fn){pending.set(++next,fn);return next},cancelAnimationFrame(id){pending.delete(id)},
    IntersectionObserver:class{constructor(fn){observerCallback=fn}observe(){}},window:{addEventListener(name,fn){events[name]=fn}}};
  context.window.IntersectionObserver=context.IntersectionObserver;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../ocean-life.js'),'utf8'), context);
  return {document,media,whale,classes,pending,canvas,draws:()=>draws,
    visible(on){observerCallback([{target:scene,isIntersecting:on},{target:encounter,isIntersecting:on}])},
    scroll(y){context.scrollY=y},
    step(time){const [id,fn]=pending.entries().next().value;pending.delete(id);fn(time)},
    pause(on){events['site-motion-change']({detail:{paused:on}})},hidden(on){document.hidden=on;events.visibilitychange()}};
}
test('sea life runs only on visible sections and stops scheduling when paused', () => {
  const p=fixture();assert.equal(p.pending.size,0);p.visible(true);assert.equal(p.pending.size,1);
  p.step(100);assert.match(p.whale.style.transform,/translate3d/);
  const transform=p.whale.style.transform;p.pause(true);assert.equal(p.pending.size,0);assert.ok(p.classes.has('sea-life-stopped'));
  assert.equal(p.whale.style.transform,transform);p.pause(false);assert.equal(p.pending.size,1);
  p.visible(false);assert.equal(p.pending.size,0);
});
test('background tabs stop the animation and reduced motion never starts it', () => {
  const p=fixture();p.visible(true);p.hidden(true);assert.equal(p.pending.size,0);p.hidden(false);assert.equal(p.pending.size,1);
  const quiet=fixture({reduce:true});quiet.visible(true);assert.equal(quiet.pending.size,0);assert.equal(quiet.whale.style.transform,'none');
});
test('drawing is capped at 30 fps and canvas resolution is bounded', () => {
  const p=fixture();assert.equal(p.canvas.width,1800);p.visible(true);p.step(100);const first=p.draws();
  p.step(116);assert.equal(p.draws(),first);p.step(134);assert.ok(p.draws()>first);
});
test('the whale approaches from a faint distant shape to a clear oversized close pass', () => {
  const p=fixture();p.visible(true);p.step(100);
  const far=Number(p.whale.style.transform.match(/scale\(([\d.]+)\)/)[1]);
  const farOpacity=Number(p.whale.style.opacity);
  assert.ok(far<.4);assert.ok(farOpacity<.3);
  p.scroll(1550);
  for(let i=1;i<=60;i++)p.step(100+i*34);
  const near=Number(p.whale.style.transform.match(/scale\(([\d.]+)\)/)[1]);
  assert.ok(near>3);assert.ok(near/far>10);assert.ok(Number(p.whale.style.opacity)>.95);
  assert.match(p.whale.style.filter,/blur\(0\.0\dpx\)/);
  p.scroll(0);
  for(let i=61;i<=120;i++)p.step(100+i*34);
  assert.ok(Number(p.whale.style.transform.match(/scale\(([\d.]+)\)/)[1])<.4);
});
