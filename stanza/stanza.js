// PUNK CITY – Stanza di prova "Il Covo": sfondo dipinto + personaggio 3D low-poly (Three.js),
// area calpestabile invisibile, maschere di occlusione, '!' e dialoghi JRPG, musica WebAudio.
import * as THREE from '../lib/three.module.min.js?v=5';
const V='5',W=1280,H=720,$=id=>document.getElementById(id);
const ASSET=n=>'assets/'+n+'?v='+V;

// ---------------- DATI DELLA STANZA (coordinate in pixel dello sfondo 1280x720) ----------------
const WALK=[[326,585],[296,530],[306,490],[340,470],[380,452],[470,410],[560,378],[660,348],[760,334],[880,334],[893,318],[1015,318],[1040,330],[1070,340],[1094,350],[1094,382],[1060,382],[934,418],[928,482],[892,502],[892,560],[862,598],[858,690],[330,690],[312,620]];
// livelli in primo piano ritagliati dallo sfondo: coprono il personaggio quando i suoi piedi sono "dietro" (y < base)
const OCC=[{k:'occ_casse',x:863,y:375,w:219,h:345,base:430},{k:'occ_tubo',x:1073,y:0,w:207,h:720,base:2000},{k:'occ_tavolo',x:0,y:309,w:314,h:411,base:530}];
const sizeAt=y=>175+(y-330)*.42;            // altezza del personaggio in pixel in base alla profondità
const DEPTH=2;                               // 1 px in verticale sullo schermo = 2 px "veri" sul pavimento (prospettiva)
const SPEED=1.75;                            // velocità in "altezze del personaggio" al secondo

// ---------------- AUDIO (tutto generato, nessun file) ----------------
const AU=(()=>{let ctx=null,master,mus,fx,dly,noiseB,rainG,crG,timer=null,nextT=0,step=0,mode='ambient',muted=false;
 try{muted=localStorage.getItem('pc_mute')=='1'}catch(e){}
 const N=n=>440*Math.pow(2,(n-69)/12);
 function init(){if(ctx){if(ctx.state!='running')ctx.resume();return true}const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;try{ctx=new AC()}catch(e){return false}
  master=ctx.createGain();master.gain.value=muted?0:.9;master.connect(ctx.destination);
  mus=ctx.createGain();mus.gain.value=.5;mus.connect(master);fx=ctx.createGain();fx.gain.value=.6;fx.connect(master);
  dly=ctx.createDelay(2);dly.delayTime.value=.42;const fb=ctx.createGain();fb.gain.value=.38;const wet=ctx.createGain();wet.gain.value=.4;const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2200;dly.connect(lp);lp.connect(fb);fb.connect(dly);lp.connect(wet);wet.connect(mus);
  const len=ctx.sampleRate*2;noiseB=ctx.createBuffer(1,len,ctx.sampleRate);const d=noiseB.getChannelData(0);let b=0;for(let i=0;i<len;i++){const w=Math.random()*2-1;b=.97*b+.03*w;d[i]=w*.4+b*3}
  // pioggia fuori dalla finestra
  const r=ctx.createBufferSource();r.buffer=noiseB;r.loop=true;const rf=ctx.createBiquadFilter();rf.type='bandpass';rf.frequency.value=900;rf.Q.value=.6;rainG=ctx.createGain();rainG.gain.value=.05;r.connect(rf);rf.connect(rainG);rainG.connect(master);r.start();
  // fruscio del disco (acceso solo col grammofono)
  const c=ctx.createBufferSource();c.buffer=noiseB;c.loop=true;const cf=ctx.createBiquadFilter();cf.type='highpass';cf.frequency.value=3000;crG=ctx.createGain();crG.gain.value=0;c.connect(cf);cf.connect(crG);crG.connect(master);c.start();
  const s=ctx.createBufferSource();s.buffer=ctx.createBuffer(1,1,22050);s.connect(ctx.destination);s.start(0);if(ctx.state!='running')ctx.resume();
  document.addEventListener('visibilitychange',()=>{if(ctx)document.hidden?ctx.suspend():ctx.resume()});
  nextT=ctx.currentTime+.1;timer=setInterval(tick,30);return true}
 function tone(type,f,t,dur,peak,out,o={}){const v=ctx.createOscillator(),g=ctx.createGain();v.type=type;v.frequency.setValueAtTime(f,t);if(o.det)v.detune.value=o.det;let n=v;
  if(o.lp){const fl=ctx.createBiquadFilter();fl.type='lowpass';fl.frequency.value=o.lp;v.connect(fl);n=fl}n.connect(g);g.connect(out);
  const a=o.a||.01;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+dur);v.start(t);v.stop(t+a+dur+.05)}
 // due brani originali, lenti: "Covo" (pad + carillon elettrico) e "Disco" (valzer malinconico)
 const SONG={ambient:{bpm:66,ch:[[57,64,67,71],[53,60,64,69],[48,55,59,64],[52,59,62,67]],mel:[76,0,0,74,0,72,0,0,71,0,0,0,72,0,74,0,  79,0,0,76,0,0,74,0,72,0,71,0,69,0,0,0]},
  disco:{bpm:84,ch:[[50,57,62,65],[55,59,62,67],[48,55,60,64],[57,61,64,69]],mel:[74,0,77,76,0,74,72,0,74,0,69,0,0,0,0,0,  77,0,81,79,0,77,76,0,74,0,73,0,74,0,0,0]}};
 function sched(t){const S=SONG[mode],e=60/S.bpm/2,st=step%32,bar=Math.floor(step/8)%4,ch=S.ch[bar];
  if(mode=='ambient'){
   if(step%8==0)ch.forEach((n,i)=>{[-7,7].forEach(det=>tone('triangle',N(n-12),t,e*9,.028,mus,{a:1.2,lp:900,det}))});
   if(step%8==0)tone('sine',N(ch[0]-24),t,e*8,.12,mus,{a:.4});
   const m=S.mel[st];if(m&&Math.floor(step/32)%2==1){tone('sine',N(m),t,1.4,.07,mus,{a:.005});tone('sine',N(m+12),t,.6,.02,dly,{a:.005})}
   if(step%2==0&&Math.random()<.35)tone('sine',N(ch[1+Math.floor(Math.random()*3)]+24),t,.9,.018,dly,{a:.005});
  }else{ // disco: tempo di valzer 3/4 con fruscio
   const b3=step%6;if(b3==0)tone('triangle',N(ch[0]-12),t,e*2,.12,mus,{lp:700});
   if(b3==2||b3==4)ch.slice(1).forEach(n=>tone('triangle',N(n),t,e*.9,.025,mus,{lp:1500}));
   const m=S.mel[st];if(m){tone('square',N(m),t,e*2.2,.022,mus,{lp:1400,a:.02});tone('sine',N(m),t,e*2.2,.04,dly,{a:.02})}}}
 function tick(){if(!ctx)return;const S=SONG[mode],e=60/S.bpm/2;while(nextT<ctx.currentTime+.2){sched(nextT);nextT+=e;step++}}
 function setMode(m){mode=m;step=0;if(ctx){nextT=ctx.currentTime+.1;crG.gain.setTargetAtTime(m=='disco'?.012:0,ctx.currentTime,.3);mus.gain.setTargetAtTime(m=='disco'?.6:.5,ctx.currentTime,.3)}}
 const FX={step(t){const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noiseB;f.type='lowpass';f.frequency.value=380+Math.random()*120;s.connect(f);f.connect(g);g.connect(fx);g.gain.setValueAtTime(.35,t);g.gain.exponentialRampToValueAtTime(.001,t+.09);s.start(t,Math.random());s.stop(t+.1)},
  blip(t){tone('square',820+Math.random()*60,t,.03,.025,fx,{lp:2500,a:.002})},
  open(t){tone('sine',660,t,.12,.09,fx);tone('sine',990,t+.07,.18,.07,fx)},
  bang(t){tone('triangle',1320,t,.25,.12,fx,{a:.003});tone('triangle',1760,t+.06,.35,.1,fx,{a:.003})},
  door(t){const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noiseB;f.type='bandpass';f.frequency.setValueAtTime(300,t);f.frequency.exponentialRampToValueAtTime(1400,t+.7);f.Q.value=8;s.connect(f);f.connect(g);g.connect(fx);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.6,t+.2);g.gain.exponentialRampToValueAtTime(.001,t+.9);s.start(t);s.stop(t+1);tone('sine',70,t+.8,.5,.5,fx,{a:.005})},
  vinyl(t){tone('sine',200,t,.4,.1,fx,{a:.3})}};
 function play(n){if(!ctx||muted||ctx.state!='running')return;try{FX[n](ctx.currentTime+.01)}catch(e){}}
 function setMute(m){muted=m;try{localStorage.setItem('pc_mute',m?'1':'0')}catch(e){}if(master)master.gain.setTargetAtTime(m?0:.9,ctx.currentTime,.05)}
 function fadeOut(){if(master)master.gain.setTargetAtTime(0,ctx.currentTime,.25)}
 return{init,play,setMode,setMute,fadeOut,get muted(){return muted},get mode(){return mode},get running(){return !!ctx&&ctx.state=='running'}}})();

