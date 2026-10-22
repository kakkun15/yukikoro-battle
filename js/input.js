'use strict';
// ---------------------------------------------------------------- input
const keys={};
function pressA(){inp.a++;inp.ca++;}
function pressB(){inp.b++;inp.cb++;}
function readKeys(){
  let mx=0,my=0;
  if(keys.ArrowLeft||keys.KeyA)mx-=1;if(keys.ArrowRight||keys.KeyD)mx+=1;if(keys.ArrowUp||keys.KeyW)my-=1;if(keys.ArrowDown||keys.KeyS)my+=1;
  inp.mx=mx;inp.my=my;
}
const DEFK={a:['KeyX','KeyF'],b:['Space','KeyE','Enter']};
const MOVE=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyW','KeyA','KeyS','KeyD'];
let KEYS={a:DEFK.a.slice(),b:DEFK.b.slice()},rebind=null,rebindTimer=0,flashKey='',setOpen=false;
try{const k=JSON.parse(localStorage.getItem('yk-keys'));if(k&&Array.isArray(k.a)&&Array.isArray(k.b)&&k.a.length&&k.b.length)KEYS={a:k.a.slice(0,3).map(String),b:k.b.slice(0,3).map(String)};}catch(_){}
function keyName(c){
  let m;
  if((m=/^Key(.)$/.exec(c)))return m[1];
  if((m=/^Digit(.)$/.exec(c)))return m[1];
  if((m=/^Numpad(.+)$/.exec(c)))return'テンキー'+m[1];
  if((m=/^(Shift|Control|Alt|Meta)(Left|Right)$/.exec(c)))return(m[2]==='Left'?'左':'右')+({Shift:'Shift',Control:'Ctrl',Alt:'Alt',Meta:'Win'})[m[1]];
  return c;
}
function kbd(t,cls){const k=document.createElement('kbd');k.textContent=t;if(cls)k.className=cls;return k;}
function renderKeys(){
  $('qk-a').textContent=keyName(KEYS.a[0]);$('qk-b').textContent=keyName(KEYS.b[0]);
  for(const act of['a','b']){
    const box=$('ksk-'+act),btn=$('rb-'+act),g=$('gk-'+act),mouse=act==='a'?'左クリック':'右クリック';
    $('ks-'+act).classList.toggle('listen',rebind===act);box.textContent='';
    if(rebind===act){const sp=document.createElement('span');sp.className='listen-box';sp.textContent='使いたいキーを押してね（Escでやめる）';box.append(sp);btn.textContent='やめる';}
    else{for(const k of KEYS[act])box.append(kbd(keyName(k),flashKey===act+k?'new':''));box.append(kbd(mouse));btn.textContent='変える';}
    g.textContent='';for(const k of KEYS[act])g.append(kbd(keyName(k)));g.append(kbd(mouse));if(isTouch)g.append(kbd(act==='a'?'手ボタン':'道具ボタン'));
  }
}
function saveKeys(){try{localStorage.setItem('yk-keys',JSON.stringify(KEYS));}catch(_){}}
function setRebind(act){
  rebind=act;clearTimeout(rebindTimer);
  if(act){$('keymsg').textContent='';rebindTimer=setTimeout(()=>{if(rebind){rebind=null;$('keymsg').textContent='時間切れ。もう一度「変える」を押してね。';renderKeys();}},10000);}
  renderKeys();
}
function aimStart(src){if(!inp.aim){inp.aim=true;aimBy=src;}}
function aimEnd(src,fire){if(!inp.aim||(src&&aimBy!==src))return;inp.aim=false;aimBy=null;if(fire)pressB();}
$('rb-a').onclick=()=>setRebind(rebind==='a'?null:'a');
$('rb-b').onclick=()=>setRebind(rebind==='b'?null:'b');
$('rb-reset').onclick=()=>{KEYS={a:DEFK.a.slice(),b:DEFK.b.slice()};flashKey='';saveKeys();setRebind(null);$('keymsg').textContent='初期設定（手：X・F、道具：Space・E・Enter）にもどしたよ。';};
function openSettings(toKeys){
  $('settings').hidden=false;setOpen=true;for(const k in keys)keys[k]=false;readKeys();aimEnd(null,false);
  try{(toKeys?$('ks-a'):$('settings').querySelector('.sheet')).focus({preventScroll:true});}catch(_){}
}
function closeSettings(){$('settings').hidden=true;setOpen=false;setRebind(null);try{$('open-set').focus();}catch(_){}}
$('open-set').onclick=()=>openSettings(false);
$('open-keys').onclick=()=>openSettings(true);
$('set-close').onclick=closeSettings;
$('settings').addEventListener('pointerdown',e=>{if(e.target===$('settings'))closeSettings();else if(rebind&&!e.target.closest('#ks-'+rebind))setRebind(null);});
(()=>{
  const add=(sel,list)=>{for(const[v,t]of list){const o=document.createElement('option');o.value=v;o.textContent=t;sel.append(o);}};
  const songs=SONG_ORDER.map(k=>[k,SONGS[k].n+(SONGS[k].battle?'':'（ゆったり）')]);
  add($('bgm-battle'),[['auto','おまかせ（試合ごとに変わる）'],...songs,['off','なし']]);
  add($('bgm-menu'),[['auto','おまかせ（雪の宿・きよしこの夜）'],...songs,['off','なし']]);
  add($('theme'),[['now','いまの時間に合わせる'],['rand','試合ごとにランダム'],['day','昼'],['eve','夕方'],['night','夜']]);
  $('bgm-battle').value=bgmBattle;$('bgm-menu').value=bgmMenu;$('theme').value=themeSel;
  $('bgm-battle').onchange=e=>{bgmBattle=e.target.value;try{localStorage.setItem('yk-bgm',bgmBattle);}catch(_){}audioUnlock();if(bgmBattle==='auto')matchSong=pickBattle();musUpdate();};
  $('bgm-menu').onchange=e=>{bgmMenu=e.target.value;try{localStorage.setItem('yk-bgm-menu',bgmMenu);}catch(_){}audioUnlock();musUpdate();};
  $('theme').onchange=e=>{themeSel=e.target.value;try{localStorage.setItem('yk-theme',themeSel);}catch(_){}curTheme='';applyTheme(resolveTheme(true));};
})();
window.addEventListener('keydown',e=>{
  if(rebind){
    if(e.code==='Tab')return;
    e.preventDefault();
    if(e.code==='Escape'){setRebind(null);return;}
    if(MOVE.includes(e.code)){$('keymsg').textContent='移動に使うキー（矢印・WASD）は選べないよ。ほかのキーを押してね。';return;}
    const act=rebind,other=act==='a'?'b':'a';
    KEYS[act]=[e.code];KEYS[other]=KEYS[other].filter(k=>k!==e.code);if(!KEYS[other].length)KEYS[other]=DEFK[other].filter(k=>k!==e.code);
    flashKey=act+e.code;saveKeys();
    setRebind(null);$('keymsg').textContent='「'+(act==='a'?'手':'道具')+'」を '+keyName(e.code)+' にしたよ。';
    return;
  }
  if(setOpen){if(e.code==='Escape'){e.preventDefault();closeSettings();}return;}
  const tg=e.target&&e.target.tagName;if(tg==='INPUT'||tg==='TEXTAREA'||tg==='SELECT')return;
  if(scene!=='game'&&scene!=='ending')return;
  const isA=KEYS.a.includes(e.code),isB=KEYS.b.includes(e.code);
  if(isA||isB||MOVE.includes(e.code))e.preventDefault();
  if(e.repeat)return;
  keys[e.code]=true;readKeys();
  if(isA)pressA();
  if(isB)aimStart(e.code);
});
window.addEventListener('keyup',e=>{keys[e.code]=false;readKeys();aimEnd(e.code,scene==='game'&&!setOpen);});
window.addEventListener('pagehide',()=>{try{if(peer)peer.destroy();}catch(_){}});
window.addEventListener('blur',()=>{for(const k in keys)keys[k]=false;readKeys();aimEnd(null,false);});
// mouse: left = hand, right = item (hold to aim)
cv.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='mouse'||scene!=='game')return;
  if(e.button===0)pressA();else if(e.button===2)aimStart('mouse');
});
window.addEventListener('pointerup',e=>{if(e.pointerType==='mouse'&&e.button===2)aimEnd('mouse',scene==='game');});
cv.addEventListener('contextmenu',e=>{if(scene==='game'||scene==='ending')e.preventDefault();});
// touch
if(isTouch){
  $('touch').hidden=false;
  const st=$('stick'),kn=$('knob');let pid=null;
  const mv=e=>{const r=st.getBoundingClientRect();let x=(e.clientX-r.left-r.width/2)/(r.width/2),y=(e.clientY-r.top-r.height/2)/(r.height/2);const l=Math.hypot(x,y);if(l>1){x/=l;y/=l;}inp.mx=l<0.2?0:x;inp.my=l<0.2?0:y;kn.style.transform='translate('+x*44+'px,'+y*44+'px)';};
  const end=()=>{pid=null;inp.mx=inp.my=0;kn.style.transform='';};
  st.addEventListener('pointerdown',e=>{pid=e.pointerId;try{st.setPointerCapture(pid);}catch(_){}mv(e);e.preventDefault();});
  st.addEventListener('pointermove',e=>{if(e.pointerId===pid)mv(e);});
  st.addEventListener('pointerup',end);st.addEventListener('pointercancel',end);
  $('t-a').addEventListener('pointerdown',e=>{pressA();e.preventDefault();});
  const tb=$('t-b');
  tb.addEventListener('pointerdown',e=>{try{tb.setPointerCapture(e.pointerId);}catch(_){}aimStart('touch');e.preventDefault();});
  tb.addEventListener('pointerup',()=>aimEnd('touch',scene==='game'));
  tb.addEventListener('pointercancel',()=>aimEnd('touch',false));
  tb.addEventListener('contextmenu',e=>e.preventDefault());
}

