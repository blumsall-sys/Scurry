import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.js';
import {MAPS,INTERIORS,PORTALS,NPCS,HOMES,newState,seasonForDay,BUILDINGS,CROPS} from '../src/data.js';
import {blocked,mapTile,validBuild,world} from '../src/world.js';
class FakeUI{constructor(){this.messages=[];this.action=null;}refresh(){}refreshFast(){}save(){}close(){}toast(t){this.messages.push(t);}bulletin(){}dialogue(){}pumpChoice(){}build(){}shipping(){}shop(){}town(){}sleepMenu(){this.action='sleepMenu';}inventory(){this.action='inventory';}}
function make(map='farm'){const ui=new FakeUI();const game=new Game(ui);game.start();game.enter(map,map==='town'?47.5:20.5,map==='town'?48.5:18.5,true);return game;}

test('starter world regions and doors share explicit grounded map coordinates',()=>{const g=make();assert.equal(Object.keys(MAPS).length,11);for(const h of HOMES){assert.ok(h.x>=1&&h.y>=1);assert.ok(h.x+h.w<MAPS[h.map].w);assert.ok(h.y+h.h<MAPS[h.map].h);if(h.to)assert.ok(INTERIORS.includes(h.to));}for(const [from,ps] of Object.entries(PORTALS)){for(const p of ps){assert.ok(MAPS[p.to]);assert.ok(p.x<MAPS[from].w&&p.y<MAPS[from].h);}}assert.equal(g.map,'farm');});

test('planting uses stock and growth happens once per watered dawn',()=>{const g=make();g.s.weather='sunny';g.till(16,18);const initial=g.p.seeds.turnip;g.plant(16,18);assert.equal(g.p.seeds.turnip,initial-1);assert.equal(g.s.crops['16,18'].days,0);g.water(16,18);g.advanceDay();assert.equal(g.s.crops['16,18'].days,1);assert.equal(g.s.crops['16,18'].watered,g.s.weather==='rain');g.s.crops['16,18'].days=3;g.harvest(16,18);assert.equal(g.p.inv.turnip,1);assert.equal(g.s.crops['16,18'].crop,undefined);});

test('the initial 3 clods spawn two enemies and the pump changes independent values',()=>{const g=make();for(const p of [[17,16],[20,17],[22,16]])g.dig(...p);assert.equal(g.s.clods,3);assert.equal(g.s.storyStage,1);assert.equal(g.enemies.filter(e=>!e.dead).length,2);g.s.grubs=2;g.storyProgress();assert.equal(g.s.storyStage,2);const initialWater=g.s.town.water,initialTrust=g.s.town.trust;g.decidePump('public');assert.ok(g.s.town.water>initialWater);assert.ok(g.s.town.trust>initialTrust);assert.equal(g.s.storyStage,3);const g2=make();g2.decidePump('sell');assert.equal(g2.p.shells,100);assert.ok(g2.s.town.water<initialWater);assert.ok(g2.s.crimeEvidence.length>0);});

test('bridge construction actually changes water traversal and town commerce',()=>{const g=make('town');assert.equal(mapTile('town',64,50,g.s),'water');assert.equal(blocked('town',64.5,50.5,g.s),true);g.grant({wood:15,stone:10});const before=g.s.town.commerce;g.build('bridge');assert.equal(g.s.bridgeBuilt,true);assert.equal(mapTile('town',64,50,g.s),'bridge');assert.equal(blocked('town',64.5,50.5,g.s),false);assert.ok(g.s.town.commerce>before);});

test('bad purchases/builds cannot create negative stock',()=>{const g=make();g.p.inv.wood=0;const before=JSON.stringify(g.p.inv);g.build('fence',18,18);assert.equal(JSON.stringify(g.p.inv),before);g.p.shells=0;g.buySeed('turnip',2);assert.equal(g.p.shells,0);});

test('public treasury and personal wallet are not the same account',()=>{const g=make();const wallet=g.p.shells,treasury=g.s.town.treasury;g.donate();assert.equal(g.p.shells,wallet);assert.ok(g.s.town.treasury>treasury);});

test('unwitnessed theft is not instantly known by entire town',()=>{const g=make('town');g.p.x=33.5;g.p.y=43.5;g.s.crimeEvidence=[];const start=g.s.town.heat;g.crime();assert.equal(g.s.town.heat,start);assert.equal(g.p.shells,70);});

test('caravan decisions affect cargo, treasury, and quest, no resource duplication',()=>{const g=make('town');g.s.pendingCaravan={route:'safe',roll:.1};const wallet=g.p.shells;g.resolveCaravan('wait');assert.equal(g.s.caravans,1);assert.ok(g.p.shells>wallet);assert.equal(g.s.pendingCaravan,null);});

test('season rotation and save/load JSON preserve full state',()=>{assert.equal(seasonForDay(1),'spring');assert.equal(seasonForDay(15),'summer');assert.equal(seasonForDay(29),'autumn');assert.equal(seasonForDay(43),'winter');assert.equal(seasonForDay(57),'spring');const g=make();g.till(16,18);g.plant(16,18);const str=JSON.stringify(g.s);const h=make();h.start(JSON.parse(str));assert.deepEqual(h.s.crops,g.s.crops);assert.deepEqual(h.s.town,g.s.town);});

