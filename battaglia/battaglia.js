// PUNK CITY – Battaglia 3D (prototipo). Arena in Three.js nel Vicolo Neon, telecamera cinematografica,
// ATB in modalità "attesa", Ras e Kiri contro Ratti di Ferro e Drone Vespa. Tutto originale.
import {THREE,makeRas,makeKiri,makeRatto,makeDrone,flash,setOpacity,PI} from '../lib/pc-models.js?v=6';
import {Reflector} from '../lib/Reflector.js?v=6';
const V='6',W=1280,H=720,$=id=>document.getElementById(id),V3=THREE.Vector3;
const rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)],lerp=(a,b,t)=>a+(b-a)*t,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const isTouch=('ontouchstart' in window)||navigator.maxTouchPoints>0;

// =============== AUDIO (generato dal browser) ===============
const AU=(()=>{let ctx,master,mus,fx,dly,noise,timer,nextT=0,step=0,song=null,muted=false;try{muted=localStorage.getItem('pc_mute')=='1'}catch(e){}
 const N=n=>440*Math.pow(2,(n-69)/12);
 function init(){if(ctx){if(ctx.state!='running')ctx.resume();return true}const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;try{ctx=new AC()}catch(e){return false}
  master=ctx.createGain();master.gain.value=muted?0:.85;const comp=ctx.createDynamicsCompressor();comp.threshold.value=-12;comp.ratio.value=4;master.connect(comp);comp.connect(ctx.destination);
  mus=ctx.createGain();mus.gain.value=.32;mus.connect(master);fx=ctx.createGain();fx.gain.value=.75;fx.connect(master);
  dly=ctx.createDelay(1);dly.delayTime.value=.3;const fb=ctx.createGain();fb.gain.value=.3;const wet=ctx.createGain();wet.gain.value=.3;dly.connect(fb);fb.connect(dly);dly.connect(wet);wet.connect(mus);
  const len=ctx.sampleRate;noise=ctx.createBuffer(1,len,ctx.sampleRate);const d=noise.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  const s=ctx.createBufferSource();s.buffer=ctx.createBuffer(1,1,22050);s.connect(ctx.destination);s.start(0);if(ctx.state!='running')ctx.resume();
  document.addEventListener('visibilitychange',()=>{if(ctx)document.hidden?ctx.suspend():ctx.resume()});timer=setInterval(tick,25);return true}
 function o(type,f,t,dur,pk,out,x={}){const v=ctx.createOscillator(),g=ctx.createGain();v.type=type;v.frequency.setValueAtTime(f,t);if(x.to)v.frequency.exponentialRampToValueAtTime(x.to,t+(x.sw||dur));if(x.det)v.detune.value=x.det;let n=v;
  if(x.lp){const fl=ctx.createBiquadFilter();fl.type='lowpass';fl.frequency.setValueAtTime(x.lp,t);if(x.lpTo)fl.frequency.exponentialRampToValueAtTime(x.lpTo,t+dur);fl.Q.value=x.q||1;v.connect(fl);n=fl}
  n.connect(g);g.connect(out);const a=x.a||.004;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(pk,t+a);if(x.hold)g.gain.setValueAtTime(pk,t+a+x.hold);g.gain.exponentialRampToValueAtTime(.0001,t+a+(x.hold||0)+dur);v.start(t);v.stop(t+a+(x.hold||0)+dur+.05)}
 function nz(t,dur,pk,out,type='bandpass',f=1000,x={}){const s=ctx.createBufferSource(),fl=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noise;fl.type=type;fl.frequency.setValueAtTime(f,t);if(x.to)fl.frequency.exponentialRampToValueAtTime(x.to,t+dur);fl.Q.value=x.q||1;
  s.connect(fl);fl.connect(g);g.connect(out);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(pk,t+(x.a||.003));g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.start(t,Math.random()*.5);s.stop(t+dur+.05)}
 // brano di battaglia originale "Pioggia di Ferro": 148 bpm, re minore
 const BAT={bpm:148,ch:[[50,53,57],[46,50,53],[48,52,55],[45,49,52]],lead:[74,0,72,74,0,77,0,76, 74,0,72,0,69,0,0,0, 74,0,72,74,0,77,0,79, 81,0,79,77,76,0,73,0]};
 function sched(t){const S=BAT,e=60/S.bpm/4,st=step%16,bar=Math.floor(step/16)%4,ch=S.ch[bar];
  if(st%4==0)o('sine',140,t,.22,.9,mus,{to:40,sw:.1});
  if(st==4||st==12){nz(t,.16,.5,mus,'highpass',1500);o('triangle',200,t,.08,.25,mus,{to:110})}
  if(st%2==1)nz(t,.03,.12,mus,'highpass',8000);
  o('sawtooth',N(ch[0]-24+(st%8==6?12:0)),t,e*.9,.26,mus,{lp:700,lpTo:200,q:5});
  if(st%4==2){ch.forEach(n=>[-9,9].forEach(det=>o('sawtooth',N(n+12),t,e*1.2,.03,mus,{lp:2600,det})))}
  if(st%2==0)o('square',N(ch[(st/2)%3]+24),t,e*.5,.03,dly,{lp:3200});
  const ph=Math.floor(step/64)%2;if(ph==1){const ln=BAT.lead[step%32];if(ln){o('sawtooth',N(ln),t,e*1.6,.05,mus,{lp:3400,lpTo:1500,det:6});o('square',N(ln-12),t,e*1.6,.025,dly,{lp:2000})}}}
 function tick(){if(!ctx||!song)return;const e=60/BAT.bpm/4;while(nextT<ctx.currentTime+.15){sched(nextT);nextT+=e;step++}}
 function music(on){if(!init())return;if(on){song='bat';step=0;nextT=ctx.currentTime+.1}else song=null}
 // fanfara di vittoria originale (corta), suona da sola
 function fanfare(){if(!ctx||muted)return;const t=ctx.currentTime+.05,b=.12,br=(n,tt,d,p=.09)=>{o('sawtooth',N(n),tt,d,p,fx,{lp:2600,a:.02,hold:d*.6});o('square',N(n),tt,d,p*.4,dly,{lp:1800,a:.02})};
  [62,62,62].forEach((n,i)=>br(n+12,t+i*b,b*.8));br(70+12-12,t+3*b,b*2);br(72,t+5*b,b*2);br(74,t+7*b,b*1.2);br(72,t+8.4*b,b*.8);br(74,t+9.4*b,b*5,.11);
  [50,57,62,66].forEach(n=>o('sawtooth',N(n),t+9.4*b,b*6,.04,fx,{lp:1800,a:.05,hold:b*3}));nz(t+9.4*b,.6,.3,fx,'highpass',4000);o('sine',70,t+9.4*b,.6,.6,fx,{to:40})}
 const FX={
  cur(t){o('square',1200,t,.035,.07,fx)},ok(t){o('square',880,t,.05,.09,fx);o('square',1320,t+.05,.07,.08,fx)},no(t){o('square',300,t,.08,.1,fx,{to:200})},
  run(t){nz(t,.25,.25,fx,'bandpass',600,{to:2400,q:2})},
  slash(t){nz(t,.2,.7,fx,'bandpass',6000,{to:900,q:2});o('sawtooth',1500,t,.15,.06,fx,{to:400})},
  hit(t){nz(t,.14,.9,fx,'lowpass',2500,{to:300});o('sine',150,t,.18,.9,fx,{to:45})},
  crit(t){nz(t,.25,1,fx,'lowpass',4000,{to:300});o('sine',200,t,.3,1,fx,{to:40});o('square',1760,t,.2,.06,fx)},
  zap(t){for(let i=0;i<5;i++)o('square',rnd(600,2400),t+i*.03,.05,.05,fx,{to:200});nz(t,.35,.5,fx,'highpass',3000)},
  charge(t){o('sine',300,t,.7,.12,fx,{to:1800,sw:.7,a:.5});o('triangle',600,t,.7,.06,fx,{to:3000,sw:.7,a:.5})},
  heal(t){[72,76,79,84].forEach((n,i)=>o('sine',N(n),t+i*.07,.4,.1,fx))},
  laser(t){o('square',2200,t,.25,.12,fx,{to:200,lp:5000})},
  bite(t){nz(t,.1,.8,fx,'bandpass',1800,{q:3});o('sawtooth',220,t,.1,.2,fx,{to:90})},
  boom(t){nz(t,.8,1,fx,'lowpass',3000,{to:80});o('sine',90,t,.8,1,fx,{to:30})},
  shield(t){[84,88,91].forEach((n,i)=>o('triangle',N(n),t+i*.04,.5,.05,fx))},
  ko(t){o('sawtooth',400,t,.8,.12,fx,{to:60,lp:1500})},
  swirl(t){nz(t,1.3,.6,fx,'bandpass',300,{to:5000,q:3});o('sawtooth',80,t,1.3,.2,fx,{to:900,lp:2000});o('sine',60,t+1.1,.8,.8,fx,{to:30})},
  glass(t){for(let i=0;i<8;i++)o('triangle',rnd(2500,5000),t+i*.025,.25,.05,fx);nz(t,.4,.6,fx,'highpass',5000)}};
 function play(n,dl=0){if(!ctx||muted||ctx.state!='running'||!FX[n])return;try{FX[n](ctx.currentTime+.005+dl)}catch(e){}}
 function setMute(m){muted=m;try{localStorage.setItem('pc_mute',m?'1':'0')}catch(e){}if(master)master.gain.setTargetAtTime(m?0:.85,ctx.currentTime,.05)}
 return{init,music,play,fanfare,setMute,get muted(){return muted}}})();

