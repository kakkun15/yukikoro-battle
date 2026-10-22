'use strict';
// ---------------------------------------------------------------- music (NES-style: 2 pulse, triangle, noise)
const rep_=(s,n)=>Array(n).fill(s).join(' ');
function chordBars(chords,steps,pat,len,oct){ // one chord per bar -> broken-chord pattern
  return chords.map(c=>{const ns=CH[c].map(x=>x+(oct||4)),o=[];for(let i=0;i<steps/len;i++){const k=pat[i%pat.length];o.push((k<0?'R':ns[k%ns.length])+':'+len);}return o.join(' ');}).join(' ');
}
function bassBars(chords,pat){ // pat entries: 'r' root, 'f' fifth below, 'o' root octave up, '-' rest; each '' token = len
  return chords.map(c=>pat.map(t=>{const[k,l]=t.split(':');const b=BASS[c];return(k==='r'?b[0]:k==='f'?b[1]:k==='o'?b[2]:'R')+':'+l;}).join(' ')).join(' ');
}
const CH={C:['C','E','G'],Dm:['D','F','A'],D:['D','F#','A'],Em:['E','G','B'],E:['E','G#','B'],F:['F','A','C'],G:['G','B','D'],Gm:['G','Bb','D'],A:['A','C#','E'],Am:['A','C','E'],Bb:['Bb','D','F'],B:['B','D#','F#'],Eb:['Eb','G','Bb'],Edim:['E','G','Bb'],Cm:['C','Eb','G']};
const BASS={C:['C3','G2','C4'],Dm:['D3','A2','D4'],D:['D3','A2','D4'],Em:['E3','B2','E4'],E:['E3','B2','E4'],F:['F2','C3','F3'],G:['G2','D3','G3'],Gm:['G2','D3','G3'],A:['A2','E3','A3'],Am:['A2','E3','A3'],Bb:['Bb2','F3','Bb3'],B:['B2','F#3','B3'],Eb:['Eb3','Bb2','Eb4'],Edim:['E3','Bb2','E4'],Cm:['C3','G2','C4']};
const SONGS={};
(function(){
  // Jingle Bells (J. Pierpont, 1857)
  const jv='G4:4 E5 D5 C5 G4:12 G4:2 G4:2 G4:4 E5 D5 C5 A4:16 A4:4 F5 E5 D5 B4:16 G5:4 G5 F5 D5 E5:16 G4:4 E5 D5 C5 G4:16 G4:4 E5 D5 C5 A4:12 A4:4 A4:4 F5 E5 D5 G5:4 G5 G5 G5 A5:4 G5 F5 D5 C5:16';
  const jc='E5:4 E5 E5:8 E5:4 E5 E5:8 E5:4 G5 C5:6 D5:2 E5:16 F5:4 F5 F5:6 F5:2 F5:4 E5 E5 E5:2 E5:2 E5:4 D5 D5 E5 D5:8 G5:8 E5:4 E5 E5:8 E5:4 E5 E5:8 E5:4 G5 C5:6 D5:2 E5:16 F5:4 F5 F5:6 F5:2 F5:4 E5 E5 E5:2 E5:2 G5:4 G5 F5 D5 C5:16';
  const jch='C C C F F G G C C C C F F G G C C C C C F C D G C C C C F C G C'.split(' ');
  SONGS.jingle={n:'ジングルベル',bpm:176,battle:1,d1:0.5,d2:0.25,v:[0.10,0.05,0.16,0.08],
    p1:jv+' '+jc,p2:chordBars(jch,16,[-1,1,-1,2],2,4),tri:bassBars(jch,['r:4','f:4','r:4','f:4']),noi:rep_('K:2 H:2 S:2 H:2 K:2 H:2 S:2 H:2',32)};
  // Original: Yukigassen march
  const mm='D5:2 G5:2 B5:4 A5:2 G5:2 D5:4 B4:4 D5:4 G5:8 E5:2 G5:2 C6:4 B5:2 A5:2 G5:4 F#5:4 A5:4 D5:8 D5:2 G5:2 B5:4 D6:4 B5:4 C6:4 B5:2 A5:2 G5:4 E5:4 A5:4 C6:4 B5:2 A5:2 G5:4 F#5:6 E5:2 D5:8 '+
    'E5:4 E5:2 F#5:2 G5:4 E5:4 D5:4 B4:4 G4:8 C5:4 E5:4 A5:4 G5:4 F#5:4 A5:4 D6:8 B5:4 B5:2 A5:2 G5:4 D5:4 E5:4 G5:4 C6:8 A5:4 F#5:4 D5:4 F#5:4 G5:8 R:4 D5:4';
  const mch='G G C D G Em Am D C G Am D G C D G'.split(' ');
  SONGS.march={n:'雪合戦マーチ',bpm:168,battle:1,d1:0.25,d2:0.125,v:[0.10,0.05,0.16,0.08],
    p1:mm,p2:chordBars(mch,16,[-1,1,-1,2],2,4),tri:bassBars(mch,['r:4','f:4','r:4','f:4']),noi:rep_('K:4 S:4 K:2 K:2 S:4',16)};
  // Original: Fubuki (blizzard on the slope)
  const fm='A4:4 D5:4 F5:4 E5:2 D5:2 D5:4 C5:2 Bb4:2 F5:8 E5:4 G5:4 E5:2 C5:2 E5:4 C#5:6 A4:2 E5:8 A4:4 D5:4 F5:4 A5:4 G5:4 F5:2 E5:2 D5:8 Bb5:4 A5:2 G5:2 F5:4 E5:4 E5:6 C#5:2 A4:8 '+
    'F5:2 F5:2 R:2 F5:2 G5:4 A5:4 G5:4 E5:4 C5:8 D5:2 D5:2 R:2 D5:2 E5:4 F5:4 F5:4 D5:4 Bb4:8 G5:4 F5:2 G5:2 Bb5:4 A5:4 G5:4 F5:2 E5:2 C5:8 E5:4 C#5:4 E5:4 G5:4 A5:8 G5:4 E5:4';
  const fch='Dm Bb C A Dm Bb Gm A F C Dm Bb Gm C A A'.split(' ');
  SONGS.fubuki={n:'ふぶきの坂道',bpm:152,battle:1,d1:0.25,d2:0.125,v:[0.10,0.045,0.16,0.08],
    p1:fm,p2:chordBars(fch,16,[0,1,2,1],1,4),tri:bassBars(fch,['r:2','o:2','r:2','o:2','r:2','o:2','r:2','o:2']),noi:rep_('K:2 H:2 S:2 H:2 K:2 K:2 S:2 H:2',16)};
  // Original: Yuki no yado (calm, for menus)
  const ym='C5:4 F5:4 A5:6 G5:2 F5:4 D5:4 A4:8 Bb4:4 D5:4 F5:6 E5:2 D5:4 C5:4 G4:8 C5:4 F5:4 A5:6 C6:2 Bb5:4 A5:4 F5:8 D5:4 F5:4 E5:4 G5:4 F5:16 '+
    'A5:4 G5:4 F5:4 E5:4 D5:8 F5:8 G5:4 F5:4 E5:4 D5:4 C5:8 E5:8 F5:4 A5:4 G5:4 F5:4 E5:4 D5:4 C5:8 D5:4 E5:4 G5:4 E5:4 F5:16';
  const ych='F Dm Bb C F Bb C F F Dm C C F C C F'.split(' ');
  SONGS.yado={n:'雪の宿',bpm:92,battle:0,d1:0.25,d2:0.125,v:[0.08,0.04,0.12,0.03],
    p1:ym,p2:chordBars(ych,16,[0,1,2,1],2,4),tri:bassBars(ych,['r:8','f:8']),noi:rep_('R:2 h:2',64)};
  // Silent Night (F. X. Gruber, 1818)
  const sm='G5:6 A5:2 G5:4 E5:12 G5:6 A5:2 G5:4 E5:12 D6:8 D6:4 B5:12 C6:8 C6:4 G5:12 A5:8 A5:4 C6:6 B5:2 A5:4 G5:6 A5:2 G5:4 E5:12 A5:8 A5:4 C6:6 B5:2 A5:4 G5:6 A5:2 G5:4 E5:12 D6:8 D6:4 F6:6 D6:2 B5:4 C6:12 E6:12 C6:6 G5:2 E5:4 G5:6 F5:2 D5:4 C5:12 R:12';
  const sch='C C C C G G C C F F C C F F C C G G C C C G C C'.split(' ');
  SONGS.silent={n:'きよしこの夜',bpm:84,battle:0,d1:0.25,d2:0.125,v:[0.08,0.04,0.12,0],
    p1:sm,p2:chordBars(sch,12,[0,1,2,1,2,1],2,4),tri:bassBars(sch,['r:6','f:6']),noi:'R:'+(24*12)};
  // Die Schlittenfahrt (W. A. Mozart, 3 German Dances K.605 No.3, Trio, 1791)
  // melody, bass and bell pitches read from the 1881 Breitkopf & Haertel score (Mozarts Werke, Serie XI No.13; IMSLP #24315)
  const zA='F5:8 A5:2 F5:2 E5:4 G5:4 Bb5:4 Bb5:8 G5:2 E5:2 F5:4 A5:4 C6:4 C6:8 A5:2 F5:2 E5:4 G5:4 Bb5:4 Bb5:8 G5:2 E5:2 F5:4 R:8';
  const zB='F5:8 Bb5:2 D6:2 C6:4 A5:4 F5:4 F5:8 Bb5:2 D6:2 C6:4 A5:4 F5:4 E5:8 G5:2 E5:2 F5:4 A5:4 C6:4 Bb5:8 G5:2 E5:2 F5:4 R:8';
  const bell=ns=>ns.split(' ').map(n=>rep_(n+':2 R:2',3)).join(' ');   // sleigh bells on every beat (top bell of each bar, an octave up)
  const zbA=bell('F6 E6 G6 A6 A6 G6 G6 A6'),zbB=bell('F6 A6 F6 A6 G6 A6 G6 A6');
  const zlA='F3:4 R:8 C3:4 R:8 C3:4 R:8 F3:4 R:8 F3:4 R:8 C3:4 R:8 C3:4 R:8 F3:4 C3:4 F2:4';
  const zlB='F3:4 R:8 F3:4 R:8 F3:4 R:8 F3:4 R:8 C3:4 R:8 F3:4 R:8 C3:4 R:8 F3:4 C3:4 F2:4';
  SONGS.sleigh={n:'そりすべり（モーツァルト）',bpm:168,battle:1,d1:0.25,d2:0.125,v:[0.10,0.035,0.16,0.05],
    p1:[zA,zA,zB,zB].join(' '),p2:[zbA,zbA,zbB,zbB].join(' '),tri:[zlA,zlA,zlB,zlB].join(' '),noi:rep_('h:4',96)};
  // Dies irae (G. Verdi, Requiem, 1874) - arranged
  SONGS.dies=DIES();
})();
function DIES(){
  // Verdi, Requiem No.2 "Dies irae", bars 1-10 (bars 11- repeat them). Read from the vocal score,
  // Edition Peters No.4251 (ed. Kurt Soldan, 1937, plate 10962; IMSLP #698735). Allegro agitato, half = 80.
  // p1 = choir (tenors/basses then sopranos), p2 = strings / piano right hand, tri = piano left hand, noi = bass drum
  const t='2.6666667',ham='G5:2 R:6 G5:2 R:6',hamB='D5:2 R:6 D5:2 R:6';
  const run=n=>n.split(' ').map(x=>x+':1').join(' ');
  const p1=rep_(ham,2)+' '+
    'R:8 Eb5:7 Eb5:1 E5:7 E5:1 F5:4 F#5:4 '+                       // Di-es i-rae, di-es
    'G5:8 F#5:4 F5:4 E5:4 Eb5:4 D5:4 C5:4 '+                        // sopranos: Di-es i-
    `D5:${t} C5:${t} Bb4:${t} C5:${t} D5:${t} Eb5:${t} D5:${t} C5:${t} Bb4:${t} C5:7 D5:1 `+
    'G5:2 R:14 R:16';                                               // -rae,
  const trem=rep_('G4:1 F#4:1',4)+' '+rep_('G4:1 F4:1',4);
  const p2=rep_(hamB,2)+' '+
    run('G6 F6 Eb6 D6 C6 Bb5 A5 G5 G6 F6 Eb6 D6 C6 Bb5 A5 G5')+' '+
    'G6:1 E6:1 C#6:1 Bb5:1 G5:2 R:1 G#5:1 A5:2 R:1 A5:0.3333333 B5:0.3333333 C#6:0.3333334 D6:2 R:1 E6:0.3333333 F#6:0.3333333 G6:0.3333334 '+
    rep_(trem,4)+' '+
    run('G6 F6 Eb6 D6 C#6 D6 C6 Bb5 A5 Bb5 A5 G5 F#5 G5 F5 Eb5')+' '+run('D5 Eb5 D5 C5 Bb4 C5 Bb4 A4 G4 F4 Eb4 D4 C4 Bb3 A3 G3');
  const tri=rep_('G2:2 R:6 G2:2 R:6',2)+' '+
    'G2:2 G2:2 Bb2:2 D3:2 Eb3:2 G2:2 Bb2:2 Eb3:2 E3:2 G2:2 Bb2:2 E3:2 F3:2 G2:2 F#3:2 G2:2 '+
    rep_('G2:16',4)+' G2:2 R:14 '+run('D4 Eb4 D4 C4 Bb3 C4 Bb3 A3 G3 F3 Eb3 D3 C3 Bb2 A2 G2');
  const noi=rep_('C:2 R:3 B:1 R:2 C:2 R:3 B:1 R:2',2)+' '+rep_('B:2 H:2 S:2 H:2 B:2 H:2 S:2 S:2',6)+' C:2 R:14 R:8 S:2 S:2 S:2 S:2';
  return{n:'怒りの日（ヴェルディ）',bpm:160,battle:1,d1:0.5,d2:0.25,v:[0.10,0.05,0.17,0.10],p1,p2,tri,noi};
}
const SONG_ORDER=['dies','jingle','sleigh','march','fubuki','yado','silent'];
function parseSeq(str){const out=[];let len=4;for(const t of String(str).trim().split(/\s+/)){if(!t)continue;const i=t.indexOf(':');const n=i<0?t:t.slice(0,i);if(i>=0)len=+t.slice(i+1);out.push([n,len]);}return out;}
const NOTE_I={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function nfreq(n){const m=/^([A-G])([#b]?)(-?\d)$/.exec(n);if(!m)return 0;const k=NOTE_I[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0)+(+m[3]+1)*12;return 440*Math.pow(2,(k-69)/12);}
const MUS={id:null,song:null,ch:[],nodes:new Set(),gain:null,pw:{},noise:null,hold:0};
let bgmBattle='auto',bgmMenu='auto',matchSong='jingle';
try{const ok=v=>v&&(v==='auto'||v==='off'||SONGS[v]);const b=localStorage.getItem('yk-bgm');if(ok(b))bgmBattle=b;const m=localStorage.getItem('yk-bgm-menu');if(ok(m))bgmMenu=m;}catch(_){}
function pickBattle(){const ids=SONG_ORDER.filter(k=>SONGS[k].battle);return ids[(Math.random()*ids.length)|0];}
// ---- getting sound to start on phones
// iPhone browsers (Safari, Brave, in-app browsers) only allow sound to start inside a tap, sometimes leave the
// context stuck in "suspended"/"interrupted", and mute Web Audio with the silent switch. So on every tap until
// sound is running: resume, play a tiny silent buffer, start a silent looping <audio> (this moves the page to
// "media playback"), and if the context still won't run after a couple of taps, throw it away and make a new one.
let keepAlive=null,acFails=0,acTry=0;
function silentWav(){
  const n=4000,b=new Uint8Array(44+n),v=new DataView(b.buffer),w=(o,t)=>{for(let i=0;i<t.length;i++)b[o+i]=t.charCodeAt(i);};
  w(0,'RIFF');v.setUint32(4,36+n,true);w(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);
  v.setUint32(24,8000,true);v.setUint32(28,8000,true);v.setUint16(32,1,true);v.setUint16(34,8,true);w(36,'data');v.setUint32(40,n,true);b.fill(128,44);
  let s='';for(let i=0;i<b.length;i++)s+=String.fromCharCode(b[i]);return'data:audio/wav;base64,'+btoa(s);
}
function newAC(){
  try{if(AC&&AC.close)AC.close();}catch(_){}
  musStop();MUS.gain=null;MUS.pw={};MUS.noise=null;acFails=0;
  AC=new(window.AudioContext||window.webkitAudioContext)();
}
function audioUnlock(tap){
  if(document.hidden)return false;   // game sounds keep firing in the background during a match; never wake audio from there
  try{
    if(!AC)newAC();
    if(tap&&AC.state!=='running'){const now=performance.now();if(now-acTry>800){acTry=now;if(++acFails>=2)newAC();}}   // count separate taps, not the 4 events of one tap
    if(AC.state!=='running'){const r=AC.resume();if(r&&r.then)r.then(()=>{if(AC.state==='running')acFails=0;},()=>{});}else acFails=0;
    if(tap){
      const s=AC.createBufferSource();s.buffer=AC.createBuffer(1,1,22050);s.connect(AC.destination);s.start(0);
      try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch(_){}
      if(!keepAlive){keepAlive=new Audio(silentWav());keepAlive.loop=true;keepAlive.setAttribute('playsinline','');keepAlive.volume=0.01;}
      if(keepAlive.paused&&!muted){const r=keepAlive.play();if(r&&r.catch)r.catch(()=>{});}
    }
  }catch(_){return false;}
  if(!MUS.gain){MUS.gain=AC.createGain();MUS.gain.gain.value=muted?0:0.9;MUS.gain.connect(AC.destination);
    const len=AC.sampleRate,buf=AC.createBuffer(1,len,AC.sampleRate),d=buf.getChannelData(0);let r=1;for(let i=0;i<len;i++){r^=r<<13;r^=r>>17;r^=r<<5;d[i]=((r>>>0)/4294967296)*2-1;}MUS.noise=buf;}
  return true;
}
function pulseWave(duty){
  if(MUS.pw[duty])return MUS.pw[duty];
  const N=48,re=new Float32Array(N),im=new Float32Array(N);
  for(let n=1;n<N;n++)re[n]=2*Math.sin(n*Math.PI*duty)/(n*Math.PI);
  return MUS.pw[duty]=AC.createPeriodicWave(re,im);
}
function musStop(){for(const n of MUS.nodes){try{n.stop();}catch(_){}}MUS.nodes.clear();MUS.id=null;MUS.song=null;}
function musPlay(id){
  musStop();if(!id||!SONGS[id]||!AC||!MUS.gain)return;
  const s=SONGS[id],t=AC.currentTime+0.08;
  MUS.id=id;MUS.song=s;MUS.ch=['p1','p2','tri','noi'].map(k=>({k,ev:parseSeq(s[k]||''),i:0,t}));
}
function track(node,t1){MUS.nodes.add(node);node.onended=()=>MUS.nodes.delete(node);node.stop(t1);}
function playTone(k,n,t,dur,s){
  const f=nfreq(n);if(!f)return;
  const o=AC.createOscillator(),g=AC.createGain(),v=s.v[k==='p1'?0:k==='p2'?1:2];if(!v)return;
  if(k==='tri')o.type='triangle';else o.setPeriodicWave(pulseWave(k==='p1'?s.d1:s.d2));
  o.frequency.setValueAtTime(f,t);
  const gl=Math.max(0.03,dur*(k==='tri'?0.95:0.86));
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+0.006);
  if(k!=='tri')g.gain.setTargetAtTime(v*0.55,t+0.02,0.12);
  g.gain.setTargetAtTime(0,t+gl,0.015);
  o.connect(g);g.connect(MUS.gain);o.start(t);track(o,t+gl+0.1);
}
function playDrum(n,t,s){
  const v=s.v[3];if(!v||!MUS.noise)return;
  const mk=(dur,type,freq,vol)=>{const b=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();b.buffer=MUS.noise;f.type=type;f.frequency.value=freq;
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);b.connect(f);f.connect(g);g.connect(MUS.gain);b.start(t,Math.random()*0.5);track(b,t+dur+0.02);};
  const thump=(f0,f1,dur,vol)=>{const o=AC.createOscillator(),g=AC.createGain();o.type='triangle';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);o.connect(g);g.connect(MUS.gain);o.start(t);track(o,t+dur+0.02);};
  if(n==='K')thump(160,45,0.12,v*2.2);
  else if(n==='S')mk(0.12,'bandpass',1800,v*1.4);
  else if(n==='H')mk(0.04,'highpass',7000,v*0.7);
  else if(n==='h')mk(0.03,'highpass',8000,v*0.5);
  else if(n==='B'){thump(110,32,0.4,v*3);mk(0.3,'lowpass',500,v*2);}
  else if(n==='C'){mk(0.6,'highpass',3500,v*1.2);thump(120,40,0.25,v*2.4);}
}
function musTick(){
  if(!MUS.id||!AC)return;
  const s=MUS.song,st=60/s.bpm/4,now=AC.currentTime,ahead=now+0.3;
  if(MUS.ch.some(c=>c.ev.length&&c.t<now-0.15)){musPlay(MUS.id);return;}
  for(const c of MUS.ch){
    if(!c.ev.length)continue;
    let guard=0;
    while(c.t<ahead&&guard++<64){
      const e=c.ev[c.i],dur=e[1]*st;
      if(e[0]!=='R'){if(c.k==='noi')playDrum(e[0],c.t,s);else playTone(c.k,e[0],c.t,dur,s);}
      c.t+=dur;c.i=(c.i+1)%c.ev.length;
    }
  }
}
function wantSong(){
  if(performance.now()<MUS.hold)return null;
  if(scene==='game'||scene==='ending'){if(bgmBattle==='off')return null;return bgmBattle==='auto'?matchSong:bgmBattle;}
  if(bgmMenu==='off')return null;
  if(bgmMenu==='auto')return scene==='result'?'silent':'yado';
  return bgmMenu;
}
function musUpdate(){
  if(!AC||!MUS.gain)return;
  // watchdog: while the page is in the background, keep everything stopped even if something woke it up again
  if(document.hidden){bgPaused=true;try{if(AC.state==='running')AC.suspend();}catch(_){}try{if(keepAlive&&!keepAlive.paused)keepAlive.pause();}catch(_){}return;}
  MUS.gain.gain.setTargetAtTime(muted?0:0.9,AC.currentTime,0.05);
  const w=wantSong();if(w!==MUS.id)musPlay(w);
  musTick();
}

