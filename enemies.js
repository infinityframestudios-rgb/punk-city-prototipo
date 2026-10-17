// Arte procedurale dei nemici (Canvas 2D). Se in assets/ c'è un PNG con lo stesso nome, viene usato quello.
'use strict';
const EART={
 OUT:'#07020d',
 poly(x,pts,fill,lw=4,stroke){x.beginPath();x.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)x.lineTo(pts[i][0],pts[i][1]);x.closePath();x.fillStyle=fill;x.fill();if(lw){x.lineWidth=lw;x.strokeStyle=stroke||EART.OUT;x.stroke()}},
 ell(x,cx,cy,rx,ry,fill,lw=4,rot=0){x.beginPath();x.ellipse(cx,cy,rx,ry,rot,0,Math.PI*2);x.fillStyle=fill;x.fill();if(lw){x.lineWidth=lw;x.strokeStyle=EART.OUT;x.stroke()}},
 rr(x,X,Y,w,h,r,fill,lw=4){x.beginPath();x.roundRect(X,Y,w,h,r);x.fillStyle=fill;x.fill();if(lw){x.lineWidth=lw;x.strokeStyle=EART.OUT;x.stroke()}},
 glow(x,col,b,fn){if(EART.rec)EART.rec.push({m:x.getTransform(),col,b,fn});x.save();x.shadowColor=col;x.shadowBlur=b;fn();x.restore()},
 line(x,a,b,col,w){x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.strokeStyle=col;x.lineWidth=w;x.lineCap='round';x.stroke()},
 grad(x,x0,y0,x1,y1,stops){const g=x.createLinearGradient(x0,y0,x1,y1);stops.forEach(([o,c])=>g.addColorStop(o,c));return g},
 // stile "ombre al neon": sagoma scura, bordo luminoso del colore della fazione, luci (occhi, armi) accese
 make(scene,key,w,h,fn,rim){if(scene.textures.exists(key))return;const P=24,c=scene.textures.createCanvas(key,w+P*2,h+P*2);const x=c.getContext();
  const off=document.createElement('canvas');off.width=w;off.height=h;const o=off.getContext('2d');o.lineJoin='round';o.lineCap='round';
  EART.rec=[];fn(o,w,h);const lights=EART.rec;EART.rec=null;
  o.globalCompositeOperation='source-atop';const g=o.createLinearGradient(0,0,w*.3,h);g.addColorStop(0,'rgba(40,16,60,.55)');g.addColorStop(1,'rgba(8,3,16,.82)');o.fillStyle=g;o.fillRect(0,0,w,h);
  o.globalCompositeOperation='source-over';lights.forEach(l=>{o.save();o.setTransform(l.m);o.shadowColor=l.col;o.shadowBlur=l.b*1.6;l.fn();o.restore()});
  x.save();x.shadowColor=rim;x.shadowBlur=22;x.drawImage(off,P,P);x.shadowBlur=8;x.drawImage(off,P,P);x.restore();c.refresh()},
 all(scene){const E=EART;
  // RATTO DI FERRO: punk dei bassifondi, cresta, maschera da teschio di ratto, tubo chiodato con catena
  E.make(scene,'ratto',320,430,(x)=>{
   E.poly(x,[[118,250],[150,250],[132,345],[110,405],[78,405],[96,340]],'#2a2228');E.poly(x,[[160,250],[196,250],[214,330],[236,402],[202,404],[176,334]],'#2a2228');
   E.rr(x,66,396,56,24,8,'#3b2a20');E.rr(x,196,394,58,24,8,'#3b2a20');E.poly(x,[[96,330],[132,330],[128,352],[100,352]],'#6b6e75',3);
   E.poly(x,[[104,140],[200,130],[214,250],[110,262]],'#2c2630');E.poly(x,[[112,148],[150,146],[146,250],[116,256]],'#3d3235',3);
   [[118,160],[170,152],[122,205],[176,200]].forEach(([a,b])=>E.poly(x,[[a,b],[a+30,b-3],[a+32,b+30],[a+2,b+33]],'#7a7d84',3));
   x.fillStyle='#b8541e';[[124,170],[180,165],[130,215]].forEach(([a,b])=>{x.beginPath();x.arc(a+12,b+10,5,0,7);x.fill()});
   E.poly(x,[[150,140],[178,138],[170,260],[154,262]],'#8b1a1a',3);
   E.poly(x,[[96,150],[118,146],[124,230],[104,232]],'#c98b62');E.poly(x,[[200,140],[222,150],[234,232],[212,234]],'#c98b62');
   E.ell(x,114,236,14,13,'#2a2228');E.ell(x,224,236,14,13,'#2a2228');
   // tubo chiodato
   x.save();x.translate(170,240);x.rotate(-0.42);E.rr(x,-110,-9,270,18,6,'#5c5f66');for(let i=0;i<7;i++){E.poly(x,[[70+i*13,-9],[76+i*13,-26],[82+i*13,-9]],'#9aa0a8',2);E.poly(x,[[70+i*13,9],[76+i*13,26],[82+i*13,9]],'#9aa0a8',2)}x.restore();
   for(let i=0;i<9;i++)E.ell(x,120+i*14,262+Math.sin(i)*8+i*4,6,4,'#8a8f96',2);
   // testa
   E.ell(x,158,98,38,42,'#c98b62');E.poly(x,[[138,108],[204,100],[214,126],[180,150],[140,140]],'#9aa0a8');
   x.fillStyle='#f4f4f4';for(let i=0;i<6;i++){x.beginPath();x.moveTo(150+i*10,124);x.lineTo(155+i*10,138);x.lineTo(160+i*10,124);x.fill()}
   E.glow(x,'#ff2020',14,()=>{E.ell(x,170,86,7,4,'#ff3030',0);E.ell(x,146,88,6,4,'#ff3030',0)});
   for(let i=0;i<7;i++)E.poly(x,[[128+i*9,70-i*2],[124+i*10,18+Math.abs(3-i)*6],[140+i*9,66-i*2]],i%2?'#ff6a1a':'#d43a12',3);
   E.poly(x,[[120,140],[200,132],[196,150],[124,160]],'#8b1a1a',3)},'#ff6a1a');
  // DRONE VESPA: drone di sicurezza dei Varga
  E.make(scene,'drone',380,230,(x)=>{
   [[96,52],[262,48],[110,170],[268,170]].forEach(([a,b])=>{E.line(x,[a,b+12],[a+(a<200?40:-30),b+(b<100?40:-30)],'#2b2b30',8);E.glow(x,'#ffd34d',6,()=>E.ell(x,a,b,58,9,'rgba(220,220,230,.35)',0));E.ell(x,a,b+8,18,12,'#1c1c22')});
   x.beginPath();x.moveTo(140,120);x.quadraticCurveTo(70,120,30,190);x.lineWidth=26;x.strokeStyle=E.OUT;x.stroke();x.lineWidth=20;x.strokeStyle='#1d1d24';x.stroke();
   for(let i=0;i<4;i++){x.beginPath();x.arc(120-i*22,128+i*14,10,0,7);x.fillStyle='#d4a52a';x.fill()}
   E.poly(x,[[30,186],[8,224],[46,196]],'#d4a52a',3);
   E.poly(x,[[130,92],[290,84],[352,122],[300,156],[140,152]],E.grad(x,0,84,0,156,[[0,'#3a3a44'],[1,'#121218']]));
   E.poly(x,[[170,90],[200,88],[196,152],[166,152]],'#d4a52a',3);E.poly(x,[[230,86],[250,86],[248,154],[228,154]],'#d4a52a',3);
   E.glow(x,'#ff1010',24,()=>{E.ell(x,310,118,16,16,'#ff2020',3);E.ell(x,312,116,6,6,'#fff',0)});
   E.rr(x,200,150,90,16,5,'#2b2b30');E.rr(x,206,170,96,12,5,'#2b2b30');E.glow(x,'#ff2020',10,()=>{E.ell(x,292,158,5,5,'#ff4040',0);E.ell(x,304,176,5,5,'#ff4040',0)})},'#ffd34d');
  // AGENTE PCPD: armatura antisommossa, visore, scudo energetico, manganello elettrico
  E.make(scene,'agente',330,450,(x)=>{
   E.poly(x,[[110,270],[150,270],[146,360],[132,420],[96,420],[108,356]],'#1e2540');E.poly(x,[[160,270],[200,270],[212,360],[226,420],[190,420],[172,360]],'#1e2540');
   E.rr(x,84,412,58,26,8,'#141a2e');E.rr(x,186,412,58,26,8,'#141a2e');E.rr(x,104,330,38,34,8,'#2c3658');E.rr(x,176,330,38,34,8,'#2c3658');
   E.poly(x,[[96,130],[214,130],[222,280],[92,280]],E.grad(x,0,130,0,280,[[0,'#2f3a62'],[1,'#1a2140']]));
   E.glow(x,'#3aa0ff',10,()=>{E.line(x,[112,170],[150,190],'#3aa0ff',4);E.line(x,[198,170],[162,190],'#3aa0ff',4);E.line(x,[120,240],[190,240],'#3aa0ff',3)});
   E.rr(x,98,256,116,20,5,'#141a2e');
   E.ell(x,92,150,30,26,'#2c3658');E.poly(x,[[72,160],[96,160],[90,240],[66,236]],'#1e2540');
   // manganello
   x.save();x.translate(70,236);x.rotate(-0.9);E.rr(x,-8,-120,16,128,6,'#0e1224');E.glow(x,'#40c8ff',16,()=>{for(let i=0;i<4;i++)E.line(x,[-14+Math.random()*28,-120+i*22],[-14+Math.random()*28,-106+i*22],'#a8f0ff',3)});x.restore();
   E.ell(x,66,240,14,12,'#141a2e');
   // casco
   E.ell(x,156,92,46,48,'#25305a');E.glow(x,'#40c8ff',18,()=>E.poly(x,[[118,86],[200,82],[204,108],[122,112]],'#40c8ff',3));E.rr(x,128,118,56,22,6,'#141a2e');
   // scudo energetico
   x.save();E.glow(x,'#40c8ff',22,()=>{x.beginPath();x.roundRect(196,96,108,300,18);x.fillStyle='rgba(70,170,255,.28)';x.fill();x.lineWidth=6;x.strokeStyle='#5fd0ff';x.stroke()});
   x.globalAlpha=.5;E.line(x,[214,120],[240,120],'#cfefff',3);E.line(x,[214,370],[290,370],'#cfefff',2);x.globalAlpha=1;
   E.ell(x,206,210,18,16,'#2c3658');x.restore()},'#40c8ff');
  // INFERMIERA MOREAU: chirurga del mercato nero, braccia cibernetiche, pistola-siringa
  E.make(scene,'infermiera',300,460,(x)=>{
   E.rr(x,112,380,22,56,6,'#f2f2f2');E.rr(x,154,380,22,56,6,'#f2f2f2');E.poly(x,[[106,430],[136,430],[138,448],[100,448]],'#c81e2e',3);E.poly(x,[[150,430],[180,430],[186,448],[148,448]],'#c81e2e',3);
   E.poly(x,[[112,140],[178,140],[208,390],[82,390]],E.grad(x,0,140,0,390,[[0,'#ffffff'],[1,'#d9d9e0']]));
   E.poly(x,[[136,150],[156,150],[170,388],[124,388]],'#c81e2e',3);
   E.poly(x,[[96,150],[124,140],[122,176],[92,188]],'#ffffff');E.poly(x,[[168,140],[196,150],[202,190],[170,178]],'#ffffff');
   E.glow(x,'#ff2a4a',4,()=>{x.fillStyle='#c81e2e';x.fillRect(104,156,14,4);x.fillRect(109,151,4,14)});
   // braccia d'argento
   E.poly(x,[[92,186],[110,184],[104,268],[86,268]],'#b8bcc6');E.ell(x,96,276,12,12,'#9aa0aa');
   E.poly(x,[[188,186],[206,184],[226,250],[210,256]],'#b8bcc6');E.ell(x,220,260,12,12,'#9aa0aa');
   // pistola siringa
   x.save();x.translate(222,262);x.rotate(0.55);E.rr(x,-14,-14,40,28,6,'#8a8f9a');E.glow(x,'#ff40d0',22,()=>E.rr(x,24,-10,90,20,8,'rgba(255,64,208,.85)',3));E.line(x,[114,0],[140,0],'#e8e8f0',4);x.restore();
   // testa
   E.ell(x,146,96,34,40,'#f1cdb4');E.ell(x,140,52,34,22,'#141018');E.ell(x,118,40,16,16,'#141018');
   E.poly(x,[[116,60],[178,60],[176,40],[120,40]],'#ffffff',3);E.glow(x,'#ff2a4a',4,()=>{x.fillStyle='#c81e2e';x.fillRect(142,44,12,4);x.fillRect(146,40,4,12)});
   E.poly(x,[[118,104],[178,100],[174,132],[124,134]],'#f4f4f8',3);
   E.ell(x,134,90,6,4,'#2a0f1a',0);E.ell(x,164,88,6,4,'#2a0f1a',0);E.glow(x,'#ff40d0',8,()=>E.ell(x,164,88,2,2,'#ff40d0',0));
   E.poly(x,[[124,138],[170,136],[168,152],[126,154]],'#ffffff',3)},'#ff40d0');
  // IL MASTINO: sicario cyborg dei Varga, mascella d'acciaio, braccio-motosega
  E.make(scene,'mastino',430,540,(x)=>{
   E.poly(x,[[130,330],[200,330],[188,440],[170,510],[110,510],[132,436]],'#16131a');E.poly(x,[[210,330],[280,330],[296,440],[312,510],[252,510],[234,440]],'#16131a');
   E.rr(x,92,500,88,30,10,'#0b090d');E.rr(x,244,500,92,30,10,'#0b090d');
   E.poly(x,[[110,120],[310,110],[330,340],[100,350]],E.grad(x,0,110,0,350,[[0,'#24202a'],[1,'#121016']]));
   E.poly(x,[[180,118],[250,116],[240,300],[196,300]],'#e8e2d8',3);
   E.poly(x,[[208,122],[226,122],[236,270],[216,290],[200,270]],'#d9a520',3);
   E.poly(x,[[150,126],[190,118],[210,250],[170,170]],'#1b1820');E.poly(x,[[290,118],[248,116],[232,250],[270,170]],'#1b1820');
   E.glow(x,'#ffd34d',10,()=>{x.beginPath();x.arc(140,190,16,0,7);x.strokeStyle='#d9a520';x.lineWidth=4;x.stroke();x.fillStyle='#d9a520';x.font='bold 20px serif';x.fillText('V',133,197)});
   E.ell(x,108,150,40,38,'#1b1820');E.poly(x,[[78,160],[118,170],[108,270],[70,262]],'#1b1820');E.ell(x,90,276,24,22,'#a5735a');
   // braccio motosega
   E.ell(x,316,146,46,42,E.grad(x,270,100,360,190,[[0,'#9aa0aa'],[1,'#4a4e58']]));E.poly(x,[[300,170],[350,160],[372,250],[324,262]],'#6a6e78');
   E.glow(x,'#ff2020',10,()=>{E.ell(x,320,146,8,8,'#ff2a2a',2);E.ell(x,346,208,6,6,'#ff2a2a',2)});
   x.save();x.translate(352,262);x.rotate(-0.35);E.rr(x,-30,-10,60,46,8,'#4a4e58');
   E.glow(x,'#ff2020',14,()=>E.rr(x,-22,30,44,200,20,'#8a1010',4));for(let i=0;i<14;i++){E.poly(x,[[-24,40+i*14],[-36,46+i*14],[-24,52+i*14]],'#c8ccd4',2);E.poly(x,[[24,40+i*14],[36,46+i*14],[24,52+i*14]],'#c8ccd4',2)}
   E.line(x,[0,40],[0,220],'#ff6060',3);x.restore();
   // testa
   E.ell(x,214,76,48,52,'#a5735a');for(let i=0;i<8;i++)E.poly(x,[[170+i*12,50],[166+i*12,10+Math.abs(4-i)*4],[184+i*12,46]],'#0d0b10',3);
   E.poly(x,[[168,82],[262,78],[270,118],[232,146],[176,132]],E.grad(x,0,78,0,146,[[0,'#b8bcc6'],[1,'#5a5e68']]));
   E.glow(x,'#ff2020',16,()=>{E.poly(x,[[182,104],[256,100],[246,124],[192,126]],'#7a0a0a',3);x.fillStyle='#ff4040';for(let i=0;i<7;i++){x.beginPath();x.moveTo(186+i*10,104);x.lineTo(191+i*10,118);x.lineTo(196+i*10,103);x.fill()}});
   E.glow(x,'#ff1010',18,()=>{E.ell(x,196,66,8,5,'#ff3030',0);E.ell(x,236,64,8,5,'#ff3030',0)});
   E.line(x,[184,54],[208,62],'#0d0b10',5);E.line(x,[248,52],[226,60],'#0d0b10',5)},'#ff2020');
 }};
