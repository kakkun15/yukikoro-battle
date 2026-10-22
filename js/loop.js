'use strict';
// ---------------------------------------------------------------- loops
let lastTick=performance.now(),acc=0,snapAcc=0,lastF=performance.now(),inAcc=0,hbAcc=0,lastHost=0;
function heartbeat(now){
  if(!online||!peer)return;
  if(hostConn){
    if(hostConn.open)hostConn.send({t:'hb'});
    if(lastHost&&now-lastHost>6000)leave('ホストとの接続が切れた。');
  }else for(const r of roster.slice())if(r.conn){
    if(r.conn.open)r.conn.send({t:'hb'});
    if(now-r.last>6000){const cn=r.conn;hostDrop(cn);try{cn.close();}catch(_){}}
  }
}
function simTick(){
  const now=performance.now();let dt=(now-lastTick)/1000;lastTick=now;if(dt>0.5)dt=0.5;
  hbAcc+=dt;if(hbAcc>=1){hbAcc=0;heartbeat(now);}
  musUpdate();
  if(role==='client'){
    inAcc+=dt;
    if(hostConn&&hostConn.open&&scene==='game'&&inAcc>=0.05){inAcc=0;hostConn.send({t:'in',mx:r2(inp.mx),my:r2(inp.my),a:inp.ca,b:inp.cb});}
    return;
  }
  if(!G)return;
  acc+=dt;
  while(acc>=STEP){
    acc-=STEP;
    if(role==='host'){const p=G.players[0];p.mx=inp.mx;p.my=inp.my;p.pa+=inp.a;p.pb+=inp.b;inp.a=inp.b=0;}
    step(G,STEP);
    if(G.ev.length){for(const e of G.ev){fx(e);if(role==='host'&&online)evOut.push(e);}G.ev.length=0;}
  }
  if(role==='host'&&online){snapAcc+=dt;if(snapAcc>=SNAP_MS/1000){snapAcc=0;const s=packSnap(G);for(const r of roster)if(r.conn&&r.conn.open)r.conn.send(s);}}
  if(role==='host'&&G.ph==='end'&&scene==='game'&&G.t>G.endT+2.5)showResult();
  if(role==='demo'&&G.ph==='end'&&G.t>G.endT+5)startDemo();
}
let tbState='';
function updTouch(){
  if(!isTouch)return;
  const my=V&&role!=='demo'?V.players[me]:null,st=(my&&!my.hold?'p':'h')+'|'+(my&&my.item||'')+'|'+(hintNow||'');
  if(st===tbState)return;tbState=st;
  const face=(id,name)=>{const x=$(id).getContext('2d');x.clearRect(0,0,10,10);if(name)icon((px,py,w,h,col)=>{x.fillStyle=col;x.fillRect(px,py,w,h);},name,1,1,1);};
  const free=my&&!my.hold;$('t-a').classList.toggle('hint',!!hintNow);
  face('ti-a',free?'fist':'palm');$('tl-a').textContent=free?'パンチ':'はなす';
  face('ti-b',my&&my.item?my.item:null);$('tl-b').textContent=my&&my.item?ITEMS[my.item].n:'道具';
}
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(0.1,(now-lastF)/1000);lastF=now;
  if(role==='client'&&curS&&V){buildView(now);regen(V.snow,dt,V.players.length);for(const p of V.players)if(p.hold)sweep(V.snow,p.bx,p.by,radius(p.size));}
  if(!V)return;
  updFx(dt);draw(now/1000);updTouch();
  const ing=scene==='game'||scene==='ending'||scene==='result';if(document.body.classList.contains('ingame')!==ing)document.body.classList.toggle('ingame',ing);
}
function startDemo(){
  role='demo';me=-1;
  G=newGame(teamList([0,1,2,3].map(i=>({name:BOTN[i],color:i,bot:true})),curTeam),curMode,curSki,undefined,curTeam);G.startT=0.01;V=G;parts=[];pops=[];lines=[];banners=[];bolts=[];floats=[];
}

