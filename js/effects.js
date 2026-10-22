'use strict';
// ---------------------------------------------------------------- effects
let parts=[],lines=[],pops=[],banners=[],bolts=[],floats=[],shake=0,flash=0,flakes=[];
for(let i=0;i<70;i++)flakes.push({x:Math.random()*W,y:Math.random()*H,s:rnd(8,26),w:Math.random()*6,z:Math.random()<0.3?2:1});
function burst(x,y,n,col,spd=30,life=0.5){for(let i=0;i<n;i++){const a=Math.random()*6.28,v=rnd(spd*0.3,spd);parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-10,l:rnd(life*0.5,life),col,g:60});}}
function banner(t,d){banners=[{t,d,m:d}];}
function sfx(n){
  if(muted||role==='demo')return;
  if(!audioUnlock())return;
  const T=AC.currentTime;
  const tone=(f,d,ty,v,f2,dl=0)=>{const o=AC.createOscillator(),g=AC.createGain();o.type=ty;o.frequency.setValueAtTime(f,T+dl);if(f2)o.frequency.exponentialRampToValueAtTime(f2,T+dl+d);g.gain.setValueAtTime(v,T+dl);g.gain.exponentialRampToValueAtTime(0.001,T+dl+d);o.connect(g);g.connect(AC.destination);o.start(T+dl);o.stop(T+dl+d+0.02);};
  if(n==='dig'){tone(660,.09,'square',.05);tone(990,.14,'square',.05,0,.09);}
  else if(n==='go'){tone(523,.1,'square',.05);tone(784,.25,'square',.05,0,.1);}
  else if(n==='punch')tone(180,.08,'square',.06,90);
  else if(n==='stun')tone(400,.3,'sawtooth',.05,120);
  else if(n==='boom')tone(120,.4,'sawtooth',.09,40);
  else if(n==='hook')tone(300,.15,'square',.04,900);
  else if(n==='ice'){tone(1400,.08,'triangle',.06,700);tone(200,.2,'square',.05,80,.06);}
  else if(n==='alarm'){tone(880,.12,'square',.05);tone(660,.12,'square',.05,0,.14);tone(880,.12,'square',.05,0,.28);}
  else if(n==='warn'){tone(740,.1,'triangle',.06);tone(740,.1,'triangle',.06,0,.16);}
  else if(n==='use')tone(520,.1,'triangle',.05,780);
  else if(n==='win'){[523,659,784,1047].forEach((f,i)=>tone(f,.2,'square',.05,0,i*.13));}
  else if(n==='safe')tone(880,.2,'triangle',.05,1320);
  else if(n==='deliver'){[659,784,988].forEach((f,i)=>tone(f,.12,'square',.05,0,i*.08));}
  else if(n==='bonk')tone(150,.12,'square',.07,60);
  else if(n==='thunder'){tone(90,.5,'sawtooth',.09,30);tone(1800,.06,'square',.04,400);}
}
function fx(e){
  const P=V&&V.players;if(!P)return;const demo=role==='demo';
  switch(e.e){
    case'go':if(!demo){banner('スタート！',1.2);sfx('go');}break;
    case'dig':{const p=P[e.id];burst(p.bx,p.by,8,'#ffffff');pops.push({id:e.id,it:e.it,t:0});if(e.id===me){banner('「'+ITEMS[e.it].n+'」を掘り当てた！',1.8);sfx('dig');}break;}
    case'use':{const p=P[e.id];if(demo)break;
      if(e.it==='spot')sfx('alarm');
      else if(e.it==='ice'){banner('つららが落ちてくる！',1.4);sfx('warn');}
      else if(e.id===me)sfx('use');
      break;}
    case'punch':burst(e.x,e.y,3,'#ffffff',20,0.25);if(e.id===me)sfx('punch');break;
    case'stun':{const p=P[e.id];burst(p.x,p.y-6,6,'#f4b860',26,0.5);if(e.id===me)sfx('stun');break;}
    case'chip':burst(e.x,e.y-4,12,'#dbe6f3',36,0.6);if(e.a>=1)floats.push({txt:'-'+e.a+'%',x:e.x,y:e.y-6,t:0,col:'#c0392b'});break;
    case'boom':shake=0.35;flash=0.12;burst(e.x,e.y,26,'#f08a3c',70,0.6);burst(e.x,e.y,14,'#fff3c4',40,0.4);lines.push({ring:1,x:e.x,y:e.y,t:0.3,m:0.3});sfx('boom');break;
    case'hook':lines.push({x1:e.x1,y1:e.y1,x2:e.x2,y2:e.y2,t:0.3,m:0.3});sfx('hook');break;
    case'ice':shake=0.2;burst(e.x,e.y-6,16,'#8fd0f0',50,0.6);sfx('ice');break;
    case'spotEnd':{flash=0.15;let hit=0;for(const p of P)if(!e.safe.includes(p.id)){hit++;bolts.push({x:p.x,y:p.y,t:0.4,seed:(p.id+1)*977+((p.x*13)|0)});burst(p.x,p.y-4,12,'#fff3c4',50,0.5);}
      if(hit){shake=0.3;if(!demo)sfx('thunder');}
      if(!demo){if(e.safe.includes(me)){banner('セーフ！',1.2);if(!hit)sfx('safe');}else banner('光の外にいて雷に打たれた…',1.8);}break;}
    case'deliver':{const p=P[e.id];burst(e.x,e.y-6,18,'#ffffff',46,0.7);burst(e.x,e.y-6,8,COL[p.color].m,40,0.7);floats.push({txt:'+'+e.amt,x:e.x,y:e.y-14,t:0,col:COL[p.color].d});if(!demo&&e.id===me){banner(e.amt+'% を届けた！',1.4);sfx('deliver');}break;}
    case'bonk':shake=Math.max(shake,0.15);burst(e.x,e.y-4,10,'#ffffff',44,0.45);if(!demo)sfx('bonk');break;
    case'thud':burst(e.x,e.y,6,'#e3ebf5',26,0.35);break;
    case'skiWarn':if(!demo){banner('スキー客がつっこんでくる！',1.5);sfx('warn');}break;
    case'say':{if(demo)break;const L=LINES[e.set];if(L&&L[e.k]!=null)says[e.id]={txt:L[e.k],t:e.set==='pre'?3.4:9};break;}
    case'toyDie':burst(e.x,e.y,8,'#3fae6b',26,0.4);break;
    case'win':{const p=P[e.id];for(let i=0;i<40;i++)parts.push({x:p.bx+rnd(-30,30),y:p.by-40+rnd(-20,10),vx:rnd(-20,20),vy:rnd(-40,-5),l:rnd(1,2.2),col:COL[(Math.random()*6)|0].m,g:50});if(role!=='demo'){MUS.hold=performance.now()+2600;musStop();}sfx('win');break;}
  }
}
function updFx(dt){
  for(const p of parts){p.l-=dt;p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;}
  parts=parts.filter(p=>p.l>0);if(parts.length>400)parts.splice(0,parts.length-400);
  for(const l of lines)l.t-=dt;lines=lines.filter(l=>l.t>0);
  for(const p of pops)p.t+=dt;pops=pops.filter(p=>p.t<0.8);
  for(const b of banners)b.d-=dt;banners=banners.filter(b=>b.d>0);
  for(const b of bolts)b.t-=dt;bolts=bolts.filter(b=>b.t>0);
  for(const f of floats)f.t+=dt;floats=floats.filter(f=>f.t<1.2);
  for(const id in says){says[id].t-=dt;if(says[id].t<=0)delete says[id];}
  shake=Math.max(0,shake-dt);flash=Math.max(0,flash-dt);
  for(const f of flakes){f.y+=f.s*dt*f.z;f.x+=Math.sin(f.w+=dt*1.3)*8*dt;if(f.y>H){f.y=-2;f.x=Math.random()*W;}}
  if(V){
    for(const s of V.skiers)if(s.warn<=0&&Math.random()<0.6)parts.push({x:s.x+rnd(-3,3),y:s.y,vx:rnd(-14,14),vy:-rnd(5,25),l:0.35,col:'#ffffff',g:40});
    for(const p of V.players)if(p.boost>0&&Math.random()<0.5)parts.push({x:p.x+rnd(-3,3),y:p.y,vx:0,vy:-4,l:0.3,col:'#ffffff',g:0});
  }
}

