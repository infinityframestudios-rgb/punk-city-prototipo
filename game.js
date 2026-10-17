// PUNK CITY – Prototipo di battaglia (ATB + colpi a tempo). Phaser 3.
'use strict';
const W=1280,H=720,FONT='"Trebuchet MS",Arial,sans-serif';
const COL={pink:0xff2fb3,cyan:0x00f0ff,gold:0xffd34d,red:0xff2a4a,ink:0x0b0216,green:0x34ff8a,blue:0x4aa8ff,purple:0xb04dff};
const rnd=(a,b)=>a+Math.random()*(b-a), pick=a=>a[Math.floor(Math.random()*a.length)];
const T=(s,x,y,str,size,col,extra)=>s.add.text(x,y,str,{fontFamily:FONT,fontSize:size+'px',color:col||'#fff',fontStyle:'bold',stroke:'#000',strokeThickness:Math.max(3,size/5),...(extra||{})});

// ---------- DATI ----------
// portrait crop: [centroX, centroY, lato] in frazioni della larghezza/altezza dello sprite
const HEROES={
 ras:{name:'RAS',role:'Il Don · spada e pistola',col:COL.red,hex:'#ff2a4a',hp:340,mp:60,atk:38,def:16,spd:11,crit:.1,h:310,half:1,por:[.43,.10,.24],hand:[-.42,.91],
  attack:{n:'Combo Infernale',d:'Spada, spada, pistola: 3 colpi a tempo'},
  tech:[{id:'raffica',n:'Raffica a Bruciapelo',mp:8,d:'6 colpi di pistola a caso. Doppi danni sui droni.',t:'all'},
        {id:'fendente',n:'Fendente Alto',mp:10,d:'Colpo pesante di spada. Spacca gli scudi.',t:'one'}],
  furia:{n:'ALBA ROSSA',d:'Attraversa tutti i nemici con la spada. Toglie gli scudi.'}},
 lyra:{name:'LYRA',role:'La voce del Neon · frusta al neon',col:COL.pink,hex:'#ff2fb3',hp:280,mp:90,atk:31,def:11,spd:14,crit:.08,h:300,half:1,por:[.58,.10,.22],hand:[-.14,.91],
  attack:{n:'Frustata Neon',d:'Due frustate elettriche a tempo'},
  tech:[{id:'laccio',n:'Laccio Elettrico',mp:10,d:'Lega un nemico: lo stordisce e gli strappa lo scudo.',t:'one'},
        {id:'vortice',n:'Vortice Neon',mp:14,d:'La frusta gira a 360°: colpisce tutti.',t:'all'},
        {id:'scintilla',n:'Scintilla Vitale',mp:12,d:'Energia neon che cura tutta la squadra.',t:'party'}],
  furia:{n:'TEMPESTA NEON',d:'Fulmini di frusta su tutti + squadra più veloce.'}},
 sable:{name:'SABLE',role:'Cecchina · fucile a rotaia "Requiem"',col:COL.cyan,hex:'#00f0ff',hp:250,mp:70,atk:44,def:10,spd:10,crit:.25,h:250,por:[.72,.11,.2],hand:[-.46,.74],
  attack:{n:'Colpo di Requiem',d:'Un colpo preciso del fucile a rotaia'},
  tech:[{id:'mirino',n:'Mirino Rosso',mp:6,d:'Marca il bersaglio: i prossimi colpi su di lui sono critici.',t:'one'},
        {id:'carica',n:'Carica a Rotaia',mp:14,d:'Raggio che trapassa tutti i nemici e gli scudi.',t:'all'},
        {id:'baionetta',n:'Affondo di Baionetta',mp:8,d:'Lama monofilamento: danno + sanguinamento.',t:'one'}],
  furia:{n:'COLPO UNICO',d:'Un solo colpo, danno enorme, ignora le difese.'}}};
const ENEMIES={
 ratto:{name:'Ratto di Ferro',hp:230,atk:43,def:9,spd:10,h:225},
 drone:{name:'Drone Vespa',hp:165,atk:37,def:6,spd:14,h:150,flying:1},
 agente:{name:'Agente PCPD',hp:290,atk:42,def:15,spd:9,h:290,shield:1},
 infermiera:{name:'Infermiera Moreau',hp:230,atk:33,def:8,spd:12,h:300},
 mastino:{name:'IL MASTINO',hp:2100,atk:61,def:17,spd:10,h:350,boss:1}};
const WAVES=[
 [['ratto',440,470],['drone',290,245],['ratto',170,440]],
 [['agente',430,474],['infermiera',165,445],['drone',320,230]],
 [['mastino',400,478],['ratto',125,440]]];
const HERO_POS={ras:[850,630],lyra:[1075,645],sable:[1140,440]};
// nemici con arte PNG in assets/ (altrimenti arte procedurale da enemies.js)
const ENEMY_PNG=['ratto','drone','agente','infermiera','mastino'];
const ITEMS={medikit:{n:'Medikit',d:'+120 PV a chi sta peggio',q:3},stim:{n:'Stim Neon',d:'+40 PM a chi ne ha meno',q:2},emp:{n:'Granata EMP',d:'60 danni a tutti, stordisce i droni',q:1}};

// ---------- BOOT ----------
class Boot extends Phaser.Scene{constructor(){super('boot')}
 preload(){const t=T(this,W/2,H/2,'Caricamento…',32,'#ff2fb3').setOrigin(.5);
  this.load.on('progress',p=>t.setText('Caricamento… '+Math.round(p*100)+'%'));
  this.load.image('bg','assets/bg.jpg');
  ['ras','lyra','sable'].concat(ENEMY_PNG).forEach(k=>this.load.image(k,'assets/'+k+'.png'))}
 create(){EART.all(this);const g=this.make.graphics({add:false});g.fillStyle(0xffffff,1).fillCircle(8,8,8);g.generateTexture('dot',16,16);
  g.clear();g.fillStyle(0xaad8ff,1).fillRect(0,0,2,18);g.generateTexture('drop',2,18);
  g.clear();g.lineStyle(6,0xffffff,1).strokeCircle(32,32,28);g.generateTexture('ring',64,64);
  g.clear();g.fillStyle(0xffffff,1);g.fillTriangle(0,32,64,26,64,38);g.fillTriangle(64,32,0,26,0,38);g.fillTriangle(32,0,26,64,38,64);g.fillCircle(32,32,12);g.generateTexture('star',64,64);
  g.clear();g.fillStyle(0xffd34d,1).fillRect(0,0,8,4);g.generateTexture('shell',8,4);g.destroy();
  Object.entries(HEROES).forEach(([k,d])=>{const src=this.textures.get(k).getSourceImage(),c=this.textures.createCanvas('por_'+k,96,96),x=c.getContext();
   const s=d.por[2]*src.width,cx=d.por[0]*src.width,cy=d.por[1]*src.height;x.fillStyle='#1a0630';x.fillRect(0,0,96,96);x.drawImage(src,cx-s/2,cy-s/2,s,s,0,0,96,96);c.refresh()});
  this.scene.start(/[?&]lotta=1/.test(location.search)?'battle':'title')}}

function backdrop(s,dim=0){s.add.image(W/2,H/2,'bg').setDisplaySize(W,H);
 s.add.particles(0,0,'drop',{x:{min:-100,max:W+200},y:-30,speedY:{min:700,max:1000},speedX:-160,rotate:10,lifespan:1100,quantity:2,frequency:20,alpha:{start:.35,end:.08},scale:{min:.6,max:1.2}}).setDepth(1);
 if(dim)s.add.rectangle(W/2,H/2,W,H,0x000000,dim).setDepth(2)}
function panel(s,x,y,w,h,col=COL.pink,a=.85){const g=s.add.graphics();g.fillStyle(COL.ink,a).fillRoundedRect(x,y,w,h,14);g.lineStyle(3,col,1).strokeRoundedRect(x,y,w,h,14);g.lineStyle(1,0xffffff,.15).strokeRoundedRect(x+5,y+5,w-10,h-10,10);return g}
const BTN={};
function button(s,x,y,w,h,label,cb,col=COL.cyan,size=24,sub){const c=s.add.container(x,y);const g=s.add.graphics();let en=true;
 const draw=on=>{g.clear();g.fillStyle(on?col:COL.ink,on?.9:.88).fillRoundedRect(-w/2,-h/2,w,h,12);g.lineStyle(3,en?col:0x555555,1).strokeRoundedRect(-w/2,-h/2,w,h,12)};draw(0);
 const t=T(s,0,sub?-11:0,label,size,'#fff').setOrigin(.5);c.add([g,t]);let st;if(sub){st=T(s,0,15,sub,16,'#ffd34d').setOrigin(.5);c.add(st)}
 c.setSize(w,h).setInteractive({useHandCursor:true});
 c.on('pointerover',()=>en&&draw(1)).on('pointerout',()=>draw(0)).on('pointerdown',(p,lx,ly,ev)=>{ev&&ev.stopPropagation&&ev.stopPropagation();if(!en)return;draw(1);s.time.delayedCall(90,()=>draw(0));SFX.play('ui');cb()});
 c.setEnabled=v=>{en=v;t.setAlpha(v?1:.4);st&&st.setAlpha(v?1:.4);draw(0);return c};c.label=label;BTN[label]=c;return c}