// ---------------- RENDERER E SCENA ----------------
const canvas=$('gl');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
renderer.setSize(W,H,false);renderer.setClearColor(0x000000,1);
const scene=new THREE.Scene();
const cam=new THREE.OrthographicCamera(0,W,0,-H,-4000,4000);cam.position.z=0;   // telecamera fissa: lo "scatto" è il quadro dipinto
const loader=new THREE.TextureLoader();
const tex=(n,cb)=>{const t=loader.load(ASSET(n),cb);t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;return t};
const flat=(t,w,h,x,y,o={})=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,transparent:true,depthTest:false,depthWrite:false,blending:o.add?THREE.AdditiveBlending:THREE.NormalBlending,opacity:o.op??1,color:o.col??0xffffff,toneMapped:false}));m.position.set(x+w/2,-(y+h/2),-3000);scene.add(m);return m};
let loaded=0;const need=1+OCC.length,onLoad=()=>{loaded++;if(loaded>=need)ready()};
const bg=flat(tex('covo.jpg',onLoad),W,H,0,0);bg.renderOrder=-1000;
OCC.forEach(o=>{o.mesh=flat(tex(o.k+'.webp',onLoad),o.w,o.h,o.x,o.y)});

// bagliori: neon della porta, lampade, finestra (sfarfallano un po')
function glowTex(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.45)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
const GT=glowTex();
const glows=[[860,90,70,240,0xff2fb3,.55,'neon'],[995,95,70,240,0xff2fb3,.55,'neon'],[910,50,130,70,0xff2fb3,.5,'neon'],[540,30,110,90,0xffb060,.45,'lamp'],[440,95,110,100,0xffb060,.4,'lamp'],[630,70,190,170,0x60c8ff,.16,'win']].map(([x,y,w,h,c,a,k])=>{const m=flat(GT,w,h,x,y,{add:1,col:c,op:a});m.renderOrder=-900;return{m,a,k,ph:Math.random()*9}});
// pioggia dietro la finestra
const rainGeo=new THREE.PlaneGeometry(1.5,16),rainMat=new THREE.MeshBasicMaterial({color:0xaee6ff,transparent:true,opacity:.35,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending});
const rain=[...Array(36)].map(()=>{const m=new THREE.Mesh(rainGeo,rainMat);m.rotation.z=-.12;m.renderOrder=-950;m.position.set(650+Math.random()*135,-(90+Math.random()*115),-3000);m.userData.v=380+Math.random()*260;scene.add(m);return m});
// polvere nella luce
const dustN=60,dustG=new THREE.BufferGeometry(),dp=new Float32Array(dustN*3);for(let i=0;i<dustN;i++){dp[i*3]=380+Math.random()*560;dp[i*3+1]=-(60+Math.random()*420);dp[i*3+2]=-3000}
dustG.setAttribute('position',new THREE.BufferAttribute(dp,3));const dust=new THREE.Points(dustG,new THREE.PointsMaterial({color:0xffd9a0,size:3,map:GT,transparent:true,opacity:.55,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:false}));dust.renderOrder=-800;scene.add(dust);

