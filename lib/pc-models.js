// PUNK CITY – personaggi 3D low-poly fatti a mano (forme semplici + cel-shading + contorno).
// Altezza ~1 unità, piedi a y=0, guardano verso +z. Ogni modello ha i suoi materiali (per i lampi quando viene colpito).
import * as THREE from './three.module.min.js?v=6';
export {THREE};
const GRAD=(()=>{const d=new Uint8Array([60,60,60,255,140,140,140,255,215,215,215,255,255,255,255,255]);const t=new THREE.DataTexture(d,4,1,THREE.RGBAFormat);t.minFilter=t.magFilter=THREE.NearestFilter;t.needsUpdate=true;return t})();
export const PI=Math.PI;
function kit(){const mats=[],cache={};
 const OUT=new THREE.MeshBasicMaterial({color:0x07030b,side:THREE.BackSide,transparent:true});mats.push(OUT);OUT.userData.outline=1;
 const M=(c,o={})=>{const k=[c,o.e||0,o.side||0,o.flat?1:0].join('_');if(cache[k])return cache[k];
  const m=new THREE.MeshToonMaterial({color:c,gradientMap:GRAD,emissive:o.e||0x000000,transparent:true,side:o.side||THREE.FrontSide});m.userData.e0=new THREE.Color(o.e||0);mats.push(m);return cache[k]=m};
 const P=(par,geo,col,pos=[0,0,0],o={})=>{const m=new THREE.Mesh(geo,col.isMaterial?col:M(col,o));m.position.set(...pos);if(o.rot)m.rotation.set(...o.rot);if(o.sc)m.scale.set(...o.sc);par.add(m);
  if(o.line!==false){const l=new THREE.Mesh(geo,OUT);l.scale.setScalar(o.line||1.08);m.add(l)}return m};
 const G=(par,pos=[0,0,0])=>{const g=new THREE.Group();g.position.set(...pos);par.add(g);return g};
 return{mats,M,P,G,OUT}}
const sph=(r,w=14,h=10)=>new THREE.SphereGeometry(r,w,h),cap=(r,l,s=8)=>new THREE.CapsuleGeometry(r,Math.max(.001,l),3,s),box=(w,h,d)=>new THREE.BoxGeometry(w,h,d),
 cyl=(a,b,h,s=10)=>new THREE.CylinderGeometry(a,b,h,s),cone=(r,h,s=6)=>new THREE.ConeGeometry(r,h,s),
 lathe=(pts,s=14,p0=0,pl=PI*2)=>new THREE.LatheGeometry(pts.map(([x,y])=>new THREE.Vector2(x,y)),s,p0,pl);
// arto a due pezzi con perno in alto (spalla/anca) e gomito/ginocchio
function limb(K,par,pos,len,r,col,o={}){const g=K.G(par,pos);K.P(g,cap(r,len*.5-r),col,[0,-len*.25,0],{line:1.12});const lo=K.G(g,[0,-len*.5,0]);
 K.P(lo,cap(r*.9,len*.5-r),o.lowCol??col,[0,-len*.25,0],{line:1.12});
 if(o.rings)o.rings.forEach(y=>K.P(lo,cyl(r*.98,r*.98,.014,10),0xffa040,[0,-len*y,0],{e:0xff8a20,line:false}));
 let end=K.G(lo,[0,-len*.5,0]);
 if(o.foot)K.P(end,box(r*2.1,.055,r*3.4),o.footCol??0x0d0b10,[0,-.005,r*.7],{line:1.1});
 if(o.hand)K.P(end,sph(r*1.05,8,6),o.handCol??0xe0a988,[0,-r*.2,0],{line:1.12});
 return{g,lo,end}}
