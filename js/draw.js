'use strict';
// ---------------------------------------------------------------- pixel drawing
const cv=$('cv'),X=cv.getContext('2d');
const off=document.createElement('canvas');off.width=W;off.height=H;const c=off.getContext('2d');
const dark=document.createElement('canvas');dark.width=W;dark.height=H;const dc=dark.getContext('2d');
const bg=document.createElement('canvas');bg.width=W;bg.height=H;
let S=1,texts=[],bubbleQ=[];
const R=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h);};
function disc(F,cx,cy,r,col){cx=Math.round(cx);cy=Math.round(cy);const m=Math.floor(r);for(let dy=-m;dy<=m;dy++){const w=Math.floor(Math.sqrt(r*r-dy*dy)+0.5);F(cx-w,cy+dy,2*w+1,1,col);}}
const T=(s,x,y,size,col,al,ol)=>texts.push([s,x,y,size,col,al||'center',ol]);
const IPAL={r:'#d9534f',k:'#33415c',y:'#f4b860',g:'#3fae6b',d:'#23743f',w:'#ffffff',c:'#7cc4ec',o:'#f08a3c',n:'#8a5a48',s:'#f6d2b0'};
const ICON={
  ski:['......rr','.....rr.','.r..rr..','rr.rr...','.rrr....','.rr.....','rr......','r.......'],
  hook:['k..kk..k','k..kk..k','.kkkkkk.','...kk...','...kk...','...yy...','..yy....','.yy.....'],
  toy:['..gggg..','.gkggkg.','.gggggg.','..dgg...','...ggd..','..dggg..','.ggg..r.','..gggrr.'],
  bomb:['.....y..','....o...','..kkkn..','.kwkkkk.','.kwkkkk.','.kkkkkk.','.kkkkkk.','..kkkk..'],
  ice:['cccccccc','.cwcccc.','.cwcccc.','..cwcc..','..cwcc..','...cc...','...cc...','...c....'],
  fist:['.kkkkkk.','kskskskk','kskskssk','kssssssk','kkkkkssk','kssssskk','.kssssk.','..kkkk..'],
  palm:['.k.k.k..','ksksksk.','ksksksk.','ksksksk.','kssssskk','kssssssk','.kssssk.','..kkkk..'],
  spot:['...yy...','..yyyy..','.kkkkkk.','..y..y..','.y....y.','.y....y.','y......y','yyyyyyyy']
};
function icon(F,name,x,y,s){const d=ICON[name];for(let j=0;j<8;j++)for(let i=0;i<8;i++){const ch=d[j][i];if(ch!=='.')F(x+i*s,y+j*s,s,s,IPAL[ch]);}}
function mul(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function drawBg(){
  const b=bg.getContext('2d'),rr=mul(11),th=THEME[curTheme]||THEME.day,sky=th.sky;b.clearRect(0,0,W,H);
  const F=(x,y,w,h,col)=>{b.fillStyle=col;b.fillRect(Math.round(x),Math.round(y),w,h);};
  sky.forEach((col,i)=>F(0,i*9,W,9,col));
  for(let i=1;i<sky.length;i++)for(let x=0;x<W;x+=2)F(x+(i%2),i*9-1,1,1,sky[i]);
  if(th.stars){const sr=mul(3);for(let i=0;i<th.stars;i++)F((sr()*W)|0,(sr()*54)|0,1,1,sr()<0.3?'#ffffff':'#8fa3cf');}
  {const sn=th.sun;disc(F,sn[2],sn[3],sn[4],sn[0]);disc(F,sn[2],sn[3],sn[4]-2,sn[1]);if(curTheme==='night'){F(sn[2]-2,sn[3]-2,2,2,'#d6d2b6');F(sn[2]+2,sn[3]+1,2,1,'#d6d2b6');}}
  const mtn=(peaks,base,body,cap,shade,jag)=>{
    for(let x=0;x<W;x++){
      let y=base,top=base;
      for(const p of peaks){const yy=p[1]+Math.abs(x-p[0])*p[2];if(yy<y){y=yy;top=p[1];}}
      y=Math.round(y+Math.sin(x*0.7)*jag+Math.sin(x*0.23)*jag);
      if(y>=base)continue;
      F(x,y,1,base-y,body);
      const capH=Math.max(0,Math.round(11-(y-top)*0.55+((x*7)%5)-2));
      if(capH>0)F(x,y,1,Math.min(capH,base-y),cap);
      let px=0;for(const p of peaks)if(p[1]===top)px=p[0];
      if(x>px&&capH>1)F(x,y+1,1,Math.min(capH-1,base-y-1),shade);
    }
  };
  mtn([[40,16,0.75],[150,8,0.62],[262,20,0.8],[350,12,0.7]],60,th.far[0],th.far[1],th.far[2],0.8);
  mtn([[-10,34,0.6],[92,30,0.7],[210,36,0.75],[318,31,0.72],[395,36,0.6]],60,th.near[0],th.near[1],th.near[2],0.6);
  // ski lift
  for(let x=0;x<=150;x++)F(x,46-x*0.2,1,1,'#4b5d80');
  [[30,40],[90,28],[150,16]].forEach(p=>{F(p[0],p[1],1,60-p[1],'#4b5d80');F(p[0]-2,p[1],5,1,'#4b5d80');});
  // field
  F(0,58,W,H-58,'#f2f6fb');
  for(let x=0;x<W;x++){const h=Math.round(Math.sin(x*0.11)*1.5+Math.sin(x*0.37)*0.8);F(x,57+h,1,3-h,'#f2f6fb');F(x,57+h,1,1,'#ffffff');}
  for(let i=0;i<650;i++){const x=(rr()*W)|0,y=62+((rr()*(H-62))|0);F(x,y,1,1,rr()<0.55?'#ffffff':'#e6eef7');}
  // pines
  const pine=(x,by,h,c1,c2)=>{
    F(x,by-2,1,3,'#5a3a2d');
    for(let j=0;j<h;j++){const w=Math.floor((j%5)*0.7+j*0.22)+1;F(x-w,by-h+j-1,2*w+1,1,j%5===4?c2:c1);}
    for(let j=0;j<h;j+=5){const w=Math.floor(j*0.22)+1;F(x-w,by-h+j-1,w+1,1,'#f6fafd');}
    F(x,by-h-2,1,1,'#f6fafd');
  };
  [[6,60,15],[20,61,19],[58,59,13],[70,61,17],[168,59,12],[180,61,16],[194,60,13],[208,61,18],[318,60,14],[330,61,19],[344,60,13],[362,61,17],[376,60,14]].forEach((p,i)=>pine(p[0],p[1],p[2],i%2?'#2f5d62':'#27504f',i%2?'#24484d':'#1d3d3f'));
  // lift hut
  F(34,48,16,11,'#7a4e3a');for(let y=50;y<59;y+=3)F(34,y,16,1,'#69412f');
  F(32,45,20,3,'#f7fafd');F(32,48,20,1,'#c9d6e6');F(38,52,4,4,'#f8c868');
  // lodge
  const lx=236;
  F(lx+6,43,58,19,'#7a4e3a');for(let y=45;y<61;y+=3)F(lx+6,y,58,1,'#69412f');
  F(lx+6,60,58,3,'#8d99ad');F(lx+6,60,58,1,'#a9b4c6');
  for(let y=22;y<=43;y++){const h=Math.round((y-22)*1.62);F(lx+35-h,y,2*h,1,'#f7fafd');F(lx+35,y,h,1,'#e3ecf6');}
  F(lx,44,70,1,'#c9d6e6');F(lx+2,45,66,1,'#4e2f22');
  for(let y=33;y<=43;y++){const h=Math.round((y-31)*1.5);F(lx+35-h,y,2*h,1,'#6b4332');}
  F(lx+33,36,5,5,'#4e2f22');
  F(lx+52,22,5,10,'#8a5a48');F(lx+51,21,7,2,'#ffffff');
  F(lx+31,50,8,12,'#3d2418');F(lx+30,49,10,1,'#4e2f22');
  [10,20,44,54].forEach(dx=>{F(lx+dx-1,49,8,8,'#4e2f22');});
  F(lx+4,63,62,2,'#ffffff');
  // light pole + posts for the string lights
  F(214,46,1,16,'#4b5d80');F(213,45,3,1,'#4b5d80');
  // side nets
  for(let y=70;y<H-6;y+=12){F(2,y,1,7,'#e07b39');F(W-3,y,1,7,'#e07b39');F(2,y+1,1,1,'#fff');F(W-3,y+1,1,1,'#fff');}
  for(let y=70;y<H-12;y+=2){F(2,y,1,1,'rgba(224,123,57,.35)');F(W-3,y,1,1,'rgba(224,123,57,.35)');}
  // bottom fence
  F(0,H-4,W,1,'#b98c63');
  for(let x=10;x<W;x+=28){F(x,H-7,2,7,'#7a4e3a');F(x-1,H-8,4,1,'#ffffff');}
}
const bg2=document.createElement('canvas');bg2.width=W;bg2.height=H;
const over2=document.createElement('canvas');over2.width=W;over2.height=H;
function drawBg2(){
  const b=bg2.getContext('2d'),rr=mul(5);b.clearRect(0,0,W,H);b.drawImage(bg,0,0);
  const F=(x,y,w,h,col)=>{b.fillStyle=col;b.fillRect(Math.round(x),Math.round(y),w,h);};
  // the higher, the icier
  for(let y=62;y<H-8;y++){const t=(y-62)/(H-70);F(3,y,W-6,1,'rgba(118,152,204,'+(0.24*(1-t)*(1-t)).toFixed(3)+')');}
  for(let k=0;k<6;k++){const y0=88+k*21;for(let x=4;x<W-4;x++){if((x+k*5)%4===0)continue;F(x,y0+Math.round(Math.sin(x*0.017+k*1.3)*3),1,1,'rgba(140,168,210,.5)');}}
  // deep drifts at the bottom
  for(let i=0;i<34;i++){const x=8+rr()*(W-30),y=172+rr()*32,w=7+rr()*12;F(x,y,w,1,'#ffffff');F(x+1,y+1,Math.max(1,w-2),1,'#e1e9f4');}
  const o=over2.getContext('2d');o.clearRect(0,0,W,H);
  const O=(x,y,w,h,col)=>{o.fillStyle=col;o.fillRect(Math.round(x),Math.round(y),w,h);};
  // goal line and flags
  for(let x=FX0-4;x<FX1+4;x+=3){const k=((x/3)|0)%2;O(x,GOAL_Y+2,3,2,k?'#d9534f':'#ffffff');O(x,GOAL_Y+4,3,1,k?'#ffffff':'#d9534f');}
  for(let x=20;x<W;x+=43){O(x,GOAL_Y-9,1,13,'#4b5d80');O(x+1,GOAL_Y-9,6,4,'#d9534f');O(x+1,GOAL_Y-8,2,2,'#ffffff');O(x+5,GOAL_Y-8,2,2,'#ffffff');}
  // log fences: loose balls stop here
  for(const L of LEDGES){
    const w=L.x1-L.x0+6,x0=L.x0-3;
    O(x0,L.y-8,w,10,'#fbfdff');O(x0,L.y-8,w,1,'#dfe8f3');
    O(x0,L.y+2,w,3,'#8a5a48');O(x0,L.y+2,w,1,'#b08468');O(x0,L.y+5,w,1,'rgba(100,128,172,.45)');
    for(let x=L.x0;x<=L.x1;x+=12){O(x-1,L.y-2,2,8,'#5a3a2d');O(x-1,L.y-3,2,1,'#ffffff');}
  }
}
function drawBackAnim(t){
  const lx=236;
  // windows flicker
  [10,20,44,54].forEach((dx,i)=>{
    const f=Math.sin(t*3+i*1.7)>0.92?'#f2b450':'#f8c868';
    R(lx+dx,50,6,6,f);R(lx+dx+2,50,1,6,'#4e2f22');R(lx+dx,52,6,1,'#4e2f22');R(lx+dx,50,2,2,'#fde6ae');
  });
  R(lx+34,37,3,3,'#f8c868');R(lx+33,53,2,2,'#f8c868');R(38,52,4,4,Math.sin(t*2)>0.9?'#f2b450':'#f8c868');
  // glow on snow
  for(let i=0;i<4;i++){const dx=[10,20,44,54][i];for(let y=0;y<5;y++)for(let x=-1;x<7;x++)if((x+y)%2===0)R(lx+dx+x,65+y,1,1,'rgba(248,200,104,'+(0.5-y*0.09)+')');}
  // smoke
  for(let i=0;i<4;i++){const k=(t*0.35+i*0.25)%1;const sx=lx+54+Math.sin(k*5+i)*3+k*5,sy=20-k*16;c.globalAlpha=0.75*(1-k);disc(R,sx,sy,1+k*2.4,'#ffffff');c.globalAlpha=1;}
  // string lights
  const cols=['#f4b860','#d9534f','#3fae6b','#3f7fd6'];
  for(let i=0;i<=7;i++){const k=i/7,x=214+k*22,y=46+Math.sin(k*Math.PI)*3;R(x,y,1,1,'#33415c');if(i>0&&i<7)R(x,y+1,1,1,(Math.floor(t*2)+i)%4===0?'#ffffff':cols[i%4]);}
  // lift chairs
  for(let i=0;i<4;i++){const k=((t*0.03+i*0.25)%1),x=k*150,y=46-x*0.2;R(x,y+1,1,3,'#4b5d80');R(x-2,y+4,5,1,'#d9534f');R(x-2,y+5,1,2,'#4b5d80');R(x+2,y+5,1,2,'#4b5d80');}
}
function drawWindows(t){
  const lx=236;
  [10,20,44,54].forEach((dx,i)=>{const f=Math.sin(t*3+i*1.7)>0.92?'#f2b450':'#f8c868';R(lx+dx,50,6,6,f);R(lx+dx+2,50,1,6,'#4e2f22');R(lx+dx,52,6,1,'#4e2f22');R(lx+dx,50,2,2,'#fde6ae');});
  R(lx+34,37,3,3,'#f8c868');R(lx+33,53,2,2,'#f8c868');R(38,52,4,4,'#f8c868');
  c.globalAlpha=0.16;for(const dx of[10,20,44,54])disc(R,lx+dx+3,54,8,'#f8c868');disc(R,40,54,6,'#f8c868');c.globalAlpha=1;
  const cols=['#f4b860','#d9534f','#3fae6b','#3f7fd6'];
  for(let i=1;i<7;i++){const k=i/7,x=214+k*22,y=46+Math.sin(k*Math.PI)*3;R(x,y+1,1,1,(Math.floor(t*2)+i)%4===0?'#ffffff':cols[i%4]);}
}
function drawTrails(sn){
  for(let cy=0;cy<GH;cy++)for(let cx=0;cx<GW;cx++){
    const v=sn[cy*GW+cx];if(v>=0.86)continue;
    const y=GY0+cy*CELL;if(y<60)continue;
    R(cx*CELL,y,CELL,CELL,v<0.3?'#d0dcea':v<0.6?'#dce6f1':'#e8eff6');
    if(v<0.3&&(cx+cy)%2===0)R(cx*CELL+1,y+2,2,1,'#c2d1e4');
  }
}
function drawBall(bx,by,r,roll,col){
  const cx=Math.round(bx),cy=Math.round(by-r*0.55),ri=Math.max(1,r-1),sw=Math.round(r*0.95);
  R(cx-sw,by+r*0.38,2*sw+1,2,'rgba(100,128,172,.38)');R(cx-sw+2,by+r*0.38+2,Math.max(1,2*sw-3),1,'rgba(100,128,172,.38)');
  disc(R,cx,cy,r,col.d);disc(R,cx,cy,ri,'#c5d5e8');
  const o=Math.max(1,Math.round(r*0.14)),rh=ri-o*0.4,m=Math.floor(ri);
  for(let dy=-m;dy<=m;dy++){
    const wi=Math.floor(Math.sqrt(ri*ri-dy*dy)+0.5),dh=dy+o;if(Math.abs(dh)>rh)continue;
    const wh=Math.floor(Math.sqrt(rh*rh-dh*dh)+0.5),x0=Math.max(-wi,-o-wh),x1=Math.min(wi,-o+wh);
    if(x1>=x0)R(cx+x0,cy+dy,x1-x0+1,1,'#fbfdff');
  }
  if(r>5){const a=roll/Math.max(4,r);for(let k=0;k<3;k++){const aa=a+k*2.1;R(cx+Math.cos(aa)*ri*0.55,cy+Math.sin(aa)*ri*0.55,1,1,'#a9bcd6');}}
}
function drawSnowman(bx,by,r,col,t){
  drawBall(bx,by,r,0,col);
  const hr=r*0.62,hy=by-r*1.55-hr*0.2+Math.sin(t*4)*0.6;
  disc(R,bx,hy,hr,col.d);disc(R,bx,hy,hr-1,'#fbfdff');
  R(bx-4,hy-2,2,2,'#22304a');R(bx+3,hy-2,2,2,'#22304a');R(bx,hy+1,4,2,'#f08a3c');
  R(bx-hr+1,hy-hr-1,2*hr-1,2,col.m);R(bx-hr+3,hy-hr-6,2*hr-5,5,col.m);R(bx-hr+3,hy-hr-3,2*hr-5,1,'#ffffff');
  R(bx-r-6,by-r*1.1,7,1,'#5a3a2d');R(bx+r,by-r*1.1,7,1,'#5a3a2d');
  R(bx-1,by-r*0.9,2,2,'#22304a');R(bx-1,by-r*0.4,2,2,'#22304a');
}
const MOUTH={n:'.ssssss.',happy:'.psrrsp.',sad:'.scsscs.'};
const BODY=['...ww...','..HHHH..','.HHHHHH.','.wwwwww.','F','M','mJJJJJJm','mJJJJJJm','.JJJJJJ.','L1','L2'];
const FACE={d:'.skssks.',l:'.ksksss.',r:'.sssksk.',u:'.HHHHHH.'};
const LEGS=[['.PP..PP.','.bb..bb.'],['..PP.PP.','..bb..bb'],['.PP..PP.','.bb..bb.'],['.PP.PP..','bb..bb..']];
function won(p){return V.team?p.team===V.wteam:p.id===V.win;}
function drawPlayer(p,t){
  const col=COL[p.color],pal={w:'#ffffff',H:col.m,s:'#f6d2b0',k:'#22304a',J:col.d,m:col.m,P:'#33415c',b:'#22304a',r:'#c0392b',p:'#f2a1a8',c:'#7cc4ec'};
  const mood=V&&V.ph==='end'&&role!=='demo'?(won(p)?'happy':'sad'):null;
  const x=Math.round(p.x),y=Math.round(p.y)-(mood==='happy'?Math.round(Math.abs(Math.sin(t*9))*3):0);
  if(p.inv&&!p.stun&&Math.floor(t*12)%2)return;
  if(p.team>=0&&V.team&&V.startT>0&&role!=='demo'){const tc=TCOL[p.team];for(let k=0;k<28;k++){const an=k/28*6.283;R(x+Math.cos(an)*11,y-4+Math.sin(an)*9,2,2,tc.m);}}   // countdown: team ring
  if(p.team>=0){R(x-4,y,9,1,TCOL[p.team].m);R(x-3,y+1,7,1,TCOL[p.team].d);}else R(x-3,y,7,1,'rgba(100,128,172,.4)');
  const pushing=!p.hold&&p.pushA!=null,fa=pushing?p.pushA:p.ang,ax=Math.cos(fa),ay=Math.sin(fa);
  const f=mood?'d':Math.abs(ay)>Math.abs(ax)*1.2?(ay<0?'u':'d'):(ax<0?'l':'r');
  const lg=LEGS[Math.floor(p.walk/4)%4];
  if(p.stun>0){
    for(let j=0;j<11;j++){let row=BODY[j];if(row==='F')row=FACE.d;else if(row==='M')row=MOUTH.n;else if(row==='L1')row=LEGS[0][0];else if(row==='L2')row=LEGS[0][1];
      for(let i=0;i<8;i++){const ch=row[i];if(ch!=='.')R(x-6+j,y-7+i,1,1,ch==='k'?'#22304a':pal[ch]);}}
    for(let k=0;k<3;k++){const a=t*6+k*2.1;R(x+Math.cos(a)*6,y-11+Math.sin(a)*2,1,1,'#f4b860');R(x+Math.cos(a)*6,y-12+Math.sin(a)*2,1,1,'#fff3c4');}
    return;
  }
  if(p.boost>0){R(x-5,y,4,1,'#d9534f');R(x+1,y,5,1,'#d9534f');}
  for(let j=0;j<11;j++){let row=BODY[j];if(row==='F')row=FACE[f];else if(row==='M')row=MOUTH[mood||'n'];else if(row==='L1')row=mood?LEGS[0][0]:lg[0];else if(row==='L2')row=mood?LEGS[0][1]:lg[1];
    for(let i=0;i<8;i++){const ch=row[i];if(ch!=='.')R(x-4+i,y-11+j,1,1,pal[ch]);}}
  if(p.hold||pushing){R(x+ax*4-1,y-5+ay*2,2,2,col.m);R(x+ax*5+ay*2-1,y-5+ay*3,2,2,col.m);}
  if(p.pT>0){R(x+ax*7-1,y-6+ay*6,3,3,col.m);R(x+ax*4-1,y-5+ay*4,2,2,col.d);}
}
function drawToy(t,time){
  const x=t.x,y=t.y;R(x-3,y+1,7,1,'rgba(100,128,172,.4)');
  if(t.k===0){for(let i=0;i<6;i++)R(x-5+i*2,y-2+Math.sin(time*14+i*1.2)*1.6,2,2,i===5?'#23743f':'#3fae6b');R(x+7,y-2,2,1,'#d9534f');R(x+5,y-3,1,1,'#fff');}
  else{R(x-2,y-3,5,4,'#7b2d2a');R(x-1,y-4,3,1,'#a5302f');R(x-2,y-3,1,1,'#fff');const l=Math.floor(time*16)%2;R(x-3,y-2+l,1,1,'#22304a');R(x+3,y-1-l,1,1,'#22304a');R(x-3,y,1,1,'#22304a');R(x+3,y,1,1,'#22304a');}
  R(x-1,y-6,2,1,'#8d99ad');R(x-2+Math.floor(time*8)%3,y-7,2,1,'#8d99ad');
}
function draw(time){
  texts=[];bubbleQ=[];hintNow=null;
  const P=V.players,spot=V.spot;
  c.drawImage(V.mode===1?bg2:bg,0,0);drawBackAnim(time);drawTrails(V.snow);if(V.mode===1)c.drawImage(over2,0,0);
  // ground decals
  for(const b of V.bombs)if(b.ft<=0){for(let k=0;k<20;k++){const a=k/20*6.283+time;R(b.x+Math.cos(a)*BLAST,b.y+Math.sin(a)*BLAST,1,1,k%2?'#d9534f':'#f08a3c');}}
  for(const s of V.skiers)if(s.warn>0){
    for(let k=0;k<26;k++){const yy=FY0-8+k*6+((time*30)%6);R(s.x+s.vx*((yy-s.y)/s.vy),yy,1,3,'#d9534f');}
    if(Math.floor(time*6)%2){R(s.x-3,60,7,7,'#d9534f');R(s.x,61,1,3,'#fff');R(s.x,65,1,1,'#fff');}
  }
  let lights=null;
  if(spot){
    const cas=P[spot.by],own=spotOwners(P,spot).own;
    lights=spot.pts.map((q,i)=>({x:q.x,y:q.y,o:own[i]}));
    if(cas)lights.push({x:cas.x,y:cas.y-3,o:cas.id});
    for(const q of lights){const col=q.o>=0?COL[P[q.o].color].m:'#f4b860',sz=q.o>=0?2:1;for(let k=0;k<24;k++){const a=k/24*6.283;R(q.x+Math.cos(a)*SPOT_R,q.y+Math.sin(a)*SPOT_R,sz,sz,col);}}
  }
  // not holding: dotted line to my own ball
  const my=P[me];
  if(my&&!my.hold&&!my.stun&&V.ph==='play'){const d=dist(my.x,my.y,my.bx,my.by),n=Math.floor(d/5);for(let k=1;k<n;k++)R(lerp(my.x,my.bx,k/n),lerp(my.y,my.by,k/n),1,1,COL[my.color].m);}
  // entities
  const ents=[];
  for(const p of P){ents.push({y:p.by,k:0,p});ents.push({y:p.y,k:1,p});}
  for(const t of V.toys)ents.push({y:t.y,k:2,t});
  for(const b of V.bombs)ents.push({y:b.y,k:3,b});
  for(const s of V.skiers)if(s.warn<=0)ents.push({y:s.y,k:4,s});
  ents.sort((a,b)=>a.y-b.y);
  for(const e of ents){
    if(e.k===0){const p=e.p;if(V.ph==='end'&&V.win===p.id){if(V.mode===1)drawSnowman(clamp(p.bx,30,W-30),Math.max(p.by,94),radius(GOAL),COL[p.color],time);else drawSnowman(p.bx,p.by,radius(p.size),COL[p.color],time);}else drawBall(p.bx,p.by,radius(p.size),p.broll,COL[p.color]);}
    else if(e.k===1)drawPlayer(e.p,time);
    else if(e.k===2)drawToy(e.t,time);
    else if(e.k===3){const b=e.b;let x=b.x,y=b.y;if(b.ft>0){const k=1-b.ft/0.35;x=lerp(b.sx,b.x,k);y=lerp(b.sy,b.y,k)-Math.sin(k*Math.PI)*14;}
      R(b.x-2,b.y+1,5,1,'rgba(100,128,172,.4)');disc(R,x,y-3,3,'#22304a');R(x-2,y-5,1,1,'#8d99ad');R(x+1,y-7,1,1,'#8a5a48');R(x+2,y-8,1,1,Math.floor(time*14)%2?'#f4b860':'#d9534f');}
    else{const s=e.s,cc=COL[s.c],x=Math.round(s.x),y=Math.round(s.y);R(x-3,y,7,1,'rgba(100,128,172,.4)');
      R(x-3,y-1,2,4,'#d9534f');R(x+2,y-1,2,4,'#d9534f');R(x-2,y-3,2,2,'#33415c');R(x+1,y-3,2,2,'#33415c');
      R(x-3,y-8,7,5,cc.m);R(x-4,y-7,1,3,cc.d);R(x+4,y-7,1,3,cc.d);R(x-1,y-11,3,3,'#f6d2b0');R(x-2,y-12,5,2,cc.d);R(x-1,y-10,3,1,'#22304a');}
  }
  // icicles
  for(const i of V.ices){
    const p=P[i.tg];if(!p)continue;const r=radius(p.size)+3,cy=p.by-r*0.5,b=Math.floor(time*10)%2?'#2f8fc8':'#7cc4ec';
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(d=>{R(p.bx+d[0]*r-1,cy+d[1]*r,3,1,b);R(p.bx+d[0]*r,cy+d[1]*r-1,1,3,b);});
    const iy=cy-r-i.t*130;for(let j=0;j<12;j++){const w=Math.max(0,3-Math.floor(j/3.2));R(p.bx-w,iy-12+j,2*w+1,1,j<2?'#e8f6fd':'#7cc4ec');}R(p.bx-1,iy-11,1,7,'#ffffff');
  }
  drawAim(P[me],P,time);
  // fx
  for(const l of lines){
    if(l.ring){const rr=(1-l.t/l.m)*BLAST;for(let k=0;k<28;k++){const a=k/28*6.283;R(l.x+Math.cos(a)*rr,l.y+Math.sin(a)*rr,2,2,'#fff3c4');}}
    else{const n=Math.ceil(dist(l.x1,l.y1,l.x2,l.y2)/2);for(let k=0;k<=n;k++)R(lerp(l.x1,l.x2,k/n),lerp(l.y1,l.y2,k/n)-5,1,1,k%2?'#33415c':'#8d99ad');R(l.x2-1,l.y2-6,3,3,'#33415c');}
  }
  for(const p of parts)R(p.x,p.y,p.l>0.25?2:1,p.l>0.25?2:1,p.col);
  {const th=THEME[curTheme];if(th&&th.ov){c.fillStyle=th.ov;c.fillRect(0,0,W,H);drawWindows(time);}}
  // held items and names
  for(const p of P){
    const pop=pops.find(q=>q.id===p.id);
    if(pop){const k=Math.min(1,pop.t/0.5);const x=lerp(p.bx,p.x,k)-4,y=lerp(p.by-6,p.y-22,k)-Math.sin(k*Math.PI)*8;R(x-1,y-1,10,10,'#ffffff');icon(R,pop.it,x,y,1);}
    else if(p.item&&!p.stun){R(p.x-5,p.y-23,10,10,'#ffffff');R(p.x-1,p.y-13,2,1,'#ffffff');icon(R,p.item,p.x-4,p.y-22,1);}
    if(p.stun>0){
      const w0=Math.max(2,Math.round(Math.max(p.stun0,p.stun)*STUN_PX)),w=clamp(Math.round(p.stun*STUN_PX),1,w0),x0=Math.round(p.x-w0/2);
      R(x0-1,p.y-17,w0+2,4,'#22304a');R(x0,p.y-16,w0,2,'#f3f7fb');R(x0,p.y-16,w,2,'#f08a3c');
    }
    if(role!=='demo'){const ny=p.stun>0?p.y-19:p.item?p.y-25:p.y-14;
      T((p.id===me?'▼':'')+p.name,p.x,ny,6,p.team>=0?TCOL[p.team].d:p.id===me?COL[p.color].d:'#3c4d6e','center','#ffffff');if(says[p.id])bubbleQ.push([says[p.id].txt,p.x,ny-8,COL[p.color].d]);}
  }
  // spotlight darkness
  if(spot){
    const k=Math.min(1,(spot.dur-spot.t)*3);
    dc.clearRect(0,0,W,H);dc.globalCompositeOperation='source-over';dc.fillStyle='rgba(14,22,46,'+(0.62*k)+')';dc.fillRect(0,0,W,H);
    dc.globalCompositeOperation='destination-out';dc.fillStyle='#000';
    for(const q of lights){disc((x,y,w,h)=>dc.fillRect(x,y,w,h),q.x,q.y,SPOT_R,'#000');dc.fillStyle='rgba(0,0,0,.28)';dc.beginPath();dc.moveTo(q.x-3,0);dc.lineTo(q.x+3,0);dc.lineTo(q.x+SPOT_R,q.y);dc.lineTo(q.x-SPOT_R,q.y);dc.fill();dc.fillStyle='#000';}
    c.drawImage(dark,0,0);
    for(const q of lights){c.globalAlpha=q.o>=0?0.3:0.16;disc(R,q.x,q.y,SPOT_R,q.o>=0?COL[P[q.o].color].m:'#f4b860');c.globalAlpha=1;}
  }
  for(const b of bolts){
    if(Math.floor(b.t*40)%4===3)continue;
    const rs=mul(b.seed),n=Math.max(2,Math.ceil(b.y/10));let px=b.x+(rs()-0.5)*40,py=0;
    for(let k=1;k<=n;k++){
      const ty=b.y*k/n,tx=k===n?b.x:b.x+(rs()-0.5)*18,st=Math.max(1,Math.ceil(ty-py));
      for(let j=0;j<=st;j++){const x=lerp(px,tx,j/st),y=lerp(py,ty,j/st);R(x-1,y,3,1,'#f4d35e');R(x,y,1,1,'#ffffff');}
      px=tx;py=ty;
    }
  }
  for(const f of floats)T(f.txt,f.x,f.y-f.t*14,9,f.col,'center','#ffffff');
  for(const f of flakes)R(f.x,f.y,f.z,f.z,'#ffffff');
  if(flash>0){c.globalAlpha=Math.min(0.7,flash*5);R(0,0,W,H,'#ffffff');c.globalAlpha=1;}
  if(role!=='demo')drawHud(time);
  // blit
  X.imageSmoothingEnabled=false;
  const sx=shake>0?Math.round(rnd(-2,2))*S:0,sy=shake>0?Math.round(rnd(-2,2))*S:0;
  X.fillStyle='#dfe9f4';X.fillRect(0,0,cv.width,cv.height);
  X.drawImage(off,sx,sy,cv.width,cv.height);
  X.textBaseline='alphabetic';X.lineJoin='round';
  for(const t of texts){
    X.font=Math.max(8,Math.round(t[3]*S))+'px DotGothic16, monospace';X.textAlign=t[5];
    if(t[6]){X.lineWidth=Math.max(2,S*1.2);X.strokeStyle=t[6];X.strokeText(t[0],t[1]*S,t[2]*S);}
    X.fillStyle=t[4];X.fillText(t[0],t[1]*S,t[2]*S);
  }
  for(const q of bubbleQ){
    const fs=Math.max(10,Math.round(7*S)),pad=Math.round(Math.max(4,3*S));X.font=fs+'px DotGothic16, monospace';
    const tw=X.measureText(q[0]).width,bw=tw+pad*2,bh=fs+pad*1.4,ax=q[1]*S,bx=clamp(ax-bw/2,4,cv.width-bw-4),by=Math.max(4,q[2]*S-bh);
    X.fillStyle='#ffffff';X.fillRect(bx,by,bw,bh);X.lineWidth=Math.max(2,Math.round(S*0.8));X.strokeStyle=q[3];X.strokeRect(bx,by,bw,bh);
    X.beginPath();X.moveTo(ax-4*S/2,by+bh);X.lineTo(ax,by+bh+3*S);X.lineTo(ax+4*S/2,by+bh);X.closePath();X.fillStyle='#ffffff';X.fill();X.stroke();X.fillRect(ax-4*S/2+1,by+bh-2,4*S-2,3);
    X.fillStyle='#22304a';X.textAlign='left';X.textBaseline='middle';X.fillText(q[0],bx+pad,by+bh/2+1);X.textBaseline='alphabetic';
  }
}
function mark(x,y,r,col){[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(d=>{R(x+d[0]*r-1,y+d[1]*r,3,1,col);R(x+d[0]*r,y+d[1]*r-1,1,3,col);});}
function drawAim(my,P,time){
  aimTxt='';
  if(!inp.aim||!my||!my.item||my.stun||V.ph!=='play'||V.startT>0)return;
  const it=my.item,ux=Math.cos(my.ang),uy=Math.sin(my.ang),bl=Math.floor(time*8)%2?'#d9534f':'#f08a3c',ln='#3c4d6e';
  const dot=(x,y,col)=>{if(y>=60&&y<H-4)R(x,y,1,1,col);};
  if(it==='hook'){
    for(let k=10;k<=HOOK_R;k+=3){dot(my.x+Math.cos(my.ang-HOOK_A)*k,my.y+Math.sin(my.ang-HOOK_A)*k,ln);dot(my.x+Math.cos(my.ang+HOOK_A)*k,my.y+Math.sin(my.ang+HOOK_A)*k,ln);}
    for(let a=-HOOK_A;a<=HOOK_A;a+=0.03)dot(my.x+Math.cos(my.ang+a)*HOOK_R,my.y+Math.sin(my.ang+a)*HOOK_R,ln);
    const t=hookTarget(P,my,null);
    if(t){
      const n=Math.ceil(dist(my.x,my.y,t.x,t.y)/4);for(let k=1;k<n;k++)dot(lerp(my.x,t.x,k/n),lerp(my.y,t.y,k/n)-4,bl);
      mark(t.x,t.y-5,8,bl);aimTxt=my.hold?'離すと '+t.name+' を引き寄せる':'離すと '+t.name+' に飛びつく';
    }else aimTxt='範囲の中に相手がいない（離すと空振り）';
  }else if(it==='bomb'){
    const q=bombSpot(my,ux,uy);
    for(let k=0;k<32;k++){const a=k/32*6.283;dot(q.x+Math.cos(a)*BLAST,q.y+Math.sin(a)*BLAST,k%2?bl:ln);}
    R(q.x-2,q.y,5,1,bl);R(q.x,q.y-2,1,5,bl);aimTxt='離すと × に投げる（円の中が爆発）';
  }else if(it==='toy'){
    let t=null,bd=1e9;for(const o of P)if(!ally(o,my)&&!o.stun){const d=dist(o.x,o.y,my.x,my.y);if(d<bd){bd=d;t=o;}}
    if(t){mark(t.x,t.y-5,8,bl);aimTxt='離すと '+t.name+' を追いかける';}else aimTxt='離すと おもちゃを放す';
  }else if(it==='ice'){
    let t=null;for(const o of P)if(!ally(o,my)&&(!t||o.rank<t.rank))t=o;
    if(t){const r=radius(t.size)+3;mark(t.bx,t.by-r*0.5,r,bl);aimTxt='離すと '+t.name+' の雪玉に落ちる';}
  }else if(it==='spot'){const o=P.filter(q=>!ally(q,my)).length;aimTxt=V.spot?'いまは使えない（光が出ている）':'離すと 光が '+(V.team?o:o>=2?o-1:1)+' つ出る';}
  else aimTxt='離すと 5秒間スピードアップ';
}
function teamTot(P,t,slope){let s=0;for(const p of P)if(p.team===t)s+=slope?p.score:p.size;return s;}
function drawTeamHud(P,my,slope){
  const bw=118;
  for(let t=0;t<2;t++){
    const x0=4+t*172,y0=4,col=TCOL[t],tot=teamTot(P,t,slope),oth=teamTot(P,1-t,slope);
    R(x0,y0+1,5,5,col.m);R(x0+1,y0,3,1,'#ffffff');R(x0,y0+3,5,1,'#ffffff');
    if(tot>oth&&tot>0.5){R(x0,y0-3,1,2,'#eaa92a');R(x0+2,y0-3,1,2,'#eaa92a');R(x0+4,y0-3,1,2,'#eaa92a');R(x0,y0-2,5,1,'#eaa92a');}
    R(x0+7,y0,bw+2,7,'#22304a');R(x0+8,y0+1,bw,5,'#f3f7fb');
    let fx=0,car=0;
    for(const p of P)if(p.team===t){const w=Math.min(bw-fx,Math.round(bw*(slope?p.score:p.size)/tGoal(P.length)));if(w>0)R(x0+8+fx,y0+1,w,5,COL[p.color].m);fx+=Math.max(0,w);if(slope)car+=p.size;}
    if(car>0){const w=Math.min(bw-fx,Math.round(bw*car/tGoal(P.length)));if(w>0){c.globalAlpha=0.4;R(x0+8+fx,y0+1,w,5,col.m);c.globalAlpha=1;}}
    R(x0+9+bw,y0-2,1,9,'#22304a');R(x0+10+bw,y0-2,3,3,'#d9534f');
    T(String(Math.floor(tot)),x0+14+bw,y0+7,7,'#22304a','left','#ffffff');
    T(TEAMN[t]+(my&&my.team===t?'（あなた）':''),x0+8,y0+15,6,col.d,'left','#ffffff');
  }
}
function drawHud(time){
  const P=V.players,n=P.length,cw=Math.min(66,Math.floor((W-40)/n)),bw=cw-31,my=P[me],slope=V.mode===1;
  if(V.team)drawTeamHud(P,my,slope);
  else P.forEach((p,i)=>{
    const col=COL[p.color],x0=4+i*cw,y0=4,val=slope?p.score:p.size;
    R(x0,y0+1,5,5,col.m);R(x0+1,y0,3,1,'#ffffff');R(x0,y0+3,5,1,'#ffffff');
    if(p.rank===0&&(val>0.5||p.size>0.5)){R(x0,y0-3,1,2,'#eaa92a');R(x0+2,y0-3,1,2,'#eaa92a');R(x0+4,y0-3,1,2,'#eaa92a');R(x0,y0-2,5,1,'#eaa92a');}
    const fw=Math.round(bw*val/GOAL);
    R(x0+7,y0,bw+2,7,'#22304a');R(x0+8,y0+1,bw,5,'#f3f7fb');R(x0+8,y0+1,fw,5,col.m);
    if(slope){const cw2=Math.min(bw-fw,Math.round(bw*p.size/GOAL));if(cw2>0){c.globalAlpha=0.4;R(x0+8+fw,y0+1,cw2,5,col.m);c.globalAlpha=1;}}
    R(x0+9+bw,y0-2,1,9,'#22304a');R(x0+10+bw,y0-2,3,3,'#d9534f');
    T(String(Math.floor(val)),x0+14+bw,y0+7,7,'#22304a','left','#ffffff');
    if(i===me)R(x0,y0+9,bw+9,1,'#22304a');
  });
  const tl=Math.max(0,Math.ceil(V.tl));T(Math.floor(tl/60)+':'+String(tl%60).padStart(2,'0'),W-4,11,8,tl<=20?'#d9534f':'#22304a','right','#ffffff');
  if(my){
    const bx=4,by=H-27,rr=radius(my.size),under=(my.x<150&&my.y>H-40)||(my.bx-rr<150&&my.by+rr*0.5>H-40);
    if(under)c.globalAlpha=0.3;
    R(bx,by,22,22,'#22304a');R(bx+1,by+1,20,20,'#f3f7fb');
    if(under){if(my.item)icon(R,my.item,bx+3,by+3,2);c.globalAlpha=1;}
    else if(my.item){icon(R,my.item,bx+3,by+3,2);T(ITEMS[my.item].n,bx+26,by+10,7,'#22304a','left','#ffffff');if(!aimTxt)T(isTouch?'道具ボタン 長押しで狙う':keyName(KEYS.b[0])+' 長押しで狙う・離して使う',bx+26,by+19,6,'#4a5f85','left','#ffffff');}
    else if(my.cd>0){const h=Math.round(20*my.cd/DIG_CD);R(bx+1,by+21-h,20,h,'#c5d5e8');T(String(Math.ceil(my.cd)),bx+11,by+15,9,'#4a5f85','center');T('次の発掘まで',bx+26,by+14,6,'#4a5f85','left','#ffffff');}
    else{if(Math.floor(time*3)%2)R(bx+9,by+9,4,4,'#f4b860');T('転がして掘り当てろ',bx+26,by+14,6,'#4a5f85','left','#ffffff');}
    const ka=isTouch?'手ボタン':keyName(KEYS.a[0]);
    if(!my.stun&&V.ph==='play'&&V.startT<=0){
      if(my.hold&&V.ices.some(i=>i.tg===me))hintNow='ice';
      else if(V.toys.some(t=>t.tg===me&&dist(t.x,t.y,my.x,my.y)<48))hintNow='toy';
    }
    if(hintNow&&Math.floor(time*4)%2){const hx=Math.round(my.x),hy=Math.round(my.stun>0?my.y-19:my.item?my.y-25:my.y-14)-17;R(hx-5,hy-1,10,10,'#22304a');R(hx-4,hy,8,8,'#ffffff');icon(R,my.hold?'palm':'fist',hx-4,hy,1);if(!isTouch)T(keyName(KEYS.a[0]),hx+7,hy+7,7,'#a5302f','left','#ffffff');}
    if(aimTxt)T(aimTxt,W/2,H-6,7,'#a5302f','center','#ffffff');
    else if(hintNow)T(hintNow==='ice'?'つららが来る！ '+ka+' で手をはなせば気絶しない':my.hold?'ヘビが来る！ '+ka+' で手をはなして、もう一度 '+ka+' でパンチ':'ヘビが来る！ '+ka+' でパンチしてこわせ',W/2,H-6,7,'#a5302f','center','#ffffff');
    else if(!my.hold&&!my.stun&&V.ph==='play'&&V.startT<=0)T((isTouch?'手ボタン':keyName(KEYS.a[0]))+' でパンチ ／ 雪玉に向かって歩くと持つ',W/2,H-6,6,'#22304a','center','#ffffff');
  }
  if(V.startT>0){
    T(String(Math.ceil(V.startT)),W/2,118,40,'#22304a','center','#ffffff');
    if(V.team&&my){
      const col=TCOL[my.team],mates=P.filter(p=>p.team===my.team&&p!==my).map(p=>p.name).join('・');
      R(W/2-62,24,124,15,col.d);R(W/2-61,25,122,13,col.m);
      T('あなたは '+TEAMN[my.team],W/2,35,10,'#ffffff','center',col.d);
      if(mates)T('味方：'+mates,W/2,50,7,col.d,'center','#ffffff');
    }
  }
  if(V.spot){
    const sp=V.spot,mine=sp.by===me,cas=P[sp.by],safe=!mine&&sp.s0.includes(me);
    T(String(Math.max(1,Math.ceil(sp.t))),W/2,52,26,'#f4b860','center','#101a2e');
    T(mine?'あなたのスポットライト。光はついてくる':safe?'味方のスポットライト。先に光に入って相手をじゃましろ！':(cas?cas.name:'')+' のスポットライト。光に入れ！',W/2,66,7,'#ffffff','center','#101a2e');
  }
  const b=banners[0];
  if(b&&V.startT<=0){const y=V.spot?84:44;T(b.t,W/2,y,10,'#22304a','center','#ffffff');}
  if(V.ph==='end'&&V.team&&V.wteam>=0){
    const wt=V.wteam,full=teamTot(P,wt,slope)>=tGoal(P.length)-0.01;
    T(full?TEAMN[wt]+' の雪だるまが完成！':'時間切れ！ '+TEAMN[wt]+' の勝ち',W/2,40,12,TCOL[wt].d,'center','#ffffff');
  }else if(V.ph==='end'&&V.win>=0){
    const w=P[V.win],full=(slope?w.score:w.size)>=GOAL-0.01;
    T(full?w.name+' の雪だるまが完成！':'時間切れ！ '+w.name+' の勝ち',W/2,40,12,COL[w.color].d,'center','#ffffff');
  }
}
function resize(){
  const r=cv.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,3);
  const w=Math.max(W,Math.round(r.width*dpr));
  if(cv.width!==w){cv.width=w;cv.height=Math.round(w*H/W);}
  S=cv.width/W;
}