// luci per i personaggi 3D, intonate al quadro: ambra dal bancone, rosa dalla porta, azzurro dalla finestra
scene.add(new THREE.HemisphereLight(0x9a88b8,0x2a1a20,1.35));
const keyL=new THREE.DirectionalLight(0xffb070,1.7);keyL.position.set(-1,1.2,1.4);scene.add(keyL);
const pinkL=new THREE.DirectionalLight(0xff3cc0,.6);pinkL.position.set(1.4,.6,.2);scene.add(pinkL);
const rimL=new THREE.DirectionalLight(0x60c8ff,1.5);rimL.position.set(.2,.8,-1.5);scene.add(rimL);

// ---------------- PERSONAGGI LOW-POLY (fatti a mano con forme semplici, stile cel-shading) ----------------
const grad=(()=>{const d=new Uint8Array([70,70,70,255,150,150,150,255,255,255,255,255]);const t=new THREE.DataTexture(d,3,1,THREE.RGBAFormat);t.minFilter=t.magFilter=THREE.NearestFilter;t.needsUpdate=true;return t})();
const OUT=new THREE.MeshBasicMaterial({color:0x06020a,side:THREE.BackSide,transparent:true});
const MAT={};const mat=(c,e=0,ds=false)=>{const k=c+'_'+e+'_'+ds;return MAT[k]||(MAT[k]=new THREE.MeshToonMaterial({color:c,gradientMap:grad,emissive:e||0x000000,transparent:true,side:ds?THREE.DoubleSide:THREE.FrontSide,flatShading:true}))};
function P(parent,geo,col,pos,o={}){const m=new THREE.Mesh(geo,mat(col,o.e,o.ds));m.position.set(...pos);if(o.rot)m.rotation.set(...o.rot);if(o.sc)m.scale.set(...o.sc);parent.add(m);
 if(o.line!==false){const l=new THREE.Mesh(geo,OUT);l.scale.setScalar(o.line||1.12);m.add(l)}return m}
const box=(w,h,d)=>new THREE.BoxGeometry(w,h,d),cyl=(a,b,h,s=6,open=false,t0=0,tl=Math.PI*2)=>new THREE.CylinderGeometry(a,b,h,s,1,open,t0,tl),ico=(r,d=1)=>new THREE.IcosahedronGeometry(r,d);
function limb(parent,x,y,len,w,col,{foot,hand,cyber}={}){const g=new THREE.Group();g.position.set(x,y,0);parent.add(g);
 P(g,cyl(w*.6,w*.5,len*.54,7),col,[0,-len*.26,0]);const lo=new THREE.Group();lo.position.y=-len*.5;g.add(lo);P(lo,cyl(w*.5,w*.42,len*.52,7),cyber?0x46404e:col,[0,-len*.25,0]);
 if(cyber){[-.1,-.22,-.34].forEach(yy=>P(lo,cyl(w*.53,w*.5,.016,8),0xffa040,[0,len*yy,0],{e:0xff8a20,line:false}))}
 if(foot)P(lo,box(w*1.05,.06,w*1.7),0x0d0b10,[0,-len*.5,w*.3]);
 if(hand)P(lo,ico(w*.55,0),cyber?0x5a5060:0xd29a78,[0,-len*.52,0]);
 return{g,lo}}