test('interiors and farm garden have safe walkable tiles',()=>{const g=make();assert.equal(blocked('home',8.5,9.5,g.s),false);assert.equal(blocked('farm',20.5,19.5,g.s),false);assert.equal(validBuild(g.s,'fence','farm',19,20),null);});

// Regression tests added after v0.9.1 shipped with a missing INTERIORS import.
test('pressing E by interior EXIT exits home and correctly places Nim outside',()=>{
 const ui=new FakeUI(), g=new Game(ui);g.start();
 assert.equal(g.map,'home');
 assert.doesNotThrow(()=>g.interact());
 assert.equal(g.map,'farm');
 const home=HOMES.find(h=>h.to==='home');
 assert.equal(g.p.x,home.x+Math.floor(home.w/2)+.5);
 assert.ok(g.p.y>=home.y+home.h+1);
 assert.equal(blocked(g.map,g.p.x,g.p.y,g.s),false);
});
test('all seven interior exits share valid, unblocked exterior doorsteps',()=>{
 const ui=new FakeUI(),g=new Game(ui);g.start();
 for(const id of INTERIORS){
  g.enter(id,8.5,8.9);
  assert.doesNotThrow(()=>g.interact(),`${id}: E should never throw`);
  const house=HOMES.find(h=>h.to===id);
  assert.equal(g.map,house.map,`${id}: wrong parent map`);
  assert.ok(!blocked(g.map,g.p.x,g.p.y,g.s),`${id}: exit spawn blocked`);
  assert.ok(Math.hypot(g.p.x-(house.x+Math.floor(house.w/2)+.5),g.p.y-(house.y+house.h+.5))<1.8);
  assert.doesNotThrow(()=>g.interact(),`${id}: should be able to re-enter through same doorway`);
  assert.equal(g.map,id,`${id}: re-entry did not work`);
 }
});
test('bed opens rest interaction with E and with clicking the drawn mattress',()=>{
 const ui=new FakeUI(),g=new Game(ui);g.start();
 g.p.x=5.4;g.p.y=5.5;g.interact();assert.equal(ui.action,'sleepMenu');
 ui.action=null;
 assert.equal(g.clickHotspot(4.2,3.1),true);
 assert.equal(ui.action,'sleepMenu');
 ui.action=null;
 g.p.x=8.5;g.p.y=8.5;
 assert.equal(g.clickHotspot(4.5,3.5),true);
 assert.equal(ui.action,null,'must not teleport to a distant bed');
 assert.ok(ui.messages.some(t=>t.includes('Walk closer to the bed')));
});
test('doorway tiles permit walk-out and auto transition, but surrounding walls stay solid',()=>{
 const ui=new FakeUI(),g=new Game(ui);g.start();
 assert.equal(mapTile('home',8,11,g.s),'floor');
 assert.equal(mapTile('home',7,11,g.s),'wall');
 assert.equal(mapTile('home',9,11,g.s),'wall');
 g.p.x=8.5;g.p.y=10.6;g.setKey('s',true);g.update(.05);g.setKey('s',false);
 assert.equal(g.map,'farm','walking south over the drawn threshold should exit');
});
test('mouse clicking an interior exit or outside door triggers only when close enough',()=>{
 const g=new Game(new FakeUI());g.start();
 assert.equal(g.clickHotspot(8.5,10.9),true);
 assert.equal(g.map,'farm');
 assert.equal(g.clickHotspot(10.5,12.0),true);
 assert.equal(g.map,'home');
});
test('bed sleep advances a single day and original state survives the transition',()=>{
 const ui=new FakeUI(),g=new Game(ui);g.start();g.s.day=2;g.p.shells=61;
 g.p.x=5.5;g.p.y=5.5;g.interact();assert.equal(ui.action,'sleepMenu');
 g.advanceDay(true);assert.equal(g.s.day,3);assert.equal(g.p.shells,61);
 assert.equal(g.map,'home');
});

test('solid town crates and shipping structures block movement without trapping shop doorways',()=>{
 const g=make('town'),crate=world.town.objects.find(o=>o.type==='crate');
 assert.ok(crate);assert.equal(blocked('town',crate.x+.5,crate.y+.5,g.s),true);
 assert.equal(blocked('town',crate.x+.85,crate.y+.5,g.s),true,'crate collision must cover visible sprite footprint');
 for(const h of HOMES.filter(h=>h.map==='town'&&h.to)){
  const x=h.x+Math.floor(h.w/2)+.5,y=h.y+h.h+1.6;
  assert.equal(blocked('town',x,y,g.s),false,'doorstep should stay clear: '+h.to);
 }
});

test('formerly decorative town vegetable bundles are real collectables',()=>{
 const g=make('town'),herbs=world.town.objects.filter(o=>o.type==='herb');
 assert.equal(herbs.length,4);
 const o=herbs[0];g.p.x=o.x-.5;g.p.y=o.y+.5;
 const before=g.p.inv.herb;
 g.activateTarget(o.x+.5,o.y+.5);
 assert.equal(g.p.inv.herb,before+2);
 assert.equal(g.s.gathered[`town:${o.id}`],g.s.day);
});

test('tap/click path requests navigate around physical barriers',()=>{
 const g=make('town');g.p.x=34.5;g.p.y=43.5;
 assert.equal(g.pathTo(41.5,45.5),true);
 for(let i=0;i<140;i++)g.update(.04);
 assert.ok(g.p.x>37,`walked only to ${g.p.x}`);
 assert.equal(blocked('town',g.p.x,g.p.y,g.s),false);
});