// =============== RENDERER, SCENA, TELECAMERA ===============
const canvas=$('gl');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.setSize(W,H,false);
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x0a0414);scene.fog=new THREE.FogExp2(0x1a0a2a,.028);
const cam=new THREE.PerspectiveCamera(42,W/H,.1,200);
const loader=new THREE.TextureLoader();
function glowTex(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.2,'rgba(255,255,255,.6)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)}
const GLOW=glowTex();
const addMat=(c,o=1)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide});

// ---- arena: Vicolo Neon ----
let ground,reflector;
(function arena(){
 // fondale dipinto (lo sfondo del Vicolo Neon) su un cilindro lontano
 const bt=loader.load('../assets/bg.jpg?v='+V);bt.colorSpace=THREE.SRGBColorSpace;bt.wrapS=THREE.MirroredRepeatWrapping;bt.repeat.set(2,.62);bt.offset.set(0,.38);
 const cylM=new THREE.MeshBasicMaterial({map:bt,side:THREE.BackSide,fog:false,color:0x9a90a8});const cyl=new THREE.Mesh(new THREE.CylinderGeometry(42,42,40,64,1,true),cylM);cyl.position.y=19;scene.add(cyl);
 // pozzanghere che riflettono (specchio sotto un asfalto semitrasparente)
 const RW=Math.round(512*Math.min(1.5,devicePixelRatio||1));
 reflector=new Reflector(new THREE.PlaneGeometry(90,40),{textureWidth:RW,textureHeight:Math.round(RW*.56),color:0x6a6a7a,clipBias:.003});reflector.rotation.x=-PI/2;reflector.position.y=-.02;scene.add(reflector);
 const gc=document.createElement('canvas');gc.width=1024;gc.height=512;const g=gc.getContext('2d');
 g.fillStyle='rgba(26,22,32,.93)';g.fillRect(0,0,1024,512);
 for(let i=0;i<9000;i++){const v=Math.random()*40|0;g.fillStyle=`rgba(${30+v},${26+v},${38+v},${Math.random()*.6})`;g.fillRect(Math.random()*1024,Math.random()*512,2,2)}
 g.strokeStyle='rgba(8,6,12,.8)';g.lineWidth=2;for(let i=0;i<40;i++){g.beginPath();let x=Math.random()*1024,y=Math.random()*512;g.moveTo(x,y);for(let k=0;k<5;k++){x+=rnd(-30,30);y+=rnd(-30,30);g.lineTo(x,y)}g.stroke()}
 g.fillStyle='rgba(200,180,120,.18)';for(let x=40;x<1024;x+=90)g.fillRect(x,250,44,6);              // segnaletica consumata
 g.globalCompositeOperation='destination-out';
 const puddle=(x,y,rx,ry,a)=>{const gr=g.createRadialGradient(0,0,0,0,0,1);gr.addColorStop(0,`rgba(0,0,0,${a})`);gr.addColorStop(.7,`rgba(0,0,0,${a*.8})`);gr.addColorStop(1,'rgba(0,0,0,0)');g.save();g.translate(x,y);g.scale(rx,ry);g.fillStyle=gr;g.beginPath();g.arc(0,0,1,0,PI*2);g.fill();g.restore()};
 for(let i=0;i<16;i++)puddle(rnd(300,740),rnd(160,350),rnd(30,85),rnd(14,36),rnd(.55,.8));for(let i=0;i<22;i++)puddle(rnd(0,1024),rnd(0,512),rnd(12,50),rnd(6,22),rnd(.35,.65));
 g.fillStyle='rgba(0,0,0,.08)';g.fillRect(0,0,1024,512);
 const gt=new THREE.CanvasTexture(gc);gt.colorSpace=THREE.SRGBColorSpace;gt.anisotropy=4;
 ground=new THREE.Mesh(new THREE.PlaneGeometry(90,40),new THREE.MeshLambertMaterial({map:gt,transparent:true}));ground.rotation.x=-PI/2;scene.add(ground);
 // palazzi ai lati del vicolo con finestre accese
 const facade=(seed)=>{const c=document.createElement('canvas');c.width=256;c.height=512;const x=c.getContext('2d');x.fillStyle=pick(['#2a2030','#30263a','#222a34']);x.fillRect(0,0,256,512);for(let i=0;i<4000;i++){x.fillStyle=`rgba(255,255,255,${Math.random()*.05})`;x.fillRect(Math.random()*256,Math.random()*512,2,2)}x.fillStyle='rgba(0,0,0,.35)';for(let r=0;r<512;r+=64)x.fillRect(0,r,256,4);
  const e=document.createElement('canvas');e.width=256;e.height=512;const y=e.getContext('2d');y.fillStyle='#000';y.fillRect(0,0,256,512);
  for(let r=0;r<26;r++)for(let k=0;k<9;k++){const wx=10+k*27,wy=12+r*16;x.fillStyle='#0c0a10';x.fillRect(wx,wy,15,9);if(Math.random()<.22){const col=pick(['#ffb060','#ffd080','#ff60c0','#60d0ff','#ff9040']);y.fillStyle=col;y.globalAlpha=rnd(.4,1);y.fillRect(wx+1,wy+1,13,7);x.fillStyle=col;x.globalAlpha=.5;x.fillRect(wx+1,wy+1,13,7);x.globalAlpha=1;y.globalAlpha=1}}
  x.fillStyle='#2a1a30';x.fillRect(0,440,256,72);y.fillStyle=pick(['#ff9040','#ff60c0','#40c8ff']);y.globalAlpha=.45;y.fillRect(20,452,216,46);y.globalAlpha=1;y.fillStyle='#000';for(let k=20;k<236;k+=36)y.fillRect(k,452,5,46);            // vetrina
  const t1=new THREE.CanvasTexture(c),t2=new THREE.CanvasTexture(e);t1.colorSpace=t2.colorSpace=THREE.SRGBColorSpace;return[t1,t2]};
 const FAC=[0,1,2].map(facade);
 [-1,1].forEach(side=>{let x=-30;while(x<30){const w=rnd(4,7),h=rnd(9,18),[m,e]=pick(FAC);const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,5),new THREE.MeshLambertMaterial({map:m,emissive:0xffffff,emissiveMap:e,emissiveIntensity:.75}));
  b.position.set(x+w/2,h/2,side*(13+rnd(0,1.5)));scene.add(b);
  if(Math.random()<.5){const aw=new THREE.Mesh(new THREE.BoxGeometry(w*.8,.12,1.6),new THREE.MeshLambertMaterial({color:pick([0x6a1424,0x14404a,0x4a1450])}));aw.position.set(x+w/2,3.2,side*(10.4));aw.rotation.x=side*.25;scene.add(aw)}
  x+=w+rnd(.2,1.2)}});
 // insegne al neon (forme astratte, nessun testo copiato) + una scritta nostra
 const neonTex=(txt,col)=>{const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');x.font='bold 84px "Trebuchet MS",sans-serif';x.textAlign='center';x.textBaseline='middle';
  x.shadowColor=col;x.shadowBlur=24;x.strokeStyle=col;x.lineWidth=6;x.strokeText(txt,256,66);x.fillStyle='#fff';x.shadowBlur=10;x.fillText(txt,256,66);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t};
 const signs=[['BAR ALBA','#ff2fb3',[-6,5.2,-10.4],0],['RAMEN 24H','#00f0ff',[4,6.2,10.4],PI],['VICOLO NEON','#ff4060',[-14,7.5,10.4],PI],['RIPARAZIONI','#ffd34d',[12,4.6,-10.4],0]];
 window.__signs=signs.map(([t,c,p,ry])=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(4.4,1.1),new THREE.MeshBasicMaterial({map:neonTex(t,c),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));m.position.set(...p);m.rotation.y=ry;scene.add(m);
  const gl=new THREE.Mesh(new THREE.PlaneGeometry(7,3),new THREE.MeshBasicMaterial({map:GLOW,color:c,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));gl.position.copy(m.position);gl.position.z+=ry?-.05:.05;gl.rotation.y=ry;scene.add(gl);return{m,gl,ph:Math.random()*9}});
 [[-2,0xff40c0,-10.3],[6,0x00e0ff,10.3]].forEach(([x,c,z])=>{const b=new THREE.Mesh(new THREE.BoxGeometry(.12,4,.12),new THREE.MeshBasicMaterial({color:c,fog:false}));b.position.set(x,3,z);scene.add(b)});
 // lampioni
 [[-8,-7],[9,7]].forEach(([x,z])=>{const p=new THREE.Mesh(new THREE.CylinderGeometry(.07,.1,5,8),new THREE.MeshLambertMaterial({color:0x222028}));p.position.set(x,2.5,z);scene.add(p);
  const hd=new THREE.Mesh(new THREE.SphereGeometry(.25,12,8),new THREE.MeshBasicMaterial({color:0xffd090,fog:false}));hd.position.set(x,5.05,z);scene.add(hd);
  const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:0xffb060,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));gl.scale.set(3,3,1);gl.position.copy(hd.position);scene.add(gl)});
 // casse, bidone, tubi: un po' di oggetti per la profondità
 [[-6.5,6],[7.5,-6.4],[-11,-6]].forEach(([x,z])=>{const c=new THREE.Mesh(new THREE.BoxGeometry(1.2,1.2,1.2),new THREE.MeshLambertMaterial({color:0x4a3424}));c.position.set(x,.6,z);c.rotation.y=rnd(0,1);scene.add(c)});
 const bar=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,1.2,14),new THREE.MeshLambertMaterial({color:0x3a4a3a}));bar.position.set(-8.5,.6,5.2);scene.add(bar);
 // luci
 scene.add(new THREE.HemisphereLight(0x9080c0,0x2a1820,1.5));window.__fill=new THREE.DirectionalLight(0xffe0f0,.9);scene.add(window.__fill,window.__fill.target);
 const key=new THREE.DirectionalLight(0xffc090,1.4);key.position.set(6,10,6);scene.add(key);
 const rim=new THREE.DirectionalLight(0x60d0ff,1.5);rim.position.set(-8,5,-6);scene.add(rim);
 [[ -4,3,-5,0xff30c0,26],[5,3,5,0x00d8ff,22],[0,4,0,0xffa060,10]].forEach(([x,y,z,c,i])=>{const l=new THREE.PointLight(c,i,18,1.6);l.position.set(x,y,z);scene.add(l)});
})();
// pioggia
const RAIN=900,rainPos=new Float32Array(RAIN*6),rainV=new Float32Array(RAIN);
for(let i=0;i<RAIN;i++){const x=rnd(-16,16),y=rnd(0,16),z=rnd(-10,10);rainPos.set([x,y,z,x-.03,y-.45,z],i*6);rainV[i]=rnd(13,18)}
const rainG=new THREE.BufferGeometry();rainG.setAttribute('position',new THREE.BufferAttribute(rainPos,3));
const rain=new THREE.LineSegments(rainG,new THREE.LineBasicMaterial({color:0xa8c8ff,transparent:true,opacity:.38,fog:true}));rain.frustumCulled=false;scene.add(rain);
const ripples=[...Array(26)].map(()=>{const m=new THREE.Mesh(new THREE.RingGeometry(.7,1,20),new THREE.MeshBasicMaterial({color:0xb0d0ff,transparent:true,opacity:0,depthWrite:false}));m.rotation.x=-PI/2;m.position.set(rnd(-8,8),.02,rnd(-6,6));m.userData.t=Math.random();scene.add(m);return m});
const steam=[...Array(10)].map(()=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:0x9a8ab0,transparent:true,opacity:0,depthWrite:false}));s.userData.t=Math.random();scene.add(s);return s});

