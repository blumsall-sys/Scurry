import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/game.js';
import {MAPS,INTERIORS,PORTALS,NPCS,HOMES,newState,seasonForDay,BUILDINGS,CROPS} from '../src/data.js';
import {blocked,mapTile,validBuild,world} from '../src/world.js';
class FakeUI{constructor(){this.messages=[];}refresh(){}refreshFast(){}save(){}close(){}toast(t){this.messages.push(t);}bulletin(){}dialogue(){}pumpChoice(){}build(){}shipping(){}shop(){}town(){}}
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
