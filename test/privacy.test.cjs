const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../privacy-controls.js'),'utf8');
function page(status){
 const scripts=[],button={hidden:true,addEventListener(type,fn){this.click=fn}};
 const states=Object.fromEntries(['UNKNOWN','GRANTED','DENIED','NOT_APPLICABLE','NOT_CONFIGURED'].map((k,i)=>['CONSENT_MODE_PURPOSE_STATUS_'+k,i]));
 const window={googlefc:{ConsentModePurposeStatusEnum:states,callbackQueue:[],getGoogleConsentModeValues:()=>({analyticsStoragePurposeConsentStatus:states['CONSENT_MODE_PURPOSE_STATUS_'+status]})}};
 vm.runInNewContext(source,{window,document:{readyState:'complete',querySelectorAll:()=>[button],createElement:()=>({}),head:{appendChild:s=>scripts.push(s)}}});
 return {window,scripts,button,ready:()=>window.googlefc.callbackQueue[0].CONSENT_MODE_DATA_READY()};
}
test('Analytics stays unloaded until consent data arrives',()=>assert.equal(page('GRANTED').scripts.length,0));
test('denied, unknown and unconfigured consent do not load Analytics',()=>{for(const s of ['DENIED','UNKNOWN','NOT_CONFIGURED']){const p=page(s);p.ready();assert.equal(p.scripts.length,0,s)}});
test('granted or inapplicable consent loads Analytics only once',()=>{for(const s of ['GRANTED','NOT_APPLICABLE']){const p=page(s);p.ready();p.ready();assert.equal(p.scripts.length,1);assert.match(p.scripts[0].src,/G-17WNKDX3ZB/)}});
test('privacy button queues the official revocation action',()=>{const p=page('GRANTED');let revoked=false;p.window.googlefc.showRevocationMessage=()=>revoked=true;p.button.click();p.window.googlefc.callbackQueue[1]();assert.equal(revoked,true)});