// testa con viso semplice: occhi (bianco + iride), sopracciglia, naso, bocca, orecchie
function face(K,head,{r=.075,skin=0xe6ae8c,iris=0x3a1810,brow=0x16101a,stern=.25,eyeGlow=null,mouth=0x8a4038}={}){
 K.P(head,sph(r,16,12),skin,[0,0,0],{sc:[.94,1.08,1],line:1.05});
 const eyes=[];[-1,1].forEach(s=>{const e=K.G(head,[s*r*.38,r*.04,r*.86]);K.P(e,sph(r*.2,10,8),0xffffff,[0,0,0],{sc:[1,.78,.4],line:false});
  const glow=eyeGlow&&s==1;K.P(e,sph(r*.12,8,6),glow?eyeGlow:iris,[0,-r*.01,r*.06],{sc:[1,1,.5],line:false,e:glow?eyeGlow:0});
  K.P(e,sph(r*.04,6,4),0xffffff,[r*.04,r*.04,r*.11],{line:false,e:0x999999});eyes.push(e);
  K.P(head,box(r*.42,r*.075,r*.08),brow,[s*r*.4,r*.3,r*.88],{rot:[0,0,-s*stern],line:false});
  K.P(head,sph(r*.2,8,6),skin,[s*r*.93,0,0],{sc:[.5,1,.8],line:1.1})});
 K.P(head,cone(r*.1,r*.25,5),skin,[0,-r*.18,r*1.0],{rot:[PI/2+.3,0,0],line:false});
 K.P(head,box(r*.38,r*.045,r*.05),mouth,[0,-r*.48,r*.88],{line:false});
 return eyes}

// ---------------- RAS ----------------
export function makeRas({sword='back'}={}){const K=kit(),root=new THREE.Group(),body=K.G(root);
 const BL=0x241d29,LIN=0x7a1424,PANTS=0x1c1922;
 const L=limb(K,body,[-.055,.5,0],.48,.036,PANTS,{foot:1}),R=limb(K,body,[.055,.5,0],.48,.036,PANTS,{foot:1});
 K.P(body,cyl(.1,.095,.07,12),PANTS,[0,.5,0],{sc:[1,1,.68]});
 const torso=K.G(body,[0,.52,0]);
 K.P(torso,lathe([[.001,-.02],[.085,-.02],[.098,.08],[.115,.2],[.118,.25],[.07,.31],[.001,.32]],12),0x7a1828,[0,0,0],{sc:[1,1,.66],line:1.04}); // gilet bordeaux
 K.P(torso,cyl(.1,.1,.03,12),0x0d0b10,[0,.005,0],{sc:[1,1,.68],line:false});K.P(torso,box(.04,.028,.01),0xe0b048,[0,.005,.07],{e:0x3a2600,line:false}); // cintura
 const chain=new THREE.Mesh(new THREE.TorusGeometry(.04,.003,4,10,PI),K.M(0xe0b048,{e:0x302000}));chain.position.set(.03,.12,.073);chain.rotation.set(0,0,PI+.3);torso.add(chain);
 const coat=K.G(torso,[0,0,0]);const cpts=[[.125,.28],[.122,.2],[.108,.06],[.122,-.08],[.155,-.22],[.19,-.34]];
 K.P(coat,lathe(cpts,16,.55,PI*2-1.1),BL,[0,0,0],{sc:[1,1,.78],line:1.03});K.P(coat,lathe(cpts,16,.55,PI*2-1.1),K.M(LIN,{side:THREE.BackSide}),[0,0,0],{sc:[.985,1,.765],line:false});
 [-1,1].forEach(s=>{K.P(torso,box(.045,.26,.012),0x31263a,[s*.07,.15,.075],{rot:[-.12,0,s*.14],line:1.1});K.P(torso,sph(.062,10,8),BL,[s*.13,.265,0],{sc:[1.1,.8,1],line:1.06})}); // risvolti + spalle
 K.P(torso,lathe([[.075,.28],[.088,.36],[.095,.4]],14,.9,PI*2-1.8),BL,[0,0,-.005],{sc:[1,1,.85],line:1.04});                  // colletto alto
 K.P(torso,cyl(.032,.034,.06,10),0xe0a988,[0,.33,0],{line:false});
 const armL=limb(K,torso,[.15,.27,0],.38,.034,BL,{hand:1,lowCol:0x4a4452,rings:[.18,.28,.38],handCol:0x5a5462}),armR=limb(K,torso,[-.15,.27,0],.38,.034,BL,{hand:1});
 const head=K.G(torso,[0,.44,.0]);head.scale.setScalar(1.12);
 const eyes=face(K,head,{iris:0x5a1a14,stern:.32});
 const hair=0x17131c;K.P(head,new THREE.SphereGeometry(.084,14,10,0,PI*2,0,PI*.5),hair,[0,.022,-.012],{rot:[-.45,0,0],sc:[1,1,1.04],line:1.05});
 [[-.06,.06,-.02,.7,0],[-.025,.085,.0,.25,0],[.02,.088,0,-.2,0],[.06,.06,-.01,-.7,0],[0,.06,-.07,0,-.6],[-.045,.03,-.07,.4,-.8],[.045,.03,-.07,-.4,-.8]].forEach(([x,y,z,rz,rx])=>K.P(head,cone(.03,.09,5),hair,[x,y,z],{rot:[rx-.25,0,rz],line:1.08}));
 [[-.045,.07,.055,.6],[-.012,.078,.064,.2],[.025,.076,.06,-.3]].forEach(([x,y,z,rz])=>K.P(head,cone(.02,.06,4),hair,[x,y,z],{rot:[PI-.9,0,rz],line:1.1})); // frangia
 K.P(head,cone(.022,.085,4),0xe01a32,[.05,.065,.045],{rot:[-.5,0,-.6],e:0x600010,line:1.1});                                  // ciuffo rosso
 // katana
 const sw=new THREE.Group();const tip=new THREE.Object3D(),base=new THREE.Object3D();
 K.P(sw,box(.022,.6,.007),0x30101a,[0,.38,0],{e:0x5a0614,line:1.05});K.P(sw,box(.005,.6,.009),0xff4060,[.011,.38,0],{e:0xff1838,line:false});
 K.P(sw,cyl(.03,.03,.012,10),0xa01828,[0,.075,0],{rot:[0,0,0],line:false});K.P(sw,cyl(.012,.012,.14,6),0x0b080c,[0,0,0]);
 tip.position.y=.68;base.position.y=.1;sw.add(tip,base);
 const putSword=m=>{if(m=='hand'){sw.scale.setScalar(1);armR.end.add(sw);sw.position.set(0,-.02,.01);sw.rotation.set(PI/2,0,0)}else{torso.add(sw);sw.position.set(.1,.33,-.1);sw.rotation.set(0,0,2.5);sw.scale.setScalar(.85)}};putSword(sword);
 root.userData={K,body,torso,head,L,R,armL,armR,coat,sword:sw,tip,swBase:base,eyes,putSword,h:1};return root}

