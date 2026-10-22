'use strict';
// ---------------------------------------------------------------- boot
try{const n=localStorage.getItem('yk-name');if(n)$('name').value=n;}catch(_){}
const il=$('itemlist');
for(const k in ITEMS){
  const dt=document.createElement('dt'),dd=document.createElement('dd'),ic=document.createElement('canvas');
  ic.width=ic.height=10;const ix=ic.getContext('2d');icon((x,y,w,h,col)=>{ix.fillStyle=col;ix.fillRect(x,y,w,h);},k,1,1,1);
  dt.append(ic,ITEMS[k].n);dd.textContent=ITEMS[k].d;il.append(dt,dd);
}
renderKeys();renderModes();applyTheme(resolveTheme(false));startDemo();
(()=>{for(const m of[0,1]){const x=$('mi-'+m).getContext('2d'),F=(a,b,w,h,col)=>{x.fillStyle=col;x.fillRect(Math.round(a),Math.round(b),w,h);};
  F(0,0,40,24,'#f3f7fb');
  if(m===0){F(0,0,40,5,'#c8dcef');for(let i=0;i<8;i++)F(4+i*4,15+(i%2),3,2,'#d8e3f0');disc(F,24,15,5,'#a5302f');disc(F,24,15,4,'#fbfdff');F(13,13,3,3,'#e2504c');F(13,16,3,3,'#a5302f');}
  else{for(let y=0;y<24;y++)F(0,y,40,1,'rgba(118,152,204,'+(0.35*(1-y/24)).toFixed(2)+')');for(let k=0;k<40;k+=3)F(k,5,3,1,(k/3)%2?'#d9534f':'#ffffff');F(6,1,1,5,'#4b5d80');F(7,1,3,2,'#d9534f');
    disc(F,20,14,4,'#a5302f');disc(F,20,14,3,'#fbfdff');F(19,19,3,3,'#e2504c');F(30,10,1,7,'#22304a');F(29,11,3,1,'#22304a');F(28,12,5,1,'#22304a');}
}})();
if(window.matchMedia&&window.matchMedia('(max-width:760px)').matches)document.querySelectorAll('.gsec').forEach((d,i)=>{if(i>0)d.open=false;});
for(let i=0;i<900;i++)step(G,STEP);G.ev.length=0;G.spot=null;   // open on a match already in progress
resize();window.addEventListener('resize',resize);
if(window.ResizeObserver)new ResizeObserver(resize).observe(cv);
if(document.fonts&&document.fonts.load)document.fonts.load('16px DotGothic16').catch(()=>{});
let ticker=null;
try{ticker=new Worker(URL.createObjectURL(new Blob(['setInterval(()=>postMessage(0),33)'],{type:'text/javascript'})));ticker.onmessage=simTick;ticker.onerror=()=>{setInterval(simTick,33);};}
catch(_){setInterval(simTick,33);}
requestAnimationFrame(frame);
window.__yk={setHelp(x,y){HELP_ON=[x,y];},newGame,step,radius,setMode,LEDGES,SONGS,parseSeq,MUS,applyTheme,get says(){return says},get G(){return G},get V(){return V},get scene(){return scene},get role(){return role},get me(){return me},get AC(){return AC},get keepAlive(){return keepAlive},get acFails(){return acFails}};