function muteBtn(s,x,y){const b=button(s,x,y,84,60,SFX.muted?'🔇':'🔊',()=>{SFX.init();SFX.setMute(!SFX.muted);b.list[1].setText(SFX.muted?'🔇':'🔊');if(!SFX.muted&&!SFX.mode)SFX.music(s.scene.key=='battle'?(s.wave==2?'boss':'battle'):'title')},COL.gold,26);BTN['MUTE']=b;return b}
// ---------- TITOLO ----------
class Title extends Phaser.Scene{constructor(){super('title')}
 create(){backdrop(this,.55);const d=10;
  const t=T(this,W/2,110,'PUNK CITY',118,'#ff2fb3',{strokeThickness:10}).setOrigin(.5).setDepth(d).setShadow(0,0,'#ff2fb3',30,true,true);
  this.tweens.add({targets:t,alpha:.75,duration:90,yoyo:true,repeat:-1,repeatDelay:2400});
  T(this,W/2,192,'PROTOTIPO DI BATTAGLIA  ·  VICOLO NEON',26,'#00f0ff').setOrigin(.5).setDepth(d);
  [['ras',330],['lyra',640],['sable',950]].forEach(([k,x],i)=>{const h=HEROES[k];const sp=this.add.image(x,560,k).setOrigin(.5,1).setDepth(d);sp.setScale(Math.min(290/sp.height,330/sp.width));
   this.tweens.add({targets:sp,y:552,duration:1400+i*200,yoyo:true,repeat:-1,ease:'Sine.inOut'});
   T(this,x,575,h.name,30,h.hex).setOrigin(.5,0).setDepth(d);T(this,x,612,h.role,17,'#ddd').setOrigin(.5,0).setDepth(d)});
  const go=T(this,W/2,680,'▶ TOCCA PER COMBATTERE',30,'#fff').setOrigin(.5).setDepth(d);this.tweens.add({targets:go,alpha:.3,duration:700,yoyo:true,repeat:-1});
  T(this,W/2,270,'Tocca i comandi in basso · COLPO A TEMPO: tocca quando il cerchio bianco è sul bersaglio giallo · AUTO e x2 in alto',17,'#ccc').setOrigin(.5).setDepth(d);
  T(this,W/2,236,'"In questa città il sangue si paga a rate. Io sono venuto a riscuotere." — Ras',21,'#ffd34d').setOrigin(.5).setDepth(d);
  muteBtn(this,1220,44).setDepth(d+1);if(SFX.running)SFX.music('title');
  let started=false;const start=()=>{if(started)return;started=true;SFX.init();SFX.music('battle');SFX.play('wave');try{if(this.sys.game.device.input.touch&&!this.scale.isFullscreen){this.scale.startFullscreen();screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{})}}catch(e){}
   this.cameras.main.fadeOut(300,0,0,0);this.time.delayedCall(320,()=>this.scene.start('battle'))};
  // nuovo: pulsante per la stanza di prova (esplorazione in stile JRPG anni '90)
  const sb=button(this,140,44,250,60,'🚪 STANZA DI PROVA',()=>{this.cameras.main.fadeOut(300,0,0,0);this.time.delayedCall(320,()=>location.href='stanza/?v=5')},COL.cyan,20).setDepth(d+1);
  this.tweens.add({targets:sb,scale:1.05,duration:800,yoyo:true,repeat:-1,ease:'Sine.inOut'});
  this.input.on('pointerup',p=>{if(p.x>1160&&p.y<95)return;if(p.x<280&&p.y<90)return;start()});this.input.keyboard.once('keydown-ENTER',start);this.input.keyboard.once('keydown-SPACE',start);
  window.__pc={scene:this,state:'title'}}}