// ---------------- KIRI ----------------
export function makeKiri(){const K=kit(),root=new THREE.Group(),body=K.G(root);
 const SUIT=0x1c2532,CL=0x2c4458,TEAL=0x2a7a8a;
 const L=limb(K,body,[-.045,.47,0],.45,.03,SUIT,{foot:1,footCol:0x10141a}),R=limb(K,body,[.045,.47,0],.45,.03,SUIT,{foot:1,footCol:0x10141a});
 K.P(body,cyl(.085,.08,.07,12),SUIT,[0,.47,0],{sc:[1,1,.7]});K.P(body,box(.035,.05,.03),0x3a2a20,[.085,.44,.02],{line:1.1});
 const torso=K.G(body,[0,.49,0]);
 K.P(torso,lathe([[.001,-.02],[.075,-.02],[.08,.08],[.098,.19],[.1,.24],[.06,.3],[.001,.3]],12),SUIT,[0,0,0],{sc:[1,1,.68],line:1.04});
 K.P(torso,box(.012,.2,.004),0x40e0ff,[.035,.14,.07],{e:0x00a0c0,line:false,rot:[0,0,.2]});                                 // linea luminosa della tuta
 const coat=K.G(torso,[0,0,0]);const cp=[[.11,.27],[.105,.15],[.1,.04],[.12,-.06],[.14,-.14]];
 K.P(coat,lathe(cp,14,.9,PI*2-1.8),CL,[0,0,-.005],{sc:[1,1,.8],line:1.03});K.P(coat,lathe(cp,14,.9,PI*2-1.8),K.M(0x16303a,{side:THREE.BackSide}),[0,0,-.005],{sc:[.98,1,.78],line:false});
 K.P(torso,new THREE.TorusGeometry(.06,.028,6,12),TEAL,[0,.3,0],{rot:[PI/2,0,0],sc:[1,.85,1],line:1.06});                    // sciarpa
 K.P(torso,box(.05,.16,.02),TEAL,[-.04,.2,-.07],{rot:[.3,0,.2],line:1.08});
 const armL=limb(K,torso,[.125,.25,0],.34,.028,CL,{hand:1,lowCol:SUIT}),armR=limb(K,torso,[-.125,.25,0],.34,.028,CL,{hand:1,lowCol:SUIT});
 const kunai=new THREE.Group();K.P(kunai,cone(.012,.09,4),0xb0d8e8,[0,.06,0],{e:0x206070,line:false});K.P(kunai,cyl(.007,.007,.05,5),0x111111,[0,0,0],{line:false});armR.end.add(kunai);kunai.rotation.x=PI/2;kunai.position.z=.01;
 const head=K.G(torso,[0,.41,0]);head.scale.setScalar(1.1);
 const eyes=face(K,head,{r:.07,skin:0xd8a68c,iris:0x1a2a30,stern:.12,eyeGlow:0x30f0ff,mouth:0x8a4a48});
 K.P(head,new THREE.SphereGeometry(.076,14,10,0,PI*2,0,PI*.5),0x14262e,[0,.012,-.006],{rot:[-.5,0,0],line:1.05});
 [[-.04,.045,.062,.4],[0,.05,.07,.05],[.035,.045,.064,-.35]].forEach(([x,y,z,rz])=>K.P(head,cone(.02,.06,4),0x14262e,[x,y,z],{rot:[PI-.6,0,rz],line:1.1}));
 K.P(head,new THREE.SphereGeometry(.098,14,10,PI/2+PI*.3,PI*2-PI*.6,0,PI*.8),CL,[0,.0,-.005],{line:1.04,side:THREE.DoubleSide}); // cappuccio aperto davanti
 K.P(head,cone(.05,.1,8),CL,[0,.09,-.04],{rot:[-.6,0,0],line:1.06});
 root.userData={K,body,torso,head,L,R,armL,armR,coat,kunai,eyes,h:.93};return root}