// =============== TEMPO, TWEEN, TELECAMERA ===============
let TIME=0;const tweens=[];
const E={lin:t=>t,io:t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,o:t=>1-Math.pow(1-t,3),i:t=>t*t*t,back:t=>{const c=1.7;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2)}};
const tw=(dur,fn,ease=E.io)=>new Promise(res=>{tweens.push({t:0,dur,fn,ease,res});fn(0)});
const wait=s=>tw(s,()=>{});
function upTweens(dt){for(let i=tweens.length-1;i>=0;i--){const w=tweens[i];w.t+=dt;const p=Math.min(1,w.t/w.dur);w.fn(w.ease(p),p);if(p>=1){tweens.splice(i,1);w.res()}}}
const CAM={pos:new V3(14,7,12),look:new V3(0,1,0),shake:0,anim:null,fov:42};
const DEF={pos:new V3(7.6,3.3,6.6),look:new V3(-.9,1.15,-.1)};
function camPath(dur,f,ease=E.io){return new Promise(res=>{CAM.anim={t:0,dur,f,ease,res}})}
function camTo(pos,look,dur=.8,ease=E.io,fov){const p0=CAM.pos.clone(),l0=CAM.look.clone(),f0=CAM.fov;return camPath(dur,u=>{CAM.pos.lerpVectors(p0,pos,u);CAM.look.lerpVectors(l0,look,u);if(fov)CAM.fov=lerp(f0,fov,u)},ease)}
const camHome=(d=.9)=>camTo(DEF.pos,DEF.look,d,E.io,42);
function shake(a){CAM.shake=Math.max(CAM.shake,a)}
function upCam(dt){const A=CAM.anim;if(A){A.t+=dt;const p=Math.min(1,A.t/A.dur);A.f(A.ease(p));if(p>=1){CAM.anim=null;A.res()}}
 CAM.shake=Math.max(0,CAM.shake-dt*1.8);const s=CAM.shake*CAM.shake*.35;
window.__fill&&(window.__fill.position.copy(CAM.pos).add(new V3(0,3,0)),window.__fill.target.position.copy(CAM.look));
 cam.position.copy(CAM.pos).add(new V3(rnd(-s,s),rnd(-s,s),rnd(-s,s)));cam.lookAt(CAM.look);if(cam.fov!=CAM.fov){cam.fov=CAM.fov;cam.updateProjectionMatrix()}}
// punto di vista "alle spalle" di chi agisce, guardando il bersaglio
function overShoulder(a,b,dist=2.6,h=1.5,side=1){const d=new V3().subVectors(b,a).setY(0).normalize(),sd=new V3(-d.z,0,d.x).multiplyScalar(side);
 return{pos:a.clone().addScaledVector(d,-dist).addScaledVector(sd,1.5).setY(h+a.y*.3),look:a.clone().lerp(b,.6).setY(1)}}
function sideView(a,b,dist=4.2,side=1){const mid=a.clone().lerp(b,.5),d=new V3().subVectors(b,a).setY(0).normalize(),n=new V3(-d.z,0,d.x).multiplyScalar(side);return{pos:mid.clone().addScaledVector(n,dist).setY(1.6),look:mid.clone().setY(1)}}

// =============== EFFETTI: particelle, scie, numeri ===============
const SPR=[];for(let i=0;i<260;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));s.visible=false;scene.add(s);SPR.push({s,life:0})}
function burst(p,{n=20,col=0xffffff,sp=4,life=.6,size=.35,up=0,grav=-4,spread=1}={}){for(let k=0;k<n;k++){const o=SPR.find(o=>o.life<=0);if(!o)return;o.s.visible=true;o.s.position.copy(p);o.v=new V3(rnd(-1,1),rnd(-.4,1)*spread+up,rnd(-1,1)).normalize().multiplyScalar(sp*rnd(.3,1));o.life=o.max=life*rnd(.6,1.2);o.size=size*rnd(.6,1.3);o.g=grav;o.s.material.color.set(Array.isArray(col)?pick(col):col)}}
function stream(a,b,{n=24,col=0x30f0ff,dur=.5,size=.25}={}){for(let k=0;k<n;k++){const o=SPR.find(o=>o.life<=0);if(!o)return;o.s.visible=true;o.s.material.color.set(Array.isArray(col)?pick(col):col);o.size=size*rnd(.6,1.3);o.from=a.clone().add(new V3(rnd(-.3,.3),rnd(-.3,.3),rnd(-.3,.3)));o.to=b.clone().add(new V3(rnd(-.2,.2),rnd(-.2,.2),rnd(-.2,.2)));o.delay=k/n*dur;o.life=o.max=dur*.9+o.delay;o.curve=rnd(-1.5,1.5);o.v=null}}
function upSpr(dt){for(const o of SPR){if(o.life<=0)continue;o.life-=dt;if(o.life<=0){o.s.visible=false;o.from=null;continue}
 if(o.from){const tt=clamp(1-(o.life-0)/(o.max-o.delay),0,1);const t2=E.io(tt);o.s.position.lerpVectors(o.from,o.to,t2);o.s.position.y+=Math.sin(t2*PI)*o.curve*.6;o.s.position.z+=Math.sin(t2*PI)*o.curve*.4;const a=tt<=0?0:1;o.s.material.opacity=a*(1-tt*.3);o.s.scale.setScalar(o.size*(1+Math.sin(t2*PI)))}
 else{o.v.y+=o.g*dt;o.s.position.addScaledVector(o.v,dt);const k=o.life/o.max;o.s.material.opacity=k;o.s.scale.setScalar(o.size*(.4+k*.8))}}}
// scia della katana
const TRN=14,trail={on:false,pts:[],geo:new THREE.BufferGeometry(),col:new THREE.Color(0xff2a4a)};
trail.geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(TRN*2*3),3));trail.geo.setAttribute('color',new THREE.BufferAttribute(new Float32Array(TRN*2*3),3));
{const idx=[];for(let i=0;i<TRN-1;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}trail.geo.setIndex(idx)}
trail.mesh=new THREE.Mesh(trail.geo,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));trail.mesh.frustumCulled=false;scene.add(trail.mesh);
function upTrail(){const R=units.find(u=>u.id=='ras');if(!R)return;const tip=R.m.userData.tip.getWorldPosition(new V3()),base=R.m.userData.swBase.getWorldPosition(new V3());
 trail.pts.unshift([tip,base]);if(trail.pts.length>TRN)trail.pts.length=TRN;const P=trail.geo.attributes.position.array,C=trail.geo.attributes.color.array;
 for(let i=0;i<TRN;i++){const p=trail.pts[Math.min(i,trail.pts.length-1)];P.set([p[0].x,p[0].y,p[0].z,p[1].x,p[1].y,p[1].z],i*6);const k=trail.on?Math.pow(1-i/TRN,1.5):0;const c=trail.col;C.set([c.r*k*1.4,c.g*k+.2*k,c.b*k+.2*k,c.r*k*.3,c.g*k*.3,c.b*k*.3],i*6)}
 trail.geo.attributes.position.needsUpdate=trail.geo.attributes.color.needsUpdate=true}
// numeri dei danni (HTML sopra al 3D)
const nums=[];const fxL=$('fx');
function popNum(u,txt,cls='',sub=''){const d=document.createElement('div');d.className='num '+cls;d.innerHTML=txt+(sub?`<small>${sub}</small>`:'');fxL.appendChild(d);const n={d,u,t:0,off:nums.filter(n=>n.u==u).length*.35};nums.push(n)}
function upNums(dt){for(let i=nums.length-1;i>=0;i--){const n=nums[i];n.t+=dt;const p=n.u.chest().add(new V3(0,(n.u.flying?.5:.75)+n.off,0)).project(cam);const x=(p.x+1)/2*W,y=(1-p.y)/2*H;
 const b=n.t<.18?-Math.sin(n.t/.18*PI)*40:n.t<.32?-Math.sin((n.t-.18)/.14*PI)*12:0;n.d.style.left=x+'px';n.d.style.top=(y+b-Math.max(0,n.t-.6)*30)+'px';n.d.style.opacity=n.t>1.1?Math.max(0,1-(n.t-1.1)/.3):1;if(n.t>1.4){n.d.remove();nums.splice(i,1)}}}
