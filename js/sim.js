'use strict';
// ---------------------------------------------------------------- simulation (host only)
function newAI(){return{help:-1,hside:1,helpT:0,helpCd:rnd(2,5),hpx:0,hpy:0,hlost:0,hstill:0,hy:0,calm:false,spSeenId:-1,spSeenT:0,wx:0,wy:0,wt:0,want:0,unstick:0,ux:0,uy:0,t:0,gx:0,gy:0,useT:-1,raid:0,raidT:-1,raidCd:rnd(6,14),sp:-1,spId:-1,rest:0,restCd:rnd(4,9)}}
function newGame(list,mode,ski,lv,team){
  if(ski==null)ski=2;if(lv==null)lv=1;
  const n=list.length,slope=mode===1;
  const g={t:0,mode:slope?1:0,tl:slope?MATCH_S:MATCH,ph:'play',win:-1,startT:3,endT:0,players:[],toys:[],bombs:[],skiers:[],ices:[],spot:null,spotN:0,spotCd:0,
    snow:new Float32Array(GW*GH).fill(1),ev:[],ski,lv,team:!!team,wteam:-1,tsc:[0,0],skiT:ski>0?rnd(SKI[ski].a*0.8,SKI[ski].b*0.75):1e9};
  list.forEach((r,i)=>{
    const x=FX0+(i+0.5)*(FX1-FX0)/n,y=slope?FY1-8-((i%2)?16:0):FY0+62+((i%2)?28:0);
    const p={id:i,name:r.name,color:r.color,team:team?(r.team!=null&&r.team>=0?r.team:i%2):-1,bot:!!r.bot,x,y,ang:-Math.PI/2,hold:true,bx:x,by:y,size:0,score:0,walk:0,broll:0,bvx:0,bvy:0,parked:false,
      stun:0,stun0:0,inv:0,item:null,cd:rnd(3,8),boost:0,pT:0,pCd:0,relT:9,rank:i,mx:0,my:0,pa:0,pb:0,ai:newAI()};
    placeBall(p);g.players.push(p);
  });
  return g;
}
const emit=(g,e)=>g.ev.push(e);
function clampP(p){p.x=clamp(p.x,FX0,FX1);p.y=clamp(p.y,FY0,FY1)}
function placeBall(p){
  const r=radius(p.size);
  p.bx=clamp(p.x+Math.cos(p.ang)*(r+5),FX0+r*0.8-2,FX1-r*0.8+2);
  p.by=clamp(p.y+Math.sin(p.ang)*(r+5),FY0+r*0.3,FY1-r*0.45);
}
function sweep(sn,bx,by,r){
  let t=0;const R=r+1.5,rr=R*R;
  const x0=Math.max(0,Math.floor((bx-R)/CELL)),x1=Math.min(GW-1,Math.floor((bx+R)/CELL));
  const y0=Math.max(0,Math.floor((by-R-GY0)/CELL)),y1=Math.min(GH-1,Math.floor((by+R-GY0)/CELL));
  for(let cy=y0;cy<=y1;cy++)for(let cx=x0;cx<=x1;cx++){
    const px=cx*CELL+2-bx,py=GY0+cy*CELL+2-by;
    if(px*px+py*py<=rr){const i=cy*GW+cx;t+=sn[i];sn[i]=0;}
  }
  return t*CELL*CELL;
}
const regenK=n=>1+0.32*Math.max(0,n-2);
function regen(sn,dt,n){const rg=dt/REGEN*regenK(n);for(let i=0;i<sn.length;i++)if(sn[i]<1){const v=sn[i]+rg;sn[i]=v>1?1:v;}}
function snowAt(sn,x,y){
  let t=0,c=0;const cx=Math.floor(x/CELL),cy=Math.floor((y-GY0)/CELL);
  for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){const X=cx+i,Y=cy+j;if(X<0||Y<0||X>=GW||Y>=GH)continue;t+=sn[Y*GW+X];c++;}
  return c?t/c:0;
}
function ledgeAt(x,y){for(const L of LEDGES)if(x>=L.x0&&x<=L.x1&&y>=L.y-6&&y<=L.y+1.5)return L;return null;}
function dropBall(g,p){
  p.hold=false;p.relT=0;p.bvx=0;p.bvy=0;p.parked=g.mode===1&&!!ledgeAt(p.bx,p.by);
}
function stun(g,p,dur,kx,ky,force){
  if(!force&&(p.inv>0||p.stun>0))return false;
  const was=p.stun>0;
  p.stun=Math.max(p.stun,dur);p.stun0=was?Math.max(p.stun0,p.stun):p.stun;
  if(p.hold)dropBall(g,p);
  p.relT=0;p.boost=0;p.x+=kx;p.y+=ky;clampP(p);
  emit(g,{e:'stun',id:p.id});return true;
}
function chip(g,o,amt){const lost=Math.min(o.size,amt);o.size=Math.max(0,o.size-amt);emit(g,{e:'chip',x:o.bx,y:o.by-radius(o.size),a:Math.round(lost),id:o.id});if(o.hold)placeBall(o);}
function pickItem(g,p){
  const n=g.players.length;let pos=n>1?p.rank/(n-1):0,first=p.rank===0,last=p.rank===n-1;
  if(g.team){const a=g.tsc[p.team],b=g.tsc[1-p.team];pos=a>b?0.2:a<b?0.8:0.5;first=false;last=a<b;}
  const spotOk=pos>=0.5&&!g.spot&&g.spotCd<=0&&!g.players.some(o=>o.item==='spot');
  const w={ski:3,hook:3,toy:2+pos,bomb:3-1.5*pos,ice:first?0:1+3*pos,spot:spotOk?(last?5:2):0};
  let tot=0;for(const k in w)tot+=w[k];
  let r=Math.random()*tot;for(const k in w){r-=w[k];if(r<=0)return k;}
  return'ski';
}
function spotOwners(ps,sp){
  const taken=[sp.by],own=[];
  for(const q of sp.pts){
    let best=null,bd=SPOT_R;
    for(const o of ps)if(!taken.includes(o.id)){const d=dist(o.x,o.y,q.x,q.y);if(d<bd){bd=d;best=o;}}
    if(best)taken.push(best.id);own.push(best?best.id:-1);
  }
  for(const id of sp.s0)if(!taken.includes(id))taken.push(id);
  return{own,safe:taken};
}
function startSpot(g,p){
  const foes=g.players.filter(o=>!ally(o,p)),others=foes.length,k=g.team?others:others>=2?others-1:1,dur=others>=2?5:3.2,pts=[];
  const only=others===1?foes[0]:null;
  for(let i=0;i<k;i++){
    let best=null;
    for(let tr=0;tr<80;tr++){
      const q={x:rnd(FX0+16,FX1-16),y:rnd(FY0+12,FY1-12)};
      if(pts.some(o=>dist(o.x,o.y,q.x,q.y)<46))continue;
      if(only&&dist(only.x,only.y,q.x,q.y)<(tr<60?150:90))continue;
      best=q;break;
    }
    pts.push(best||{x:rnd(FX0+16,FX1-16),y:rnd(FY0+12,FY1-12)});
  }
  g.spot={id:++g.spotN,by:p.id,s0:g.players.filter(o=>ally(o,p)).map(o=>o.id),t:dur,dur,pts};
}
function hookTarget(ps,p,hint){
  let best=null,bs=1e9;
  for(const o of ps){
    if(ally(o,p))continue;
    const dx=o.x-p.x,dy=o.y-p.y,d=Math.hypot(dx,dy);if(d>HOOK_R||d<1)continue;
    const a=Math.abs(angDiff(Math.atan2(dy,dx),p.ang));
    let s=d*(1+a);if(o===hint)s=-1;else if(a>HOOK_A)continue;
    if(s<bs){bs=s;best=o;}
  }
  return best;
}
function bombSpot(p,vx,vy){
  const th=(p.hold?2*radius(p.size)+5:0)+30;
  return{x:clamp(p.x+vx*th,FX0,FX1),y:clamp(p.y+vy*th,FY0,FY1)};
}
function useItem(g,p,hint){
  const it=p.item;if(!it)return;
  if(it==='spot'&&g.spot)return;
  p.item=null;emit(g,{e:'use',id:p.id,it});
  const ux=Math.cos(p.ang),uy=Math.sin(p.ang);
  if(it==='ski')p.boost=5;
  else if(it==='hook'){
    const best=hookTarget(g.players,p,hint);
    if(!best){emit(g,{e:'hook',x1:p.x,y1:p.y,x2:p.x+ux*HOOK_R*0.6,y2:p.y+uy*HOOK_R*0.6});return;}
    const dx=best.x-p.x,dy=best.y-p.y,d=Math.hypot(dx,dy),vx=dx/d,vy=dy/d;
    emit(g,{e:'hook',x1:p.x,y1:p.y,x2:best.x,y2:best.y});
    if(p.hold){
      const r=radius(p.size);
      stun(g,best,0.9,0,0,true);best.x=p.x+ux*(2*r+14);best.y=p.y+uy*(2*r+14);clampP(best);
    }else{
      p.x=best.x-vx*9;p.y=best.y-vy*9;p.ang=Math.atan2(vy,vx);clampP(p);
      stun(g,best,1.0,vx*6,vy*6,true);
    }
  }
  else if(it==='toy')g.toys.push({x:p.x,y:p.y,own:p.id,life:8,hit:0.5,tg:-1,rt:0,k:Math.random()<0.5?0:1});
  else if(it==='bomb'){
    let vx=ux,vy=uy;
    if(hint){const d=dist(hint.x,hint.y,p.x,p.y)||1;vx=(hint.x-p.x)/d;vy=(hint.y-p.y)/d;}
    const q=bombSpot(p,vx,vy);
    g.bombs.push({x:q.x,y:q.y,sx:p.x,sy:p.y,ft:0.35,fuse:1.4,own:p.id});
  }
  else if(it==='ice'){
    let tg=null;for(const o of g.players)if(!ally(o,p)&&(!tg||o.rank<tg.rank))tg=o;
    if(tg)g.ices.push({tg:tg.id,t:1.6});
  }
  else if(it==='spot')startSpot(g,p);
}
function punch(g,p){
  p.pT=0.2;p.pCd=0.45;
  const ux=Math.cos(p.ang),uy=Math.sin(p.ang),hx=p.x+ux*8,hy=p.y+uy*8;
  emit(g,{e:'punch',x:hx,y:hy,id:p.id});
  for(const o of g.players)if(!ally(o,p)&&dist(o.x,o.y,hx,hy)<10)stun(g,o,1.3,ux*12,uy*12,false);
  for(const t of g.toys)if(dist(t.x,t.y,hx,hy)<11)t.life=0;
}
function moveTo(p,x,y,stop){const dx=x-p.x,dy=y-p.y,d=Math.hypot(dx,dy);if(d>stop){p.mx=dx/d;p.my=dy/d;}return d;}
const BOTLV=[{sp:0.8,rest:[3,6],restL:[0.6,1.4],samples:4,use:[3,7],raid:0.15,raidCd:[12,20],react:0.9,dodge:false},
  {sp:1,rest:[5,10],restL:[0.3,0.9],samples:10,use:[0.8,3.5],raid:0.5,raidCd:[7,15],react:0.25,dodge:true},
  {sp:1,rest:[30,40],restL:[0,0.15],samples:18,use:[0.2,1.2],raid:0.75,raidCd:[5,9],react:0,dodge:true}];
