'use strict';
// ---------------------------------------------------------------- client view
function makeView(list,mode,team){
  return{mode:mode===1?1:0,team:!!team,wteam:-1,tl:mode===1?MATCH_S:MATCH,ph:'play',win:-1,startT:3,toys:[],bombs:[],skiers:[],ices:[],spot:null,snow:new Float32Array(GW*GH).fill(1),
    players:list.map((r,i)=>({id:i,name:r.name,color:r.color,team:team&&r.team>=0?r.team:-1,x:0,y:0,ang:0,hold:true,bx:0,by:0,size:0,score:0,stun:0,stun0:0,inv:0,item:null,cd:0,boost:0,pT:0,rank:i,walk:0,broll:0,pushA:null}))};
}
const r1=v=>Math.round(v*10)/10,r2=v=>Math.round(v*100)/100;
function packSnap(g){
  return{t:'s',tl:r1(g.tl),ph:g.ph,win:g.win,wt:g.wteam,st:r2(Math.max(0,g.startT)),
    P:g.players.map(p=>[r1(p.x),r1(p.y),r2(p.ang),p.hold?1:0,r1(p.bx),r1(p.by),r1(p.size),r2(p.stun),p.inv>0?1:0,p.item,r1(p.cd),r2(p.boost),r2(p.pT),p.rank,Math.round(p.walk),r2(p.stun0),r1(p.score),Math.round(p.broll),p.pushA==null?null:r2(p.pushA)]),
    T:g.toys.map(t=>[r1(t.x),r1(t.y),t.k,t.tg]),
    B:g.bombs.map(b=>[r1(b.x),r1(b.y),r2(b.fuse),r2(b.ft),r1(b.sx),r1(b.sy)]),
    S:g.skiers.map(s=>[r1(s.x),r1(s.y),r1(s.vx),r1(s.vy),r2(s.warn),s.c]),
    I:g.ices.map(i=>[i.tg,r2(i.t)]),
    sp:g.spot?{by:g.spot.by,s0:g.spot.s0,t:r2(g.spot.t),dur:g.spot.dur,pts:g.spot.pts.map(q=>[Math.round(q.x),Math.round(q.y)])}:null,
    E:evOut.splice(0)};
}
function buildView(now){
  const s=curS,o=prevS||curS,a=prevS?clamp((now-curAt)/SNAP_MS,0,1):1;
  V.tl=s.tl;V.ph=s.ph;V.win=s.win;V.wteam=s.wt==null?-1:s.wt;V.startT=s.st;
  V.players.forEach((p,i)=>{
    const c1=s.P[i],c0=o.P[i]||c1;if(!c1)return;
    p.x=lerp(c0[0],c1[0],a);p.y=lerp(c0[1],c1[1],a);p.ang=c0[2]+angDiff(c1[2],c0[2])*a;p.hold=!!c1[3];
    p.bx=lerp(c0[4],c1[4],a);p.by=lerp(c0[5],c1[5],a);p.size=lerp(c0[6],c1[6],a);
    p.stun=c1[7];p.inv=c1[8];p.item=c1[9];p.cd=c1[10];p.boost=c1[11];p.pT=c1[12];p.rank=c1[13];p.walk=lerp(c0[14],c1[14],a);p.stun0=c1[15];p.score=c1[16];p.broll=lerp(c0[17],c1[17],a);p.pushA=c1[18]==null?null:c1[18];
  });
  const same=o.T.length===s.T.length;
  V.toys=s.T.map((t,i)=>({x:same?lerp(o.T[i][0],t[0],a):t[0],y:same?lerp(o.T[i][1],t[1],a):t[1],k:t[2],tg:t[3]}));
  V.bombs=s.B.map(b=>({x:b[0],y:b[1],fuse:b[2],ft:b[3],sx:b[4],sy:b[5]}));
  const sameS=o.S.length===s.S.length;
  V.skiers=s.S.map((k,i)=>({x:sameS?lerp(o.S[i][0],k[0],a):k[0],y:sameS?lerp(o.S[i][1],k[1],a):k[1],vx:k[2],vy:k[3],warn:k[4],c:k[5]}));
  V.ices=s.I.map(i=>({tg:i[0],t:i[1]}));
  V.spot=s.sp?{by:s.sp.by,s0:s.sp.s0||[s.sp.by],t:s.sp.t,dur:s.sp.dur,pts:s.sp.pts.map(q=>({x:q[0],y:q[1]}))}:null;
}