function banner(txt,dur=1.1,big=false){const b=$('banner');b.textContent=txt;b.classList.toggle('big',big);b.classList.remove('on');void b.offsetWidth;b.classList.add('on');clearTimeout(b._t);if(dur)b._t=setTimeout(()=>b.classList.remove('on'),dur*1000)}
// cerchio di "codice" sotto il bersaglio (hack di Kiri)
const glyphTex=(()=>{const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.translate(256,256);x.strokeStyle='#fff';x.fillStyle='#fff';x.shadowColor='#30f0ff';x.shadowBlur=12;
 [240,200,120].forEach((r,i)=>{x.lineWidth=i==1?3:6;x.beginPath();x.arc(0,0,r,0,PI*2);x.stroke()});x.font='bold 26px monospace';x.textAlign='center';
 for(let i=0;i<24;i++){x.save();x.rotate(i/24*PI*2);x.fillText(pick(['0x','1F','A9','7C','E2','4B','::','//','#','3D']),0,-212);x.restore()}
 for(let i=0;i<6;i++){x.save();x.rotate(i/6*PI*2);x.beginPath();x.moveTo(0,-120);x.lineTo(104,60);x.stroke();x.fillRect(-8,-128,16,16);x.restore()}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t})();
function glyph(p,col=0x30f0ff,dur=1.4,size=2.4){const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:glyphTex,color:col,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));m.rotation.x=-PI/2;m.position.copy(p).setY(.05);scene.add(m);
 tw(dur,(e,p)=>{const k=p<.2?p/.2:p>.8?(1-p)/.2:1;m.scale.setScalar(size*(.5+.5*E.o(Math.min(1,p*3))));m.rotation.z=p*3;m.material.opacity=k}).then(()=>{scene.remove(m);m.geometry.dispose()});return m}
function bolt(a,b,col=0x60f8ff){const pts=[a.clone()];const n=8;for(let i=1;i<n;i++){const p=a.clone().lerp(b,i/n);p.add(new V3(rnd(-.35,.35),rnd(-.2,.2),rnd(-.35,.35)));pts.push(p)}pts.push(b.clone());
 const g=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,false,'catmullrom',0),24,.035,4),m=new THREE.Mesh(g,addMat(col));const g2=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,.12,4),m2=new THREE.Mesh(g2,addMat(col,.35));scene.add(m,m2);
 tw(.28,(e,p)=>{m.material.opacity=1-p;m2.material.opacity=.35*(1-p)}).then(()=>{scene.remove(m,m2);g.dispose();g2.dispose()})}
function beam(a,b,col=0xff2040,dur=.35,r=.05){const L=a.distanceTo(b),mid=a.clone().lerp(b,.5);const mk=(rad,op)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(rad,rad,L,8,1,true),addMat(col,op));m.position.copy(mid);m.quaternion.setFromUnitVectors(new V3(0,1,0),new V3().subVectors(b,a).normalize());scene.add(m);return m};
 const c1=mk(r,1),c2=mk(r*3.5,.35);tw(dur,(e,p)=>{c1.material.opacity=1-p;c2.material.opacity=.35*(1-p);c1.scale.x=c1.scale.z=1-p*.6}).then(()=>{scene.remove(c1,c2)})}
function wave(from,to,col=0xff2040,dur=.35,scale=1){const m=new THREE.Mesh(new THREE.TorusGeometry(.9*scale,.07*scale,6,28,PI),addMat(col));const m2=new THREE.Mesh(new THREE.TorusGeometry(.9*scale,.25*scale,6,28,PI),addMat(col,.3));const g=new THREE.Group();g.add(m,m2);scene.add(g);
 const d=new V3().subVectors(to,from).normalize();g.position.copy(from);g.lookAt(to);g.rotateZ(PI/2);
 return tw(dur,e=>{g.position.lerpVectors(from,to,e);g.scale.setScalar(.7+e*.6)},E.lin).then(()=>{tw(.2,(e,p)=>{m.material.opacity=1-p;m2.material.opacity=.3*(1-p)}).then(()=>scene.remove(g))})}
function ringBlast(p,col=0xff2040,r=6,dur=.5){const m=new THREE.Mesh(new THREE.RingGeometry(.8,1,40),addMat(col));m.rotation.x=-PI/2;m.position.copy(p).setY(.15);scene.add(m);tw(dur,(e,pp)=>{m.scale.setScalar(.2+e*r);m.material.opacity=1-pp},E.o).then(()=>scene.remove(m))}
function shieldFx(u){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),new THREE.MeshBasicMaterial({color:0x60e0ff,wireframe:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));m.position.copy(u.pos()).setY(1);scene.add(m);
 tw(.9,(e,p)=>{m.scale.setScalar(.4+E.back(Math.min(1,p*2))*.7);m.rotation.y=p*3;m.material.opacity=p<.6?1:(1-p)/.4}).then(()=>scene.remove(m))}

// =============== UNITÀ ===============
const units=[];
function mkUnit(o){const m=o.make();m.scale.setScalar(o.sc);m.position.set(...o.at);m.rotation.y=o.side=='h'?-PI/2:PI/2;scene.add(m);
 const hit=new THREE.Mesh(new THREE.SphereGeometry(o.flying?.5:.7,8,6),new THREE.MeshBasicMaterial({visible:false}));hit.position.y=o.flying?0:.9;m.add(hit);hit.scale.setScalar(1/o.sc);hit.userData.u=null;
 const u={...o,m,hit,mhp:o.hp,mmp:o.mp||0,atb:o.atb0??rnd(10,45),alive:true,defend:false,home:new V3(...o.at),run:0,ph:0,
  pos(){return m.position.clone()},top(){return m.position.clone().add(new V3(0,(m.userData.h||1)*o.sc+(o.flying?.1:.15),0))},chest(){return m.position.clone().add(new V3(0,o.flying?0:(m.userData.h||1)*o.sc*.6,0))},
  gnd(){return m.position.clone().setY(0)}};hit.userData.u=u;
 // ombra
 const sh=new THREE.Mesh(new THREE.CircleGeometry(1,20),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.45,depthWrite:false}));sh.rotation.x=-PI/2;sh.position.set(o.at[0],.03,o.at[2]);sh.scale.setScalar(o.flying?.4:.45);scene.add(sh);u.sh=sh;
 units.push(u);rest(u);return u}
function rest(u){const d=u.m.userData;if(u.id=='ras'){d.putSword('hand');d.armR.g.rotation.set(-.55,0,-.15);d.armR.lo.rotation.set(-.95,0,0);d.armL.g.rotation.set(-.25,0,.18);d.armL.lo.rotation.set(-.55,0,0);
  d.L.g.rotation.set(-.2,0,.06);d.L.lo.rotation.set(.22,0,0);d.R.g.rotation.set(.22,0,-.06);d.R.lo.rotation.set(.3,0,0);d.torso.rotation.set(.06,-.15,0);d.body.rotation.set(0,0,0);d.body.position.y=-.012;d.sword.rotation.set(PI/2-.3,0,0)}
 else if(u.id=='kiri'){d.armR.g.rotation.set(-.85,0,-.25);d.armR.lo.rotation.set(-.7,0,0);d.armL.g.rotation.set(-.35,0,.35);d.armL.lo.rotation.set(-1.1,0,0);
  d.L.g.rotation.set(-.38,0,.08);d.L.lo.rotation.set(.55,0,0);d.R.g.rotation.set(.25,0,-.08);d.R.lo.rotation.set(.4,0,0);d.torso.rotation.set(.18,.2,0);d.body.rotation.set(0,0,0);d.body.position.y=-.035}
 else if(u.kind=='ratto'){d.armL.g.rotation.set(-.5,0,.25);d.armL.lo.rotation.set(-.9,0,0);d.armR.g.rotation.set(-.3,0,-.2);d.armR.lo.rotation.set(-.8,0,0);d.torso.rotation.set(.38,0,0);d.body.rotation.set(0,0,0)}
 u.restL=d.L?[d.L.g.rotation.x,d.R.g.rotation.x,d.L.lo.rotation.x,d.R.lo.rotation.x]:null}
function idle(u,dt){const d=u.m.userData;if(!u.alive)return;u.ph+=dt*(u.run>0?11:0);
 if(u.flying){u.m.position.y=u.home.y+Math.sin(TIME*2.3+u.home.x)*.12+(u.dy||0);d.rotors.forEach((r,i)=>r.rotation.y+=dt*40*(i%2?1:-1));d.core.rotation.z=Math.sin(TIME*1.7)*.08;u.sh.position.set(u.m.position.x,.03,u.m.position.z);return}
 d.torso.scale.y=1+Math.sin(TIME*2.4+u.home.z)*.012;u.sh.position.set(u.m.position.x,.03,u.m.position.z);
 if(u.restL&&!u.posing){const s=Math.sin(u.ph)*u.run;d.L.g.rotation.x=u.restL[0]*(1-u.run)+s*.85;d.R.g.rotation.x=u.restL[1]*(1-u.run)-s*.85;d.L.lo.rotation.x=lerp(u.restL[2],Math.max(0,-Math.cos(u.ph))*.9+.1,u.run);d.R.lo.rotation.x=lerp(u.restL[3],Math.max(0,Math.cos(u.ph))*.9+.1,u.run);
  d.body.position.y=(u.id=='kiri'?-.035:u.id=='ras'?-.012:0)*(1-u.run)+Math.abs(Math.cos(u.ph))*.03*u.run}
 if(u.kind=='ratto'&&!u.posing)d.torso.rotation.z=Math.sin(TIME*1.6+u.home.z)*.05}