// ---------------- RATTO DI FERRO ----------------
export function makeRatto(){const K=kit(),root=new THREE.Group(),body=K.G(root);
 const FUR=0x6e6a76,HOOD=0x43285a,PANTS=0x23202a,MET=0x55525c;
 const L=limb(K,body,[-.07,.44,0],.42,.04,PANTS,{foot:1,footCol:0x141216}),R=limb(K,body,[.07,.44,0],.42,.04,PANTS,{foot:1,footCol:0x141216});
 L.g.rotation.x=-.25;L.lo.rotation.x=.45;R.g.rotation.x=.1;R.lo.rotation.x=.3;
 const torso=K.G(body,[0,.45,0]);torso.rotation.x=.38;
 K.P(torso,lathe([[.001,-.03],[.105,-.03],[.12,.08],[.14,.2],[.13,.27],[.07,.32],[.001,.33]],12),HOOD,[0,0,0],{sc:[1,1,.8],line:1.04});
 [[.05,.1,.1],[-.06,.18,.1],[.0,.05,-.11]].forEach(([x,y,z])=>K.P(torso,box(.04,.04,.01),0x6aa040,[x,y,z],{rot:[0,0,.4],e:0x203010,line:false})); // toppe verdi
 K.P(torso,sph(.07,10,8),MET,[-.13,.27,0],{sc:[1.2,.8,1.1],line:1.06,flat:true});[0,1,2].forEach(i=>K.P(torso,cone(.016,.06,5),0xa0a0aa,[-.15+i*.02,.32,-.02+i*.02],{rot:[0,0,.5-i*.3],line:false}));
 K.P(torso,new THREE.SphereGeometry(.1,12,8,0,PI*2,0,PI*.5),HOOD,[0,.29,-.05],{rot:[-.9,0,0],line:1.04,side:THREE.DoubleSide});   // cappuccio abbassato
 const armL=limb(K,torso,[.15,.25,0],.38,.038,HOOD,{hand:1,handCol:0x2a2830,lowCol:0x2a2830}),armR=limb(K,torso,[-.15,.25,0],.38,.038,HOOD,{hand:1,handCol:0x2a2830});
 armL.g.rotation.set(-.5,0,.25);armL.lo.rotation.x=-.9;armR.g.rotation.set(-.3,0,-.2);armR.lo.rotation.x=-.8;
 const club=new THREE.Group();K.P(club,cyl(.022,.028,.5,8),0x7a3e22,[0,.2,0],{line:1.08});[.1,.25,.38].forEach(y=>K.P(club,cyl(.03,.03,.02,8),0x40362e,[0,y,0],{line:false}));armL.end.add(club);club.rotation.x=PI/2+.3;
 const head=K.G(torso,[0,.36,.05]);head.rotation.x=-.3;
 K.P(head,sph(.085,14,10),FUR,[0,0,0],{sc:[.95,.9,1.05],line:1.05});
 K.P(head,cone(.06,.15,10),FUR,[0,-.02,.1],{rot:[PI/2,0,0],line:1.06});K.P(head,sph(.018,8,6),0xd07080,[0,-.02,.18],{line:false});
 const eyes=[];[-1,1].forEach(s=>{const e=K.G(head,[s*.04,.025,.065]);K.P(e,sph(.016,8,6),0xffe040,[0,0,0],{e:0xb09000,sc:[1,.7,.6],line:false});K.P(e,sph(.007,6,4),0x000000,[0,0,.009],{line:false});eyes.push(e);
  K.P(head,box(.04,.008,.01),0x111111,[s*.04,.05,.07],{rot:[0,0,s*.45],line:false});
  const ear=K.G(head,[s*.065,.07,-.01]);K.P(ear,sph(.045,10,8),FUR,[0,.02,0],{sc:[1,1,.3],line:1.08});K.P(ear,sph(.03,8,6),0xc07a88,[0,.02,.012],{sc:[1,1,.2],line:false});ear.rotation.z=-s*.4;
  K.P(head,cone(.007,.025,4),0xf0f0e0,[s*.015,-.06,.15],{rot:[PI,0,0],line:false})});
 K.P(head,cyl(.012,.012,.02,6),0xb0b0b8,[.07,.0,.02],{rot:[0,0,PI/2],line:false});               // piercing
 // coda di metallo
 const pts=[[0,.42,-.08],[0,.3,-.25],[.05,.12,-.38],[.15,.05,-.5],[.25,.12,-.58]].map(p=>new THREE.Vector3(...p));
 const tail=K.P(body,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),16,.014,5),0x8a8090,[0,0,0],{line:1.15});
 root.userData={K,body,torso,head,L,R,armL,armR,club,tail,eyes,h:1};return root}

