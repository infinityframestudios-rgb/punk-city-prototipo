// Audio procedurale (WebAudio): musica synthwave in loop + effetti. Nessun file esterno.
'use strict';
const SFX=(()=>{
 let ctx=null,master,musicG,sfxG,dly,noise,timer=null,step=0,nextT=0,mode=null,muted=false;
 try{muted=localStorage.getItem('pc_mute')=='1'}catch(e){}
 const N=n=>440*Math.pow(2,(n-69)/12);
 const SONGS={
  battle:{bpm:112,ch:[[57,60,64],[53,57,60],[48,52,55],[55,59,62]],lead:[76,0,74,72,0,71,72,0,74,0,76,0,79,0,76,0]},
  boss:{bpm:126,ch:[[50,53,57],[46,50,53],[43,46,50],[45,49,52]],lead:[74,74,0,77,0,76,74,0,73,0,74,0,81,0,77,0]},
  title:{bpm:96,ch:[[57,60,64],[53,57,60],[50,53,57],[52,56,59]],lead:null}};
 function init(){
  if(ctx){if(ctx.state!='running')ctx.resume();return true}
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
  try{ctx=new AC()}catch(e){return false}
  master=ctx.createGain();master.gain.value=muted?0:.9;
  const comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;master.connect(comp);comp.connect(ctx.destination);
  musicG=ctx.createGain();musicG.gain.value=.30;musicG.connect(master);
  sfxG=ctx.createGain();sfxG.gain.value=.8;sfxG.connect(master);
  dly=ctx.createDelay(1);const fb=ctx.createGain(),wet=ctx.createGain();fb.gain.value=.32;wet.gain.value=.35;dly.connect(fb);fb.connect(dly);dly.connect(wet);wet.connect(musicG);
  const len=ctx.sampleRate;noise=ctx.createBuffer(1,len,ctx.sampleRate);const d=noise.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  // sblocco iOS: buffer muto
  const s=ctx.createBufferSource();s.buffer=ctx.createBuffer(1,1,22050);s.connect(ctx.destination);s.start(0);
  if(ctx.state!='running')ctx.resume();
  document.addEventListener('visibilitychange',()=>{if(!ctx)return;document.hidden?ctx.suspend():ctx.resume()});
  return true}
 // --- mattoncini
 function env(g,t,a,peak,dec,sus=0,rel=.05,len=0){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(Math.max(peak*sus,.0001),t+a+dec);if(len){g.gain.setValueAtTime(Math.max(peak*sus,.0001),t+len);g.gain.exponentialRampToValueAtTime(.0001,t+len+rel)}}
 function osc(type,f,t,dur,peak,out,o={}){const v=ctx.createOscillator(),g=ctx.createGain();v.type=type;v.frequency.setValueAtTime(f,t);if(o.to)v.frequency.exponentialRampToValueAtTime(o.to,t+(o.sweep||dur));if(o.det)v.detune.value=o.det;
  let n=v;if(o.lp){const fl=ctx.createBiquadFilter();fl.type='lowpass';fl.frequency.setValueAtTime(o.lp,t);if(o.lpTo)fl.frequency.exponentialRampToValueAtTime(o.lpTo,t+dur);fl.Q.value=o.q||1;v.connect(fl);n=fl}
  n.connect(g);g.connect(out);env(g,t,o.a||.004,peak,dur,o.sus||0);v.start(t);v.stop(t+dur+.1);return v}
 function nz(t,dur,peak,out,type='bandpass',f=1000,o={}){const s=ctx.createBufferSource(),fl=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noise;s.loop=true;fl.type=type;fl.frequency.setValueAtTime(f,t);if(o.to)fl.frequency.exponentialRampToValueAtTime(o.to,t+dur);fl.Q.value=o.q||1;
  s.connect(fl);fl.connect(g);g.connect(out);env(g,t,o.a||.002,peak,dur);s.start(t,Math.random()*.5);s.stop(t+dur+.1)}
 // --- musica
 function sched(t){const S=SONGS[mode];const st=step%16,bar=Math.floor(step/16)%4,ch=S.ch[bar],six=60/S.bpm/4;
  if(mode!='title'){
   if(st%4==0){osc('sine',150,t,.28,.9,musicG,{to:42,sweep:.12})}
   if(st==4||st==12){nz(t,.18,.45,musicG,'highpass',1200);osc('triangle',190,t,.1,.25,musicG,{to:120})}
   if(st%2==1||mode=='boss')nz(t,.04,st%2?.16:.08,musicG,'highpass',7000)}
  else if(st==0)osc('sine',110,t,.5,.4,musicG,{to:40,sweep:.3});
  // basso
  const bassOn=mode=='boss'?true:st%2==0;if(bassOn){const n=ch[0]-12+(mode=='boss'&&st%4==3?12:0);osc('sawtooth',N(n),t,six*1.6,.32,musicG,{lp:900,lpTo:180,q:6})}
  // arpeggio
  if(mode!='title'||st%2==0){const n=ch[[0,1,2,1][st%4]]+12+(st>=8?12:0);const v=osc('square',N(n),t,six*.9,.07,musicG,{lp:2600,lpTo:900});const g2=ctx.createGain();g2.gain.value=.5;}
  if(st%4==0){const n=ch[[0,1,2,1][st%4]]+12;osc('square',N(n+12),t,six*.6,.04,dly,{lp:3000})}
  // pad
  if(st==0)ch.forEach((n,i)=>{[-8,8].forEach(det=>osc('sawtooth',N(n),t,six*15,.035,musicG,{a:.25,sus:.8,lp:1400,det}))});
  // melodia
  if(S.lead){const ln=S.lead[st];if(ln&&bar%2==1){osc('sawtooth',N(ln),t,six*1.8,.06,musicG,{lp:3200,lpTo:1200,sus:.4});osc('sawtooth',N(ln),t,six*1.8,.03,dly,{lp:2400,det:12})}}}
 function tick(){if(!ctx||!mode)return;const S=SONGS[mode],six=60/S.bpm/4;dly.delayTime.value=six*3;while(nextT<ctx.currentTime+.15){sched(nextT);nextT+=six;step++}}
 function music(m){if(!init())return;if(mode==m)return;mode=m;step=0;nextT=ctx.currentTime+.08;if(!timer)timer=setInterval(tick,25)}
 function stopMusic(){mode=null}
 // --- effetti
 const FX={
  ui(t){osc('square',880,t,.05,.12,sfxG,{to:1320,sweep:.04})},
  sword(t){nz(t,.16,.55,sfxG,'bandpass',5000,{to:900,q:2});osc('triangle',1800,t+.02,.18,.08,sfxG,{to:1500})},
  gun(t){nz(t,.12,.9,sfxG,'lowpass',3500,{to:400});osc('sine',160,t,.14,.8,sfxG,{to:45});nz(t+.03,.25,.12,sfxG,'bandpass',1800,{q:.5})},
  whip(t){osc('sine',2400,t,.08,.25,sfxG,{to:500,sweep:.07});nz(t+.06,.06,.9,sfxG,'highpass',3000);osc('sawtooth',1200,t+.06,.12,.08,sfxG,{to:3000,lp:5000})},
  charge(t){osc('sawtooth',160,t,.5,.18,sfxG,{to:1400,sweep:.5,a:.4,sus:.9,lp:3000});osc('sine',320,t,.5,.12,sfxG,{to:2800,sweep:.5,a:.4,sus:.9})},
  rail(t){nz(t,.5,.9,sfxG,'lowpass',8000,{to:200});osc('square',90,t,.45,.5,sfxG,{to:30,lp:1200});osc('sawtooth',3000,t,.25,.18,sfxG,{to:300,lp:6000});osc('sine',55,t,.6,.7,sfxG,{to:30})},
  laser(t){osc('square',1600,t,.15,.12,sfxG,{to:300,lp:4000})},
  hit(t){osc('sine',130,t,.14,.7,sfxG,{to:45});nz(t,.08,.5,sfxG,'lowpass',1800)},
  crit(t){osc('sine',100,t,.25,.9,sfxG,{to:35});nz(t,.18,.7,sfxG,'bandpass',2500,{to:600});osc('square',1320,t+.02,.15,.06,sfxG)},
  perfect(t){osc('sine',1568,t,.25,.18,sfxG);osc('sine',2093,t+.06,.3,.15,sfxG)},
  miss(t){osc('sine',600,t,.12,.1,sfxG,{to:300})},
  heal(t){[72,76,79,84].forEach((n,i)=>osc('sine',N(n),t+i*.06,.3,.12,sfxG))},
  shield(t){osc('triangle',300,t,.3,.2,sfxG,{to:900});nz(t,.25,.15,sfxG,'bandpass',3000,{q:3})},
  shatter(t){nz(t,.3,.6,sfxG,'highpass',2500,{to:6000});[2000,2600,3300].forEach((f,i)=>osc('triangle',f,t+i*.03,.2,.07,sfxG))},
  chainsaw(t){const v=ctx.createOscillator(),g=ctx.createGain(),l=ctx.createOscillator(),lg=ctx.createGain(),fl=ctx.createBiquadFilter();v.type='sawtooth';v.frequency.setValueAtTime(70,t);v.frequency.linearRampToValueAtTime(110,t+.7);
   l.frequency.value=28;lg.gain.value=.25;l.connect(lg);lg.connect(g.gain);fl.type='lowpass';fl.frequency.value=1800;v.connect(fl);fl.connect(g);g.connect(sfxG);g.gain.setValueAtTime(.3,t);g.gain.linearRampToValueAtTime(0,t+.8);v.start(t);l.start(t);v.stop(t+.85);l.stop(t+.85)},
  roar(t){osc('sawtooth',120,t,.7,.4,sfxG,{to:60,lp:700,a:.08});nz(t,.7,.3,sfxG,'bandpass',400,{q:1.5,a:.08})},
  death(t){nz(t,.6,.4,sfxG,'bandpass',3000,{to:200,q:2});osc('square',600,t,.5,.08,sfxG,{to:60,lp:2000})},
  ko(t){osc('triangle',400,t,.6,.25,sfxG,{to:80})},
  wave(t){osc('sawtooth',N(57),t,.4,.12,sfxG,{lp:2000});osc('sawtooth',N(64),t+.12,.5,.12,sfxG,{lp:2000});nz(t,.5,.25,sfxG,'highpass',4000,{to:800})},
  win(t){[69,72,76,81,84].forEach((n,i)=>{osc('square',N(n),t+i*.12,.35,.08,sfxG,{lp:3000});osc('sawtooth',N(n-12),t+i*.12,.35,.05,sfxG,{lp:1500})})},
  lose(t){[64,62,60,57].forEach((n,i)=>osc('triangle',N(n),t+i*.25,.5,.15,sfxG))}};
 function play(n,delay=0){if(!ctx||muted||ctx.state!='running'||!FX[n])return;try{FX[n](ctx.currentTime+.005+delay)}catch(e){}}
 function setMute(v){muted=v;try{localStorage.setItem('pc_mute',v?'1':'0')}catch(e){}if(ctx)master.gain.setTargetAtTime(v?0:.9,ctx.currentTime,.03)}
 return{init,music,stopMusic,play,setMute,get muted(){return muted},get running(){return !!ctx&&ctx.state=='running'},get mode(){return mode}}})();
// primo tocco: sblocca l'audio (regole autoplay su telefono)
['pointerdown','touchend','keydown'].forEach(ev=>window.addEventListener(ev,function f(){if(SFX.init()&&SFX.running){['pointerdown','touchend','keydown'].forEach(e=>window.removeEventListener(e,f,true))}},true));