function faceTo(u,p,dur=.15){const d=new V3().subVectors(p,u.m.position);const target=Math.atan2(d.x,d.z),a0=u.m.rotation.y;let dd=Math.atan2(Math.sin(target-a0),Math.cos(target-a0));return tw(dur,e=>{u.m.rotation.y=a0+dd*e})}
async function moveTo(u,p,dur=.42){const p0=u.m.position.clone(),p1=p.clone();if(!u.flying)p1.y=0;await faceTo(u,p1,.1);u.run=1;AU.play('run');await tw(dur,e=>{u.m.position.lerpVectors(p0,p1,e)},E.io);u.run=0}
async function goHome(u){await moveTo(u,u.home,.4);await faceTo(u,u.side=='h'?u.home.clone().add(new V3(-1,0,0)):u.home.clone().add(new V3(1,0,0)),.15);rest(u)}
const alive=s=>units.filter(u=>u.side==s&&u.alive);

// =============== DANNI ===============
const ST={exp:0,cr:0,turns:0,t0:0,items:{medikit:{n:'Medikit',d:'Cura 150 PV a un alleato',q:3},stim:{n:'Stim Neon',d:'Ridà 30 PM a un alleato',q:2},emp:{n:'Granata EMP',d:'60 danni a tutti i nemici (x2 ai droni)',q:1}}};
function calc(a,t,pow,{magic=false,weak=1}={}){const base=(magic?a.mag:a.atk)*pow;const crit=!magic&&Math.random()<(a.crit||.08);let d=base*rnd(.9,1.1)*(crit?1.6:1)*weak-(t.def||0)*.6;if(t.defend)d*=.5;return{d:Math.max(1,Math.round(d)),crit}}
function hurt(t,{d,crit},o={}){if(!t.alive)return;t.hp=Math.max(0,t.hp-d);popNum(t,d,crit?'crit':'',crit?'CRITICO!':o.weak?'DEBOLE!':'');AU.play(crit?'crit':'hit');shake(crit?1.1:.7);
 flash(t.m,o.col||0xffffff,1);tw(.25,e=>flash(t.m,o.col||0xffffff,1-e));burst(t.chest(),{n:crit?30:18,col:o.sparks||[0xffffff,0xffd34d,0xff6080],sp:5,size:.3});
 if(!t.flying){const dir=new V3().subVectors(t.m.position,o.from||t.home).setY(0);if(dir.lengthSq()<.01)dir.set(t.side=='h'?1:-1,0,0);dir.normalize().multiplyScalar(.25);const p0=t.m.position.clone();
  tw(.09,e=>t.m.position.copy(p0).addScaledVector(dir,e),E.o).then(()=>tw(.25,e=>t.m.position.copy(p0).addScaledVector(dir,1-e)))}else{t.dy=.3;tw(.3,e=>t.dy=.3*(1-e))}
 if(t.hp<=0)ko(t)}
function heal(t,n,mp=false){if(mp){t.mp=Math.min(t.mmp,t.mp+n);popNum(t,'+'+n,'mp','PM')}else{t.hp=Math.min(t.mhp,t.hp+n);popNum(t,'+'+n,'heal')}AU.play('heal');
 burst(t.gnd().setY(.2),{n:26,col:mp?[0x7ec8ff,0xffffff]:[0x5dff9a,0xffffff,0xd0ffb0],sp:1.5,up:3,grav:1,life:1,size:.3});flash(t.m,mp?0x3080ff:0x30ff80,.8);tw(.5,e=>flash(t.m,mp?0x3080ff:0x30ff80,.8*(1-e)))}
function ko(t){t.alive=false;t.atb=0;const i=ready.indexOf(t);if(i>=0)ready.splice(i,1);AU.play('ko');
 if(t.side=='e'){ST.exp+=t.exp;ST.cr+=t.cr;const d=t.m.userData;
  if(t.flying){const p0=t.m.position.clone();tw(.8,e=>{t.m.position.y=p0.y*(1-e*e);t.m.rotation.z+=.25;t.m.rotation.x+=.1},E.lin).then(()=>{AU.play('boom');shake(1.2);burst(t.m.position.clone().setY(.3),{n:50,col:[0xffd34d,0xff6020,0xffffff],sp:7,size:.5});ringBlast(t.m.position,0xffa040,4);t.m.visible=false;t.sh.visible=false})}
  else tw(1.1,(e,p)=>{setOpacity(t.m,1-p);flash(t.m,0xff2fb3,p);t.m.position.y=-p*.4;if(Math.random()<.5)burst(t.chest(),{n:2,col:[0xff2fb3,0x00f0ff],sp:1,up:2,grav:2,size:.25})},E.lin).then(()=>{t.m.visible=false;t.sh.visible=false})}
 else{const d=t.m.userData;t.posing=1;tw(.5,e=>{d.body.rotation.x=-1.45*e;d.body.position.y=.08*e},E.back)}}

// =============== AZIONI DEGLI EROI ===============
const lunge=(u,t,dist=1.15)=>{const d=new V3().subVectors(u.home,t.gnd()).setY(0).normalize();return t.gnd().addScaledVector(d,t.flying?.9:dist)};
async function rasAttack(u,t){const dest=lunge(u,t);const sv=sideView(u.home,t.gnd(),4.5,1);camTo(sv.pos,sv.look,.5);await moveTo(u,dest,.45);await faceTo(u,t.pos(),.08);
 const os=overShoulder(t.gnd(),u.gnd(),-2.4,1.7,1);camTo(new V3().copy(t.gnd()).lerp(u.gnd(),.5).add(new V3(0,1.5,0)).add(new V3().subVectors(u.gnd(),t.gnd()).normalize().applyAxisAngle(new V3(0,1,0),1.2).multiplyScalar(3.2)),t.chest().lerp(u.chest(),.4),.35,E.io,36);
 const d=u.m.userData,g=d.armR.g;u.posing=0;
 await tw(.2,e=>{g.rotation.x=lerp(-.55,-2.7,e);g.rotation.z=lerp(-.15,-.5,e);d.armR.lo.rotation.x=lerp(-.95,-.4,e);d.torso.rotation.y=lerp(-.15,.5,e)});
 trail.on=true;AU.play('slash');
 await tw(.11,e=>{g.rotation.x=lerp(-2.7,.5,e);g.rotation.z=lerp(-.5,.3,e);d.torso.rotation.y=lerp(.5,-.6,e);d.armR.lo.rotation.x=lerp(-.4,-.2,e)},E.i);
 hurt(t,calc(u,t,1,{weak:t.flying?.85:1}),{from:u.m.position,sparks:[0xff2040,0xffffff,0xff8090]});await wait(.2);trail.on=false;await wait(.15);await goHome(u)}
async function kiriAttack(u,t){const dest=lunge(u,t,1.0);const sv=sideView(u.home,t.gnd(),4.3,-1);camTo(sv.pos,sv.look,.45);await moveTo(u,dest,.35);await faceTo(u,t.pos(),.06);
 const d=u.m.userData;for(let k=0;k<2;k++){AU.play('slash');await tw(.08,e=>{d.armR.g.rotation.x=lerp(-.85,-1.6,e);d.armR.lo.rotation.x=lerp(-.7,0,e);d.torso.rotation.y=lerp(.2,-.4,e)},E.i);
  burst(t.chest(),{n:10,col:[0x30f0ff,0xffffff],sp:4,size:.25});hurt(t,calc(u,t,.6),{from:u.m.position,sparks:[0x30f0ff,0xffffff]});await tw(.14,e=>{d.armR.g.rotation.x=lerp(-1.6,-.85,e);d.armR.lo.rotation.x=lerp(0,-.7,e);d.torso.rotation.y=lerp(-.4,.2,e)});if(!t.alive)break}
 await wait(.1);await goHome(u)}
async function taglioAlba(u,t){banner('Taglio Alba');const d=u.m.userData;const os=overShoulder(u.gnd(),t.gnd(),3.4,1.9,-1);await camTo(os.pos,os.look,.5,E.io,40);
 AU.play('charge');stream(u.chest().add(new V3(rnd(-2,2),2,rnd(-2,2))),d.tip.getWorldPosition(new V3()),{n:30,col:[0xff2040,0xff90a0,0xffffff],dur:.6});
 await tw(.6,e=>{d.armR.g.rotation.x=lerp(-.55,-2.9,e);d.torso.rotation.y=lerp(-.15,.6,e);flash(u.m,0xff2040,.22*e)});trail.on=true;AU.play('slash');
 await tw(.12,e=>{d.armR.g.rotation.x=lerp(-2.9,.6,e);d.torso.rotation.y=lerp(.6,-.7,e)},E.i);flash(u.m,0xff2040,0);
 const sv=sideView(u.home,t.gnd(),5.5,1);camTo(sv.pos,sv.look,.35);await wave(u.chest(),t.chest(),0xff2040,.35,1.2);trail.on=false;
 hurt(t,calc(u,t,1.9,{weak:1}),{from:u.m.position,sparks:[0xff2040,0xffffff,0xffd34d]});ringBlast(t.gnd(),0xff2040,3);await wait(.5);rest(u)}
async function lamaRotante(u){banner('Lama Rotante');const d=u.m.userData,center=new V3(0,0,0);await moveTo(u,center,.4);
 camPath(1.6,e=>{const a=.4+e*1.6;CAM.pos.set(Math.cos(a)*6,2.2+e*1.5,Math.sin(a)*6);CAM.look.set(0,1,0)},E.io);
 d.armR.g.rotation.set(-1.6,0,-1.2);trail.on=true;AU.play('slash');AU.play('slash',.25);AU.play('slash',.5);const r0=u.m.rotation.y;await tw(.8,e=>{u.m.rotation.y=r0+e*PI*4},E.io);
 ringBlast(center,0xff2040,7,.6);shake(1);for(const t of alive('e'))hurt(t,calc(u,t,.95),{from:center,sparks:[0xff2040,0xffffff]});trail.on=false;await wait(.6);await goHome(u)}
