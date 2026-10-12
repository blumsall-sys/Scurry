import {CROPS,SEASONS,MAPS,INTERIORS,NPCS,HOMES,BUILDINGS,RECIPES,FACTIONS,QUESTS,PORTALS,ITEM_NAMES,newState,seasonForDay,seasonDay,clamp,seededHash} from './data.js';
import {world,initializeWorld,mapTile,blocked,canMove,objectAt,doorwayNear,portalNear,validBuild,inFarmPlot,collected} from './world.js';
const distance=(x,y,a,b)=>Math.hypot(x-a,y-b), money=n=>`${Math.floor(n)} shells`;
export class Game {
 constructor(ui){this.ui=ui;initializeWorld();this.s=newState();this.keys=new Set();this.buildMode=null;this.paused=true;this.anim=0;this.last=0;this.attacking=0;this.sense=0;this.dash=0;this.dashCd=0;this.hurtCd=0;this.enemies=[];this.particles=[];this.activeMap='';this.accum=0;this.saveElapsed=0;this.audio=null;this.messages=[];}
 start(save){this.s=save||newState();this.s.enemyKills??={};this.s.quests??={};this.s.npcNeeds??={};this.s.flags??={};this.s.settings??={sound:true,volume:.18,dayLength:12,shake:false};this.s.buildings??=[];this.s.crops??={};this.s.gathered??={};this.s.dug??={};this.s.journal??=[];this.s.eventLog??=[];this.s.town??=newState().town;this.s.player.inv??=newState().player.inv;this.s.player.seeds??=newState().player.seeds;this.s.player.skills??=newState().player.skills;this.s.player.xp??=newState().player.xp;this.enter(this.s.player.map,this.s.player.x,this.s.player.y,true);this.paused=false;this.ui.refresh();}
 get p(){return this.s.player;} get map(){return this.p.map;} get season(){return seasonForDay(this.s.day);} get weather(){return this.s.weather;}
 roll(salt=0){this.s.seed=(Math.imul((this.s.seed+salt)|0,1664525)+1013904223)>>>0;return this.s.seed/4294967296;}
 addNews(text){this.s.bulletins.unshift(text);this.s.bulletins=this.s.bulletins.slice(0,25);this.ui.refresh();}
 toast(t){this.ui.toast(t);}
 log(text){this.s.journal.unshift(`Day ${this.s.day}: ${text}`);this.s.journal=this.s.journal.slice(0,60);this.addNews(text);}
 sound(freq=440,dur=.09,type='square'){if(!this.s.settings.sound)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;this.audio??=new C();const o=this.audio.createOscillator(),gain=this.audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,this.audio.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(80,freq*.68),this.audio.currentTime+dur);gain.gain.setValueAtTime(this.s.settings.volume??.15,this.audio.currentTime);gain.gain.exponentialRampToValueAtTime(.0001,this.audio.currentTime+dur);o.connect(gain).connect(this.audio.destination);o.start();o.stop(this.audio.currentTime+dur);}catch{}}
 gainSkill(k,n=1){this.p.xp[k]=(this.p.xp[k]||0)+n;let level=this.p.skills[k]||1;if(level<5&&this.p.xp[k]>=level*20){this.p.xp[k]-=level*20;this.p.skills[k]=level+1;this.toast(`${k.toUpperCase()} LEVEL ${level+1}!`);this.sound(620,.25);} }
 spend(cost){for(const [k,v] of Object.entries(cost)){if(k==='shells'?(this.p.shells<v):((this.p.inv[k]||0)<v))return false;}for(const [k,v] of Object.entries(cost)){if(k==='shells')this.p.shells-=v;else this.p.inv[k]-=v;}return true;}
 canAfford(cost){return Object.entries(cost).every(([k,v])=>k==='shells'?this.p.shells>=v:(this.p.inv[k]||0)>=v);}
 grant(items){for(const [k,v] of Object.entries(items))this.p.inv[k]=(this.p.inv[k]||0)+v;}
 enter(id,x,y,initial=false){if(!MAPS[id])return;this.p.map=id;this.p.x=x;this.p.y=y;this.buildMode=null;this.spawnEnemies();if(!initial){this.sound(510,.09);this.ui.save();}this.ui.refresh();}
 spawnEnemies(){this.enemies=[];const killed=this.s.enemyKills??{};const add=(id,type,x,y)=>{if(killed[`${this.map}:${id}`]===this.s.day)return;this.enemies.push({id,type,x,y,homeX:x,homeY:y,hp:type==='grub'?24:type==='beetle'?38:32,maxhp:type==='grub'?24:type==='beetle'?38:32,attack:0,cool:0,stun:0,warn:0,dead:false,dirX:1,dirY:0});};
 if(this.map==='farm'&&this.s.clods>=3&&this.s.grubs<2){add('tutorial-grub-1','grub',23.5,17.5);add('tutorial-grub-2','grub',26.5,17.5);}
 if(this.map==='tunnel'){[[19,9],[32,27],[49,31],[13,38],[39,39]].forEach(([x,y],i)=>add('tunnel'+i,i%4===0?'beetle':'grub',x+.5,y+.5));}
 if(this.map==='woods'){[[19,30],[31,22],[42,34],[51,19],[35,40]].forEach(([x,y],i)=>add('woods'+i,i%2?'scout':'beetle',x+.5,y+.5));}
 if(this.map==='town'&&this.s.flags.raidActive)for(let i=0;i<3;i++)add('raid'+i,'scout',59+i,46+i*2);
 }
 setKey(k,on){if(on)this.keys.add(k.toLowerCase());else this.keys.delete(k.toLowerCase());}
 direction(){return this.p.face==='up'?[0,-1]:this.p.face==='left'?[-1,0]:this.p.face==='right'?[1,0]:[0,1];}
 target(){const [dx,dy]=this.direction();return [Math.floor(this.p.x+dx*.85),Math.floor(this.p.y+dy*.85)];}
 update(dt){if(this.paused)return;dt=Math.min(dt,.05);this.anim+=dt;this.hurtCd=Math.max(0,this.hurtCd-dt);this.attacking=Math.max(0,this.attacking-dt);this.dash=Math.max(0,this.dash-dt);this.dashCd=Math.max(0,this.dashCd-dt);this.sense=Math.max(0,this.sense-dt);
 let dx=0,dy=0;const k=this.keys;if(k.has('w')||k.has('arrowup'))dy--;if(k.has('s')||k.has('arrowdown'))dy++;if(k.has('a')||k.has('arrowleft'))dx--;if(k.has('d')||k.has('arrowright'))dx++;if(dx||dy){const d=Math.hypot(dx,dy);dx/=d;dy/=d;if(Math.abs(dx)>Math.abs(dy))this.p.face=dx>0?'right':'left';else this.p.face=dy>0?'down':'up';let speed=this.dash>0?13:(k.has('shift')&&this.p.stamina>1?5.0:3.1);if(k.has('shift')&&this.dash<=0){this.p.stamina=Math.max(0,this.p.stamina-dt*6);}const nx=this.p.x+dx*speed*dt,ny=this.p.y+dy*speed*dt;if(canMove(this.map,nx,this.p.y,this.s))this.p.x=nx;if(canMove(this.map,this.p.x,ny,this.s))this.p.y=ny;}
 // Walking across the visible interior threshold also exits. Keep E as the accessible alternative.
 if(INTERIORS.includes(this.map)&&this.p.y>=10.65&&Math.abs(this.p.x-8.5)<.48){this.exitInterior();return;}
 this.p.stamina=clamp(this.p.stamina+dt*(this.p.fullness<15?1:3.4));this.p.fullness=clamp(this.p.fullness-dt*.021);this.s.minute+=dt*(1440/(60*(this.s.settings.dayLength||12)));if(this.s.minute>=1440)this.advanceDay(false);
 for(const e of this.enemies){if(e.dead)continue;e.cool=Math.max(0,e.cool-dt);e.stun=Math.max(0,e.stun-dt);e.warn=Math.max(0,e.warn-dt);const dist=distance(e.x,e.y,this.p.x,this.p.y);if(e.stun>0)continue;if(e.warn>0){if(e.warn<.04&&e.cool<=0){e.cool=1.5;if(dist<(e.type==='scout'?1.85:1.1))this.takeDamage(e.type==='grub'?5:e.type==='beetle'?9:8);this.particles.push({x:e.x,y:e.y,text:'!',life:.5,color:'#f6d18a'});}continue;}
 if(dist<6&&dist>0.75){const sp=e.type==='beetle'?1.15:1.25;const vx=(this.p.x-e.x)/dist,vy=(this.p.y-e.y)/dist;const nx=e.x+vx*sp*dt,ny=e.y+vy*sp*dt;if(canMove(this.map,nx,e.y,this.s,.22))e.x=nx;if(canMove(this.map,e.x,ny,this.s,.22))e.y=ny;e.dirX=vx;e.dirY=vy;}else if(dist>8&&distance(e.x,e.y,e.homeX,e.homeY)>1){const vx=e.homeX-e.x,vy=e.homeY-e.y,d=Math.hypot(vx,vy)||1;if(canMove(this.map,e.x+vx/d*.65*dt,e.y+vy/d*.65*dt,this.s)) {e.x+=vx/d*.65*dt;e.y+=vy/d*.65*dt;}}
 if(dist<(e.type==='scout'?1.8:1.25)&&e.cool<=0){e.warn=e.type==='beetle'?.66:.40;e.cool=1.8;}
 }
 this.particles=this.particles.filter(p=>(p.life-=dt)>0);
 this.accum+=dt;this.saveElapsed+=dt;if(this.accum>.2){this.accum=0;this.ui.refreshFast();}if(this.saveElapsed>75){this.saveElapsed=0;this.ui.save(false);}
 }
 useTool(){if(this.paused)return;const slot=this.p.tool;const [x,y]=this.target();if(slot===1){if(this.hitEnemy())return;this.dig(x,y);}else if(slot===2)this.till(x,y);else if(slot===3)this.plant(x,y);else if(slot===4)this.water(x,y);this.ui.refresh();}
 attack(){if(!this.paused)this.hitEnemy(true);}
 hitEnemy(force=false){if(this.attacking>0||this.p.stamina<3)return false;this.attacking=.38;this.p.stamina-=3;this.sound(290,.07,'sawtooth');const [fx,fy]=this.direction();let hit=false;for(const e of this.enemies){if(e.dead)continue;const vx=e.x-this.p.x,vy=e.y-this.p.y,d=Math.hypot(vx,vy);if(d<1.55&&(vx*fx+vy*fy)/(d||1)>.58){const dmg=8+Math.floor((this.p.skills.combat-1)*2);e.hp-=dmg;e.stun=.22;e.x+=fx*.25;e.y+=fy*.25;this.particles.push({x:e.x,y:e.y,text:'-'+dmg,life:.7,color:'#fff1b9'});this.sound(170,.12,'triangle');hit=true;if(e.hp<=0){e.dead=true;this.s.enemyKills[`${this.map}:${e.id}`]=this.s.day;this.gainSkill('combat',5);this.grant({fiber:1});this.p.shells+=3;this.toast('+3 shells · +1 fibre');if(e.id.startsWith('tutorial')){this.s.grubs++;if(this.s.grubs>=2){this.toast('Garden secured! Inspect the old pipe.');this.storyProgress();}}
 if(e.type==='scout'&&this.s.flags.raidActive){this.s.flags.raidersStopped=(this.s.flags.raidersStopped||0)+1;if(this.s.flags.raidersStopped>=3){this.s.flags.raidActive=false;this.s.town.safety=clamp(this.s.town.safety+12);this.s.town.trust=clamp(this.s.town.trust+4);this.log('Thornband scouts were driven off. Clovercross is safer.');}}
 }}}
 if(!hit&&force)this.toast('Your trowel swishes through the air.');return hit;
 }
 takeDamage(dmg){if(this.hurtCd>0||this.dash>0)return;this.p.hp=clamp(this.p.hp-dmg);this.hurtCd=.6;this.sound(110,.24,'sawtooth');this.particles.push({x:this.p.x,y:this.p.y-1,text:`-${dmg} HP`,life:.75,color:'#e88f81'});if(this.p.hp<=0){this.p.hp=50;this.p.shells=Math.max(0,this.p.shells-10);this.p.map='home';this.p.x=8.5;this.p.y=8.5;this.advanceDay(true);this.enter('home',8.5,8.5,true);this.ui.dialogue('Rest and recovery','Lumi and the neighbours carried you home. You lost up to 10 shells for medicine and one day passed. No permanent death.');this.log('Nim recovered at home after being knocked unconscious.');}}
 dashAction(){if(this.dashCd>0||this.p.stamina<20){this.toast('Dash is recharging, or you need stamina.');return;}this.p.stamina-=20;this.dash=.16;this.dashCd=2;this.sound(570,.16);}
 soilSense(){if(this.p.stamina<8)return this.toast('Not enough energy for Soil Sense.');this.p.stamina-=8;this.sense=3;this.toast('Soil Sense reveals hidden resources!');this.sound(690,.23,'sine');}
 dig(x,y){if(this.p.stamina<6)return this.toast('Too tired to dig. Rest or eat.');const o=(world[this.map]?.objects||[]).find(o=>o.x===x&&o.y===y&&!collected(this.s,this.map,o));if(o?.type==='clod'){this.s.gathered[`${this.map}:${o.id}`]=this.s.day;this.s.clods++;this.grant({clay:1,stone:this.roll()<.4?1:0});this.p.stamina-=6;this.gainSkill('digging',5);this.sound(180,.06);this.toast(`Clod cleared (${this.s.clods}/3). +1 clay`);if(this.s.clods===3){this.spawnEnemies();this.toast('Oh no! Thorn grubs from the garden!');this.storyProgress();}return;}
 const t=mapTile(this.map,x,y,this.s);if(t==='softwall'){this.s.dug[`${this.map}:${x},${y}`]=true;this.p.stamina-=7;this.grant(this.roll()<.18?{metal:1}:{clay:1});this.gainSkill('digging',3);this.sound(155,.08);this.toast('A new tunnel passage opens.');return;}
 if(t==='soil'&&this.map==='farm'){this.p.stamina-=4;this.grant(this.roll()<.2?{stone:1}:{clay:1});this.gainSkill('digging',1);this.sound(160,.05);this.toast('You sift the soil for materials.');return;}
 this.toast('This ground cannot be dug with your trowel.');}
 till(x,y){if(this.map!=='farm'||!inFarmPlot(x,y))return this.toast('Hoe your own garden soil at the farm.');if(this.p.stamina<5)return this.toast('Not enough stamina.');const k=`${x},${y}`;let pl=this.s.crops[k];if(pl?.crop)return this.toast('Something is growing here.');if(!pl)pl={};pl.tilled=true;this.s.crops[k]=pl;this.p.stamina-=5;this.gainSkill('farming',2);this.sound(220,.07);this.toast('Soil tilled. Select seeds with key 3.');}
 plant(x,y){if(this.map!=='farm'||!inFarmPlot(x,y))return this.toast('Plant on your garden plots at the farm.');const key=`${x},${y}`,crop=this.p.crop,c=CROPS[crop],plot=this.s.crops[key];if(!plot?.tilled)return this.toast('Till this soil first with the hoe (2).');if(plot.crop)return this.toast('This plot is already planted.');if(!(this.p.seeds[crop]>0))return this.toast(`No ${c.name} seeds. Buy some at Rook’s store.`);if(!c.seasons.includes(this.season)&&!(crop==='mushroom'&&this.map==='tunnel'))return this.toast(`${c.name} needs ${c.seasons.join(' or ')}.`);this.p.seeds[crop]--;this.s.crops[key]={...plot,crop,days:0,watered:this.s.weather==='rain',fertilized:false};this.p.stamina=clamp(this.p.stamina-3);this.sound(430,.08);this.gainSkill('farming',3);this.toast(`${c.name} planted! Water with key 4.`);}
 water(x,y){const p=this.s.crops[`${x},${y}`];if(!p?.crop)return this.toast('Point toward a planted crop to water it.');p.watered=true;this.p.stamina=clamp(this.p.stamina-2);this.sound(680,.09,'sine');this.toast('Freshly watered!');}
 harvest(x,y){const key=`${x},${y}`,p=this.s.crops[key];if(!p?.crop)return;const c=CROPS[p.crop];if(p.days<c.days)return this.toast(`${c.name}: ${p.days}/${c.days} growing days.`);const bonus=(p.fertilized?1:0)+(this.p.skills.farming>=3?1:0);this.grant({[p.crop]:1+bonus});this.gainSkill('farming',6);this.sound(710,.13);this.toast(`Harvested ${1+bonus} ${c.name}!`);if(c.regrow){p.days=c.days-c.regrow;p.watered=false;p.fertilized=false;}else this.s.crops[key]={tilled:true};this.ui.refresh();}
 // Exterior spawn is deliberately beyond the building footprint, matching its drawn door.
 exitInterior(){
  if(!INTERIORS.includes(this.map))return false;
  const h=HOMES.find(h=>h.to===this.map);
  if(!h){this.toast('The outside doorway could not be found.');return false;}
  const x=h.x+Math.floor(h.w/2)+.5,y=h.y+h.h+1.6;
  if(!canMove(h.map,x,y,this.s)){
   this.toast('The outside doorstep is blocked. Clear the path before leaving.');return false;
  }
  this.enter(h.map,x,y);return true;
 }
 // Reusable keyboard and mouse doorway handler. Keeping it central avoids mismatched triggers.
 enterExteriorDoor(h){
  if(!h?.to)return false;
  this.p.returnDoor=this.map;
  this.enter(h.to,8.5,8.9);return true;
 }
 // Only clicking an actual nearby hotspot activates it, never arbitrary distant canvas clicks.
 clickHotspot(x,y){
  if(this.paused)return false;
  const p=this.p;
  if(INTERIORS.includes(this.map)){
   if(this.map==='home'&&x>=2.8&&x<=7.1&&y>=2.4&&y<=5.5){
    if(distance(p.x,p.y,5,4.5)<=3){this.ui.sleepMenu();}else this.toast('Walk closer to the bed before resting.');
    return true;
   }
   if(x>=7.55&&x<=9.55&&y>=9.7&&y<=11.6){
    if(distance(p.x,p.y,8.5,10.5)<=2.8)this.exitInterior();
    else this.toast('Walk closer to the exit first.');
    return true;
   }
  }else{
   for(const h of HOMES){
    if(h.map!==this.map||!h.to)continue;
    const dx=h.x+Math.floor(h.w/2)+.5,dy=h.y+h.h;
    if(Math.abs(x-dx)<=.8&&Math.abs(y-dy)<=1.1){
     if(distance(p.x,p.y,dx,dy+.5)<2.8)this.enterExteriorDoor(h);
     else this.toast('Walk up to the doorway first.');
     return true;
    }
   }
   for(const portal of PORTALS[this.map]||[]){
    if(distance(x,y,portal.x+.5,portal.y+.5)<1.0){
     if(distance(p.x,p.y,portal.x+.5,portal.y+.5)<2.8)this.enter(portal.to,portal.at[0]+.5,portal.at[1]+.5);
     else this.toast('Walk closer to the travel sign first.');
     return true;
    }
   }
  }
  return false;
 }
 interact(){if(this.paused)return;const id=this.map,p=this.p;
  if(id==='farm'&&this.s.storyStage<=2&&this.s.clods>=3&&this.s.grubs>=2&&distance(p.x,p.y,22.5,15.5)<2.5)return this.ui.pumpChoice();
  // Recognize interior exit before other objects, with no missing-scope globals.
  if(INTERIORS.includes(id)&&distance(p.x,p.y,8.5,10.5)<2.7){this.exitInterior();return;}
  const door=doorwayNear(id,p.x,p.y);
  if(door){this.enterExteriorDoor(door.h);return;}
  const portal=portalNear(id,p.x,p.y);
  if(portal){this.enter(portal.to,portal.at[0]+.5,portal.at[1]+.5);return;}
  if(id==='home'){
   if(distance(p.x,p.y,5,4.5)<2.9)return this.ui.sleepMenu();
   if(distance(p.x,p.y,11,4.5)<2.3)return this.ui.inventory();
  }
  if(id==='shop')return this.ui.shop('rook');if(id==='bakery')return this.ui.shop('tilly');if(id==='clinic')return this.ui.shop('lumi');if(id==='hall')return this.ui.town();if(id==='repair')return this.ui.craft();if(id==='watch')return this.ui.town();
  const npc=this.npcNear(2);if(npc)return this.ui.npc(npc);
  const o=objectAt(this.s,id,p.x,p.y,2);
  if(o){if(o.type==='pipe'&&this.s.grubs>=2&&!this.s.pumpChoice)return this.ui.pumpChoice();if(o.type==='shipping')return this.ui.shipping();if(o.type==='notice'||o.type==='mailbox')return this.ui.bulletin();if(o.type==='townProject'||o.type==='bridgeSite'||o.type==='watchSite')return this.ui.build();if(o.type==='travel'||o.type==='caravan')return this.ui.caravan();if(o.type==='crate')return this.ui.crimeChoice();if(o.type==='fountain'){p.stamina=clamp(p.stamina+12);this.toast('Cool water restores 12 stamina.');return;}if(['wood','stone','metal','herb'].includes(o.type))return this.gather(o);if(o.type==='farmSign')return this.ui.dialogue('Nim’s Garden','Start by clearing clods with the trowel (1), till with the hoe (2), plant seeds (3), and water (4). Crops grow at dawn, if watered.');if(o.type==='tunnelSign'||o.type==='forestSign')return this.ui.dialogue(o.type==='tunnelSign'?'Root Tunnels':'Bramblewood','Stay alert. Some earth is diggable; stone is not. Use F for Soil Sense, Q to swing, K to dash.');}
  const [x,y]=this.target();if(id==='farm'&&this.s.crops[`${x},${y}`]?.crop)return this.harvest(x,y);
  if(id==='farm'&&this.s.crops[`${Math.floor(p.x)},${Math.floor(p.y)}`]?.crop)return this.harvest(Math.floor(p.x),Math.floor(p.y));
  this.toast('Nothing to interact with nearby. Walk closer to a door, item or resident.');
 }
 gather(o){if(this.p.stamina<3)return this.toast('Too tired to gather.');this.s.gathered[`${this.map}:${o.id}`]=this.s.day;let reward=o.type==='wood'?{wood:2,fiber:1}:o.type==='stone'?{stone:2}:o.type==='metal'?{metal:1}:{herb:2};this.grant(reward);this.p.stamina-=3;this.gainSkill('digging',2);this.toast('Gathered '+Object.entries(reward).map(([k,v])=>`+${v} ${k}`).join(', '));this.sound(480,.11);this.ui.refresh();}
 npcPosition(n){if(this.map==='farm'&&n.id==='moss'&&this.s.storyStage===0)return [12.5,17.5];if(this.map!=='town')return null;
 const hour=this.s.minute/60;let px=n.x+.5,py=n.y+.5;if(hour<7||hour>22){const h=HOMES.find(h=>h.to===n.home);if(h){px=h.x+Math.floor(h.w/2)+.5;py=h.y+h.h+1.5;}}
 else if(hour>=12&&hour<14){px=46.5+(n.x%7),py=47.5+(n.y%5);}else if(hour>=17&&hour<20){px=n.x+.5+Math.sin(this.anim*.7+n.x)*1.2;py=n.y+.5+Math.cos(this.anim*.6+n.y)*1.1;}
 return [px,py];}
 npcNear(r){for(const n of NPCS){const pos=this.npcPosition(n);if(pos&&distance(this.p.x,this.p.y,...pos)<r)return n;}return null;}
 meet(n){this.s.relationships[n.id]=(this.s.relationships[n.id]||0)+1;this.p.morale=clamp(this.p.morale+1);if(this.s.storyStage===3&&(n.id==='bram'||n.id==='mara')){this.s.storyStage=4;this.gainSkill('civic',10);this.toast('Clovercross heard about your choice!');this.log(`Spoke with ${n.name}. The town remembers Nim’s decision.`);} }
 gift(n,item){if((this.p.inv[item]||0)<1)return this.toast('Nothing to give.');this.p.inv[item]--;this.s.relationships[n.id]=(this.s.relationships[n.id]||0)+8;this.p.morale=clamp(this.p.morale+4);this.s.town.trust=clamp(this.s.town.trust+1);this.gainSkill('civic',3);this.log(`${n.name} appreciated Nim’s gift of ${ITEM_NAMES[item]||item}.`);this.ui.npc(n);}
 decidePump(route){if(this.s.pumpChoice)return;this.s.pumpChoice=route;this.s.storyStage=3;this.s.flags.pumpKnown=true;
 if(route==='public'){this.s.town.water=clamp(this.s.town.water+24);this.s.town.trust=clamp(this.s.town.trust+15);this.s.town.satisfaction=clamp(this.s.town.satisfaction+7);this.s.factions.council+=15;this.s.factions.rootworkers+=12;this.p.shells+=20;this.log('Nim returned the copper pump component. The public waterworks sputtered back to life! (+20 shells contract fee)');}
 else if(route==='sell'){this.p.shells+=60;this.s.town.water=clamp(this.s.town.water-9);this.s.town.trust=clamp(this.s.town.trust-8);this.s.factions.lantern+=20;this.s.flags.waterShortage=true;this.s.crimeEvidence.push({day:this.s.day,kind:'pump sale',witness:'Mara',discovered:false});this.log('Nim sold the component to Mara for 60 shells. The town pump remains broken.');}
 else{this.s.flags.privateIrrigation=true;this.s.town.water=clamp(this.s.town.water-5);this.s.factions.mosskeepers-=6;this.s.town.trust=clamp(this.s.town.trust-3);this.log('Nim kept the component and installed private irrigation. Neighbours still lack water.');}
 this.gainSkill('civic',10);this.ui.save();this.ui.bulletin(true);
 }
 storyProgress(){if(this.s.storyStage===0&&this.s.clods>=3){this.s.storyStage=1;this.log('Three clods cleared. Strange, angry grubs crawl out of the garden!');}if(this.s.storyStage===1&&this.s.grubs>=2){this.s.storyStage=2;this.log('Garden secured. Inspect the old pipe at the north of the vegetable patch.');}if(this.s.storyStage===4&&this.s.shipped>=1){this.s.storyStage=5;this.log('Your first harvest was shipped. The west footbridge needs repairing.');}if(this.s.storyStage===5&&this.s.bridgeBuilt){this.s.storyStage=6;this.log('West footbridge rebuilt! Take a caravan trip to bring more supplies to Clovercross.');}if(this.s.storyStage===6&&this.s.caravans>=1){this.s.storyStage=7;this.log('Scurry’s open-ended sandbox begins. The town is yours to help or exploit.');}}
 ship(item,qty=1){qty=Math.floor(qty);if(!CROPS[item]||qty<1||this.p.inv[item]<qty)return false;this.p.inv[item]-=qty;const factor=clamp(1+(50-this.s.town.food)/200,.75,1.25);const total=Math.round(CROPS[item].sale*qty*factor);this.p.shells+=total;this.s.town.food=clamp(this.s.town.food+qty*2);this.s.shipped+=qty;this.gainSkill('trading',qty*4);this.storyProgress();this.toast(`Shipped ${qty} ${item} for ${total} shells!`);this.ui.refresh();return true;}
 buySeed(item,qty=1){const c=CROPS[item],sum=c.cost*qty;if(!c||this.p.shells<sum)return this.toast('Not enough shells.');this.p.shells-=sum;this.p.seeds[item]=(this.p.seeds[item]||0)+qty;this.s.town.treasury+=Math.round(sum*.07);this.gainSkill('trading',2);this.toast(`Bought ${qty} ${c.name} seeds.`);this.ui.shop('rook');}
 buyItem(item,cost){if(this.p.shells<cost)return this.toast('Not enough shells.');this.p.shells-=cost;this.grant({[item]:1});this.sound(690,.09);this.ui.shop(item==='meal'?'tilly':'lumi');}
 eat(item){if((this.p.inv[item]||0)<1)return this.toast('You have none of that item.');this.p.inv[item]--;if(item==='poultice'){this.p.hp=clamp(this.p.hp+35);}else{this.p.fullness=clamp(this.p.fullness+30);this.p.hp=clamp(this.p.hp+10);this.p.stamina=clamp(this.p.stamina+20);}this.sound(620,.1);this.toast('Feeling better!');this.ui.inventory();}
 craft(id){const recipe=RECIPES[id];if(!recipe||!this.spend(recipe.cost))return this.toast('Not enough ingredients.');this.grant(recipe.output);this.gainSkill('crafting',6);this.sound(430,.18);this.toast(`Crafted ${recipe.name}!`);this.ui.craft();}
 build(type,x,y){const def=BUILDINGS[type];if(!def)return;const cost=def.cost;if(!this.canAfford(cost))return this.toast('Not enough materials for that project.');if(def.fixed){if(this.map!=='town'&&this.map!=='hall'&&this.map!=='watch')return this.toast('Civic projects are proposed within Clovercross.');if(type==='bridge'){if(this.s.bridgeBuilt)return this.toast('The bridge is already restored.');this.spend(cost);this.s.bridgeBuilt=true;this.s.town.connectivity=clamp(this.s.town.connectivity+30);this.s.town.commerce=clamp(this.s.town.commerce+20);this.s.town.safety=clamp(this.s.town.safety+7);this.s.town.trust=clamp(this.s.town.trust+10);this.s.factions.rootworkers+=12;this.s.town.treasury=Math.max(0,this.s.town.treasury-30);this.p.shells+=30;this.storyProgress();this.log('West footbridge restored! A shorter physical path opens through the stream, and commerce improves. (+30 shell civic contract)');}
 if(type==='watchpost'){if(this.s.flags.watchpost)return this.toast('The town already has a reinforced watch post.');this.spend(cost);this.s.flags.watchpost=true;this.s.town.safety=clamp(this.s.town.safety+24);this.s.town.trust=clamp(this.s.town.trust+5);this.log('Guard post reinforced. Future raids will cause less damage, but upkeep increases.');}this.gainSkill('civic',10);this.ui.save();this.ui.build();return;}
 if(this.map!=='farm')return this.toast('Private construction is only allowed on Nim’s farm.');if(x===undefined||y===undefined){this.buildMode=type;this.ui.close();this.toast(`Choose a clear farm tile to place ${def.name}. Left click to build; ESC cancels.`);return;}
 let w=def.size[0],h=def.size[1];const err=validBuild(this.s,type,this.map,x,y,w,h);if(err)return this.toast(err);this.spend(cost);this.s.buildings.push({type,map:'farm',x,y,w,h,health:100,day:this.s.day});this.buildMode=null;
 if(type==='drain')this.s.town.water=clamp(this.s.town.water+3);if(type==='burrow')this.p.morale=clamp(this.p.morale+10);if(type==='stall')this.s.flags.stall=true;if(type==='fence')this.s.flags.fence=(this.s.flags.fence||0)+1;this.gainSkill('crafting',7);this.log(`${def.name} constructed at the farm, affecting ${type==='drain'?'flood resilience':type==='stall'?'daily income':'farm improvements'}.`);this.ui.save();}
 donate(){if(this.p.inv.wood<2)return this.toast('You need two wood to donate.');this.p.inv.wood-=2;this.s.town.treasury+=8;this.s.town.trust=clamp(this.s.town.trust+3);this.s.factions.council=clamp(this.s.factions.council+4,-100,100);this.gainSkill('civic',4);this.log('Nim donated wood to the Clovercross public-works stockpile.');this.ui.town();}
 stockStall(item,qty){if(!this.s.flags.stall)return this.toast('Build a market stall first.');if((this.p.inv[item]||0)<qty)return this.toast('Not enough crops.');this.p.inv[item]-=qty;this.s.stallStock+=qty;this.toast(`Stocked ${qty} items at your market stall.`);this.ui.shipping();}
 crime(){const witnessed=NPCS.filter(n=>{const p=this.npcPosition(n);return p&&distance(this.p.x,this.p.y,...p)<7;});this.p.shells+=30;this.s.town.commerce=clamp(this.s.town.commerce-3);if(witnessed.length){this.s.crimeEvidence.push({day:this.s.day,kind:'crate theft',witness:witnessed[0].name,discovered:false});this.toast(`${witnessed[0].name} saw something suspicious...`);}else this.toast('Nobody seems to have seen. For now.');this.s.flags.stoleCrateDay=this.s.day;const crate=world.town.objects.find(o=>o.type==='crate');this.s.gathered[`town:${crate.id}`]=this.s.day;this.s.factions.lantern+=2;this.gainSkill('trading',5);this.log('Nim took 30 shells from a locked supply crate.');this.ui.close();}
 restitution(){if(this.p.shells<40)return this.toast('You need 40 shells for restitution.');this.p.shells-=40;this.s.town.heat=clamp(this.s.town.heat-20);this.s.town.trust=clamp(this.s.town.trust+5);this.s.factions.council+=6;this.s.crimeEvidence=[];this.log('Nim paid restitution and restored some public trust.');this.ui.town();}
 setEventWeather(){let r=this.roll(this.s.day);let next=this.season==='summer'?'sunny':this.season==='winter'?'cloudy':'sunny';if(r<.12)next='storm';else if(r<.34)next='rain';else if(r<.54)next='cloudy';else if(r>.92)next='hot';this.s.weather=next;this.s.weatherForecast=next==='storm'?'Storm clouds gathering':next==='rain'?'Showers expected':next==='hot'?'Dry and sunny':'Mostly mild';}
 advanceDay(sleep=false){this.s.day++;this.s.minute=480;this.setEventWeather();this.p.hp=clamp(this.p.hp+(sleep?30:8));this.p.stamina=100;this.p.fullness=clamp(this.p.fullness-(sleep?12:7));this.p.morale=clamp(this.p.morale+(sleep?6:0));let grown=0,dead=0;
 for(const plot of Object.values(this.s.crops)){if(!plot.crop)continue;const c=CROPS[plot.crop];const watered=plot.watered||this.s.weather==='rain'||(this.s.flags.privateIrrigation&&this.map==='farm');if(watered){plot.days++;grown++;}else if(this.s.weather==='hot'&&this.roll()<.18){plot.days=Math.max(0,plot.days-1);dead++;}plot.watered=this.s.weather==='rain';}
 // Day-scale bounded economy: never simulate businesses per animation frame.
 const t=this.s.town;const up=(this.s.flags.watchpost?4:0)+this.s.buildings.filter(b=>b.type==='stall').length*2;
 t.treasury=Math.max(0,t.treasury+Math.round(t.commerce/13)+4-up-(this.s.flags.raidActive?10:0));t.food=clamp(t.food-2+Math.min(grown,6)+2);t.commerce=clamp(t.commerce+((this.s.bridgeBuilt)?1:-.3));t.satisfaction=clamp(t.satisfaction+(t.water>50?.4:-.6)+(t.safety>55?.3:-.5)+(t.food>40?.2:-.6));t.prosperity=clamp((t.commerce+t.satisfaction+t.water)/3);t.heat=clamp(t.heat-2);this.s.shopCash=180;
 // Guards and neighbours can handle a raid even if Nim avoids direct combat.
 if(this.s.flags.raidActive){this.s.flags.raidDays=(this.s.flags.raidDays||0)+1;const defense=t.safety+(this.s.flags.watchpost?25:0)+(this.s.bridgeBuilt?8:0);if(defense>=60||this.s.flags.raidDays>=2){this.s.flags.raidActive=false;this.s.flags.raidDays=0;t.safety=clamp(t.safety+5);this.addNews('The town watch rallied neighbours and sent the remaining Thornband scouts away.');}}
 if(t.satisfaction>69&&t.housing>t.population&&this.s.day%5===0){t.population++;this.addNews('A new resident moves into town, drawn by better services.');}
 for(const n of NPCS){this.s.npcNeeds[n.id]??={food:80,rest:80,safety:80,social:60};const needs=this.s.npcNeeds[n.id];needs.food=clamp(needs.food-12+t.food/12);needs.rest=clamp(needs.rest+20);needs.safety=clamp(needs.safety+(t.safety-50)/12);needs.social=clamp(needs.social+this.roll()*8-5);}
 if(this.s.flags.stall&&this.s.stallStock){const sold=Math.min(this.s.stallStock,Math.ceil((t.commerce+t.trust)/36));this.s.stallStock-=sold;const revenue=Math.round(sold*(12+t.commerce/12));this.p.shells+=revenue;t.treasury+=Math.floor(revenue*.07);this.addNews(`Your roadside stall sold ${sold} goods and earned ${revenue} shells.`);}
 // Evidence becomes common knowledge only after witnessed or investigated.
 for(const evidence of this.s.crimeEvidence){if(evidence.discovered)continue;const chance=evidence.witness?0.58:0.14;if(this.roll()<chance){evidence.discovered=true;t.heat=clamp(t.heat+24);t.trust=clamp(t.trust-13);this.s.factions.council-=12;this.addNews(`Town gossip spread evidence about ${evidence.kind}. Suspicion rises.`);}}
 this.dailyEvent();this.s.eventCooldown=Math.max(0,this.s.eventCooldown-1);this.s.enemyKills={};this.spawnEnemies();this.addNews(`Day ${this.s.day}, ${this.season}: ${this.s.weatherForecast}. ${grown} growing plots advanced${dead?`, ${dead} wilted`:''}.`);this.ui.save();if(sleep)this.ui.bulletin(true);this.ui.refresh();}
 dailyEvent(){if(this.s.day<4||this.s.eventCooldown>0)return;const r=this.roll();const season=this.season;const t=this.s.town;let risk=.19+(this.s.weather==='storm'?.18:0)+((t.ecology<45)?.08:0);if(r>risk)return;this.s.eventCooldown=2;const types=this.s.weather==='storm'?['flood','windstorm','collapse','raid']:season==='summer'?['drought','fire','pests','market','raid']:['flood','pests','market','raid','windstorm','collapse'];const type=types[Math.floor(this.roll()*types.length)];let msg='';
 if(type==='flood'){let mitigated=this.s.buildings.filter(b=>b.type==='drain').length*6+(this.s.flags.privateIrrigation?3:0);let damage=Math.max(1,18-mitigated);t.water=clamp(t.water-damage/2);t.safety=clamp(t.safety-damage/3);msg=`FLASH FLOOD: ${mitigated?'Drainage softened the damage. ':'Low fields were damaged. '}Water service -${Math.round(damage/2)}.`;}
 if(type==='windstorm'){t.commerce=clamp(t.commerce-7);t.safety=clamp(t.safety-3);msg='WINDSTORM: Broken paths delay deliveries. Commerce -7.';}
 if(type==='drought'){let damage=this.s.flags.privateIrrigation?4:13;t.water=clamp(t.water-damage);msg='DROUGHT: Low water stocks slow gardens and businesses. Water -'+damage+'.';}
 if(type==='fire'){let damage=Math.round(13*(1-t.ecology/180));t.safety=clamp(t.safety-damage);t.treasury=Math.max(0,t.treasury-25);msg='FOREST FIRE: The watch contained the blaze, but repairs cost 25 town shells.';}
 if(type==='collapse'){const collapse=Object.keys(this.s.dug);if(collapse.length){let k=collapse[Math.floor(this.roll()*collapse.length)];delete this.s.dug[k];}t.safety=clamp(t.safety-4);msg='TUNNEL COLLAPSE: Unbraced ground gives way. Loose tunnels may need re-digging.';}
 if(type==='pests'){if(this.s.flags.fence)msg='CROP PESTS: The garden fence helps keep most insects away.';else {for(const p of Object.values(this.s.crops))if(p.crop&&this.roll()<.28)p.days=Math.max(0,p.days-1);msg='CROP PESTS: Unprotected fields lose some growth.';}}
 if(type==='market'){t.commerce=clamp(t.commerce-9);t.treasury=Math.max(0,t.treasury-15);msg='MARKET SHORTAGE: A caravan delay lowers commerce and costs the treasury 15 shells.';}
 if(type==='raid'){const defense=(this.s.flags.watchpost?24:0)+Math.round(t.safety/5)+(this.s.bridgeBuilt?5:0);t.safety=clamp(t.safety-Math.max(2,17-defense/4));t.treasury=Math.max(0,t.treasury-Math.max(5,28-defense));this.s.flags.raidActive=true;this.s.flags.raidDays=0;this.s.flags.raidersStopped=0;msg='THORNBAND RAID: Scouts approach Clovercross! A reinforced watch reduces the losses. Defend the town for a reward.';if(this.map==='town')this.spawnEnemies();}
 this.s.pendingEvent={day:this.s.day,type,msg};this.log(msg);
 }
 doCaravan(route,choice){if(this.p.shells<(route==='safe'?16:7))return this.toast('Not enough shells for travel supplies.');this.p.shells-=route==='safe'?16:7;this.s.pendingCaravan={route,choice:'',danger:route==='risky',encounter:this.roll()<.5?'The Thimble Creek is swollen from rain.':'A travelling beetle has broken an axle.',roll:this.roll()};this.ui.caravanEncounter();}
 resolveCaravan(action){const c=this.s.pendingCaravan;if(!c)return;let success=c.route==='safe'?.86:.62;let description='';if(action==='repair'){if((this.p.inv.wood||0)<2)return this.toast('You need 2 wood.');this.p.inv.wood-=2;success+=.13;description='You stop to reinforce the route. ';}else if(action==='help'){if((this.p.inv.herb||0)<1)return this.toast('You need a healing herb.');this.p.inv.herb--;success+=.11;this.s.town.trust=clamp(this.s.town.trust+3);description='You lend a healing herb to a stranger. ';}else if(action==='rush'){success-=.22;description='You take the fastest dangerous shortcut. ';}else if(action==='wait'){success+=.08;this.s.minute+=80;description='You wait for conditions to improve. ';}
 if(c.roll<clamp(success,.1,.97)){const prize=c.route==='safe'?42:72;this.p.shells+=prize;this.grant({metal:2,wood:2});this.s.town.commerce=clamp(this.s.town.commerce+5);this.s.town.treasury+=8;this.s.caravans++;this.gainSkill('trading',11);this.storyProgress();this.log(`${description}Caravan delivered metal and wood to Clovercross. You earned ${prize} shells.`);}else{this.p.hp=clamp(this.p.hp-12);this.s.town.commerce=clamp(this.s.town.commerce-5);this.log(`${description}The caravan limped home after an ambush. Nim was injured (-12 HP).`);}this.s.pendingCaravan=null;this.ui.bulletin(true);this.ui.save();}
 currentQuest(){return QUESTS[Math.min(this.s.storyStage,QUESTS.length-1)];}
 questProgress(){const stage=this.s.storyStage;return stage===0?`${this.s.clods}/3 clods`:stage===1?`${this.s.grubs}/2 grubs`:stage===2?'Inspect the old pipe':stage===3?'Talk to Bram or Mara':stage===4?`${this.s.shipped}/1 crop shipped`:stage===5?'Repair the bridge':stage===6?`${this.s.caravans}/1 caravan`:'Open-world sandbox';}
 currentTime(){const minutes=Math.floor(this.s.minute)%1440;return `${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;}
 }