// ---------- BATTAGLIA ----------
class Battle extends Phaser.Scene{constructor(){super('battle')}
 create(){this.cameras.main.fadeIn(300);backdrop(this);for(const k in BTN)delete BTN[k];
  this.ended=0;this.speed=1;this.auto=false;this.busy=true;this.menuFor=null;this.wave=0;this.stats={perf:0,turns:0,start:Date.now()};this.said={};this.tutQ=false;
  this.items=JSON.parse(JSON.stringify(ITEMS));this.enemies=[];
  this.party=Object.keys(HEROES).map(k=>{const d=HEROES[k];return{k,hero:1,...d,maxhp:d.hp,maxmp:d.mp,gauge:rnd(20,60),furia:0,st:{},x:HERO_POS[k][0],y:HERO_POS[k][1],alive:true}});
  this.party.forEach(u=>this.spawn(u));this.buildUI();if(SFX.running)SFX.music('battle');
  else this.input.once('pointerdown',()=>{SFX.init();if(!SFX.mode)SFX.music(this.wave==2?'boss':'battle')});
  this.input.keyboard.on('keydown',e=>this.onKey(e.key));
  this.qteG=this.add.graphics().setDepth(3000);
  window.__pc={scene:this,state:'intro',get wave(){return window.__pc.scene.wave+1},btn:l=>{const b=BTN[l];if(!b||!b.visible||!b.parentContainer&&!b.active)return null;const m=b.getWorldTransformMatrix();return{x:m.tx,y:m.ty}}};
  this.run()}
 // --- tempo
 wait(ms){return new Promise(r=>this.time.delayedCall(ms,r))}
 tw(cfg){return new Promise(r=>this.tweens.add({...cfg,onComplete:r}))}
 setSpeed(v){this.speed=v;this.time.timeScale=v;this.tweens.timeScale=v}
 // --- sprite
 spawn(u){const s=this.add.image(u.x,u.y,u.k).setOrigin(.5,1);s.setScale(u.h/s.height);u.s=s;u.sc=s.scale;
  const sh=this.add.ellipse(u.x,u.flying?u.y+170:u.y,s.displayWidth*.6,20,0x000000,.45).setDepth((u.flying?u.y+170:u.y)-1);u.sh=sh;s.setDepth(u.y);
  this.idleOn(u);
  if(u.hero){const dw=s.displayWidth,h=u.h,Z={ras:[[-.5,-1,.55,.13],[COL.red,0xff8040,0xffd34d],150],lyra:[[-.5,-.97,1,.85],[COL.pink,COL.purple,COL.cyan],45],sable:[[-.38,-.86,.48,.1],[0xff1040,0xff6080],110]}[u.k];
   u.amb=this.add.particles(0,0,'dot',{lifespan:{min:500,max:1000},speedY:{min:-50,max:-10},speedX:{min:-20,max:20},scale:{start:.32,end:0},alpha:{start:.9,end:0},tint:Z[1],blendMode:'ADD',frequency:Z[2],
    emitZone:{type:'random',source:new Phaser.Geom.Rectangle(Z[0][0]*dw,Z[0][1]*h,Z[0][2]*dw,Z[0][3]*h)}}).setDepth(u.y+1);u.amb.startFollow(s)}
  if(!u.hero){const bw=u.boss?220:130;s.x=u.x-160;this.tweens.add({targets:s,x:u.x,duration:420,ease:'Cubic.out'});u.bar=this.add.graphics().setDepth(900);u.bw=bw;
   u.lbl=T(this,u.x,u.y+6,u.name,u.boss?20:16,u.boss?'#ffd34d':'#fff').setOrigin(.5,0).setDepth(900);u.icons=T(this,u.x,u.y-u.h-30,'',20,'#fff').setOrigin(.5).setDepth(900);
   s.setInteractive({useHandCursor:true});s.on('pointerdown',()=>{if(this.picking&&u.alive)this.picking(u)});this.drawEBar(u)}}
 idleOn(u){const s=u.s;u.idle&&u.idle.stop();u.breath&&u.breath.stop();s.y=u.y;s.setScale(u.sc);
  u.idle=this.tweens.add({targets:s,y:u.flying?u.y-16:u.y-3,duration:u.flying?600:1100+Math.random()*300,yoyo:true,repeat:-1,ease:'Sine.inOut'});
  u.breath=u.flying?null:this.tweens.add({targets:s,scaleY:u.sc*1.028,scaleX:u.sc*.992,duration:1250+Math.random()*400,yoyo:true,repeat:-1,ease:'Sine.inOut'})}
 center(u){return{x:u.s.x,y:u.s.y-u.h*(u.half?.68:.55)}}
 hand(u){if(u.hand)return{x:u.s.x+u.hand[0]*u.s.displayWidth,y:u.s.y-u.hand[1]*u.h};return{x:u.s.x+(u.hero?-1:1)*u.s.displayWidth*.38,y:u.s.y-u.h*.62}}
 drawEBar(u){const g=u.bar,w=u.bw,x=u.x-w/2,y=u.y+32;g.clear();if(!u.alive){u.lbl.setVisible(false);u.icons.setVisible(false);return}
  g.fillStyle(0x000000,.8).fillRoundedRect(x-2,y-2,w+4,13,4);g.fillStyle(u.boss?COL.gold:COL.red,1).fillRoundedRect(x,y,Math.max(0,w*u.hp/u.maxhp),9,3);
  g.fillStyle(0x000000,.7).fillRect(x,y+12,w,4);g.fillStyle(0xffffff,.8).fillRect(x,y+12,w*Math.min(1,u.gauge/100),4);
  const ic=[];if(u.shield)ic.push('🛡');if(u.st.mark)ic.push('🎯');if(u.st.stun)ic.push('💫');if(u.st.bleed)ic.push('🩸');if(u.charging)ic.push('⚠️');u.icons.setText(ic.join(' '))}
 // --- UI
 buildUI(){const D=1000;panel(this,10,532,520,180,COL.pink).setDepth(D);panel(this,540,532,730,180,COL.cyan).setDepth(D);
  this.waveT=T(this,20,14,'',24,'#ffd34d').setDepth(D);
  this.autoB=button(this,1060,40,150,60,'AUTO: NO',()=>{this.auto=!this.auto;this.autoB.list[1].setText(this.auto?'AUTO: SÌ':'AUTO: NO');if(this.auto&&this.menuFor)this.autoAct(this.menuFor)},COL.gold,20).setDepth(D);
  this.muteB=muteBtn(this,935,40).setDepth(D);this.spdB=button(this,1200,40,110,60,'x1',()=>{this.setSpeed(this.speed==1?2:1);this.spdB.list[1].setText('x'+this.speed)},COL.gold,22).setDepth(D);
  this.hint=T(this,640,74,'',22,'#ffffff').setOrigin(.5).setDepth(D);
  this.menu=this.add.container(0,0).setDepth(D+1);
  this.rows=this.party.map((u,i)=>{const y=544+i*56,c=this.add.container(0,0).setDepth(D);const hl=this.add.rectangle(905,y+25,716,52,u.col,0);
   const por=this.add.image(580,y+25,'por_'+u.k).setDisplaySize(48,48);const fr=this.add.graphics().lineStyle(2,u.col).strokeRect(556,y+1,48,48);
   const nm=T(this,614,y+2,u.name,22,u.hex);const bars=this.add.graphics();const hpT=T(this,740,y+26,'',15,'#fff'),mpT=T(this,960,y+26,'',15,'#fff'),fT=T(this,1150,y+26,'',15,'#ffd34d');
   c.add([hl,por,fr,nm,bars,hpT,mpT,fT]);return{u,hl,bars,hpT,mpT,fT,y}});
  this.dlg=this.add.container(W/2,130).setDepth(2000).setAlpha(0);const dp=panel(this,-480,-50,960,104,COL.gold,.92);this.dlgP=this.add.image(-428,2,'por_ras').setDisplaySize(80,80);
  this.dlgN=T(this,-376,-38,'',22,'#ffd34d');this.dlgT=T(this,-376,-8,'',22,'#fff',{wordWrap:{width:830}});this.dlg.add([dp,this.dlgP,this.dlgN,this.dlgT]);
  this.tgtArrow=T(this,0,0,'▼',44,'#ffd34d').setOrigin(.5).setVisible(false).setDepth(2500);this.tweens.add({targets:this.tgtArrow,y:'+=8',duration:300,yoyo:true,repeat:-1});
  this.refresh()}
 refresh(){this.rows.forEach(r=>{const u=r.u,g=r.bars;g.clear();const by=r.y+12;
  const bar=(x,v,m,c1,w,h=12)=>{g.fillStyle(0x000000,.9).fillRoundedRect(x,by,w,h+4,5);g.fillStyle(c1,1).fillRoundedRect(x+2,by+2,Math.max(0,(w-4)*Math.min(1,v/m)),h,4)};
  bar(740,u.hp,u.maxhp,u.hp/u.maxhp<.3?COL.red:COL.green,200);bar(960,u.mp,u.maxmp,COL.blue,170);bar(1150,u.furia,100,u.furia>=100?COL.gold:0xb07a00,100);
  g.fillStyle(0x000000,.9).fillRect(614,by+28,110,8);g.fillStyle(u.gauge>=100?0xffffff:0x9fdcff,1).fillRect(614,by+28,110*Math.min(1,u.gauge/100),8);
  r.hpT.setText('PV '+Math.max(0,Math.ceil(u.hp))+'/'+u.maxhp);r.mpT.setText('PM '+u.mp+'/'+u.maxmp);r.fT.setText(u.furia>=100?'FURIA!':'Furia');
  r.hl.setFillStyle(u.col,this.menuFor===u?.22:0);if(!u.alive)r.hpT.setText('K.O.');});
  this.waveT.setText('ONDATA '+Math.min(3,this.wave+1)+'/3   ·   Perfetti: '+this.stats.perf)}
 async say(who,name,text,ms=2300){const k=HEROES[who]?'por_'+who:null;this.dlgP.setVisible(!!k);if(k)this.dlgP.setTexture(k);
  this.dlgN.setText(name).setX(k?-376:-460);this.dlgT.setText(text).setX(k?-376:-460);this.dlg.setAlpha(1);
  await new Promise(r=>{let done=false;const fin=()=>{if(done)return;done=true;r()};this.time.delayedCall(ms,fin);this.input.once('pointerdown',fin)});this.dlg.setAlpha(0)}
 async quip(key,who,name,text){if(this.said[key])return;this.said[key]=1;await this.say(who,name,text,2000)}
 // --- flusso
 async run(){window.__pc.state='intro';
  await this.say('ras','KIRI (radio)','Ras, sono Kiri. I Ratti di Ferro bloccano il Vicolo Neon. Dietro di loro aspetta il Mastino dei Varga.',3000);
  await this.say('ras','RAS','Allora passiamo in mezzo.');
  await this.say('lyra','LYRA','Finalmente un po\' di movimento. Stavo per annoiarmi.');
  await this.say('sable','SABLE','Andate avanti. Vi copro io. Come sempre.');
  this.startWave(0)}
 async startWave(i){this.wave=i;this.refresh();window.__pc.state='wave'+(i+1);SFX.play('wave');if(i==2)SFX.music('boss');
  const ban=T(this,W/2,300,i==2?'MINI-BOSS: IL MASTINO':'ONDATA '+(i+1),i==2?64:80,i==2?'#ff2a4a':'#00f0ff',{strokeThickness:10}).setOrigin(.5).setDepth(2600).setAlpha(0);
  await this.tw({targets:ban,alpha:1,scale:{from:1.6,to:1},duration:350});await this.wait(700);await this.tw({targets:ban,alpha:0,duration:300});ban.destroy();
  this.enemies=WAVES[i].map(([k,x,y])=>{const d=ENEMIES[k];const u={k,...d,maxhp:d.hp,gauge:rnd(0,40),st:{},x,y,alive:true,turns:0,shield:!!d.shield};this.spawn(u);u.s.setAlpha(0);this.tweens.add({targets:u.s,alpha:1,duration:400});return u});
  await this.wait(450);
  if(i==0){await this.say('ras','KIRI (radio)','Il drone vola: spada, frusta e baionetta lo mancano spesso. Pistola e fucile no.',3000);}
  if(i==1){await this.say('ras','KIRI (radio)','Agente con lo scudo: rompilo col Laccio di Lyra o col Fendente Alto di Ras. Il fucile di Sable lo trapassa.',3200);
   await this.say('ras','KIRI (radio)','E stendete prima l\'infermiera: rimette in piedi gli altri.',2400)}
  if(i==2){await this.say(null,'IL MASTINO','Il Don Varga vi manda i suoi saluti. Io vi mando in pezzi.',2600);
   await this.say('ras','RAS','Io non minaccio mai due volte. Tu non arrivi nemmeno alla prima.',2600);
   await this.say('ras','KIRI (radio)','Quando carica la motosega ⚠️ mettetevi in DIFESA!',2600)}
  this.busy=false}
 update(t,dt){if(this.busy||this.menuFor||!this.enemies.length)return;dt=Math.min(dt,50)*this.speed;
  const all=[...this.party,...this.enemies].filter(u=>u.alive);
  for(const u of all){const mul=(u.st.haste?1.5:1)*(u.enraged?1.3:1);u.gauge+=(u.spd+10)*1.6*mul*dt/1000}
  this.party.forEach(u=>{if(!u.alive)u.gauge=0});this.enemies.forEach(u=>u.alive&&this.drawEBar(u));this.refresh();
  const ready=all.filter(u=>u.gauge>=100).sort((a,b)=>b.gauge-a.gauge)[0];if(!ready)return;
  ready.gauge=0;this.turn(ready)}
 async turn(u){this.busy=true;this.stats.turns++;
  // stati a inizio turno
  if(u.st.guard)u.st.guard=0;
  if(u.st.bleed){u.st.bleed--;await this.hurt(u,Math.round(u.maxhp*.06),'#ff4060','🩸')}
  if(u.st.poison){u.st.poison--;await this.hurt(u,Math.round(u.maxhp*.05),'#a0ff60','☠')}
  if(u.st.haste)u.st.haste--;
  if(!u.alive){await this.checkEnd();return}
  if(u.st.stun){u.st.stun--;this.float(u,'STORDITO','#ffd34d');await this.wait(600);this.end();return}
  if(u.hero){if(this.auto)await this.autoAct(u);else{this.openMenu(u);return}}
  else{await this.enemyAct(u);await this.checkEnd()}
  }
 end(){this.busy=false;this.refresh()}
 // --- menu
 clearMenu(){this.menu.removeAll(true);this.picking=null;this.tgtArrow.setVisible(false);this.hint.setText('');for(const k in BTN)if(!BTN[k].active)delete BTN[k]}
 openMenu(u){this.menuFor=u;this.busy=false;this.refresh();this.mainMenu()}
 mainMenu(){const u=this.menuFor;this.clearMenu();this.hint.setText(u.name+': cosa facciamo?');
  const b=[['⚔ ATTACCO',()=>this.pickTarget(u,{id:'attack'}),u.col,u.attack.n],['✦ TECNICHE',()=>this.techMenu(),COL.purple],['🎒 OGGETTI',()=>this.itemMenu(),COL.green],['🛡 DIFESA',()=>this.doAction(u,{id:'guard'}),COL.blue,'-50% danni, +8 PM']];
  b.forEach(([l,cb,c,sub],i)=>this.menu.add(button(this,140+(i%2)*260,590+Math.floor(i/2)*90,245,80,l,cb,c,26,sub)));
  if(u.furia>=100){const f=button(this,270,470,330,62,'🔥 '+u.furia.n,()=>this.pickTarget(u,{id:'furia'}),COL.gold,26);this.menu.add(f);this.tweens.add({targets:f,scale:1.06,duration:400,yoyo:true,repeat:-1})}}
 techMenu(){const u=this.menuFor;this.clearMenu();
  u.tech.forEach((t,i)=>{const bt=button(this,140+(i%2)*260,590+Math.floor(i/2)*90,245,80,t.n,()=>{this.pickTarget(u,t)},u.col,20,t.mp+' PM');bt.setEnabled(u.mp>=t.mp);
   bt.on('pointerover',()=>this.hint.setText(t.d));this.menu.add(bt)});
  this.hint.setText(u.tech.map(t=>t.n+': '+t.d)[0]);this.menu.add(button(this,400,680,245,52,'↩ INDIETRO',()=>this.mainMenu(),0x888888,20))}
 itemMenu(){const u=this.menuFor;this.clearMenu();this.hint.setText('Oggetti della famiglia');
  Object.entries(this.items).forEach(([id,it],i)=>{const bt=button(this,140+(i%2)*260,590+Math.floor(i/2)*90,245,80,it.n+' x'+it.q,()=>{if(id=='emp')this.doAction(u,{id:'item',item:id});else this.doAction(u,{id:'item',item:id})},COL.green,20,it.d.length>26?it.d.slice(0,26)+'…':it.d);
   bt.setEnabled(it.q>0);this.menu.add(bt)});this.menu.add(button(this,400,680,245,52,'↩ INDIETRO',()=>this.mainMenu(),0x888888,20))}
 pickTarget(u,a){const t=a.id=='attack'||a.id=='furia'&&u.k!='ras'&&u.k!='lyra'?'one':a.t||'one';
  if(a.id=='furia'&&(u.k=='ras'||u.k=='lyra'))return this.doAction(u,a);
  if(t!='one')return this.doAction(u,a);
  this.clearMenu();this.hint.setText('Tocca un nemico');const live=this.enemies.filter(e=>e.alive);let idx=0;
  const show=()=>{const e=live[idx];this.tgtArrow.setVisible(true).setPosition(e.x,e.s.y-e.h-58)};show();
  this.cycle=d=>{idx=(idx+d+live.length)%live.length;show()};this.confirm=()=>this.picking&&this.picking(live[idx]);
  this.picking=e=>{this.picking=null;this.doAction(u,a,e)};
  this.menu.add(button(this,140,630,245,80,'↩ INDIETRO',()=>this.mainMenu(),0x888888,22));
  this.menu.add(button(this,400,630,245,80,'◀ ▶ CAMBIA',()=>this.cycle(1),COL.cyan,22))}
 onKey(k){if(!this.menuFor)return;if(this.picking){if(k=='ArrowLeft'||k=='ArrowUp')this.cycle(-1);if(k=='ArrowRight'||k=='ArrowDown')this.cycle(1);if(k=='Enter'||k==' ')this.confirm();if(k=='Escape'||k=='Backspace')this.mainMenu()}
  else{const m={'1':'⚔ ATTACCO','2':'✦ TECNICHE','3':'🎒 OGGETTI','4':'🛡 DIFESA'};if(m[k]&&BTN[m[k]])BTN[m[k]].emit('pointerdown');if(k=='Escape')this.mainMenu()}}
 async doAction(u,a,target){const tc=a.t||'one';if(a.mp){if(u.mp<a.mp)return;}this.clearMenu();this.menuFor=null;this.busy=true;this.refresh();
  if(!target&&(a.id=='attack'||a.id=='furia'&&u.k=='sable'||tc=='one'&&a.id!='guard'&&a.id!='item'))target=this.bestTarget();
  if(a.mp)u.mp-=a.mp;
  await this.execHero(u,a,target);await this.checkEnd()}
 bestTarget(pref){const live=this.enemies.filter(e=>e.alive);return live.find(e=>e.k=='infermiera')||live.sort((a,b)=>a.hp-b.hp)[0]}
 async autoAct(u){this.menuFor=null;this.busy=true;const live=this.enemies.filter(e=>e.alive);const has=id=>u.tech.find(t=>t.id==id);const can=id=>u.mp>=has(id).mp;
  let a={id:'attack'},t=this.bestTarget();const hurt=this.party.filter(p=>p.alive&&p.hp/p.maxhp<.35);
  const boss=live.find(e=>e.boss),shielded=live.find(e=>e.shield),fly=live.find(e=>e.flying);
  if(hurt.length&&this.items.medikit.q&&Math.random()<(window.__pcQ?.6:.2))a={id:'item',item:'medikit'};
  else if(u.furia>=100){a={id:'furia'};if(boss)t=boss}
  else if(u.k=='ras'){if(fly&&can('raffica'))a=has('raffica');else if(shielded&&can('fendente')){a=has('fendente');t=shielded}}
  else if(u.k=='lyra'){const avg=this.party.reduce((s,p)=>s+p.hp/p.maxhp,0)/3;if(avg<(window.__pcQ?.6:.45)&&can('scintilla'))a=has('scintilla');else if(shielded&&can('laccio')){a=has('laccio');t=shielded}else if(live.length>=2&&can('vortice'))a=has('vortice')}
  else if(u.k=='sable'){if(live.length>=2&&can('carica'))a=has('carica');else if(boss&&!boss.st.mark&&can('mirino')){a=has('mirino');t=boss}else if(boss&&can('baionetta')&&!boss.st.bleed){a=has('baionetta');t=boss}}
  if(boss&&boss.charging&&Math.random()<(window.__pcQ?1:.35)&&a.id=='attack')a={id:'guard'};
  if(a.mp)u.mp-=a.mp;this.refresh();await this.execHero(u,a,t);await this.checkEnd()}
 // --- calcoli
 calc(att,tg,pow,o={}){if(!tg.alive)return null;
  if(tg.flying&&o.melee&&Math.random()<.4)return{miss:1};
  let d=att.atk*pow*rnd(.9,1.1)-(o.pierce?0:tg.def*.6);let tags=[];
  if(tg.shield&&!o.pierce&&!o.breakShield){d*=.3;tags.push('PARATO')}
  if(tg.flying&&o.gun){d*=1.5;tags.push('PUNTO DEBOLE')}
  const crit=o.crit||tg.st.mark||Math.random()<(att.crit||.06);if(crit){d*=1.6;tags.push('CRITICO')}
  if(o.qte)d*=o.qte;if(tg.st.guard)d*=.5;if(att.enraged)d*=1.2;
  return{d:Math.max(1,Math.round(d)),crit,tags}}
 async hit(att,tg,pow,o={}){const r=this.calc(att,tg,pow,o);if(!r)return 0;
  if(r.miss){SFX.play('miss');this.float(tg,'MANCATO','#9fdcff');return 0}
  if(o.breakShield&&tg.shield){tg.shield=false;tg.shieldT=0;SFX.play('shatter');this.float(tg,'SCUDO ROTTO!','#00f0ff',-40)}
  await this.hurt(tg,r.d,r.crit?'#ffd34d':'#fff',r.tags.join(' '),o.big);
  if(att.hero)att.furia=Math.min(100,att.furia+(o.furia??5));return r.d}
 async hurt(u,d,col='#fff',tag='',big){u.hp-=d;const s=u.s;const crit=/CRITICO/.test(tag);
  s.setTintFill(0xffffff);this.time.delayedCall(80,()=>{if(s.active&&u.alive!==false){s.clearTint();if(u.enraged)s.setTint(0xff7070)}});
  const dir=u.hero?1:-1;this.tweens.add({targets:s,x:u.x+dir*(big?28:16),duration:60,yoyo:true});
  this.impact(u,col,big);SFX.play(big||crit?'crit':'hit');this.cameras.main.shake(big?220:crit?150:90,big?.012:crit?.008:.004);if(big||crit)this.hitstop(big?90:60);
  this.dmgNum(u,d,col,big,crit);
  if(tag)this.float(u,tag,col=='#fff'?'#ff9ad5':col,-46);
  if(u.hero){u.furia=Math.min(100,u.furia+d/u.maxhp*70);if(u.k=='ras'&&u.hp>0&&u.hp/u.maxhp<.3)this.quip('rasHurt','lyra','LYRA','Tesoro, stai sanguinando su tutto il cappotto. Elegante, però.')}
  if(u.hp<=0){u.hp=0;await this.die(u)}else if(!u.hero)this.drawEBar(u);this.refresh()}
 dmgNum(u,d,col,big,crit){const x=u.s.x+rnd(-30,30),y=u.s.y-u.h*.72;const t=T(this,x,y,String(d)+(crit?'!':''),big?58:crit?48:38,col).setOrigin(.5).setDepth(2800).setScale(2);
  if(crit||big)t.setShadow(0,0,'#ff8a00',14,true,true);this.tweens.add({targets:t,scale:1,duration:180,ease:'Back.out'});
  this.tweens.add({targets:t,x:x+rnd(-45,45),y:y-85,alpha:0,duration:850,delay:400,ease:'Cubic.in',onComplete:()=>t.destroy()})}
 impact(u,col,big){const c=this.center(u);const x=c.x+rnd(-20,20),y=c.y+rnd(-30,30);const hex=typeof col=='string'?Phaser.Display.Color.HexStringToColor(col).color:col;
  const p=this.add.particles(0,0,'dot',{x,y,speed:{min:120,max:big?520:340},angle:{min:0,max:360},lifespan:{min:200,max:450},scale:{start:big?.55:.4,end:0},tint:[0xffffff,hex,COL.gold],blendMode:'ADD',gravityY:500,emitting:false}).setDepth(2750);p.explode(big?28:14);
  const r=this.add.image(x,y,'ring').setDepth(2750).setBlendMode('ADD').setTint(hex).setScale(.2);this.tweens.add({targets:r,scale:big?2.4:1.4,alpha:0,duration:260,onComplete:()=>r.destroy()});this.time.delayedCall(700,()=>p.destroy())}
 hitstop(ms){if(this.hsT)return;this.tweens.pauseAll();this.hsT=setTimeout(()=>{this.hsT=0;if(this.sys&&this.sys.isActive())this.tweens.resumeAll()},ms)}
 ghost(u){const s=u.s;if(!s.active)return;const g=this.add.image(s.x,s.y,s.texture.key).setOrigin(.5,1).setScale(s.scaleX,s.scaleY).setAngle(s.angle).setDepth(s.depth-1).setTintFill(u.col||0xff2a4a).setAlpha(.4).setBlendMode('ADD');this.tweens.add({targets:g,alpha:0,duration:260,onComplete:()=>g.destroy()})}
 kick(u,amt=18){const dir=u.hero?1:-1;if(u.kt&&u.kt.isPlaying())return;u.kt=this.tweens.add({targets:u.s,x:u.s.x+dir*amt,duration:70,yoyo:true,ease:'Quad.out'})}
 float(u,str,col,dy=0){const t=T(this,u.x,u.s.y-u.h-20+dy,str,22,col).setOrigin(.5).setDepth(2800);this.tweens.add({targets:t,y:'-=40',alpha:0,duration:1100,delay:300,onComplete:()=>t.destroy()})}
 async die(u){u.alive=false;u.idle&&u.idle.stop();u.breath&&u.breath.stop();if(u.hero){SFX.play('ko');u.gauge=0;u.st={};u.amb&&u.amb.stop();this.tweens.add({targets:u.s,alpha:.35,angle:8,duration:400});this.float(u,'K.O.','#ff2a4a');return}
  this.drawEBar(u);const s=u.s;s.disableInteractive();SFX.play('death');s.setTintFill(0xffffff);
  const fw=s.frame.width,fh=s.frame.height,dh=s.displayHeight,dw=s.displayWidth,top=s.y-dh;
  const p=this.add.particles(0,0,'dot',{speedY:{min:-240,max:-60},speedX:{min:-70,max:70},lifespan:{min:400,max:850},scale:{start:.45,end:0},tint:[COL.pink,COL.cyan,COL.gold,0xffffff],blendMode:'ADD',emitting:false}).setDepth(2700);
  this.time.delayedCall(100,()=>{if(s.active){s.clearTint();s.setTint(0xff70e0)}});
  const o={p:0};this.tweens.add({targets:o,p:1,duration:900,delay:100,ease:'Sine.in',onUpdate:()=>{if(!s.active||!p.scene)return;s.setCrop(0,fh*o.p,fw,fh*(1-o.p)+1);const ly=top+dh*o.p;for(let i=0;i<5;i++)p.emitParticleAt(s.x+rnd(-dw*.38,dw*.38),ly+rnd(-4,4),1)},onComplete:()=>{s.active&&s.setVisible(false);this.time.delayedCall(900,()=>p.destroy())}});
  this.tweens.add({targets:u.sh,alpha:0,duration:900})}
 // --- colpo a tempo (QTE)
 qte(tg,label){if(this.auto){if(window.__pcQ)return Promise.resolve(window.__pcQ());const r=Math.random();return Promise.resolve(r<.05?1.4:r<.2?1.15:1)}
  return new Promise(res=>{const c=this.center(tg);const o={r:140};let done=false;const g=this.qteG;this.qteO=o;
   if(!this.tutQ){this.tutQ=true;this.hint.setText('Tocca lo schermo quando il cerchio è sul bersaglio!')}
   const draw=()=>{g.clear();g.lineStyle(4,0xffd34d,1).strokeCircle(c.x,c.y,40);g.lineStyle(6,0xffffff,.9).strokeCircle(c.x,c.y,o.r);g.fillStyle(0xffd34d,.15).fillCircle(c.x,c.y,40)};
   const fin=v=>{if(done)return;done=true;this.qteO=null;tw.stop();g.clear();this.input.off('pointerdown',tap);this.input.keyboard.off('keydown-SPACE',tap);
    if(v>=1.4){this.stats.perf++;SFX.play('perfect');this.float(tg,'PERFETTO!','#ffd34d',-70);this.cameras.main.flash(80,255,220,120)}else if(v>1)this.float(tg,'BUONO','#9fdcff',-70);res(v)};
   const tap=()=>{const d=Math.abs(o.r-40);fin(d<=12?1.4:d<=30?1.15:1)};
   const tw=this.tweens.add({targets:o,r:12,duration:750,onUpdate:draw,onComplete:()=>fin(1)});draw();
   this.time.delayedCall(30,()=>{if(!done){this.input.on('pointerdown',tap);this.input.keyboard.on('keydown-SPACE',tap)}})})}
 // --- effetti
 async lunge(u,tg,off=130){const x0=u.x,s=u.s,dir=u.hero?-1:1;await this.tw({targets:s,x:x0-dir*24,duration:110,ease:'Quad.out'});
  this.time.addEvent({delay:28,repeat:5,callback:()=>this.ghost(u)});s.setAngle(dir*6);
  await this.tw({targets:s,x:tg.x+(u.hero?off:-off),duration:170,ease:'Cubic.out'});s.setAngle(0);return()=>this.tw({targets:s,x:x0,duration:240,ease:'Cubic.inOut'})}
 slash(tg,col=COL.red,flip,big,mute){if(!mute)SFX.play('sword');const c=this.center(tg);const g=this.add.graphics().setDepth(2700).setBlendMode('ADD');const r=big?150:95;
  g.lineStyle(big?22:14,col,.9);g.beginPath();g.arc(0,0,r,flip?Math.PI*1.15:-.35,flip?Math.PI*1.85:.95*Math.PI*.6+.6,false);g.strokePath();g.lineStyle(4,0xffffff,1);g.beginPath();g.arc(0,0,r,flip?Math.PI*1.15:-.35,flip?Math.PI*1.85:.95*Math.PI*.6+.6,false);g.strokePath();
  g.setPosition(c.x,c.y).setRotation(rnd(-.5,.5));this.tweens.add({targets:g,alpha:0,scale:1.3,duration:260,onComplete:()=>g.destroy()})}
 shot(u,tg,col=0xffd34d,w=3){const a=this.hand(u),b=this.center(tg);b.x+=rnd(-25,25);b.y+=rnd(-30,30);const g=this.add.graphics().setDepth(2700).setBlendMode('ADD');
  SFX.play(u.hero?'gun':'laser');const fl=this.add.image(a.x,a.y,'star').setDepth(2710).setBlendMode('ADD').setTint(col).setScale(.9).setRotation(rnd(0,3));this.tweens.add({targets:fl,scale:.2,alpha:0,duration:110,onComplete:()=>fl.destroy()});
  if(u.k=='ras'){const sh=this.add.particles(0,0,'shell',{x:a.x+20,y:a.y,speedX:{min:80,max:180},speedY:{min:-260,max:-160},gravityY:900,rotate:{min:0,max:720},lifespan:600,emitting:false}).setDepth(2700);sh.explode(1);this.time.delayedCall(700,()=>sh.destroy());this.kick(u,8)}
  g.lineStyle(w*4,col,.25).lineBetween(a.x,a.y,b.x,b.y);g.lineStyle(w,col,1).lineBetween(a.x,a.y,b.x,b.y);g.fillStyle(0xffffff,1).fillCircle(a.x,a.y,10);g.fillStyle(col,1).fillCircle(b.x,b.y,8);this.tweens.add({targets:g,alpha:0,duration:140,onComplete:()=>g.destroy()})}
 whip(u,tg,col=COL.pink){const a=this.hand(u),b=this.center(tg);const ctrl=new Phaser.Math.Vector2((a.x+b.x)/2,Math.min(a.y,b.y)-rnd(80,180));
  const curve=new Phaser.Curves.QuadraticBezier(new Phaser.Math.Vector2(a.x,a.y),ctrl,new Phaser.Math.Vector2(b.x+rnd(-20,20),b.y+rnd(-30,30)));const pts=curve.getPoints(28);
  const g=this.add.graphics().setDepth(2700).setBlendMode('ADD');const o={p:0};SFX.play('whip');this.kick(u,-14);
  const tr=this.add.particles(0,0,'dot',{speed:{min:20,max:90},lifespan:{min:250,max:500},scale:{start:.4,end:0},tint:[col,COL.cyan,0xffffff],blendMode:'ADD',emitting:false}).setDepth(2700);this.time.delayedCall(900,()=>tr.destroy());
  return this.tw({targets:o,p:1,duration:170,onUpdate:()=>{g.clear();const n=Math.max(2,Math.floor(pts.length*o.p));const sub=pts.slice(0,n);const hd=sub[sub.length-1];tr.scene&&tr.emitParticleAt(hd.x,hd.y,3);
   g.lineStyle(16,col,.35).strokePoints(sub);g.lineStyle(7,COL.cyan,.8).strokePoints(sub);g.lineStyle(2,0xffffff,1).strokePoints(sub)}}).then(()=>{
   const e=pts[pts.length-1];const sp=this.add.particles(0,0,'dot',{x:e.x,y:e.y,speed:{min:60,max:200},lifespan:350,scale:{start:.5,end:0},tint:[col,COL.cyan,0xffffff],blendMode:'ADD',emitting:false}).setDepth(2700);sp.explode(14);
   this.tweens.add({targets:g,alpha:0,duration:180,onComplete:()=>{g.destroy();sp.destroy()}})})}
 async charge(u,ms=380){const a=this.hand(u);SFX.play('charge');const p=this.add.particles(0,0,'dot',{emitZone:{type:'edge',source:new Phaser.Geom.Circle(a.x,a.y,110),quantity:30},moveToX:a.x,moveToY:a.y,lifespan:ms*.75,frequency:12,quantity:2,scale:{start:.15,end:.45},tint:[0xff1040,0xff6080,0xffffff],blendMode:'ADD'}).setDepth(2700);
  const gl=this.add.image(a.x,a.y,'dot').setDepth(2710).setBlendMode('ADD').setTint(0xff2050).setScale(0);this.tweens.add({targets:gl,scale:3.2,duration:ms,ease:'Quad.in'});
  await this.wait(ms);p.stop();this.time.delayedCall(400,()=>p.destroy());this.tweens.add({targets:gl,scale:0,alpha:0,duration:200,onComplete:()=>gl.destroy()})}
 beam(u,tg,full){const a=this.hand(u),b=full?{x:-50,y:this.center(tg).y}:this.center(tg);const g=this.add.graphics().setDepth(2700).setBlendMode('ADD');SFX.play('rail');this.kick(u,full?40:26);
  const L=Math.hypot(b.x-a.x,b.y-a.y),pp=this.add.particles(0,0,'dot',{speed:{min:20,max:120},lifespan:{min:300,max:700},scale:{start:.4,end:0},tint:[0xff1040,0xff6080,0xffffff],blendMode:'ADD',emitting:false}).setDepth(2700);
  for(let i=0;i<(full?70:36);i++){const k=Math.random();pp.emitParticleAt(a.x+(b.x-a.x)*k,a.y+(b.y-a.y)*k+rnd(-8,8),1)}this.time.delayedCall(900,()=>pp.destroy());
  const rg=this.add.image(a.x,a.y,'ring').setDepth(2710).setBlendMode('ADD').setTint(0xff2050).setScale(.3);this.tweens.add({targets:rg,scale:full?3:2,alpha:0,duration:300,onComplete:()=>rg.destroy()});if(full)this.cameras.main.flash(120,255,60,90);
  g.lineStyle(full?40:22,0xff1040,.45).lineBetween(a.x,a.y,b.x,b.y);g.lineStyle(full?14:8,0xff6080,1).lineBetween(a.x,a.y,b.x,b.y);g.lineStyle(3,0xffffff,1).lineBetween(a.x,a.y,b.x,b.y);
  g.fillStyle(0xffffff,1).fillCircle(a.x,a.y,full?22:14);this.cameras.main.shake(full?260:120,full?.012:.005);this.tweens.add({targets:g,alpha:0,duration:full?500:260,onComplete:()=>g.destroy()})}
 sparkle(u,col=COL.green){SFX.play('heal');const c=this.center(u);const p=this.add.particles(0,0,'dot',{x:{min:c.x-50,max:c.x+50},y:{min:c.y,max:c.y+90},speedY:{min:-160,max:-60},lifespan:700,scale:{start:.5,end:0},tint:[col,0xffffff],blendMode:'ADD',emitting:false}).setDepth(2700);p.explode(24);this.time.delayedCall(800,()=>p.destroy())}
 async banner(str,col='#ffd34d'){const t=T(this,W/2,250,str,44,col,{strokeThickness:8}).setOrigin(.5).setDepth(2900).setAlpha(0);await this.tw({targets:t,alpha:1,duration:150});this.time.delayedCall(700,()=>this.tw({targets:t,alpha:0,duration:200}).then(()=>t.destroy()))}
 live(){return this.enemies.filter(e=>e.alive)}
 // --- azioni eroi
 async execHero(u,a,tg){if(u.k=='lyra')this.lyraBusy=true;try{await this.execHero2(u,a,tg)}finally{this.lyraBusy=false}}
 async execHero2(u,a,tg){const live=()=>this.live();const nm=a.n||({attack:u.attack.n,furia:u.furia.n,guard:'Difesa'})[a.id];
  if(a.id!='item'&&nm)this.banner(nm,u.hex);
  if(a.id=='guard'){u.st.guard=1;u.mp=Math.min(u.maxmp,u.mp+8);this.float(u,'IN GUARDIA','#4aa8ff');await this.wait(500);return this.end()}
  if(a.id=='item'){const it=this.items[a.item];it.q--;this.banner(it.n,'#34ff8a');
   if(a.item=='medikit'){const p=this.party.filter(p=>p.alive).sort((x,y)=>x.hp/x.maxhp-y.hp/y.maxhp)[0];p.hp=Math.min(p.maxhp,p.hp+120);this.sparkle(p);this.float(p,'+120 PV','#34ff8a')}
   if(a.item=='stim'){const p=this.party.filter(p=>p.alive).sort((x,y)=>x.mp/x.maxmp-y.mp/y.maxmp)[0];p.mp=Math.min(p.maxmp,p.mp+40);this.sparkle(p,COL.blue);this.float(p,'+40 PM','#4aa8ff')}
   if(a.item=='emp'){this.cameras.main.flash(200,120,200,255);for(const e of live()){await this.hurt(e,60,'#9fdcff','EMP');if(e.flying&&e.alive)e.st.stun=1;if(e.shield){e.shield=false;SFX.play('shatter');this.float(e,'SCUDO OFF','#00f0ff',-40)}}}
   await this.wait(500);return this.end()}
  if(u.k=='ras'){
   if(a.id=='attack'){const back=await this.lunge(u,tg);
    for(const [i,p] of [[0,.75],[1,.75],[2,.9]]){if(!tg.alive)break;const q=await this.qte(tg);if(i<2){this.slash(tg,COL.red,i==1);await this.hit(u,tg,p,{qte:q,melee:1})}else{this.shot(u,tg);this.shot(u,tg);await this.hit(u,tg,p,{qte:q,gun:1})}await this.wait(110)}
    await back()}
   if(a.id=='raffica'){for(let i=0;i<6;i++){const t=pick(live());if(!t)break;this.shot(u,t);await this.hit(u,t,.42,{gun:1,furia:2});await this.wait(110)}}
   if(a.id=='fendente'){const back=await this.lunge(u,tg);const q=await this.qte(tg);this.tweens.add({targets:u.s,y:u.y-60,duration:120,yoyo:true});await this.wait(120);this.slash(tg,COL.red,0,1);this.cameras.main.shake(150,.008);await this.hit(u,tg,2.1,{qte:q,breakShield:1,melee:0});await back()}
   if(a.id=='furia'){u.furia=0;this.cameras.main.flash(250,255,40,60);const x0=u.x;
    for(const e of live()){await this.tw({targets:u.s,x:e.x-40,duration:110});this.slash(e,COL.red,0,1);this.slash(e,COL.gold,1,1);if(e.shield){e.shield=false}await this.hit(u,e,2.6,{breakShield:1,furia:0,big:1})}
    await this.tw({targets:u.s,x:x0,duration:300});await this.quip('alba','ras','RAS','Alba Rossa. Ricordatevi il nome.')}}
  if(u.k=='lyra'){
   if(a.id=='attack'){for(let i=0;i<2;i++){if(!tg.alive)break;const q=await this.qte(tg);await this.whip(u,tg);await this.hit(u,tg,.85,{qte:q,melee:1});await this.wait(90)}}
   if(a.id=='laccio'){const q=await this.qte(tg);await this.whip(u,tg,COL.purple);await this.whip(u,tg,COL.cyan);
    const d=await this.hit(u,tg,.9,{qte:q,breakShield:1});if(tg.alive){tg.st.stun=1;tg.gauge=0;this.float(tg,'LEGATO!','#b04dff',-70)}}
   if(a.id=='vortice'){this.tweens.add({targets:u.s,angle:360,duration:420});for(const e of live()){this.whip(u,e,pick([COL.pink,COL.purple]));}await this.wait(180);for(const e of live())await this.hit(u,e,.8,{melee:1,furia:3})}
   if(a.id=='scintilla'){for(const p of this.party.filter(p=>p.alive)){const h=Math.round(p.maxhp*.28);p.hp=Math.min(p.maxhp,p.hp+h);this.sparkle(p,COL.pink);this.float(p,'+'+h+' PV','#34ff8a')}await this.wait(600)}
   if(a.id=='furia'){u.furia=0;this.cameras.main.flash(250,255,60,200);for(let k=0;k<2;k++)for(const e of live())this.whip(u,e,pick([COL.pink,COL.purple,COL.cyan]));await this.wait(220);
    for(const e of live())await this.hit(u,e,1.9,{furia:0,big:1,breakShield:1});this.party.forEach(p=>{if(p.alive){p.st.haste=3;this.sparkle(p,COL.cyan)}});this.float(u,'SQUADRA VELOCE!','#00f0ff',-60);
    await this.quip('tempesta','lyra','LYRA','Vi piace lo spettacolo? Il biglietto lo pagate voi.')}}
  if(u.k=='sable'){
   if(a.id=='attack'){await this.charge(u,300);const q=await this.qte(tg);this.beam(u,tg);await this.hit(u,tg,1.25,{qte:q,gun:1,furia:6})}
   if(a.id=='mirino'){const c=this.center(tg);const g=this.add.graphics().setDepth(2700);g.lineStyle(3,0xff2040,1).strokeCircle(c.x,c.y,50).lineBetween(c.x-70,c.y,c.x+70,c.y).lineBetween(c.x,c.y-70,c.x,c.y+70);
    await this.tw({targets:g,scale:{from:1.8,to:1},alpha:{from:0,to:1},duration:300});this.time.delayedCall(500,()=>g.destroy());tg.st.mark=3;this.float(tg,'MARCATO','#ff2a4a');this.drawEBar(tg);u.furia=Math.min(100,u.furia+10);await this.wait(300)}
   if(a.id=='carica'){this.float(u,'CARICA…','#ff6080');await this.charge(u,520);this.beam(u,live()[0],true);for(const e of live())await this.hit(u,e,1.0,{pierce:1,gun:1,furia:3})}
   if(a.id=='baionetta'){const back=await this.lunge(u,tg,110);const q=await this.qte(tg);this.slash(tg,COL.cyan);const d=await this.hit(u,tg,1.1,{qte:q,melee:1});if(d&&tg.alive){tg.st.bleed=3;this.drawEBar(tg)}await back()}
   if(a.id=='furia'){u.furia=0;this.cameras.main.flash(120,255,255,255);this.add.rectangle(W/2,H/2,W,H,0x000000,.6).setDepth(2600).setName('dark');await this.charge(u,700);
    this.beam(u,tg,false);await this.hit(u,tg,5,{pierce:1,crit:1,furia:0,big:1});this.children.getByName('dark').destroy();await this.quip('unico','sable','SABLE','Un colpo. Un nome in meno sulla lista.')}}
  // marcatura si consuma
  if(tg&&tg.st.mark&&a.id!='mirino'){tg.st.mark--;tg.alive&&this.drawEBar(tg)}
  await this.wait(200);this.end()}
 // --- IA nemici
 tgtHero(){const l=this.party.filter(p=>p.alive);const w=l.map(p=>1.5-p.hp/p.maxhp);let r=Math.random()*w.reduce((a,b)=>a+b,0);for(let i=0;i<l.length;i++){r-=w[i];if(r<=0)return l[i]}return l[0]}
 async eLunge(e,t){if(e.flying)return async()=>{};return this.lunge(e,t,150)}
 async enemyAct(e){e.turns++;const t=this.tgtHero();if(!t)return this.end();const say=n=>this.banner(n,'#ff6080');
  if(e.k=='ratto'){if(Math.random()<.7){say('Tubo Chiodato');const b=await this.eLunge(e,t);this.slash(t,0xff8a3a);await this.hit(e,t,1);await b()}
   else{say('Catena');const b=await this.eLunge(e,t);for(let i=0;i<2;i++){this.slash(t,0xaaaaaa,i);await this.hit(e,t,.6);await this.wait(120)}await b()}}
  if(e.k=='drone'){if(Math.random()<.75){say('Laser Vespa');this.shot(e,t,0xff3030,5);await this.hit(e,t,.95)}else{say('Raffica Pungiglione');for(const p of this.party.filter(p=>p.alive)){this.shot(e,p,0xff3030,4);await this.hit(e,p,.5)}}}
  if(e.k=='agente'){if(!e.shield&&Math.random()<.5){say('Rialza lo scudo');SFX.play('shield');e.shield=true;this.float(e,'SCUDO SU','#00f0ff');this.drawEBar(e);await this.wait(500)}
   else{say('Manganello Elettrico');const b=await this.eLunge(e,t);this.slash(t,COL.cyan);const d=await this.hit(e,t,1.05);if(d&&Math.random()<.35&&t.alive){t.gauge=0;this.float(t,'SCOSSA! ATB A ZERO','#00f0ff',-70)}await b()}}
  if(e.k=='infermiera'){const low=this.live().filter(x=>x!==e&&x.hp/x.maxhp<.6).sort((a,b)=>a.hp/a.maxhp-b.hp/b.maxhp)[0]||(e.hp/e.maxhp<.4?e:null);
   if(low&&Math.random()<.8){say('Cura d\'urgenza');const h=Math.round(low.maxhp*.3);low.hp=Math.min(low.maxhp,low.hp+h);this.sparkle(low,COL.pink);this.float(low,'+'+h,'#34ff8a');this.drawEBar(low);await this.wait(600);
    await this.quip('nurse','sable','SABLE','L\'infermiera li rimette in piedi. Lei per prima.')}
   else{say('Siringa Velenosa');this.shot(e,t,0xff40ff,6);const d=await this.hit(e,t,.85);if(d&&t.alive){t.st.poison=3;this.float(t,'AVVELENATO','#a0ff60',-70)}}}
  if(e.k=='mastino'){const r=e.hp/e.maxhp;
   if(!e.howled&&r<=.5){e.howled=1;say('Ululato');SFX.play('roar');this.cameras.main.shake(400,.01);await this.wait(400);
    if(this.live().length<3){const pos=[[560,440],[130,455]].find(p=>!this.live().some(x=>Math.abs(x.x-p[0])<60));if(pos){const u={k:'ratto',...ENEMIES.ratto,maxhp:ENEMIES.ratto.hp,gauge:0,st:{},x:pos[0],y:pos[1],alive:true,turns:0};this.spawn(u);this.enemies.push(u)}}
    await this.say(null,'IL MASTINO','RATTI! Venite a mangiare!',1800);return this.end()}
   if(!e.enraged&&r<=.3){e.enraged=1;SFX.play('roar');this.cameras.main.shake(300,.008);e.s.setTint(0xff7070);say('IL MASTINO È FURIOSO!');await this.wait(600)}
   if(e.charging){e.charging=0;this.drawEBar(e);SFX.play('chainsaw');
    if(e.enraged){say('MOTOSEGA FURIOSA');for(const p of this.party.filter(p=>p.alive)){this.slash(p,0xff2020,0,1);await this.hit(e,p,1.5,{big:1})}}
    else{say('MOTOSEGA FURIOSA');const b=await this.eLunge(e,t);for(let i=0;i<3;i++){this.slash(t,0xff2020,i%2,1);this.cameras.main.shake(100,.008);await this.hit(e,t,.85,{big:1});await this.wait(90)}await b()}}
   else if(e.turns%3==0){e.charging=1;this.drawEBar(e);SFX.play('chainsaw');SFX.play('roar',.3);say('Il Mastino carica la motosega ⚠️');this.tweens.add({targets:e.s,x:e.x-20,duration:50,yoyo:true,repeat:6});await this.wait(800);
    await this.quip('charge','ras','KIRI (radio)','Sta caricando! DIFESA, adesso!')}
   else if(Math.random()<.6){say('Motosega');SFX.play('chainsaw');const b=await this.eLunge(e,t);this.slash(t,0xff2020,0,1);await this.hit(e,t,1.3);await b()}
   else{say('Morso d\'Acciaio');const b=await this.eLunge(e,t);this.slash(t,0xffffff,1);const d=await this.hit(e,t,1.0);if(d){const h=Math.round(d*.5);e.hp=Math.min(e.maxhp,e.hp+h);this.float(e,'+'+h,'#34ff8a');this.drawEBar(e)}await b()}}
  await this.wait(200);this.end()}
 async checkEnd(){if(this.ended)return;if(this.party.every(p=>!p.alive)){this.ended=1;this.busy=true;this.clearMenu();return this.lose()}
  if(this.enemies.length&&this.live().length==0){this.busy=true;this.clearMenu();this.menuFor=null;await this.wait(1150);
   this.enemies.forEach(e=>{e.s.destroy();e.sh.destroy();e.bar.destroy();e.lbl.destroy();e.icons.destroy()});this.enemies=[];
   if(this.wave==0)await this.say('lyra','LYRA','Tutto qui, i Ratti di Ferro? Mi aspettavo almeno un ballo.');
   if(this.wave==1)await this.say('sable','SABLE','Strada libera. Il Mastino è in fondo al vicolo. Lo sento ringhiare da qui.');
   if(this.wave==2){this.ended=1;return this.win()}
   this.party.forEach(p=>{if(!p.alive){p.alive=true;p.hp=1;p.s.setAlpha(1).setAngle(0);this.idleOn(p);p.amb&&p.amb.start()}p.hp=Math.min(p.maxhp,Math.round(p.hp+p.maxhp*.25));p.mp=Math.min(p.maxmp,p.mp+20);p.st={};this.sparkle(p)});
   this.float(this.party[1],'+25% PV  +20 PM','#34ff8a');this.refresh();await this.wait(700);this.startWave(this.wave+1)}}
 async win(){window.__pc.state='win';SFX.play('win');SFX.music('title');await this.say('ras','RAS','Il Mastino è a terra. Da stanotte questo vicolo è della famiglia.',2600);
  await this.say('lyra','LYRA','Mi offri da bere, Don?',1800);await this.say('sable','SABLE','…Paga lui.',1800);this.endScreen(true)}
 lose(){window.__pc.state='lose';SFX.play('lose');SFX.stopMusic();this.endScreen(false)}
 endScreen(win){const D=5000;this.add.rectangle(W/2,H/2,W,H,0x000000,.78).setDepth(D).setInteractive();
  T(this,W/2,200,win?'VITTORIA':'SCONFITTA',96,win?'#ffd34d':'#ff2a4a',{strokeThickness:10}).setOrigin(.5).setDepth(D+1);
  const sec=Math.round((Date.now()-this.stats.start)/1000);
  T(this,W/2,320,win?'Il Vicolo Neon è della famiglia di Ras.':'"Ras… rispondimi. RAS!" — Kiri',28,win?'#fff':'#ff9aa8').setOrigin(.5).setDepth(D+1);
  T(this,W/2,380,'Colpi PERFETTI: '+this.stats.perf+'   ·   Turni: '+this.stats.turns+'   ·   Tempo: '+Math.floor(sec/60)+'m '+(sec%60)+'s',22,'#00f0ff').setOrigin(.5).setDepth(D+1);
  button(this,W/2-170,500,300,74,'↻ RIGIOCA',()=>{this.setSpeed(1);this.scene.restart()},COL.pink,26).setDepth(D+1);
  button(this,W/2+170,500,300,74,'⌂ TITOLO',()=>{this.setSpeed(1);this.scene.start('title')},COL.cyan,26).setDepth(D+1);
  T(this,W/2,640,'Punk City · prototipo di battaglia · Infinity Frame Studios',16,'#888').setOrigin(.5).setDepth(D+1)}}