function makeRas(){const root=new THREE.Group(),tilt=new THREE.Group(),yaw=new THREE.Group(),body=new THREE.Group();root.add(tilt);tilt.add(yaw);yaw.add(body);tilt.rotation.x=.42;
 const BL=0x231c27,BL2=0x30263a;
 const L=limb(body,-.055,.47,.44,.075,0x1b1820,{foot:1}),R=limb(body,.055,.47,.44,.075,0x1b1820,{foot:1});
 P(body,box(.19,.08,.12),0x1b1820,[0,.48,0]);P(body,box(.05,.035,.01),0xd8a640,[0,.485,.062],{e:0x402800,line:false});
 const torso=new THREE.Group();torso.position.y=.5;body.add(torso);
 P(torso,cyl(.1,.085,.27,6),0x6e1624,[0,.135,0],{sc:[1,1,.62]});                       // gilet bordeaux
 P(torso,box(.012,.12,.004),0xd8a640,[.03,.14,.058],{rot:[0,0,.5],line:false,e:0x302000}); // catenella
 P(torso,cyl(.15,.105,.12,8),BL,[0,.25,0],{sc:[1,1,.62]});                                // spalle del cappotto
 P(torso,box(.05,.27,.012),BL2,[-.075,.13,.06],{rot:[0,0,-.12]});P(torso,box(.05,.27,.012),BL2,[.075,.13,.06],{rot:[0,0,.12]}); // risvolti
 const coatG=cyl(.12,.2,.48,10,true,.55,Math.PI*2-1.1);coatG.translate(0,-.24,0);              // cappotto lungo, aperto davanti
 const coat=P(torso,coatG,BL,[0,.17,-.004],{sc:[1,1,.78],line:1.03});
 const lin=new THREE.Mesh(coatG,new THREE.MeshToonMaterial({color:0x6a1422,gradientMap:grad,side:THREE.BackSide,transparent:true}));coat.add(lin);
 P(torso,box(.22,.08,.15),BL,[0,.33,-.01],{rot:[-.15,0,0]});                               // colletto alto
 P(torso,box(.06,.012,.01),0x9a1020,[0,.3,.07],{e:0x300008,line:false});
 const armL=limb(torso,.165,.27,.36,.072,BL,{hand:1,cyber:1}),armR=limb(torso,-.165,.27,.36,.072,BL,{hand:1});
 P(torso,cyl(.035,.035,.05,6),0xd29a78,[0,.35,0],{line:false});
 const head=new THREE.Group();head.position.y=.44;torso.add(head);
 head.scale.setScalar(1.18);P(head,ico(.078,1),0xe0a988,[0,.0,0],{sc:[1,1.12,1]});
 P(head,box(.018,.012,.01),0x120a10,[-.03,.01,.074],{line:false});P(head,box(.018,.012,.01),0x120a10,[.03,.01,.074],{line:false});
 P(head,ico(.086,1),0x15121a,[0,.035,-.018],{sc:[1.04,.82,1.04]});P(head,box(.13,.03,.04),0x15121a,[-.01,.06,.062],{rot:[.5,0,-.18]});
 [[-.05,.07,.03,.6],[0,.09,.04,.1],[.05,.075,.02,-.6],[0,.06,-.07,0]].forEach(([x,y,z,r])=>P(head,new THREE.ConeGeometry(.035,.09,4),0x120f16,[x,y,z],{rot:[-.5,0,r]}));
 P(head,box(.03,.05,.07),0xd0182c,[.045,.07,.04],{e:0x500008,rot:[-.4,0,-.3]});           // ciuffo rosso
 const sw=new THREE.Group();sw.position.set(0,.2,-.09);sw.rotation.z=.75;torso.add(sw);    // katana sulla schiena
 P(sw,box(.024,.5,.008),0x2a0c12,[0,.08,0],{e:0x7a0818});P(sw,box(.006,.5,.01),0xff3050,[.012,.08,0],{e:0xff1030,line:false});
 P(sw,box(.08,.016,.03),0x9a1020,[0,-.17,0]);P(sw,box(.02,.12,.02),0x0b080c,[0,-.24,0]);
 root.userData={tilt,yaw,body,L,R,armL,armR,torso,head,coat};return root}
function makeKiri(){const root=new THREE.Group(),tilt=new THREE.Group(),yaw=new THREE.Group(),body=new THREE.Group();root.add(tilt);tilt.add(yaw);yaw.add(body);tilt.rotation.x=.42;
 const C=0x2a3d4c,C2=0x3a5464;
 const L=limb(body,-.045,.46,.43,.062,0x161a22,{foot:1}),R=limb(body,.045,.46,.43,.062,0x161a22,{foot:1});
 P(body,box(.012,.12,.03),0xa0c8d8,[.075,.36,.02],{e:0x103040,line:false});               // kunai sulla coscia
 const torso=new THREE.Group();torso.position.y=.48;body.add(torso);
 P(torso,cyl(.085,.075,.28,6),C2,[0,.14,0],{sc:[1,1,.65]});
 P(torso,cyl(.12,.17,.42,8,true,.9,Math.PI*2-1.8),C,[0,-.03,-.01],{ds:true,line:1.04});   // mantello aperto
 P(torso,cyl(.06,.13,.12,8),0x2a6070,[0,.28,0],{e:0x08202a});                             // sciarpa
 const armL=limb(torso,.13,.26,.33,.058,C,{hand:1}),armR=limb(torso,-.13,.26,.33,.058,C,{hand:1});
 armL.g.rotation.set(-.55,0,-.12);armR.g.rotation.set(-.55,0,.12);armL.lo.rotation.set(-1.5,0,0);armR.lo.rotation.set(-1.5,0,0);armL.lo.rotation.order=armR.lo.rotation.order='YXZ';armL.lo.rotation.y=-.9;armR.lo.rotation.y=.9;  // braccia conserte
 const head=new THREE.Group();head.position.y=.41;torso.add(head);
 P(head,ico(.07,1),0xc89a80,[0,0,0],{sc:[1,1.1,1]});
 P(head,new THREE.ConeGeometry(.1,.2,7,1,true),C,[0,.05,-.01],{ds:true,line:1.05});        // cappuccio
 P(head,ico(.012,0),0x00f0ff,[.028,.012,.066],{e:0x00d0ff,line:false});                    // impianto oculare
 P(head,box(.016,.01,.01),0x120a10,[-.028,.012,.068],{line:false});
 root.userData={tilt,yaw,body,L,R,armL,armR,torso,head};return root}
function shadowBlob(){const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:GT,color:0x000000,transparent:true,opacity:.65,depthTest:false,depthWrite:false}));scene.add(m);return m}

function actor(model,x,y,yaw){const a={m:model,x,y,yaw,tyaw:yaw,ph:0,moving:0,sh:shadowBlob(),meshes:[]};model.traverse(o=>{if(o.isMesh)a.meshes.push(o)});scene.add(model);place(a);return a}
function place(a){const s=sizeAt(a.y);a.s=s;a.m.position.set(a.x,-a.y,-1000+a.y);a.m.scale.setScalar(s);a.sh.position.set(a.x,-a.y-s*.005,-3000);a.sh.scale.set(s*.42,s*.12,1)}
const ras=actor(makeRas(),600,560,Math.PI*.85),kiri=actor(makeKiri(),742,352,Math.PI);
const actors=[ras,kiri];