// ---------------- DRONE VESPA ----------------
export function makeDrone(){const K=kit(),root=new THREE.Group(),body=K.G(root);
 const Y=0xf0c020,B=0x18161c;
 const core=K.G(body,[0,0,0]);
 for(let i=0;i<5;i++)K.P(core,cyl(.12-Math.abs(i-1.5)*.012,.12-Math.abs(i-1.5)*.012,.07,12),i%2?Y:B,[0,0,-.12+i*.06],{rot:[PI/2,0,0],line:i==0||i==4?1.04:false,flat:false});
 K.P(core,sph(.12,14,10),B,[0,0,.17],{sc:[1,.9,.8],line:1.04});
 const eye=K.P(core,sph(.05,12,8),0xff2030,[0,0,.25],{e:0xff1020,line:false});
 K.P(core,cone(.07,.18,10),Y,[0,0,-.27],{rot:[-PI/2,0,0],line:1.05});K.P(core,cone(.02,.1,6),B,[0,0,-.4],{rot:[-PI/2,0,0],line:false});  // pungiglione
 const gun=K.G(core,[0,-.13,.05]);K.P(gun,cyl(.035,.035,.2,10),B,[0,0,.05],{rot:[PI/2,0,0]});K.P(gun,cyl(.024,.024,.01,10),0xff3040,[0,0,.155],{rot:[PI/2,0,0],e:0xff1020,line:false});
 const muzzle=new THREE.Object3D();muzzle.position.set(0,0,.17);gun.add(muzzle);
 const rotors=[];[[1,1],[-1,1],[1,-1],[-1,-1]].forEach(([sx,sz])=>{const arm=K.P(core,box(.25,.025,.025),B,[sx*.15,.08,sz*.1],{rot:[0,-sx*sz*.6,0],line:1.1});
  const hub=K.G(core,[sx*.26,.11,sz*.18]);K.P(hub,cyl(.03,.03,.04,8),Y,[0,0,0]);const disc=new THREE.Mesh(new THREE.CircleGeometry(.13,20),new THREE.MeshBasicMaterial({color:0xfff080,transparent:true,opacity:.3,side:THREE.DoubleSide,depthWrite:false}));
  disc.rotation.x=-PI/2;disc.position.y=.03;hub.add(disc);K.mats.push(disc.material);const bl=K.P(hub,box(.24,.004,.03),0x333333,[0,.03,0],{line:false});rotors.push(bl)});
 root.userData={K,body,core,eye,gun,muzzle,rotors,h:.5,flying:1};return root}

// lampo bianco/colore su tutto il modello (quando viene colpito)
export function flash(model,col=0xffffff,amt=1){model.userData.K.mats.forEach(m=>{if(m.userData.outline||!m.emissive)return;m.emissive.copy(m.userData.e0).lerp(new THREE.Color(col),amt)})}
export function setOpacity(model,a){model.userData.K.mats.forEach(m=>{m.opacity=a*(m.userData.op0??(m.userData.op0=m.opacity))})}
