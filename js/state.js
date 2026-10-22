'use strict';
// ---------------------------------------------------------------- app state
let role='demo';              // demo | host | client
let scene='title';            // title | lobby | game | result
let G=null,V=null,me=-1,online=false,isHostUi=true;
let roster=[],peer=null,hostConn=null,roomCode='',botCount=3,curTeam=0,curMode=0,curSki=2,curLv=1,myPre=0,themeSel='now',curTheme='';
try{const v=+localStorage.getItem('yk-lv');if(localStorage.getItem('yk-lv')!=null&&v>=0&&v<=2)curLv=v;const q=+localStorage.getItem('yk-pre');if(q>=0&&q<=3)myPre=q;const t=localStorage.getItem('yk-theme');if(['now','rand','day','eve','night'].includes(t))themeSel=t;}catch(_){}
const LINES={pre:['勝負だ！','かかってこい！','負けないよ！','雪だるまは渡さない！'],win:['やったー！','雪だるま完成！','楽勝だね！','みんな、ありがとう！'],lose:['くやしい！','次は勝つ！','もう一回！','やるじゃん…']};
let says={};
const THEME={
  day:{sky:['#aecbe8','#bad3ec','#c8dcef','#d6e3f1','#e6e9f1','#f3ebec','#fbeee4'],sun:['#fff8e8','#ffffff',112,38,8],far:['#a9bbd9','#f4f8fc','#dbe5f2'],near:['#8fa6ca','#e9f0f8','#cddbec'],stars:0,ov:null},
  eve:{sky:['#5d68a4','#7b76ab','#a081a6','#c78d96','#e09b85','#efae79','#f6c17b'],sun:['#ffc46e','#ffe2a0',150,50,11],far:['#9785ab','#f7dcd6','#dcbfc7'],near:['#776895','#efd0cf','#d2b4c0'],stars:0,ov:'rgba(255,140,80,0.11)'},
  night:{sky:['#0a1430','#0e1a3a','#122244','#172a4f','#1c325a','#223a64','#28426e'],sun:['#ece9cf','#faf8ea',66,20,7],far:['#2f4068','#c2cee4','#9fb0cf'],near:['#263557','#b3c2dc','#8fa2c4'],stars:110,ov:'rgba(18,28,78,0.36)'}
};
function resolveTheme(forMatch){
  if(themeSel==='now'){const h=new Date().getHours();return h>=6&&h<16?'day':h>=16&&h<19?'eve':'night';}
  if(themeSel==='rand')return forMatch||!curTheme?['day','eve','night'][(Math.random()*3)|0]:curTheme;
  return themeSel;
}
function applyTheme(t){if(!THEME[t])t='day';if(t===curTheme)return;curTheme=t;drawBg();drawBg2();}
try{const k=+localStorage.getItem('yk-ski');if(localStorage.getItem('yk-ski')!=null&&k>=0&&k<=3)curSki=k;}catch(_){}
try{curMode=localStorage.getItem('yk-mode')==='1'?1:0;curTeam=localStorage.getItem('yk-team')==='1'?1:0;}catch(_){}
let prevS=null,curS=null,curAt=0,evOut=[];
const inp={mx:0,my:0,a:0,b:0,ca:0,cb:0,aim:false};
let aimBy=null,aimTxt='',hintNow=null;
const isTouch=!!(window.matchMedia&&window.matchMedia('(pointer:coarse)').matches);
let muted=false,AC=null;