// ---------------- AREA CALPESTABILE + PERCORSO (A* su griglia) ----------------
function inPoly(x,y,P=WALK){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const[xi,yi]=P[i],[xj,yj]=P[j];if(((yi>y)!=(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c}return c}
const blockers=[{x:742,y:352,rx:46,ry:20}];
const walk=(x,y)=>inPoly(x,y)&&!blockers.some(b=>((x-b.x)/b.rx)**2+((y-b.y)/b.ry)**2<1);
const CELL=8,GW=W/CELL|0,GH=H/CELL|0,grid=new Uint8Array(GW*GH);for(let j=0;j<GH;j++)for(let i=0;i<GW;i++)grid[j*GW+i]=walk(i*CELL+4,j*CELL+4)?1:0;
function nearestWalk(x,y){let best=null,bd=1e18;for(let j=0;j<GH;j++)for(let i=0;i<GW;i++)if(grid[j*GW+i]){const cx=i*CELL+4,cy=j*CELL+4,d=(cx-x)**2+((cy-y)*DEPTH)**2;if(d<bd){bd=d;best=[cx,cy]}}return best}
function clearLine(ax,ay,bx,by){const n=Math.ceil(Math.hypot(bx-ax,by-ay)/4);for(let k=1;k<=n;k++){const t=k/n;if(!walk(ax+(bx-ax)*t,ay+(by-ay)*t))return false}return true}
function findPath(sx,sy,tx,ty){if(!walk(tx,ty)){const n=nearestWalk(tx,ty);if(!n)return[];[tx,ty]=n}
 if(clearLine(sx,sy,tx,ty))return[[tx,ty]];
 const si=Math.min(GW-1,sx/CELL|0)+Math.min(GH-1,sy/CELL|0)*GW;let ti=(tx/CELL|0)+(ty/CELL|0)*GW;if(!grid[ti]){const n=nearestWalk(tx,ty);ti=(n[0]/CELL|0)+(n[1]/CELL|0)*GW}
 const g=new Float32Array(GW*GH).fill(1e9),from=new Int32Array(GW*GH).fill(-1),closed=new Uint8Array(GW*GH),open=[si];g[si]=0;
 const hh=i=>{const x=i%GW,y=i/GW|0,X=ti%GW,Y=ti/GW|0;return Math.hypot(x-X,(y-Y)*DEPTH)};
 const D=[[1,0,1],[-1,0,1],[0,1,DEPTH],[0,-1,DEPTH],[1,1,Math.hypot(1,DEPTH)],[-1,1,Math.hypot(1,DEPTH)],[1,-1,Math.hypot(1,DEPTH)],[-1,-1,Math.hypot(1,DEPTH)]];
 let it=0;while(open.length&&it++<20000){let bi=0,bf=1e18;for(let k=0;k<open.length;k++){const f=g[open[k]]+hh(open[k]);if(f<bf){bf=f;bi=k}}const cur=open.splice(bi,1)[0];if(cur==ti)break;closed[cur]=1;
  const cx=cur%GW,cy=cur/GW|0;for(const[dx,dy,c]of D){const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=GW||ny>=GH)continue;const ni=ny*GW+nx;if(!grid[ni]||closed[ni])continue;const ng=g[cur]+c;if(ng<g[ni]){if(g[ni]>=1e9)open.push(ni);g[ni]=ng;from[ni]=cur}}}
 if(from[ti]<0&&ti!=si)return[];const cells=[];for(let c=ti;c!=-1&&c!=si;c=from[c])cells.unshift([(c%GW)*CELL+4,(c/GW|0)*CELL+4]);cells[cells.length-1]=[tx,ty];
 // "tiro la corda": tengo solo i punti necessari
 const out=[];let px=sx,py=sy,k=0;while(k<cells.length){let far=k;for(let m=cells.length-1;m>k;m--)if(clearLine(px,py,cells[m][0],cells[m][1])){far=m;break}out.push(cells[far]);[px,py]=cells[far];k=far+1}return out}

// ---------------- COSE CON CUI PARLARE ----------------
const RAS='RAS',KIRI='KIRI',N='';
const SPOTS=[
 {id:'kiri',x:680,y:372,r:70,face:[742,352],talk(){const first=!this.done;this.done=1;kiri.tyaw=Math.atan2(ras.x-kiri.x,(ras.y-kiri.y)*DEPTH);return first?[
   [KIRI,'Sei in ritardo.'],[RAS,'Sono vivo. È lo stesso.'],
   [KIRI,'Nel vicolo ci sono i Ratti di Ferro. Due, forse tre. E un drone che gira basso.'],
   [KIRI,'Se esci da quella porta, non tornare indietro a metà strada.'],[RAS,'Non torno mai a metà strada.']]:
   [[KIRI,'La porta è quella. Io resto qui a guardare la strada.']]},end(){setTimeout(()=>kiri.tyaw=Math.PI,1600)}},
 {id:'disco',x:338,y:520,r:85,face:[220,440],talk(){if(AU.mode=='disco'){AU.setMode('ambient');AU.play('vinyl');return[[N,'Ras alza la puntina. Il disco si ferma.']]}
   const l=this.done?[[N,'Ras rimette la puntina sul disco.']]:[[N,'Un grammofono vecchio, con un\'antenna saldata sul fianco.'],[RAS,'Mia madre ne aveva uno uguale. Diceva che la musica vecchia non si spegne da lontano.'],[N,'Ras appoggia la puntina sul disco.']];this.done=1;return l},end(){if(AU.mode!='disco'){AU.setMode('disco');AU.play('vinyl')}}},
 {id:'casse',x:872,y:470,r:80,face:[960,450],talk(){const l=this.done?[[N,'Impianti Neurolink. Ancora nella plastica.']]:[[N,'Casse con il marchio dei Varga. Il sigillo è stato forzato.'],[N,'Dentro ci sono impianti Neurolink nuovi, ancora nella plastica.'],[RAS,'Li vendono come cura. Qualcuno li sta portando quaggiù.'],[RAS,'Domani voglio sapere chi.']];this.done=1;return l}},
 {id:'porta',x:952,y:332,r:70,face:[952,250],talk(){return[[N,'La porta dà sul Vicolo Neon. Fuori piove. Si sente il ronzio di un drone.'],[N,'Uscire?',[['Esci nel vicolo (battaglia)','go'],['Resta nel Covo','stay']]]]},
  choice(v){if(v=='go')exitToBattle()}}];

// ---------------- INPUT ----------------
const stage=$('stage');let SC=1,OX=0,OY=0;
const toStage=e=>[(e.clientX-OX)/SC,(e.clientY-OY)/SC];
const ctrl={path:[],joy:null,keys:{},target:null,pending:null};
let ptr=null;
stage.addEventListener('pointerdown',e=>{if(e.target.closest('button,#dlg,#bubble,#start'))return;if(dlg.open||busy)return;e.preventDefault();const[x,y]=toStage(e);ptr={id:e.pointerId,x0:x,y0:y,t0:performance.now(),joy:false};try{stage.setPointerCapture(e.pointerId)}catch(_){}});
stage.addEventListener('pointermove',e=>{if(!ptr||e.pointerId!=ptr.id)return;const[x,y]=toStage(e),dx=x-ptr.x0,dy=y-ptr.y0;
 if(!ptr.joy&&Math.hypot(dx,dy)>22){ptr.joy=true;ctrl.path=[];ctrl.pending=null;const j=$('joy');j.style.display='block';j.style.left=ptr.x0+'px';j.style.top=ptr.y0+'px'}
 if(ptr.joy){const L=Math.hypot(dx,dy),m=Math.min(L,80),nx=dx/(L||1),ny=dy/(L||1);$('knob').style.transform=`translate(${nx*m}px,${ny*m}px)`;ctrl.joy=L>12?[nx*Math.min(1,L/60),ny*Math.min(1,L/60)]:null}});
const endPtr=e=>{if(!ptr||e.pointerId!=ptr.id)return;const p=ptr;ptr=null;$('joy').style.display='none';$('knob').style.transform='';ctrl.joy=null;
 if(!p.joy&&e.type=='pointerup')tapAt(p.x0,p.y0)};
stage.addEventListener('pointerup',endPtr);stage.addEventListener('pointercancel',endPtr);
function tapAt(x,y){hideHint();
 // toccare un oggetto o Kiri: Ras ci va e interagisce
 const hit=SPOTS.find(s=>Math.hypot(x-s.face[0],(y-s.face[1]-(s.id=='kiri'?-80:0)))<(s.id=='porta'?110:85)||Math.hypot(x-s.x,(y-s.y)*DEPTH)<35);
 const tx=hit?hit.x:x,ty=hit?hit.y:y;ctrl.path=findPath(ras.x,ras.y,tx,ty);ctrl.pending=hit||null;
 if(hit&&nearSpot()==hit){ctrl.path=[];ctrl.pending=null;interact(hit)}
 if(ctrl.path.length){marker(ctrl.path[ctrl.path.length-1])}}
addEventListener('keydown',e=>{const k=e.key.toLowerCase();ctrl.keys[k]=1;if(!started){begin();return}
 if(k==' '||k=='enter'||k=='e'){e.preventDefault();if(dlg.open)dlg.advance();else{const s=nearSpot();s&&interact(s)}}
 if(dlg.open&&(k=='arrowup'||k=='arrowdown'||k=='w'||k=='s'))dlg.move(k=='arrowup'||k=='w'?-1:1)});
addEventListener('keyup',e=>{ctrl.keys[e.key.toLowerCase()]=0});
$('bubble').addEventListener('pointerdown',e=>{e.stopPropagation();const s=nearSpot();s&&interact(s)});
$('bAct').addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();if(dlg.open)dlg.advance();else{const s=nearSpot();s&&interact(s)}});
$('bMenu').addEventListener('click',()=>leave('../?v='+V));
const muteB=$('bMute');muteB.textContent=AU.muted?'🔇':'🔊';muteB.addEventListener('click',()=>{AU.init();AU.setMute(!AU.muted);muteB.textContent=AU.muted?'🔇':'🔊'});
// segnalino dove si tocca
const mk=new THREE.Mesh(new THREE.RingGeometry(.7,1,24),new THREE.MeshBasicMaterial({color:0x00f0ff,transparent:true,opacity:0,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending}));mk.renderOrder=-700;scene.add(mk);let mkT=0;
function marker([x,y]){mk.position.set(x,-y,-3000);mkT=1}
let hinted=false;function hideHint(){if(!hinted){hinted=true;setTimeout(()=>$('hint').style.opacity=0,2500)}}