async function castPose(u,dur=.5){const d=u.m.userData;u.posing=1;await tw(dur*.6,e=>{d.armL.g.rotation.x=lerp(-.35,-2.6,e);d.armL.lo.rotation.x=lerp(-1.1,-.2,e);d.armR.g.rotation.x=lerp(-.85,-2.3,e);d.armR.lo.rotation.x=lerp(-.7,-.2,e);d.body.position.y=lerp(-.035,.02,e)})}
async function cortocircuito(u,t){banner('Hack: Cortocircuito');const os=overShoulder(u.gnd(),t.gnd(),2.4,1.7,1);await camTo(os.pos,os.look,.5,E.io,38);
 glyph(u.gnd(),0x30f0ff,1.6,2.2);AU.play('charge');await castPose(u);const hand=u.m.userData.armL.end.getWorldPosition(new V3());stream(hand,t.chest(),{n:40,col:[0x30f0ff,0xffffff,0x60a0ff],dur:.7,size:.22});
 glyph(t.gnd(),0x30f0ff,1.5,2.6);await wait(.6);const sv=sideView(u.home,t.gnd(),5,-1);camTo(t.chest().add(new V3(3.2,.6,2.6)),t.chest(),.25,E.o,40);
 const wk=t.flying?2:1;for(let k=0;k<3;k++){bolt(t.chest().add(new V3(rnd(-1,1),5,rnd(-1,1))),t.chest(),0x60f8ff);AU.play('zap');shake(.5);await wait(.09)}
 hurt(t,calc(u,t,1.55,{magic:true,weak:wk}),{col:0x30f0ff,sparks:[0x30f0ff,0xffffff,0x80ffff],weak:wk>1});burst(t.chest(),{n:36,col:[0x30f0ff,0xffffff],sp:6,size:.4});await wait(.55);u.posing=0;rest(u)}
async function virusNeon(u){banner('Hack: Virus Neon');camTo(new V3(1.5,7.5,8),new V3(-3,0,0),.6,E.io,44);AU.play('charge');await castPose(u);const hand=u.m.userData.armL.end.getWorldPosition(new V3());
 for(const t of alive('e')){glyph(t.gnd(),0x60ff90,1.6,2.2);stream(hand,t.chest(),{n:22,col:[0x60ff90,0xffffff,0x30f0ff],dur:.8,size:.22})}await wait(.95);AU.play('zap');
 for(const t of alive('e')){burst(t.chest(),{n:26,col:[0x60ff90,0xffffff],sp:4,up:1,size:.35});hurt(t,calc(u,t,.95,{magic:true}),{col:0x60ff90,sparks:[0x60ff90,0xffffff]})}await wait(.6);u.posing=0;rest(u)}
async function rattoppo(u,t){banner('Hack: Rattoppo');camTo(t.gnd().add(new V3(3,2,3.5)),t.chest(),.5);await castPose(u,.4);glyph(t.gnd(),0x5dff9a,1.4,2);await wait(.4);heal(t,130);await wait(.6);u.posing=0;rest(u)}
async function useItem(u,id,t){const it=ST.items[id];it.q--;banner(it.n);const d=u.m.userData;
 if(id=='emp'){camTo(new V3(4,4.5,6.5),new V3(-2.5,.5,0),.5);const tg=new V3(-3.2,.5,0),p0=u.chest();const g=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:0x80c0ff,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false}));g.scale.setScalar(.5);scene.add(g);
  await tw(.6,e=>{g.position.lerpVectors(p0,tg,e);g.position.y+=Math.sin(e*PI)*2.5},E.lin);scene.remove(g);AU.play('boom');shake(1.3);ringBlast(tg,0x80c0ff,7,.6);burst(tg,{n:50,col:[0x80c0ff,0xffffff,0xffd34d],sp:8,size:.5});
  for(const e of alive('e')){const w=e.flying?2:1;hurt(e,{d:Math.round(60*w*rnd(.95,1.05)),crit:false},{col:0x80c0ff,weak:w>1})}}
 else{camTo(t.gnd().add(new V3(3,2,3.5)),t.chest(),.45);await wait(.35);if(id=='medikit')heal(t,150);else heal(t,30,true)}
 await wait(.7)}
async function defend(u){banner('Difesa');u.defend=true;AU.play('shield');shieldFx(u);await wait(.7)}

// =============== AZIONI DEI NEMICI ===============
async function rattoAct(u){const t=targetHero();if(!t)return;const big=Math.random()<.35;const d=u.m.userData;banner(big?'Morso Ferroso':'Mazzata');
 const dest=lunge(u,t,1.1);const sv=sideView(u.home,t.gnd(),4.6,-1);camTo(sv.pos,sv.look,.45);await moveTo(u,dest,.45);await faceTo(u,t.pos(),.08);u.posing=1;
 const cv=overShoulder(t.gnd(),u.gnd(),-2.4,1.5,-1);camTo(t.gnd().lerp(u.gnd(),.5).add(new V3(0,1.4,0)).add(new V3().subVectors(u.gnd(),t.gnd()).normalize().applyAxisAngle(new V3(0,1,0),-1.25).multiplyScalar(3.1)),t.chest().lerp(u.chest(),.5),.3,E.io,38);
 if(big){await tw(.2,e=>{d.torso.rotation.x=lerp(.38,-.1,e);d.head.rotation.x=lerp(-.3,-.7,e)});AU.play('bite');await tw(.1,e=>{d.torso.rotation.x=lerp(-.1,.9,e);d.head.rotation.x=lerp(-.7,.1,e)},E.i);
  for(let k=0;k<3;k++){const p=t.chest().add(new V3(0,.3-k*.25,0));beam(p.clone().add(new V3(0,.3,.4)),p.clone().add(new V3(0,-.3,-.4)),0xff3040,.4,.025)}hurt(t,calc(u,t,1.35),{from:u.m.position,col:0xff2040,sparks:[0xff2040,0xffffff]})}
 else{await tw(.22,e=>{d.armL.g.rotation.x=lerp(-.5,-2.8,e);d.armL.lo.rotation.x=lerp(-.9,-.2,e);d.torso.rotation.x=lerp(.38,.05,e)});AU.play('slash');await tw(.1,e=>{d.armL.g.rotation.x=lerp(-2.8,-.2,e);d.torso.rotation.x=lerp(.05,.7,e)},E.i);hurt(t,calc(u,t,1),{from:u.m.position})}
 await wait(.25);d.head.rotation.x=-.3;u.posing=0;await goHome(u)}
async function droneAct(u){const many=Math.random()<.4;banner(many?'Raffica Vespa':'Laser');const d=u.m.userData;
 const t0=targetHero();if(!t0)return;camTo(u.pos().add(new V3(-2.2,.9,2.4)),u.pos().lerp(t0.chest(),.4),.45,E.io,40);await faceTo(u,t0.pos(),.2);
 const shots=many?[0,1,2].map(()=>targetHero()):[t0];
 for(const t of shots){if(!t||!t.alive)continue;await faceTo(u,t.pos(),.1);const mz=d.muzzle.getWorldPosition(new V3());burst(mz,{n:12,col:[0xff2040,0xffffff],sp:1,size:.25,grav:0});AU.play('charge');await wait(many?.15:.45);
  AU.play('laser');beam(d.muzzle.getWorldPosition(new V3()),t.chest(),0xff2040,.35,.05);if(!many)camTo(t.chest().add(new V3(2.6,.6,2.8)),t.chest(),.2,E.o);hurt(t,calc(u,t,many?.55:1.05),{from:u.m.position,col:0xff2040,sparks:[0xff2040,0xffffff]});await wait(.18)}
 await wait(.3);await faceTo(u,u.home.clone().add(new V3(1,0,0)),.2)}
function targetHero(){const h=alive('h');if(!h.length)return null;if(Math.random()<.3)return h.reduce((a,b)=>a.hp/a.mhp<b.hp/b.mhp?a:b);return pick(h)}

// =============== SQUADRE ===============
const ras=mkUnit({id:'ras',name:'RAS',side:'h',make:()=>makeRas({sword:'hand'}),sc:1.78,at:[3.1,0,1.35],hp:420,mp:40,atk:44,mag:20,def:10,spd:12,crit:.12});
const kiri=mkUnit({id:'kiri',name:'KIRI',side:'h',make:makeKiri,sc:1.8,at:[3.5,0,-1.35],hp:320,mp:64,atk:30,mag:40,def:7,spd:15,crit:.1});
const enemies=[mkUnit({id:'r1',kind:'ratto',name:'Ratto di Ferro A',side:'e',make:makeRatto,sc:1.75,at:[-2.7,0,1.7],hp:170,atk:32,def:6,spd:10,exp:40,cr:25}),
 mkUnit({id:'r2',kind:'ratto',name:'Ratto di Ferro B',side:'e',make:makeRatto,sc:1.68,at:[-3.2,0,-1.6],hp:170,atk:30,def:6,spd:9,exp:40,cr:25}),
 mkUnit({id:'dr',kind:'drone',name:'Drone Vespa',side:'e',make:makeDrone,sc:2.3,at:[-4.3,1.9,.1],hp:120,atk:26,def:3,spd:14,flying:1,exp:55,cr:40})];
units.forEach(u=>u.m.traverse(o=>{if(o.isMesh)o.userData.unit=u}));
// cursore 3D (freccia rosa) sul bersaglio
const cursor=new THREE.Mesh(new THREE.ConeGeometry(.16,.38,4),new THREE.MeshBasicMaterial({color:0xff2fb3,fog:false}));cursor.rotation.x=PI;cursor.visible=false;scene.add(cursor);
const curGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:0xff2fb3,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,fog:false}));curGlow.scale.setScalar(.9);cursor.add(curGlow);