const game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W,height:H,backgroundColor:'#05010a',
 scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},input:{activePointers:2},scene:[Boot,Title,Battle]});
window.__game=game;
// ---------- ROTAZIONE: si riadatta ad ogni giro del telefono, senza ricaricare ----------
(()=>{const body=document.body;
 const fit=()=>{const vv=window.visualViewport,w=vv?vv.width:innerWidth,h=vv?vv.height:innerHeight;
  const touch=('ontouchstart' in window)||navigator.maxTouchPoints>0;body.classList.toggle('portrait',h>w&&(touch||w<900));
  window.scrollTo(0,0);try{game.scale.refresh()}catch(e){}};
 let tm=[];const sched=()=>{tm.forEach(clearTimeout);fit();tm=[50,150,350,700,1200].map(ms=>setTimeout(fit,ms))};
 addEventListener('resize',sched);addEventListener('orientationchange',sched);addEventListener('pageshow',sched);
 if(window.visualViewport){visualViewport.addEventListener('resize',sched);visualViewport.addEventListener('scroll',()=>window.scrollTo(0,0))}
 if(screen.orientation&&screen.orientation.addEventListener)screen.orientation.addEventListener('change',sched);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)sched()});
 const ok=document.getElementById('rotok');if(ok)ok.addEventListener('click',()=>{body.classList.add('ok');sched()});
 game.events.once('ready',sched);sched();window.__fit=sched})();
