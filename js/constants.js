'use strict';
const $=id=>document.getElementById(id);
// ---------------------------------------------------------------- constants
const W=384,H=216,FX0=8,FX1=376,FY0=68,FY1=208,CELL=4,GW=96,GY0=60,GH=39;
const GOAL=100,MATCH=210,MATCH_S=240,STEP=1/30;
const SPD_HOLD=46,SPD_FREE=72,TURN=7.5,GROW=0.031,REGEN=24,DIG_P=1/90,DIG_CD=20;
const HOOK_R=120,HOOK_A=0.8,BLAST=28,SPOT_R=12,SNAP_MS=50,PFX='yukikoro-v4-';
const GOAL_Y=FY0+12,ROLL_ACC=95,ROLL_MAX=125,SPOT_CD=25,STUN_PX=4,GROW_S=1.0;
const LEDGES=[{x0:40,x1:100,y:150},{x0:162,x1:222,y:120},{x0:284,x1:344,y:150}];
const SKI=[{n:'なし'},{n:'少ない',a:26,b:36,k2:0.15},{n:'ふつう',a:13,b:21,k2:0.35},{n:'多い',a:6,b:10,k2:0.55}];
const MODES=[{n:'雪原',d:'その場で育てて、先に100%にした人の勝ち。'},{n:'坂道',d:'下で育てて頂上の旗まで運ぶ。届けた分だけ雪だるまが育つ。'}];
const COL=[{m:'#e2504c',d:'#a5302f'},{m:'#3f7fd6',d:'#27529a'},{m:'#eaa92a',d:'#a8700f'},{m:'#3fae6b',d:'#23743f'},{m:'#9a62d8',d:'#6a3aa4'},{m:'#ef7fb0',d:'#b84a80'},{m:'#35b3c4',d:'#1d7884'}];
const tGoal=n=>Math.round(n/2)*100,TEAMC=[[0,2,5],[1,6,4]],TEAMN=['赤チーム','青チーム'],TCOL=[{m:'#e2504c',d:'#a5302f'},{m:'#3f7fd6',d:'#27529a'}];
const ally=(a,b)=>a===b||(a.team>=0&&a.team===b.team);   // a teammate counts as yourself
function teamList(list,team){return list.map((r,i)=>Object.assign({},r,team?{team:i%2,color:TEAMC[i%2][i>>1]}:{team:-1}));}
const BOTN=['ユキオ','コナ','ツララ','モグ','シロ','ポン'];
const ITEMS={
  ski:{n:'スキー板',d:'5秒間スピードアップ。転がす速さも上がる。'},
  hook:{n:'フック',d:'向いている先（扇形の範囲）の相手に引っかける。雪玉を持っていれば相手を引き寄せ、手ぶらなら自分が飛んでいく。'},
  toy:{n:'ヘビのおもちゃ',d:'近くの相手を8秒追いかけて、かみつくたびに気絶させる。パンチで壊せる（ねらわれると頭の上に手のマークが出る）。'},
  bomb:{n:'ばくだん',d:'前に投げる。爆発に巻きこんだ雪玉は10%小さくなり、人は気絶する。自分も巻きこまれる。'},
  ice:{n:'つらら',d:'自分以外でいちばん大きい雪玉に落ちて、15%小さくする。持っていた人は気絶する。落ちる前に手をはなせば気絶しない（雪玉は減る）。'},
  spot:{n:'スポットライト',d:'下位だけが掘れる。暗くなったら光の中へ。光は1人用で、入っている人の色になる。使った人には専用の光がついてくる。入れなかった人には雷が落ちる。'}
};
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, rnd=(a,b)=>a+Math.random()*(b-a);
const angDiff=(a,b)=>{let d=(a-b)%(Math.PI*2);if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;return d};
const radius=s=>3.5+0.145*s;
const dist=(ax,ay,bx,by)=>Math.hypot(ax-bx,ay-by);

