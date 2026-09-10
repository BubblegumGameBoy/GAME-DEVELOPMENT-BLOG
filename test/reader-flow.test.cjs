const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {checkInput}=require('../typing-warmup.js');
test('typing accepts a correct prefix and normalizes capitals',()=>{
 assert.equal(checkInput('HA','hana','h').value,'ha');
 assert.equal(checkInput('HANA','hana','han').complete,true);
});
test('typing mistakes preserve entered progress and explain the next letter',()=>{
 const result=checkInput('hax','hana','ha');assert.equal(result.value,'ha');assert.equal(result.complete,false);assert.match(result.message,/N/);
});
test('typing permits backspace and rejects IME input',()=>{
 assert.equal(checkInput('h','hana','ha').value,'h');
 assert.equal(checkInput('は','hana','h').value,'h');
 assert.match(checkInput('は','hana','h').message,/IME/);
});
function fixture(){
 const listeners={},nodes={},writes=[];
 function node(){const events={},classes=new Set();return {hidden:true,disabled:true,dataset:{gameSrc:'https://example.com/game?lang=en'},classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),contains:c=>classes.has(c)},addEventListener:(name,fn)=>events[name]=fn,click(){events.click?.()},focus(){this.focused=true},events,set src(value){writes.push(value)},get src(){return writes.at(-1)}};}
 for(const name of ['game-frame','game-launch','game-start','fs-btn','game-close','game-status'])nodes[name]=node();
 nodes['game-frame'].parentElement=node();nodes['game-frame'].parentElement.style={};nodes['game-frame'].parentElement.dataset.playHeight='680px';
 nodes['game-launch'].hidden=false;
 const body=node(),history={state:null,backs:0,pushState(state){this.state=state},back(){this.backs++;this.state=null;listeners.popstate?.()}};
 const document={body,getElementById:id=>nodes[id],addEventListener:(name,fn)=>listeners[name]=fn};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../game-page.js'),'utf8'),{document,history,window:{addEventListener:(name,fn)=>listeners[name]=fn}});
 return {nodes,writes,body,history,listeners};
}
test('reading the guide does not load a game and repeated Play loads it once',()=>{
 const p=fixture();assert.equal(p.writes.length,0);assert.equal(p.nodes['game-start'].disabled,false);
 p.nodes['game-start'].click();p.nodes['game-start'].click();assert.deepEqual(p.writes,['https://example.com/game?lang=en']);assert.equal(p.nodes['game-launch'].hidden,true);assert.equal(p.nodes['game-frame'].parentElement.style.height,'680px');assert.equal(p.nodes['game-frame'].parentElement.classList.contains('game-started'),true);
});
test('fullscreen provides a visible exit and preserves the running game on exit/reentry',()=>{
 const p=fixture();p.nodes['fs-btn'].click();assert.equal(p.nodes['game-close'].hidden,false);assert.equal(p.nodes['game-frame'].classList.contains('fs-on'),true);
 p.nodes['game-close'].click();assert.equal(p.nodes['game-close'].hidden,true);assert.equal(p.body.classList.contains('fs-lock'),false);assert.equal(p.history.backs,1);
 p.nodes['fs-btn'].click();assert.equal(p.writes.length,1);
});
test('browser Back removes fullscreen and returns keyboard focus',()=>{
 const p=fixture();p.nodes['fs-btn'].click();p.listeners.popstate();assert.equal(p.nodes['game-frame'].classList.contains('fs-on'),false);assert.equal(p.nodes['fs-btn'].focused,true);
});
test('a frame load is not falsely described as game asset readiness',()=>{
 const p=fixture();p.nodes['game-start'].click();p.nodes['game-frame'].events.load();assert.match(p.nodes['game-status'].textContent,/may still be loading/);
});