// ---------------- DIALOGHI ----------------
let busy=false;
const dlg=(()=>{const box=$('dlg'),nm=$('dname'),tx=$('dtext'),nx=$('dnext'),ch=$('dchoices');let q=[],cur=null,i=0,full='',timer=null,spot=null,sel=0,btns=[];
 const api={open:false,start(s,lines){spot=s;q=lines.slice();api.open=true;box.classList.add('on');$('bubble').classList.remove('on');AU.play('open');next()},advance,move(d){if(!btns.length)return;sel=(sel+d+btns.length)%btns.length;btns.forEach((b,k)=>b.classList.toggle('sel',k==sel));AU.play('blip')}};
 function next(){clearInterval(timer);ch.innerHTML='';btns=[];if(!q.length){close();return}cur=q.shift();nm.textContent=cur[0];full=cur[1];i=0;tx.textContent='';nx.classList.remove('on');
  timer=setInterval(()=>{i+=1;tx.textContent=full.slice(0,i);if(i%2==0)AU.play('blip');if(i>=full.length)done()},28)}
 function done(){clearInterval(timer);tx.textContent=full;i=full.length;if(cur[2]){sel=0;btns=cur[2].map(([l,v],k)=>{const b=document.createElement('button');b.textContent=l;if(k==0)b.classList.add('sel');b.addEventListener('pointerdown',e=>{e.stopPropagation();pick(v)});ch.appendChild(b);return b})}else nx.classList.add('on')}
 function pick(v){const s=spot;close();s&&s.choice&&s.choice(v)}
 function advance(){if(i<full.length){done();return}if(btns.length){pick(cur[2][sel][1]);return}AU.play('blip');next()}
 function close(){clearInterval(timer);box.classList.remove('on');api.open=false;const s=spot;spot=null;s&&s.end&&s.end()}
 box.addEventListener('pointerdown',e=>{e.stopPropagation();if(!btns.length)advance()});return api})();