// =============== ATB + MENU ===============
let running=false,acting=false,ended=false,menuU=null;const ready=[],queue=[];
const SKILLS={ras:[{id:'alba',n:'Taglio Alba',mp:8,t:'e',d:'Un fendente rosso che vola sul nemico. Danno forte.'},{id:'rot',n:'Lama Rotante',mp:14,t:'all',d:'Ras gira su sé stesso: colpisce tutti i nemici.'}],
 kiri:[{id:'corto',n:'Cortocircuito',mp:6,t:'e',d:'Fulmini di codice. Doppio danno ai droni.'},{id:'virus',n:'Virus Neon',mp:12,t:'all',d:'Un virus colpisce tutti i nemici.'},{id:'patch',n:'Rattoppo',mp:8,t:'h',d:'Cura 130 PV a un alleato.'}]};
const cmdW=$('cmd'),cmdL=$('cmdL'),help=$('help');let items=[],sel=0,back=null,pickT=null;
function list(title,arr,onBack){$('cmdT').textContent=title;cmdL.innerHTML='';back=onBack;items=arr.map((it,i)=>{const b=document.createElement('button');b.innerHTML=it.l+(it.r?`<small>${it.r}</small>`:'');b.disabled=!!it.off;
  b.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();if(b.disabled){AU.play('no');return}if(sel!=i){setSel(i);if(!isTouch&&!it.tap)return}choose()});b.addEventListener('pointerenter',()=>{if(!isTouch)setSel(i)});cmdL.appendChild(b);return{...it,b}});
 if(onBack){const b=document.createElement('button');b.textContent='↩ Indietro';b.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();AU.play('no');onBack()});cmdL.appendChild(b)}
 sel=Math.max(0,items.findIndex(i=>!i.off));setSel(sel,true)}
function setSel(i,silent){sel=i;items.forEach((it,k)=>it.b.classList.toggle('sel',k==i));const it=items[i];help.textContent=it&&it.d||'';if(!silent)AU.play('cur');if(it&&it.hover)it.hover()}
function choose(){const it=items[sel];if(!it||it.off){AU.play('no');return}AU.play('ok');it.go()}
function openMenu(u){menuU=u;cmdW.classList.add('on');mainMenu()}
function closeMenu(){menuU=null;cmdW.classList.remove('on');help.textContent='';cursor.visible=false;pickT=null}
function mainMenu(){const u=menuU,sk=u.id=='ras'?'Tecnica':'Hack';cursor.visible=false;pickT=null;
 list(u.name,[{l:'Attacca',d:u.id=='ras'?'Un colpo di katana.':'Due colpi rapidi di kunai.',go:()=>targets('e',t=>act(u,()=>u.id=='ras'?rasAttack(u,t):kiriAttack(u,t)))},
  {l:sk,d:u.id=='ras'?'Tecniche di spada (costano PM).':'Hack di Kiri: magia fatta di codice (costa PM).',go:skills},
  {l:'Oggetto',d:'Usa un oggetto della squadra.',go:itemsMenu},{l:'Difendi',d:'Dimezza i danni fino al prossimo turno.',go:()=>act(u,()=>defend(u))}],null)}
function skills(){const u=menuU;list(u.id=='ras'?'TECNICA':'HACK',SKILLS[u.id].map(s=>({l:s.n,r:s.mp+' PM',off:u.mp<s.mp,d:s.d,go:()=>{
  const run=t=>act(u,()=>{u.mp-=s.mp;return({alba:()=>taglioAlba(u,t),rot:()=>lamaRotante(u),corto:()=>cortocircuito(u,t),virus:()=>virusNeon(u),patch:()=>rattoppo(u,t)})[s.id]()});
  if(s.t=='all')run();else targets(s.t,run,skills)}})),mainMenu)}
function itemsMenu(){const u=menuU;list('OGGETTI',Object.entries(ST.items).map(([id,it])=>({l:it.n,r:'x'+it.q,off:it.q<=0,d:it.d,go:()=>{const run=t=>act(u,()=>useItem(u,id,t));if(id=='emp')run();else targets('h',run,itemsMenu)}})),mainMenu)}
function targets(side,cb,backTo=mainMenu){const arr=(side=='e'?alive('e'):alive('h'));pickT=t=>{AU.play('ok');cb(t)};
 list('BERSAGLIO',arr.map(t=>({l:t.name.replace('Ratto di Ferro','Ratto'),r:t.side=='h'?t.hp+' PV':'',d:t.side=='e'?t.name:'',hover:()=>pointAt(t),go:()=>cb(t)})),backTo);}
function pointAt(t){cursor.visible=true;cursor.userData.t=t}
function act(u,fn){const i=ready.indexOf(u);if(i>=0)ready.splice(i,1);u.atb=0;closeMenu();queue.push({u,fn});ST.turns++}
// tocco diretto sui modelli 3D mentre si sceglie il bersaglio
const ray=new THREE.Raycaster();
function stageXY(e){return[(e.clientX-OX)/SC,(e.clientY-OY)/SC]}
$('stage').addEventListener('pointerdown',e=>{if(e.target.closest('button,#start'))return;if(!pickT)return;const[x,y]=stageXY(e);ray.setFromCamera(new THREE.Vector2(x/W*2-1,-(y/H*2-1)),cam);
 const hits=ray.intersectObjects(units.filter(u=>u.alive).map(u=>u.hit),false);if(hits.length){const t=hits[0].object.userData.u;const it=items.findIndex(i=>i.l&&t.name.replace('Ratto di Ferro','Ratto')==i.l);if(it>=0){setSel(it,true);pickT(t)}}});
addEventListener('keydown',e=>{const k=e.key;if(!started){if(k=='Enter'||k==' ')begin();return}if(!menuU)return;
 if(k=='ArrowDown'||k=='ArrowUp'){e.preventDefault();let i=sel;for(let n=0;n<items.length;n++){i=(i+(k=='ArrowDown'?1:-1)+items.length)%items.length;if(!items[i].off)break}setSel(i)}
 else if(k=='Enter'||k==' '){e.preventDefault();choose()}else if((k=='Escape'||k=='Backspace')&&back){AU.play('no');back()}});
// finestra della squadra
const partyW=$('party');partyW.innerHTML=[ras,kiri].map(u=>`<div class="pr" id="pr_${u.id}"><span class="nm">${u.name}</span><span class="hp">PV <b>0</b></span><span class="mp">PM 0</span><div class="atb"><i></i></div></div>`).join('');
function upParty(){for(const u of [ras,kiri]){const r=$('pr_'+u.id);r.querySelector('.hp b').textContent=u.hp+'/'+u.mhp;r.querySelector('.mp').textContent='PM '+u.mp;const a=r.querySelector('.atb');a.firstChild.style.width=Math.min(100,u.atb)+'%';a.classList.toggle('full',u.atb>=100&&u.alive);
 r.classList.toggle('act',menuU==u);r.classList.toggle('ko',!u.alive)}}
function stepATB(dt){if(!running||ended)return;const pausa=acting||menuU||queue.length;
 if(!pausa)for(const u of units){if(!u.alive)continue;if(u.atb<100){u.atb=Math.min(100,u.atb+dt*u.spd*4.3);if(u.atb>=100){if(u.side=='h'){u.defend=false;ready.push(u)}else queue.push({u,fn:()=>u.kind=='drone'?droneAct(u):rattoAct(u)})}}}
 if(!acting&&queue.length){const q=queue.shift();if(!q.u.alive)return;acting=true;cursor.visible=false;q.u.atb=0;
  Promise.resolve(q.fn()).catch(err=>console.error(err)).then(async()=>{await camHome(.7);acting=false;check()})}
 else if(!acting&&!menuU&&ready.length){const u=ready[0];if(u.alive)openMenu(u);else ready.shift()}}
function check(){if(ended)return;if(!alive('e').length)victory();else if(!alive('h').length)defeat()}

// =============== INTRO, VITTORIA, SCONFITTA ===============
async function intro(){ST.t0=performance.now();
 CAM.pos.set(-8,1.2,6);CAM.look.set(-3,1,0);CAM.fov=50;
 camPath(4.2,e=>{const a=lerp(2.3,.72,e),r=lerp(7,11.3,e);CAM.pos.set(Math.cos(a)*r,lerp(1.2,3.9,e),Math.sin(a)*r);CAM.look.set(lerp(-3,-.6,e),lerp(1.4,1.1,e),lerp(0,-.2,e));CAM.fov=lerp(50,42,e)},E.io);
 await wait(.9);banner('Ratti di Ferro x2 · Drone Vespa',2.2);await wait(2.6);await camHome(.7);banner('IN GUARDIA!',1,true);AU.play('ok');await wait(.9);running=true}
async function victory(){ended=true;running=false;closeMenu();AU.music(false);await wait(.6);banner('VITTORIA!',2.4,true);AU.fanfare();
 const hs=alive('h');for(const u of hs){u.posing=1;const d=u.m.userData;await faceTo(u,CAM.pos,.2)}
 camPath(4,e=>{const a=lerp(-.2,1.5,e),c=new V3(3.3,0,0);CAM.pos.set(c.x+Math.cos(a)*5.2,1.7+e*.6,c.z+Math.sin(a)*5.2);CAM.look.set(3.3,1.2,0)},E.io);
 for(const u of hs){const d=u.m.userData;if(u.id=='ras'){tw(.5,e=>{d.armR.g.rotation.set(lerp(-.55,-3,e),0,lerp(-.15,-.2,e));d.armR.lo.rotation.x=lerp(-.95,-.1,e);d.sword.rotation.x=lerp(PI/2-.3,PI*2.5,e)},E.back).then(()=>{burst(d.tip.getWorldPosition(new V3()),{n:30,col:[0xff2040,0xffd34d,0xffffff],sp:3,up:1,size:.3})})}
  else tw(.7,e=>{d.body.position.y=Math.sin(e*PI)*.35;d.body.rotation.x=-e*PI*2;d.armL.g.rotation.x=lerp(-.35,-2.8,e)},E.io)}
 await wait(3.6);const secs=Math.round((performance.now()-ST.t0)/1000);
 results(`<h1>VITTORIA</h1><div class="row"><span>Esperienza</span><b>+${ST.exp} EXP</b></div><div class="row"><span>Crediti</span><b>+${ST.cr} ₵</b></div><div class="row"><span>Bottino</span><b>Chip dei Varga x1</b></div><div class="row"><span>Tempo · turni</span><b>${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')} · ${ST.turns}</b></div>`)}