const BOTLVN=['よわい','ふつう','つよい'];
function botSees(g,p,sp){const L=BOTLV[g.lv|0]||BOTLV[1],a=p.ai;if(a.spSeenId!==sp.id){a.spSeenId=sp.id;a.spSeenT=g.t;}return g.t-a.spSeenT>=L.react;}
function botThink(g,p,dt){
  const a=p.ai,L=BOTLV[g.lv|0]||BOTLV[1];
  if(a.unstick>0&&p.stun<=0&&!g.spot){a.unstick-=dt;p.mx=a.ux;p.my=a.uy;return;}
  botBrain(g,p,dt);
  p.mx*=L.sp;p.my*=L.sp;
  // watchdog: wanting to move but going nowhere -> step aside and pick a new goal
  // (a helper that is already in place only makes small corrections, so that does not count as stuck)
  a.wt+=dt;if(!a.calm&&Math.abs(p.mx)+Math.abs(p.my)>0.1)a.want+=dt;
  if(a.wt>=1.2){
    if(a.want>1&&p.stun<=0&&Math.hypot(p.x-a.wx,p.y-a.wy)<3){const an=Math.random()*6.283;a.ux=Math.cos(an);a.uy=Math.sin(an);a.unstick=0.5;a.t=0;}
    a.wt=0;a.want=0;a.wx=p.x;a.wy=p.y;
  }
}
// ---- team match: bots help a teammate push their snowball
// 雪原: only once your own ball is full (it cannot grow any more, so helping is pure gain).
// 坂道: only while your own ball is tiny (e.g. right after delivering) and a teammate is hauling uphill the ball that
//       wins the match (or time is nearly up). Otherwise walking up together costs the team more than it saves.
// One helper per ball. The helper stands at the back corner of the ball, next to the pusher, and follows it.
let HELP_ON=[true,true];   // per team; tests switch one side off to compare
const HELP_CD=4;
function climbing(o){return o.bot?!!o.ai.climb:o.my<-0.3;}
function helpOk(g,p,o,start){
  if(!o||o===p||o.team!==p.team||!o.hold||o.stun>0)return false;
  if(g.mode===1){
    if(p.size>=5||o.size<(start?18:1))return false;
    if(start){
      if(o.by<GOAL_Y+45||!climbing(o)||dist(p.x,p.y,o.x,o.y)>130)return false;
      // pushing together is slower for the team overall, so only when this ball decides the match:
      // it wins the match once delivered, or time is nearly up
      const need=tGoal(g.players.length)-g.tsc[p.team];
      if(!(o.size>=need-0.5||(g.tl<30&&o.size>=10)))return false;
    }
  }else{
    if(p.size<GOAL-(start?0.5:6)||o.size>=GOAL-0.5)return false;
    if(start&&dist(p.x,p.y,o.x,o.y)>100)return false;   // a full ball still wipes snow away from rivals, so only stop that for a teammate nearby
  }
  for(const q of g.players)if(q!==p&&q.team===p.team&&!q.hold&&(q.bot?q.ai.help===o.id:dist(q.x,q.y,o.bx,o.by)<radius(o.size)+10))return false;   // already has a helper
  return true;
}
function helpPick(g,p){
  let best=null,bd=1e9;
  for(const o of g.players)if(helpOk(g,p,o,true)){const d=dist(p.x,p.y,o.x,o.y);if(d<bd){bd=d;best=o;}}
  return best;
}
function helpSpot(o,s){const r=radius(o.size),an=o.ang+Math.PI+s*1.3;return{x:o.bx+Math.cos(an)*(r+4.5),y:o.by+Math.sin(an)*(r+4.5)};}
function inField(q){return q.x>FX0+1&&q.x<FX1-1&&q.y>FY0+1&&q.y<FY1-1;}
function helpEnd(a){a.help=-1;a.helpCd=HELP_CD;a.calm=false;}
function botHelp(g,p,dt){
  const a=p.ai,o=g.players[a.help];
  a.calm=false;
  // keep going through short hiccups (the pusher re-grabbing their ball), give up on anything longer
  if(!helpOk(g,p,o,false)){a.hlost+=dt;if(a.hlost>1.2||!o||o.stun>0||(g.mode===1&&o.size<1)){helpEnd(a);return false;}moveTo(p,o?o.x:p.x,o?o.y:p.y,14);p.noGrab=true;return true;}
  a.hlost=0;a.helpT+=dt;
  a.hfar=o.help?0:(a.hfar||0)+dt;if(a.hfar>8){helpEnd(a);a.hfar=0;return false;}   // insurance: never chase a pusher forever
  // 坂道: stop if the pusher is not actually going up for a while
  if(g.mode===1){if(o.y<a.hy-4){a.hy=o.y;a.hstill=0;}else{a.hstill+=dt;if(o.y>a.hy)a.hy=o.y;}if(a.hstill>3.5||a.helpT>35){helpEnd(a);return false;}}
  p.noGrab=true;
  const r=radius(o.size),bd=dist(p.x,p.y,o.bx,o.by);
  // where to stand: a back corner of the ball (our side first). Near a wall or in a corner that spot can be off the
  // field, so fall back to a spot behind / beside the pusher. Never a spot inside the ball or on top of the pusher,
  // because standing there would shove their ball around.
  const okSpot=c=>inField(c)&&dist(c.x,c.y,o.bx,o.by)>=r+4&&dist(c.x,c.y,o.x,o.y)>=8;
  const back=o.ang+Math.PI;
  // while still walking over, switch to the other back corner when it is clearly nearer (the pusher may have turned)
  if(!a.calm){const s1=helpSpot(o,a.hside),s2=helpSpot(o,-a.hside);if(okSpot(s2)&&dist(p.x,p.y,s2.x,s2.y)+6<dist(p.x,p.y,s1.x,s1.y))a.hside=-a.hside;}
  let q=null;
  for(const c of[[helpSpot(o,a.hside),0],[helpSpot(o,-a.hside),1],[{x:o.x+Math.cos(back)*10,y:o.y+Math.sin(back)*10},0],
    [{x:o.x+Math.cos(back+a.hside*1.6)*10,y:o.y+Math.sin(back+a.hside*1.6)*10},0],[{x:o.x+Math.cos(back-a.hside*1.6)*10,y:o.y+Math.sin(back-a.hside*1.6)*10},0]])
    if(okSpot(c[0])){q=c[0];if(c[1])a.hside=-a.hside;break;}
  if(!q){   // boxed in (deep in a corner): just stand clear of the ball and wait
    const an=Math.atan2(p.y-o.by,p.x-o.bx),cx=clamp(o.bx+Math.cos(an)*(r+5),FX0,FX1),cy=clamp(o.by+Math.sin(an)*(r+5),FY0,FY1);
    if(bd<r+4){moveTo(p,cx,cy,0.5);}else{a.calm=true;if(dist(p.x,p.y,o.x,o.y)>40)moveTo(p,o.x,o.y,12);}
    a.hpx=o.x;a.hpy=o.y;return true;}
  // coming from the front: walk around the side first instead of shoving the ball back into the pusher
  const rel=Math.abs(angDiff(Math.atan2(p.y-o.by,p.x-o.bx),o.ang+Math.PI));
  if(rel>1.7&&bd<r+26){const an=o.ang-a.hside*Math.PI/2;   // same side as the corner we are heading for
   moveTo(p,clamp(o.bx+Math.cos(an)*(r+12),FX0,FX1),clamp(o.by+Math.sin(an)*(r+12),FY0,FY1),1);a.hpx=o.x;a.hpy=o.y;return true;}
  const d=dist(p.x,p.y,q.x,q.y);
  if(d>18){moveTo(p,q.x,q.y,0);a.hpx=o.x;a.hpy=o.y;return true;}
  // close: follow the pusher's speed and steer the remaining gap smoothly (no overshoot, no jitter)
  const L=BOTLV[g.lv|0]||BOTLV[1],k=SPD_FREE*L.sp,vx=dt>0?(o.x-a.hpx)/dt:0,vy=dt>0?(o.y-a.hpy)/dt:0;a.hpx=o.x;a.hpy=o.y;
  let mx=vx/k+(q.x-p.x)/6,my=vy/k+(q.y-p.y)/6;const l=Math.hypot(mx,my);if(l>1){mx/=l;my/=l;}
  if(l<0.15){mx=my=0;}
  p.mx=mx/L.sp;p.my=my/L.sp;   // botThink scales by L.sp afterwards
  if(Math.hypot(p.mx,p.my)>1){const m=Math.hypot(p.mx,p.my);p.mx/=m;p.my/=m;}
  a.calm=d<6;
  if(a.calm&&l<0.15)p.ang=Math.atan2(o.by-p.y,o.bx-p.x);
  // bodyguard: punch a rival who comes right up to us
  if(p.pCd<=0)for(const e of g.players)if(!ally(e,p)&&e.stun<=0&&e.inv<=0&&dist(e.x,e.y,p.x,p.y)<12&&Math.random()<dt*4){p.ang=Math.atan2(e.y-p.y,e.x-p.x);p.mx=p.my=0;p.pa=1;break;}
  return true;
}
function botItem(g,p,L){
  const a=p.ai,ps=g.players;
  if(!p.item){a.useT=-1;return;}
  if(a.useT<0)a.useT=g.t+rnd(L.use[0],L.use[1]);
  if(g.t<a.useT)return;
  const it=p.item;let ok=false,hint=null;
  if(it==='ski'||it==='toy'||it==='ice')ok=true;
  else if(it==='spot')ok=!g.spot;
  else if(it==='hook'){
    let bd=100;for(const o of ps)if(!ally(o,p)&&o.stun<=0){const d=dist(o.x,o.y,p.x,p.y);if(d<bd&&(g.team||o.rank<p.rank||g.t>a.useT+6)){bd=d;hint=o;}}
    ok=!!hint;
  }else if(it==='bomb'){
    const th=(p.hold?2*radius(p.size)+5:0)+30;
    for(const o of ps)if(!ally(o,p)){const d=dist(o.bx,o.by,p.x,p.y);if(Math.abs(d-th)<14){hint={x:o.bx,y:o.by};ok=true;break;}}
    if(!ok&&g.t>a.useT+12){ok=true;hint=null;}
  }
  if(ok){useItem(g,p,hint);a.useT=-1;}
}
function botBrain(g,p,dt){
  const a=p.ai;a.t-=dt;p.mx=p.my=0;
  if(p.stun>0)return;
  p.noGrab=false;a.calm=false;a.helpCd-=dt;
  const sp=g.spot,ps=g.players,slope=g.mode===1,L=BOTLV[g.lv|0]||BOTLV[1];
  if(sp&&!sp.s0.includes(p.id)&&botSees(g,p,sp)){
    if(p.hold){p.pa=1;return;}
    if(a.spId!==sp.id||a.t<=0||a.sp<0){
      a.spId=sp.id;a.t=0.7;let bi=0,bv=1e9;
      sp.pts.forEach((q,i)=>{
        const d=dist(p.x,p.y,q.x,q.y);let closer=0;
        for(const o of ps)if(o!==p&&o.id!==sp.by&&dist(o.x,o.y,q.x,q.y)<d-4)closer++;
        const v=closer*400+d;if(v<bv){bv=v;bi=i;}
      });
      a.sp=bi;
    }
    const q=sp.pts[a.sp],d=moveTo(p,q.x,q.y,2);
    if(d<9&&p.pCd<=0)for(const o of ps)if(!ally(o,p)&&o.id!==sp.by&&o.stun<=0&&dist(o.x,o.y,p.x,p.y)<12&&Math.random()<dt*3){
      p.ang=Math.atan2(o.y-p.y,o.x-p.x);p.pa=1;break;
    }
    return;
  }
  if(sp&&g.team&&p.id!==sp.by&&sp.s0.includes(p.id)&&L.dodge&&botSees(g,p,sp)){
    if(p.hold){p.pa=1;return;}
    if(a.spId!==sp.id||a.t<=0||a.sp<0){
      a.spId=sp.id;a.t=0.7;let bi=0,bv=1e9;
      sp.pts.forEach((q,i)=>{
        let v=dist(p.x,p.y,q.x,q.y);
        for(const o of ps)if(o!==p&&o.bot&&o.team===p.team&&o.ai.spId===sp.id&&o.ai.sp===i)v+=400;
        if(v<bv){bv=v;bi=i;}
      });
      a.sp=bi;
    }
    const q=sp.pts[a.sp],d=moveTo(p,q.x,q.y,2);
    if(d<9&&p.pCd<=0)for(const o of ps)if(!ally(o,p)&&o.stun<=0&&dist(o.x,o.y,p.x,p.y)<12&&Math.random()<dt*3){p.ang=Math.atan2(o.y-p.y,o.x-p.x);p.pa=1;break;}
    return;
  }
  if(!p.hold){
    for(const t of g.toys)if(t.tg===p.id&&dist(t.x,t.y,p.x,p.y)<17){
      p.ang=Math.atan2(t.y-p.y,t.x-p.x);if(p.pCd<=0)p.pa=1;moveTo(p,t.x,t.y,6);return;
    }
    if(a.help>=0){if(botHelp(g,p,dt)){if(p.item!=='hook')botItem(g,p,BOTLV[g.lv|0]||BOTLV[1]);return;}}
    if(a.raid>0){
      a.raid-=dt;const o=ps[a.raidT];
      if(!o||o.stun>0||o.inv>0)a.raid=0;
      else{
        const d=moveTo(p,o.x,o.y,7);
        if(d<10&&p.pCd<=0){p.ang=Math.atan2(o.y-p.y,o.x-p.x);p.pa=1;a.raid=0;}
        return;
      }
    }
    moveTo(p,p.bx,p.by,1.5);return;
  }
  for(const t of g.toys)if(t.tg===p.id&&dist(t.x,t.y,p.x,p.y)<20){p.pa=1;return;}
  a.raidCd-=dt;
  if(a.raidCd<=0){
    a.raidCd=rnd(L.raidCd[0],L.raidCd[1]);
    let top=null;for(const o of ps)if(!ally(o,p)&&(!top||o.rank<top.rank))top=o;const parkOk=!slope||p.size<8||p.by>FY1-12||!!ledgeAt(p.bx,p.by);
    if(parkOk&&top&&(g.team||top.rank===0)&&top.stun<=0&&dist(top.x,top.y,p.x,p.y)<95&&Math.random()<L.raid){a.raid=3.5;a.raidT=top.id;p.pa=1;return;}
  }
  if(a.help>=0){if(helpOk(g,p,ps[a.help],false)){p.pa=1;return;}helpEnd(a);}
  botItem(g,p,L);
  if(g.team&&HELP_ON[p.team]&&a.helpCd<=0&&a.help<0){
    const o=helpPick(g,p);
    if(o){a.help=o.id;a.hside=0;a.helpT=0;a.hlost=0;a.hstill=0;a.hy=o.y;a.hpx=o.x;a.hpy=o.y;a.raid=0;
      // take the back corner nearest to us
      const s1=helpSpot(o,1),s2=helpSpot(o,-1);a.hside=(inField(s1)?dist(p.x,p.y,s1.x,s1.y):1e9)<=(inField(s2)?dist(p.x,p.y,s2.x,s2.y):1e9)?1:-1;
      p.pa=1;return;}
    a.helpCd=0.5;   // nobody to help right now; look again shortly
  }
  a.restCd-=dt;
  if(a.rest>0){a.rest-=dt;return;}
  if(a.restCd<=0){a.restCd=rnd(L.rest[0],L.rest[1]);a.rest=rnd(L.restL[0],L.restL[1]);if(a.rest>0)return;}
  if(slope){
    const need=g.team?Math.max(1,tGoal(ps.length)-g.tsc[p.team]):GOAL-p.score;
    if(p.size<2){a.climb=false;if(!a.tgtSet){a.tgt=Math.min(need,rnd(26,48));a.tgtSet=true;}}else a.tgtSet=false;
    if(a.tgt==null)a.tgt=rnd(26,48);
    if(p.size>=Math.max(4,a.tgt)||p.size>=need)a.climb=true;else if(p.size<a.tgt*0.6)a.climb=false;
    if(g.tl<16&&p.size>=5)a.climb=true;
    if(a.climb){
      let dodge=0;
      for(const o of ps)if(o!==p&&!o.hold&&!o.parked&&o.bvy>20&&o.size>=8&&o.by<p.y&&p.y-o.by<85&&Math.abs(o.bx-p.x)<radius(o.size)+12)dodge=o.bx>p.x?-1:1;
      if(!dodge)for(const s of g.skiers)if(s.y<p.y&&Math.abs(s.x+s.vx*((p.y-s.y)/Math.max(1,s.vy))-p.x)<12)dodge=s.x>p.x?-1:1;
      if(!L.dodge)dodge=0;
      p.my=-1;p.mx=dodge*1.2;return;
    }
  }
  if(a.t<=0||dist(p.x,p.y,a.gx,a.gy)<8){
    a.t=rnd(2.2,3.4);let bv=-1e9;
    for(let i=0;i<L.samples;i++){
      const x=rnd(FX0+12,FX1-12),y=slope?rnd(FY1-46,FY1-6):rnd(FY0+8,FY1-8);
      let v=snowAt(g.snow,x,y)-dist(p.x,p.y,x,y)*0.0035;
      for(const o of ps)if(o!==p&&dist(o.x,o.y,x,y)<30)v-=0.3;
      for(const s of g.skiers)if(Math.abs(s.x+s.vx*((y-s.y)/Math.max(1,s.vy))-x)<16)v-=0.5;
      if(v>bv){bv=v;a.gx=x;a.gy=y;}
    }
  }
  moveTo(p,a.gx,a.gy,0);
}
function collide(g){
  const ps=g.players,n=ps.length;
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
    const a=ps[i],b=ps[j];let dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy);
    if(d<7){if(d<0.01){dx=1;dy=0;d=1;}const k=(7-d)/2/d;a.x+=dx*k;a.y+=dy*k;b.x-=dx*k;b.y-=dy*k;}
  }
  for(const p of ps)for(const o of ps){
    if(o===p)continue;
    const r=radius(o.size),dx=p.x-o.bx,dy=p.y-o.by,d=Math.hypot(dx,dy),m=r+3;
    if(d<m&&d>0.01){
      const k=(m-d)/d;
      if(o.hold&&o.stun<=0){p.x+=dx*k*0.5;p.y+=dy*k*0.5;o.x-=dx*k*0.5;o.y-=dy*k*0.5;o.bx-=dx*k*0.5;o.by-=dy*k*0.5;}
    }
  }
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
    const a=ps[i],b=ps[j],dx=a.bx-b.bx,dy=a.by-b.by,d=Math.hypot(dx,dy),m=radius(a.size)+radius(b.size);
    const wa=a.hold?1:0,wb=b.hold?1:0;
    if(d<m&&d>0.01&&wa+wb>0){
      const k=(m-d)/d/(wa+wb);
      if(wa){a.x+=dx*k;a.y+=dy*k;}
      if(wb){b.x-=dx*k;b.y-=dy*k;}
    }else if(d<m&&g.mode===1&&a.bvy<5&&b.bvy<5){
      const sft=(dx<0?-1:1)*(m-d)*0.5;
      a.bx=clamp(a.bx+sft,FX0,FX1);b.bx=clamp(b.bx-sft,FX0,FX1);
    }
  }
  for(const p of ps){clampP(p);if(p.hold)placeBall(p);}
}
function step(g,dt){
  g.t+=dt;
  if(g.ph!=='play')return;
  regen(g.snow,dt,g.players.length);
  if(g.startT>0){g.startT-=dt;for(const p of g.players){p.pa=0;p.pb=0;}if(g.startT<=0)emit(g,{e:'go'});return;}
  g.tl-=dt;g.spotCd=Math.max(0,g.spotCd-dt);
  const ps=g.players,sn=g.snow,slope=g.mode===1;
  for(const p of ps){
    if(p.bot)botThink(g,p,dt);
    p.boost=Math.max(0,p.boost-dt);p.pT=Math.max(0,p.pT-dt);p.pCd=Math.max(0,p.pCd-dt);p.relT+=dt;p.cd=Math.max(0,p.cd-dt);
    if(p.stun>0){p.stun-=dt;if(p.stun<=0){p.stun=0;p.inv=1.2;}p.pa=p.pb=0;continue;}
    p.inv=Math.max(0,p.inv-dt);
    let mx=p.mx,my=p.my;const l=Math.hypot(mx,my);if(l>1){mx/=l;my/=l;}
    const moving=l>0.15,r=radius(p.size);
    let sp=p.hold?SPD_HOLD*(1-0.42*p.size/100):SPD_FREE;if(p.boost>0)sp*=1.75;
    p.help=p.hold&&g.team&&ps.some(o=>o!==p&&o.team===p.team&&!o.hold&&o.stun<=0&&(dist(o.x,o.y,p.x,p.y)<13||dist(o.x,o.y,p.bx,p.by)<r+7));
    if(p.help)sp*=1.45;
    if(slope&&moving){const up=Math.max(0,-my),dn=Math.max(0,my);sp*=p.hold?1-0.42*up+0.3*dn:1-0.15*up+0.15*dn;}
    if(moving){
      const ta=Math.atan2(my,mx);
      if(p.hold)p.ang+=clamp(angDiff(ta,p.ang),-TURN*dt,TURN*dt);else p.ang=ta;
    }
    const ox=p.x,oy=p.y;
    if(moving){p.x+=mx*sp*dt;p.y+=my*sp*dt;}
    clampP(p);
    const d=Math.hypot(p.x-ox,p.y-oy);p.walk+=d;
    if(p.hold){
      placeBall(p);p.broll+=d;
      let eq=0.2*d+0.8*sweep(sn,p.bx,p.by,r)/(2*r+3);
      if(slope)eq*=GROW_S*(0.1+1.5*Math.pow(clamp((p.by-FY0)/(FY1-FY0),0,1),2));
      if(eq>0){
        p.size=Math.min(GOAL,p.size+eq*GROW);
        if(p.item===null&&p.cd<=0&&Math.random()<eq*DIG_P){p.item=pickItem(g,p);p.cd=DIG_CD;emit(g,{e:'dig',id:p.id,it:p.item});}
      }
      if(slope&&p.by<=GOAL_Y&&p.size>=1){
        p.score=Math.min(g.team?tGoal(ps.length):GOAL,p.score+p.size);emit(g,{e:'deliver',id:p.id,amt:Math.max(1,Math.round(p.size)),x:p.bx,y:p.by});
        p.size=0;placeBall(p);
      }
    }else{
      const dx=p.bx-p.x,dy=p.by-p.y,dd=Math.hypot(dx,dy);
      if(p.relT>0.35&&!p.noGrab&&dd<r+6&&(dd<3||(moving&&(mx*dx+my*dy)>0.3*dd))){p.hold=true;p.parked=false;p.bvx=p.bvy=0;p.ang=Math.atan2(dy,dx);p.x=p.bx-Math.cos(p.ang)*(r+5);p.y=p.by-Math.sin(p.ang)*(r+5);clampP(p);}
    }
    if(p.pa>0){p.pa=0;if(p.hold)dropBall(g,p);else if(p.pCd<=0)punch(g,p);}
    if(p.pb>0){p.pb=0;useItem(g,p,null);}
  }
  // loose balls roll down the slope
  if(slope)for(const p of ps){
    if(p.hold||p.parked)continue;
    const r=radius(p.size),bot=FY1-r*0.45;
    if(p.by>=bot-0.2){p.by=Math.min(p.by,bot);p.bvy=0;p.bvx=0;continue;}
    p.bvy=Math.min(ROLL_MAX,p.bvy+ROLL_ACC*dt);p.bvx*=Math.max(0,1-1.2*dt);
    let ny=p.by+p.bvy*dt,stop=false;
    for(const L of LEDGES)if(p.bx>=L.x0&&p.bx<=L.x1&&p.by<L.y-6&&ny>=L.y-6){ny=L.y-3;stop=true;p.parked=true;}
    const lo=FX0+r*0.8-2,hi=FX1-r*0.8+2;
    p.bx+=p.bvx*dt;if(p.bx<lo){p.bx=lo;p.bvx=Math.abs(p.bvx);}else if(p.bx>hi){p.bx=hi;p.bvx=-Math.abs(p.bvx);}
    p.broll+=Math.abs(ny-p.by);p.by=ny;
    if(stop||p.by>=bot){
      if(p.by>=bot)p.by=bot;
      if(p.bvy>40)emit(g,{e:'thud',x:p.bx,y:p.by});
      p.bvy=0;p.bvx=0;continue;
    }
    if(p.bvy>30&&p.size>=8)for(const o of ps){
      if(ally(o,p)||o.stun>0||o.inv>0)continue;
      if(dist(o.x,o.y,p.bx,p.by)<r+4){
        if(stun(g,o,0.6+p.size*0.012,(o.x<p.bx?-1:1)*10,5,false))emit(g,{e:'bonk',x:o.x,y:o.y});
      }else if(o.hold&&dist(o.bx,o.by,p.bx,p.by)<r+radius(o.size)){
        if(stun(g,o,0.5+p.size*0.008,0,0,false)){emit(g,{e:'bonk',x:o.bx,y:o.by});p.bvy*=0.5;p.bvx=(p.bx<o.bx?-1:1)*35;}
      }
    }
  }
  // toys
  for(const t of g.toys){
    t.life-=dt;t.hit-=dt;t.rt-=dt;
    if(t.rt<=0){t.rt=0.8;let bd=1e9;t.tg=-1;for(const o of ps)if(!ally(o,ps[t.own])&&o.stun<=0){const d=dist(o.x,o.y,t.x,t.y);if(d<bd){bd=d;t.tg=o.id;}}}
    const o=ps[t.tg];
    if(o){
      const dx=o.x-t.x,dy=o.y-t.y,d=Math.hypot(dx,dy)||1;
      t.x+=dx/d*52*dt;t.y+=dy/d*52*dt;
      if(d<7&&t.hit<=0&&stun(g,o,0.9,dx/d*8,dy/d*8,false)){t.hit=1.4;t.rt=0;}
    }
    if(t.life<=0)emit(g,{e:'toyDie',x:t.x,y:t.y});
  }
  g.toys=g.toys.filter(t=>t.life>0);
  // bombs
  for(const b of g.bombs){
    if(b.ft>0){b.ft-=dt;continue;}
    b.fuse-=dt;
    if(b.fuse<=0){
      emit(g,{e:'boom',x:b.x,y:b.y});
      for(const o of ps){
        if(g.team&&o.team===ps[b.own].team)continue;
        const dx=o.x-b.x,dy=o.y-b.y,d=Math.hypot(dx,dy)||1;
        if(d<BLAST)stun(g,o,2,dx/d*14,dy/d*14,false);
        if(dist(o.bx,o.by,b.x,b.y)<BLAST+radius(o.size)*0.3)chip(g,o,10);
      }
    }
  }
  g.bombs=g.bombs.filter(b=>b.fuse>0);
  // skiers
  g.skiT-=dt;
  if(g.skiT<=0&&g.ski>0){
    const sk=SKI[g.ski];g.skiT=rnd(sk.a,sk.b);const k=Math.random()<sk.k2?2:1;
    for(let i=0;i<k;i++)g.skiers.push({x:rnd(FX0+20,FX1-20),y:FY0-12,vx:rnd(-30,30),vy:rnd(135,165),warn:1.5+i*0.5,hp:0,hb:0,c:(Math.random()*4)|0});
    emit(g,{e:'skiWarn'});
  }
  for(const s of g.skiers){
    if(s.warn>0){s.warn-=dt;continue;}
    s.x+=s.vx*dt;s.y+=s.vy*dt;
    for(const o of ps){
      const bit=1<<o.id;
      if(!(s.hp&bit)&&dist(o.x,o.y,s.x,s.y)<8){s.hp|=bit;stun(g,o,1.3,(o.x<s.x?-1:1)*10,3,false);}
      if(!(s.hb&bit)&&dist(o.bx,o.by,s.x,s.y)<radius(o.size)+3){s.hb|=bit;chip(g,o,3);}
    }
  }
  g.skiers=g.skiers.filter(s=>s.y<H+14);
  // icicles
  for(const i of g.ices){
    i.t-=dt;
    if(i.t<=0){const o=ps[i.tg];emit(g,{e:'ice',x:o.bx,y:o.by,id:o.id});chip(g,o,15);if(o.hold)stun(g,o,1.5,0,0,true);}
  }
  g.ices=g.ices.filter(i=>i.t>0);
  // spotlight: when time runs out, everyone outside a light is struck
  if(g.spot){
    const sp=g.spot;sp.t-=dt;
    if(sp.t<=0){
      const safe=spotOwners(ps,sp).safe;
      for(const o of ps)if(!safe.includes(o.id))stun(g,o,4.5,0,0,true);
      emit(g,{e:'spotEnd',safe});g.spot=null;g.spotCd=SPOT_CD;
    }
  }
  collide(g);
  // who is helping push (only for drawing their hands on the ball)
  for(const q of ps){
    q.pushA=null;
    if(!g.team||q.hold||q.stun>0)continue;
    for(const o of ps)if(o!==q&&o.team===q.team&&o.hold&&o.stun<=0&&(dist(q.x,q.y,o.x,o.y)<13||dist(q.x,q.y,o.bx,o.by)<radius(o.size)+7)){q.pushA=Math.atan2(o.by-q.y,o.bx-q.x);break;}
  }
  const key=slope?(p=>p.score+p.size*0.5):(p=>p.size);
  let order=ps.slice().sort((a,b)=>key(b)-key(a)||a.id-b.id);
  let done=slope?ps.some(p=>p.score>=GOAL-0.001):order[0].size>=GOAL,tsz=[0,0];
  if(g.team){g.tsc=[0,0];for(const p of ps){g.tsc[p.team]+=slope?p.score:p.size;tsz[p.team]+=p.size;}done=Math.max(g.tsc[0],g.tsc[1])>=tGoal(ps.length)-0.001;}
  if(done||g.tl<=0){
    if(slope)order=ps.slice().sort((a,b)=>b.score-a.score||b.size-a.size||a.id-b.id);
    order.forEach((p,i)=>p.rank=i);
    if(g.team){const d=g.tsc[0]-g.tsc[1]||tsz[0]-tsz[1];g.wteam=d<0?1:0;}
    const wins=p=>g.team?p.team===g.wteam:p.id===g.win;
    g.ph='end';g.win=g.team?order.find(p=>p.team===g.wteam).id:order[0].id;g.endT=g.t;g.tl=Math.max(0,g.tl);emit(g,{e:'win',id:g.win});
    for(const p of ps){p.stun=0;p.inv=0;p.mx=p.my=0;emit(g,{e:'say',id:p.id,set:wins(p)?'win':'lose',k:(Math.random()*4)|0});}
  }else order.forEach((p,i)=>p.rank=i);
}

