'use strict';
// ---------------------------------------------------------------- UI and rooms
const panels=['p-title','p-lobby','p-result'];
function show(id){for(const p of panels)$(p).hidden=p!==id;}
function setMsg(t){$('msg').textContent=t||'';}
function getName(){let n=$('name').value.trim().slice(0,8);if(!n)n='プレイヤー';try{localStorage.setItem('yk-name',n);}catch(_){}return n;}
function chipText(){const el=$('roomchip');if(online&&roomCode){el.hidden=false;el.textContent='部屋 '+roomCode;}else el.hidden=true;}
function rebuildRoster(){
  const humans=roster.filter(r=>!r.bot);
  botCount=clamp(botCount,humans.length>=2?0:1,6-humans.length);
  if(curTeam){const tot=humans.length+botCount;botCount=(tot<=4?4:6)-humans.length;}
  roster=humans.slice();
  for(let i=0;i<botCount;i++)roster.push({name:BOTN[i],bot:true,conn:null,la:0,lb:0});
  roster.forEach((r,i)=>r.color=i);
}
function listOf(){return teamList(roster.map(r=>({name:r.name,color:r.color,bot:r.bot})),curTeam);}
function renderModes(){
  for(const m of[0,1]){const b=$('m-l'+m);b.setAttribute('aria-checked',String(curMode===m));b.disabled=!isHostUi;}
  $('ski-l').value=String(curSki);$('ski-l').disabled=!isHostUi;
  $('lv-l').value=String(curLv);$('lv-l').disabled=!isHostUi;
  $('team-l').value=String(curTeam);$('team-l').disabled=!isHostUi;
  $('m-l0').querySelector('small').innerHTML=curTeam?'その場で育てて<br>チーム合計で勝負':'その場で育てて<br>100%で勝ち';
  $('m-l1').querySelector('small').innerHTML=curTeam?'頂上まで運んで<br>チーム合計で勝負':'頂上まで運んで<br>合計100%で勝ち';
  for(const b of $('pre-chips').children)b.setAttribute('aria-pressed',String(+b.dataset.k===myPre));
}
function setMode(m){
  if(m===curMode||!isHostUi)return;
  curMode=m;try{localStorage.setItem('yk-mode',String(m));}catch(_){}
  renderModes();if(role==='demo')startDemo();
  if(scene==='lobby'&&online)broadcastLobby();
}
function renderLobby(list,you,host){
  const ul=$('members');ul.textContent='';
  const teams=list.some(r=>r.team>=0);ul.classList.toggle('teams',teams);
  // team match: red team in the left column, blue team in the right (the list already alternates red, blue, red, ...)
  if(teams)for(const t of[0,1]){const li=document.createElement('li');li.className='th';li.style.background=TCOL[t].m;li.textContent=TEAMN[t];ul.append(li);}
  list.forEach((r,i)=>{
    const li=document.createElement('li'),sw=document.createElement('span'),nm=document.createElement('span');
    sw.className='sw';sw.style.background=COL[r.color].m;nm.className='nm';
    if(teams)li.style.borderColor=TCOL[r.team].m;
    nm.textContent=r.name+(r.bot?'（ボット）':i===you?'（あなた）':i===0?'（ホスト）':'');
    li.append(sw,nm);ul.append(li);
  });
  $('codebox').hidden=!roomCode;$('lobbytitle').hidden=!!roomCode;
  $('lobbycode').textContent=roomCode||'----';
  $('b-botm').hidden=$('b-botp').hidden=!host;$('b-start').hidden=!host;
  $('botn').textContent=String(list.filter(r=>r.bot).length);
  $('lobbynote').textContent=!host?'ホストが始めるのを待っています。':roomCode?'コードを伝えて、そろったら「はじめる」。最大6人。':'ボットの数と強さを決めて「はじめる」。';
  renderModes();
}
function broadcastLobby(){
  rebuildRoster();const list=listOf();
  roster.forEach((r,i)=>{if(r.conn&&r.conn.open)r.conn.send({t:'lobby',list,you:i,code:roomCode,mode:curMode,ski:curSki,lv:curLv,team:curTeam});});
  renderLobby(list,0,true);
}
function openLobby(){scene='lobby';isHostUi=true;show('p-lobby');chipText();broadcastLobby();}
function beginHostGame(){
  rebuildRoster();const list=listOf();
  roster.forEach(r=>{r.la=r.lb=0;});
  if(roster[0]&&!roster[0].bot)roster[0].pre=myPre;
  G=newGame(list,curMode,curSki,curLv,curTeam);V=G;matchSong=pickBattle();role='host';me=0;scene='game';acc=0;evOut=[];parts=[];pops=[];lines=[];banners=[];bolts=[];floats=[];says={};
  inp.a=inp.b=0;applyTheme(resolveTheme(true));
  roster.forEach((r,i)=>G.ev.push({e:'say',id:i,set:'pre',k:r.bot?(Math.random()*4)|0:(r.pre|0)}));
  roster.forEach((r,i)=>{if(r.conn&&r.conn.open)r.conn.send({t:'start',list,you:i,mode:curMode,team:curTeam});});
  show(null);banner(startMsg(curMode,curTeam,list.length),2.6);if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
}
function startMsg(m,t,n){return t?'チームの合計で'+tGoal(n)+'%をめざせ！':m===1?'育てて、頂上の旗まで運べ！':'雪玉を100%まで育てろ！';}
function sayLine(set,k){
  if(role==='host'){const e={e:'say',id:me,set,k};fx(e);if(online)evOut.push(e);}
  else if(role==='client'&&hostConn&&hostConn.open)hostConn.send({t:'say',k});
}
function showResult(){
  scene='result';
  const P=V.players.slice().sort((a,b)=>a.rank-b.rank),ol=$('res-list');ol.textContent='';
  const row=(col,txt,pct,cls)=>{const li=document.createElement('li'),sw=document.createElement('span'),nm=document.createElement('span'),pc=document.createElement('span');
    if(cls)li.className=cls;sw.className='sw';sw.style.background=col;nm.textContent=txt;pc.className='pc';pc.textContent=Math.floor(pct)+'%';li.append(sw,nm,pc);ol.append(li);};
  const val=p=>V.mode===1?p.score:p.size,mp=V.players[me];
  if(V.team){
    for(const t of[V.wteam,1-V.wteam]){
      row(TCOL[t].m,(t===V.wteam?'勝ち  ':'')+TEAMN[t]+(mp&&mp.team===t?'（あなた）':''),teamTot(V.players,t,V.mode===1));
      for(const p of P)if(p.team===t)row(COL[p.color].m,p.name+(p.id===me?'（あなた）':''),val(p),'mem');
    }
    $('res-title').textContent=mp&&mp.team===V.wteam?'あなたのチームの勝ち！':TEAMN[V.wteam]+' の勝ち';
  }else{
    P.forEach((p,i)=>row(COL[p.color].m,(i+1)+'位  '+p.name+(p.id===me?'（あなた）':''),val(p)));
    const w=V.players[V.win];
    $('res-title').textContent=w?(w.id===me?'あなたの勝ち！':w.name+' の勝ち'):'けっか';
  }
  const set=mp&&won(mp)?'win':'lose',box=$('say-chips');box.textContent='';
  LINES[set].forEach((t,k)=>{const b=document.createElement('button');b.type='button';b.className='sm';b.textContent=t;b.setAttribute('aria-pressed','false');
    b.onclick=()=>{sayLine(set,k);for(const x of box.children)x.setAttribute('aria-pressed',String(x===b));};box.append(b);});
  const host=role==='host';
  $('b-again').hidden=!host;
  $('b-back').textContent=host?'もどる':'抜ける';
  $('res-note').textContent=host?'':'ホストが次を決めるのを待っています。';
  show('p-result');
}
function leave(msg){
  try{if(peer)peer.destroy();}catch(_){}
  peer=null;hostConn=null;lastHost=0;online=false;roomCode='';roster=[];prevS=curS=null;scene='title';isHostUi=true;says={};renderModes();
  startDemo();show('p-title');chipText();setMsg(msg||'');
}
function netFail(){
  leave('この画面ではオンライン対戦につながらなかった。配布用のHTMLをGitHub Pagesなどに置いて開くと使える。「ひとりで遊ぶ」はここでも動く。');
}
function peerOpts(){return Object.assign({debug:0},window.__PEER_OPTS||{});}
function genCode(){const ch='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<4;i++)s+=ch[(Math.random()*ch.length)|0];return s;}
function hostRoom(){
  if(typeof Peer==='undefined'||!window.RTCPeerConnection){netFail();return;}
  setMsg('部屋を作っています…');
  roomCode=genCode();let ok=false,pr;
  try{pr=new Peer(PFX+roomCode,peerOpts());}catch(_){netFail();return;}
  peer=pr;
  const to=setTimeout(()=>{if(!ok&&peer===pr)netFail();},10000);
  pr.on('open',()=>{ok=true;clearTimeout(to);online=true;roster=[{name:getName(),bot:false,conn:null,la:0,lb:0,pre:myPre}];botCount=0;setMsg('');openLobby();});
  pr.on('error',err=>{
    if(peer!==pr)return;
    if(!ok){clearTimeout(to);if(err&&err.type==='unavailable-id'){try{pr.destroy();}catch(_){}hostRoom();}else netFail();}
  });
  pr.on('disconnected',()=>{if(peer===pr&&!pr.destroyed){try{pr.reconnect();}catch(_){}}});
  pr.on('connection',cn=>{
    cn.on('data',d=>hostData(cn,d));
    cn.on('close',()=>hostDrop(cn));
    cn.on('error',()=>hostDrop(cn));
  });
}
function hostData(cn,d){
  if(!d||typeof d!=='object')return;
  const idx=roster.findIndex(r=>r.conn===cn);
  if(idx>=0)roster[idx].last=performance.now();
  if(d.t==='hello'){
    if(idx>=0)return;
    const humans=roster.filter(r=>!r.bot).length;
    if(scene!=='lobby'||humans>=6){cn.send({t:'no',why:scene!=='lobby'?'いま対戦中。終わってからもう一度入ってね。':'満員です。'});setTimeout(()=>{try{cn.close();}catch(_){}},400);return;}
    const nm=String(d.name||'').replace(/[\u0000-\u001f]/g,'').slice(0,8)||'プレイヤー';
    const bots=roster.filter(r=>r.bot),hs=roster.filter(r=>!r.bot);
    hs.push({name:nm,bot:false,conn:cn,la:0,lb:0,last:performance.now(),pre:clamp(d.pre|0,0,3)});roster=hs.concat(bots);
    broadcastLobby();
  }else if(d.t==='in'&&idx>=0&&role==='host'&&G&&scene==='game'){
    const r=roster[idx],p=G.players[idx];if(!p||p.bot)return;
    p.mx=clamp(+d.mx||0,-1,1);p.my=clamp(+d.my||0,-1,1);
    const da=(d.a|0)-r.la,db=(d.b|0)-r.lb;if(da>0&&da<6)p.pa+=da;if(db>0&&db<6)p.pb+=db;r.la=d.a|0;r.lb=d.b|0;
  }else if(d.t==='pre'&&idx>=0){roster[idx].pre=clamp(d.k|0,0,3);
  }else if(d.t==='say'&&idx>=0&&G&&G.ph==='end'){
    const k=d.k|0;if(k<0||k>3)return;const e={e:'say',id:idx,set:(G.team?G.players[idx].team===G.wteam:G.win===idx)?'win':'lose',k};fx(e);evOut.push(e);
  }
}
function hostDrop(cn){
  const idx=roster.findIndex(r=>r.conn===cn);if(idx<0)return;
  if(scene==='lobby'){roster.splice(idx,1);broadcastLobby();}
  else{const r=roster[idx];r.conn=null;r.bot=true;r.left=true;if(G&&G.players[idx]){G.players[idx].bot=true;G.players[idx].mx=G.players[idx].my=0;}}
}
function joinRoom(){
  const cd=$('code').value.trim().toUpperCase();
  if(cd.length!==4){setMsg('4文字のコードを入れてね。');return;}
  if(typeof Peer==='undefined'||!window.RTCPeerConnection){netFail();return;}
  setMsg('部屋をさがしています…');
  let ok=false,pr;
  try{pr=new Peer(peerOpts());}catch(_){netFail();return;}
  peer=pr;
  const to=setTimeout(()=>{if(!ok&&peer===pr)leave('部屋につながらなかった。コードと、ホストが部屋を開いたままかを確認してね。');},12000);
  pr.on('open',()=>{
    const cn=pr.connect(PFX+cd,{reliable:true});hostConn=cn;
    cn.on('open',()=>{ok=true;clearTimeout(to);roomCode=cd;online=true;lastHost=performance.now();cn.send({t:'hello',name:getName(),pre:myPre});});
    cn.on('data',clientData);
    cn.on('close',()=>{if(peer===pr)leave('ホストとの接続が切れた。');});
  });
  pr.on('error',err=>{
    if(peer!==pr)return;clearTimeout(to);
    if(err&&err.type==='peer-unavailable')leave('その部屋は見つからなかった。コードを確認してね。');
    else if(!ok)netFail();
  });
}
function clientData(d){
  if(!d||typeof d!=='object')return;
  lastHost=performance.now();
  if(d.t==='lobby'){const m=d.mode?1:0,tm=d.team?1:0,ch=m!==curMode||tm!==curTeam;curMode=m;curTeam=tm;if(d.ski>=0&&d.ski<=3)curSki=d.ski|0;if(d.lv>=0&&d.lv<=2)curLv=d.lv|0;scene='lobby';role='demo';if(ch||!G||G.players.length!==4||G.players.some(p=>!p.bot))startDemo();isHostUi=false;roomCode=d.code||roomCode;show('p-lobby');chipText();setMsg('');renderLobby(d.list,d.you,false);}
  else if(d.t==='start'){role='client';G=null;curMode=d.mode?1:0;curTeam=d.team?1:0;V=makeView(d.list,curMode,curTeam);me=d.you;matchSong=pickBattle();says={};applyTheme(resolveTheme(true));prevS=curS=null;scene='game';inp.ca=inp.cb=0;parts=[];pops=[];lines=[];banners=[];bolts=[];floats=[];show(null);banner(startMsg(curMode,curTeam,d.list.length),2.6);}
  else if(d.t==='s'&&role==='client'&&V){prevS=curS;curS=d;curAt=performance.now();if(!prevS)buildView(curAt);for(const e of d.E)fx(e);if(d.ph==='end'&&scene==='game'){scene='ending';setTimeout(()=>{if(role==='client'&&scene==='ending')showResult();},2500);}}
  else if(d.t==='no'){leave(d.why||'入れなかった。');}
}
$('b-solo').onclick=()=>{online=false;roomCode='';roster=[{name:getName(),bot:false,conn:null,la:0,lb:0,pre:myPre}];botCount=3;chipText();setMsg('');openLobby();};
$('b-host').onclick=hostRoom;
function showMulti(on){$('t-main').hidden=on;$('t-multi').hidden=!on;$('b-multi').setAttribute('aria-expanded',String(on));try{(on?$('b-host'):$('b-multi')).focus();}catch(_){}}
$('b-multi').onclick=()=>showMulti(true);
$('b-multi-back').onclick=()=>{showMulti(false);setMsg('');};
$('b-join').onclick=joinRoom;
$('code').addEventListener('keydown',e=>{if(e.key==='Enter')joinRoom();});
for(const m of[0,1])$('m-l'+m).onclick=()=>setMode(m);
(()=>{
  const ski=$('ski-l');SKI.forEach((o,i)=>{const op=document.createElement('option');op.value=String(i);op.textContent=o.n;ski.append(op);});
  ski.onchange=()=>{curSki=+ski.value;try{localStorage.setItem('yk-ski',String(curSki));}catch(_){}renderModes();if(role==='demo')startDemo();if(online)broadcastLobby();};
  const tm=$('team-l');[['0','なし（ひとりずつ）'],['1','あり（赤と青に分かれる）']].forEach(([v,t])=>{const op=document.createElement('option');op.value=v;op.textContent=t;tm.append(op);});
  tm.onchange=()=>{curTeam=+tm.value;try{localStorage.setItem('yk-team',String(curTeam));}catch(_){}renderModes();if(role==='demo')startDemo();if(scene==='lobby'&&isHostUi)broadcastLobby();};
  const lv=$('lv-l');BOTLVN.forEach((n,i)=>{const op=document.createElement('option');op.value=String(i);op.textContent=n;lv.append(op);});
  lv.onchange=()=>{curLv=+lv.value;try{localStorage.setItem('yk-lv',String(curLv));}catch(_){}renderModes();if(online)broadcastLobby();};
  const pc=$('pre-chips');LINES.pre.forEach((t,k)=>{const b=document.createElement('button');b.type='button';b.className='sm';b.dataset.k=String(k);b.textContent=t;
    b.onclick=()=>{myPre=k;try{localStorage.setItem('yk-pre',String(k));}catch(_){}
      if(isHostUi&&roster[0]&&!roster[0].bot)roster[0].pre=k;else if(hostConn&&hostConn.open)hostConn.send({t:'pre',k});renderModes();};pc.append(b);});
})();
$('b-botp').onclick=()=>{botCount+=curTeam?2:1;broadcastLobby();};
$('b-botm').onclick=()=>{botCount-=curTeam?2:1;broadcastLobby();};
$('b-start').onclick=()=>{if(roster.length>=2)beginHostGame();};
$('b-leave').onclick=()=>leave('');
$('b-again').onclick=()=>{if(role==='host')beginHostGame();};
$('b-back').onclick=()=>{
  if(role==='host'){role='demo';says={};startDemo();roster=roster.filter(r=>!r.left);openLobby();}
  else leave('');
};
$('b-copy').onclick=()=>{
  const done=()=>{$('copied').textContent='コピーした';setTimeout(()=>{$('copied').textContent='';},1500);};
  try{navigator.clipboard.writeText(roomCode).then(done,()=>{$('copied').textContent='コードを書き写してね';});}catch(_){$('copied').textContent='コードを書き写してね';}
};
$('mute').onclick=()=>{muted=!muted;$('mute').textContent='音: '+(muted?'OFF':'ON');audioUnlock(true);if(muted&&keepAlive)keepAlive.pause();};
const wakeAudio=()=>{if(document.hidden)return;bgPaused=false;if(!AC||AC.state!=='running'||(keepAlive&&keepAlive.paused&&!muted))audioUnlock(true);};
for(const ev of['pointerdown','pointerup','touchend','click','keydown'])window.addEventListener(ev,wakeAudio,{capture:true,passive:true});
// leaving the app/tab: stop all sound (the silent loop would otherwise let iPhone keep playing in the background)
let bgPaused=false;
function audioSleep(){bgPaused=true;try{if(keepAlive)keepAlive.pause();}catch(_){}try{if(AC&&AC.state==='running')AC.suspend();}catch(_){}}
function audioWake(){if(!bgPaused)return;bgPaused=false;audioUnlock(false);}
document.addEventListener('visibilitychange',()=>{if(document.hidden)audioSleep();else audioWake();});
window.addEventListener('pagehide',audioSleep);window.addEventListener('pageshow',()=>{if(!document.hidden)audioWake();});
window.addEventListener('blur',()=>{if(document.hidden)audioSleep();});
audioUnlock(false);   // starts right away where the browser allows it (e.g. a PC you have played on before)