async function defeat(){ended=true;running=false;closeMenu();AU.music(false);AU.play('ko');camTo(new V3(10,6,10),new V3(0,0,0),2.5);await wait(1.5);
 results(`<h1 style="color:#ff5a6a;text-shadow:0 0 18px #ff2040,0 4px 0 #000">SCONFITTA</h1><div class="row"><span>I Ratti di Ferro tengono il vicolo.</span></div><div class="row"><span>Consiglio</span><b>usa Difendi e i Medikit</b></div>`)}
function results(html){const r=$('res');r.innerHTML=html+`<div class="bt"><button class="main" id="rCovo">🚪 Torna al Covo</button><button id="rAgain">↻ Rigioca</button><button id="rMenu">⌂ Menu</button></div>`;r.classList.add('on');
 $('rCovo').onclick=()=>leave('../stanza/?v='+V);$('rAgain').onclick=()=>leave('./?v='+V+'&r='+Date.now());$('rMenu').onclick=()=>leave('../?v='+V);window.__bt.state=ended?'results':'?'}
function leave(url){AU.music(false);$('fade').classList.add('on');setTimeout(()=>location.href=url,850)}
$('bMenu').onclick=()=>leave('../?v='+V);const mb=$('bMute');mb.textContent=AU.muted?'🔇':'🔊';mb.onclick=()=>{AU.init();AU.setMute(!AU.muted);mb.textContent=AU.muted?'🔇':'🔊'};

// =============== TRANSIZIONE D'INGRESSO: vetro che si rompe + vortice neon (shader) ===============
let TR=null;
const RT=new THREE.WebGLRenderTarget(W,H,{type:THREE.HalfFloatType});
const trMat=new THREE.ShaderMaterial({uniforms:{tex:{value:RT.texture},t:{value:0},asp:{value:W/H}},depthTest:false,depthWrite:false,
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
 fragmentShader:`uniform sampler2D tex;uniform float t,asp;varying vec2 vUv;
 float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 void main(){float k=1.-t;vec2 p=vUv-.5;p.x*=asp;
  // schegge: celle triangolari che si spostano e ruotano, poi si ricompongono
  vec2 g=vUv*vec2(7.,4.)+vec2(sin(vUv.y*9.)*.18,cos(vUv.x*7.)*.15);vec2 id=floor(g),f=fract(g);float rr=h(id*1.7);vec2 ff=rr>.5?f:vec2(f.x,1.-f.y);float tri=step(ff.x,ff.y);vec2 cid=id+tri*.5;float r=h(cid);
  float ks=smoothstep(.0,.7,k);vec2 off=(vec2(h(cid+1.),h(cid+2.))-.5)*ks*ks*.7;
  // vortice
  float d=length(p);float ang=k*k*9.*(1.-smoothstep(0.,1.1,d));float s=sin(ang),c=cos(ang);vec2 q=mat2(c,-s,s,c)*p*(1.+k*k*1.2);q.x/=asp;vec2 uv=q+.5+off;
  float ca=.012*k;vec3 col=vec3(texture2D(tex,uv+vec2(ca,0)).r,texture2D(tex,uv).g,texture2D(tex,uv-vec2(ca,0)).b);
  float edge=min(min(min(f.x,f.y),min(1.-f.x,1.-f.y)),abs(ff.x-ff.y)*.7);float crack=(1.-smoothstep(0.,.025,edge))*ks*ks;
  col+=vec3(1.,.18,.7)*crack*1.6+vec3(.0,.9,1.)*crack*.4*r;
  col=mix(col,vec3(1.,.85,.95),smoothstep(.75,1.,k));col*=1.-.35*ks*r;
  gl_FragColor=vec4(col,1.);}`});
const trQuad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),trMat),trScene=new THREE.Scene(),trCam=new THREE.Camera();trScene.add(trQuad);
function startTransition(dur=1.5){TR={t:0,dur}}

// =============== CICLO ===============
let last=performance.now(),started=false;
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;TIME+=dt;
 upTweens(dt);upCam(dt);stepATB(dt);units.forEach(u=>idle(u,dt));upSpr(dt);upTrail();upNums(dt);upParty();
 // pioggia, increspature, vapore, insegne
 const P=rainG.attributes.position.array;for(let i=0;i<RAIN;i++){const k=i*6,v=rainV[i]*dt;P[k+1]-=v;P[k+4]-=v;P[k]-=v*.07;P[k+3]-=v*.07;if(P[k+4]<0){const x=rnd(-16,16)+CAM.look.x*.3,y=rnd(12,16),z=rnd(-10,10);P[k]=x;P[k+1]=y;P[k+2]=z;P[k+3]=x-.03;P[k+4]=y-.45;P[k+5]=z}}rainG.attributes.position.needsUpdate=true;
 ripples.forEach(r=>{r.userData.t+=dt*1.6;if(r.userData.t>1){r.userData.t=0;r.position.set(rnd(-9,9),.02,rnd(-6,6))}const t=r.userData.t;r.scale.setScalar(.05+t*.28);r.material.opacity=(1-t)*.5});
 steam.forEach((s,i)=>{s.userData.t+=dt*.25;if(s.userData.t>1)s.userData.t=0;const t=s.userData.t;s.position.set(-8.5+Math.sin(t*3+i)*.3,1.3+t*4,5.2);s.scale.setScalar(1+t*3);s.material.opacity=Math.sin(t*PI)*.18});
 (window.__signs||[]).forEach(s=>{const f=Math.sin(TIME*19+s.ph)>.96?.3:1;s.m.material.opacity=f;s.gl.material.opacity=.35*f});
 if(cursor.visible&&cursor.userData.t){const t=cursor.userData.t;cursor.position.copy(t.top()).add(new V3(0,.35+Math.sin(TIME*6)*.08,0));cursor.rotation.y+=dt*3}
 if(TR){TR.t+=dt;const p=Math.min(1,TR.t/TR.dur);trMat.uniforms.t.value=E.o(p);renderer.setRenderTarget(RT);renderer.render(scene,cam);renderer.setRenderTarget(null);renderer.render(trScene,trCam);if(p>=1)TR=null}
 else renderer.render(scene,cam);
 requestAnimationFrame(frame)}
window.__bt={state:'loading',units:()=>units.map(u=>({id:u.id,hp:u.hp,alive:u.alive,atb:Math.round(u.atb)})),menu:()=>menuU&&menuU.id,items:()=>items.map(i=>i.l),busy:()=>acting||queue.length>0};
function begin(){if(started)return;started=true;AU.init();AU.music(true);AU.play('glass');AU.play('swirl');$('start').classList.add('gone');startTransition(1.6);intro();window.__bt.state='play'}
$('start').addEventListener('pointerup',e=>{e.stopPropagation();begin()});
setTimeout(()=>{$('st3').textContent=isTouch?'▶ TOCCA PER COMBATTERE':'▶ CLICCA PER COMBATTERE';window.__bt.state='start';
 if(/[?&]auto=1/.test(location.search)||sessionStorage.getItem('pc_from_room')){sessionStorage.removeItem('pc_from_room')}},300);
camHome(.01);requestAnimationFrame(frame);

// =============== SCHERMO + ROTAZIONE ===============
const stage=$('stage');let SC=1,OX=0,OY=0;
(()=>{const body=document.body,wrap=$('wrap');
 const fit=()=>{const vv=window.visualViewport,vw=vv?vv.width:innerWidth,vh=vv?vv.height:innerHeight;body.classList.toggle('portrait',vh>vw&&(isTouch||vw<900));
  const r=wrap.getBoundingClientRect(),w=r.width||vw,h=r.height||vh;SC=Math.min(w/W,h/H);const ox=(w-W*SC)/2,oy=(h-H*SC)/2;stage.style.transform=`translate(${ox}px,${oy}px) scale(${SC})`;OX=r.left+ox;OY=r.top+oy;
  const pr=Math.max(.6,Math.min(isTouch?1.6:2,SC*(window.devicePixelRatio||1)));if(Math.abs(renderer.getPixelRatio()-pr)>.01){renderer.setPixelRatio(pr);renderer.setSize(W,H,false);RT.setSize(W*pr,H*pr)}window.scrollTo(0,0)};
 let tm=[];const sched=()=>{tm.forEach(clearTimeout);fit();tm=[50,150,350,700,1200].map(ms=>setTimeout(fit,ms))};
 addEventListener('resize',sched);addEventListener('orientationchange',sched);addEventListener('pageshow',e=>{sched();if(e.persisted)$('fade').classList.remove('on')});
 if(window.visualViewport){visualViewport.addEventListener('resize',sched);visualViewport.addEventListener('scroll',()=>window.scrollTo(0,0))}
 if(screen.orientation&&screen.orientation.addEventListener)screen.orientation.addEventListener('change',sched);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)sched()});$('rotok').addEventListener('click',()=>{body.classList.add('ok');sched()});sched()})();