function nearSpot(){let best=null,bd=1e9;for(const s of SPOTS){const d=Math.hypot(ras.x-s.x,(ras.y-s.y)*DEPTH);if(d<s.r&&d<bd){bd=d;best=s}}return best}
function interact(s){if(dlg.open||busy)return;ctrl.path=[];ras.tyaw=Math.atan2(s.face[0]-ras.x,(s.face[1]-ras.y)*DEPTH);AU.play('bang');dlg.start(s,s.talk())}

// ---------------- USCITA: dissolvenza verso la battaglia ----------------
function leave(url){if(busy)return;busy=true;AU.fadeOut();$('fade').classList.remove('out');setTimeout(()=>location.href=url,950)}
function exitToBattle(){busy=true;ctrl.path=[];AU.play('door');const door=[952,318];
 // Ras entra nella porta, poi tutto sfuma
 ctrl.path=[[door[0],door[1]+4]];busy=false;ctrl.lock=true;setTimeout(()=>{busy=false;leave('../?lotta=1&v='+V)},700)}

// ---------------- CICLO PRINCIPALE ----------------
let last=performance.now(),started=false,isReady=false,t=0;
function step(dt){t+=dt;
 // movimento
 let mvx=0,mvz=0;const K=ctrl.keys;
 if(!dlg.open&&!busy&&!ctrl.lock){const kx=(K['arrowright']||K['d']?1:0)-(K['arrowleft']||K['a']?1:0),kz=(K['arrowdown']||K['s']?1:0)-(K['arrowup']||K['w']?1:0);
  if(kx||kz){ctrl.path=[];ctrl.pending=null;const L=Math.hypot(kx,kz);mvx=kx/L;mvz=kz/L}
  else if(ctrl.joy){mvx=ctrl.joy[0];mvz=ctrl.joy[1]}}
 const sp=SPEED*ras.s*dt;let moving=false;
 if(mvx||mvz){const nx=ras.x+mvx*sp,ny=ras.y+mvz*sp/DEPTH;
  if(walk(nx,ny)){ras.x=nx;ras.y=ny;moving=true}else if(walk(nx,ras.y)){ras.x=nx;moving=true}else if(walk(ras.x,ny)){ras.y=ny;moving=true}
  if(moving)ras.tyaw=Math.atan2(mvx,mvz)}
 else if(ctrl.path.length&&!dlg.open){const[tx,ty]=ctrl.path[0],dx=tx-ras.x,dz=(ty-ras.y)*DEPTH,L=Math.hypot(dx,dz);
  if(L<=sp){ras.x=tx;ras.y=ty;ctrl.path.shift();if(!ctrl.path.length&&ctrl.pending){const s=ctrl.pending;ctrl.pending=null;if(nearSpot()==s)interact(s)}}
  else{ras.x+=dx/L*sp;ras.y+=dz/L*sp/DEPTH}moving=true;ras.tyaw=Math.atan2(dx,dz)}
 if(ctrl.lock){ras.tyaw=Math.PI}
 // animazione
 for(const a of actors){let d=a.tyaw-a.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));a.yaw+=d*Math.min(1,dt*12);const u=a.m.userData;u.yaw.rotation.y=a.yaw}
 const u=ras.m.userData,wasPh=ras.ph;ras.moving+=((moving?1:0)-ras.moving)*Math.min(1,dt*10);ras.ph+=dt*(moving?9.5:0);
 const sw=Math.sin(ras.ph)*ras.moving;u.L.g.rotation.x=sw*.62;u.R.g.rotation.x=-sw*.62;u.L.lo.rotation.x=Math.max(0,-Math.cos(ras.ph))*.6*ras.moving;u.R.lo.rotation.x=Math.max(0,Math.cos(ras.ph))*.6*ras.moving;
 u.armL.g.rotation.x=-sw*.5;u.armR.g.rotation.x=sw*.5;u.armL.lo.rotation.x=-.35*ras.moving-.1;u.armR.lo.rotation.x=-.35*ras.moving-.1;u.armL.g.rotation.z=.08;u.armR.g.rotation.z=-.08;
 u.body.position.y=Math.abs(Math.cos(ras.ph))*.018*ras.moving;u.torso.rotation.x=.09*ras.moving;u.coat.rotation.x=-.12*ras.moving+Math.sin(ras.ph*2)*.03*ras.moving;
 u.torso.scale.y=1+Math.sin(t*2.2)*.008*(1-ras.moving);u.head.rotation.y=Math.sin(t*.5)*.15*(1-ras.moving);
 if(moving&&Math.floor(wasPh/Math.PI)!=Math.floor(ras.ph/Math.PI))AU.play('step');
 const k=kiri.m.userData;k.torso.scale.y=1+Math.sin(t*1.9+1)*.01;k.head.rotation.y=Math.sin(t*.4)*.12;
 actors.forEach(place);
 // ordinamento in profondità: personaggi e livelli in primo piano ordinati per "piedi"
 const items=[...actors.map(a=>({y:a.y,a})),...OCC.map(o=>({y:o.base,o}))].sort((p,q)=>p.y-q.y);
 items.forEach((it,i)=>{const r=i*10;if(it.a){it.a.sh.renderOrder=r-1;it.a.meshes.forEach(m=>m.renderOrder=r)}else it.o.mesh.renderOrder=r});
 // luci che seguono il quadro: più rosa vicino alla porta, più ambra vicino al bancone
 const doorP=Math.max(0,1-Math.hypot(ras.x-955,(ras.y-330)*DEPTH)/420),barP=Math.max(0,1-Math.hypot(ras.x-430,(ras.y-420)*DEPTH)/520);
 pinkL.intensity=.35+doorP*2.4+Math.sin(t*31)*.04;keyL.intensity=1.1+barP*1.2;
 glows.forEach(g=>{const f=g.k=='neon'?(Math.sin(t*23+g.ph)>.97?.35:1)*(.92+Math.sin(t*3+g.ph)*.08):g.k=='lamp'?.9+Math.sin(t*1.3+g.ph)*.1:1;g.m.material.opacity=g.a*f});
 rain.forEach(r=>{r.position.y-=r.userData.v*dt;r.position.x-=r.userData.v*dt*.12;if(r.position.y<-208){r.position.y=-90;r.position.x=650+Math.random()*135}});
 const P=dustG.attributes.position.array;for(let i=0;i<dustN;i++){P[i*3]+=Math.sin(t*.3+i)*6*dt;P[i*3+1]+=Math.cos(t*.25+i*1.7)*5*dt}dustG.attributes.position.needsUpdate=true;
 if(mkT>0){mkT-=dt*1.6;mk.material.opacity=Math.max(0,mkT)*.9;const s=(1.6-mkT)*26;mk.scale.set(s,s*.4,1)}
 // '!' sopra la testa
 const s=!dlg.open&&!busy&&!ctrl.lock&&nearSpot();const b=$('bubble');
 if(s){b.classList.add('on');b.style.left=ras.x+'px';b.style.top=(ras.y-ras.s*1.12)+'px'}else b.classList.remove('on');
 $('bAct').classList.toggle('on',!!s&&isTouch);
 window.__st.near=s?s.id:null;window.__st.ras={x:Math.round(ras.x),y:Math.round(ras.y)};window.__st.dialog=dlg.open}
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(isReady)step(dt);renderer.render(scene,cam);requestAnimationFrame(frame)}
const isTouch=('ontouchstart' in window)||navigator.maxTouchPoints>0;
window.__st={state:'loading',path:()=>ctrl.path,tap:(x,y)=>tapAt(x,y),toScreen:(x,y)=>[OX+x*SC,OY+y*SC],spots:SPOTS.map(s=>({id:s.id,x:s.x,y:s.y})),warp:(x,y,yaw)=>{ras.x=x;ras.y=y;ctrl.path=[];if(yaw!=null)ras.tyaw=ras.yaw=yaw}};
function ready(){isReady=true;$('st3').textContent=isTouch?'▶ TOCCA PER ENTRARE':'▶ CLICCA PER ENTRARE';window.__st.state='start'}
function begin(){if(started||!isReady)return;started=true;AU.init();AU.setMode('ambient');$('start').classList.add('gone');$('fade').classList.add('out');
 setTimeout(()=>$('loc').classList.add('on'),600);setTimeout(()=>$('loc').classList.remove('on'),4200);window.__st.state='play'}
$('start').addEventListener('pointerup',e=>{e.stopPropagation();begin()});
requestAnimationFrame(frame);

// ---------------- ADATTAMENTO SCHERMO + ROTAZIONE (come il round 2) ----------------
(()=>{const body=document.body,wrap=$('wrap');
 const fit=()=>{const vv=window.visualViewport,vw=vv?vv.width:innerWidth,vh=vv?vv.height:innerHeight;
  body.classList.toggle('portrait',vh>vw&&(isTouch||vw<900));
  const r=wrap.getBoundingClientRect(),w=r.width||vw,h=r.height||vh;SC=Math.min(w/W,h/H);const ox=(w-W*SC)/2,oy=(h-H*SC)/2;
  stage.style.transform=`translate(${ox}px,${oy}px) scale(${SC})`;OX=r.left+ox;OY=r.top+oy;
  const pr=Math.max(.75,Math.min(2.5,SC*(window.devicePixelRatio||1)));if(Math.abs(renderer.getPixelRatio()-pr)>.01){renderer.setPixelRatio(pr);renderer.setSize(W,H,false)}
  window.scrollTo(0,0)};
 let tm=[];const sched=()=>{tm.forEach(clearTimeout);fit();tm=[50,150,350,700,1200].map(ms=>setTimeout(fit,ms))};
 addEventListener('resize',sched);addEventListener('orientationchange',sched);addEventListener('pageshow',e=>{sched();if(e.persisted){busy=false;$('fade').classList.add('out')}});
 if(window.visualViewport){visualViewport.addEventListener('resize',sched);visualViewport.addEventListener('scroll',()=>window.scrollTo(0,0))}
 if(screen.orientation&&screen.orientation.addEventListener)screen.orientation.addEventListener('change',sched);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)sched()});
 $('rotok').addEventListener('click',()=>{body.classList.add('ok');sched()});sched();window.__fit=sched})();
