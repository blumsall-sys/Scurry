import {MAPS,INTERIORS,HOMES,PORTALS,seededHash,clamp} from './data.js';
export const world={};
export function initializeWorld(){for(const [id,m] of Object.entries(MAPS))world[id]={id,...m,objects:makeObjects(id)};}
const noise=(x,y)=>seededHash(x,y,1941);
export function mapTile(id,x,y,s){
 if(!MAPS[id]||x<0||y<0||x>=MAPS[id].w||y>=MAPS[id].h)return 'wall';
 if(INTERIORS.includes(id))return (y===11&&x===8)?'floor':(x===0||y===0||x===16||y===11)?'wall':'floor';
 if(s.dug?.[`${id}:${x},${y}`])return 'tunnelFloor';
 if(id==='tunnel'){
  if(x<2||y<2||x>61||y>45)return 'rock';
  // Interconnected system of hand-crafted hollow galleries with diggable walls.
  if((y>=3&&y<=7&&x<=19)||(x>=17&&x<=22&&y>=5&&y<=34)||(y>=24&&y<=29&&x>=18&&x<=54)||(x>=45&&x<=52&&y>=10&&y<=32)||(y>=9&&y<=14&&x>=33&&x<=52)||(y>=36&&y<=40&&x>=5&&x<=58)||(x>=9&&x<=14&&y>=25&&y<=39))return 'tunnelFloor';
  return noise(x,y)<.12?'rock':'softwall';
 }
 if(id==='farm'){
  if(x===0||y===0||x===47||y===47)return 'hedge';
  if(x>=14&&x<=31&&y>=15&&y<=33)return 'soil';
  if((y>=23&&y<=25&&x>=1)||(x>=8&&x<=11&&y>=12&&y<=37)||(x>=9&&x<=46&&y>=35&&y<=37))return 'path';
  if(x>=36&&x<=41&&y>=7&&y<=15)return 'flowers';
  if(x>=37&&x<=44&&y>=31&&y<=40)return 'grove';
  return noise(x,y)<.20?'flowers':'grass';
 }
 if(id==='town'){
  if(x===0||y===0||x===95||y===95)return 'hedge';
  if(x>=63&&x<=65){if((s.bridgeBuilt&&y>=49&&y<=51)||(y>=23&&y<=25))return 'bridge';return 'water';}
  if((y>=48&&y<=52&&x>=1&&x<=94)||(x>=46&&x<=50&&y>=19&&y<=78)||(y>=38&&y<=40&&x>=25&&x<=62)||(y>=63&&y<=65&&x>=27&&x<=61)||(x>=34&&x<=36&&y>=38&&y<=68)||(x>=56&&x<=58&&y>=37&&y<=69)||(y>=23&&y<=25&&x>=48&&x<=80)||(x>=76&&x<=79&&y>=24&&y<=52))return 'path';
  if(x>=42&&x<=54&&y>=43&&y<=57)return 'square';
  if(x>=21&&x<=61&&y>=29&&y<=74)return noise(x,y)<.13?'flowers':'grass';
  if((x<18||x>83||y<18||y>83)&&noise(Math.floor(x/3),Math.floor(y/3))<.5)return 'grove';
  return noise(x,y)<.19?'flowers':'grass';
 }
 if(id==='woods'){
  if(x===0||y===0||x===63||y===63)return 'hedge';
  if((y>=28&&y<=32&&x<=50)||(x>=41&&x<=45&&y>=12&&y<=48)||(y>=15&&y<=17&&x>=18&&x<=58))return 'path';
  if(x>=30&&x<=38&&y>=42&&y<=51)return 'water';
  if(noise(Math.floor(x/2),Math.floor(y/2))<.22)return 'grove';
  return noise(x,y)<.14?'flowers':'grass';
 }
 return 'grass';
}
export function houseAt(id,x,y){return HOMES.find(h=>h.map===id&&x>=h.x&&x<h.x+h.w&&y>=h.y&&y<h.y+h.h);}
export function blocked(id,x,y,s,entity=false){let t=mapTile(id,Math.floor(x),Math.floor(y),s);if(['wall','rock','softwall','water','hedge','grove'].includes(t))return true;
 if(houseAt(id,Math.floor(x),Math.floor(y)))return true;
 for(const b of s.buildings){if(b.map!==id||!b.x&&b.x!==0)continue;if(x>=b.x&&x<b.x+(b.w||1)&&y>=b.y&&y<b.y+(b.h||1)&&b.type!=='fence'&&b.type!=='drain')return true;if(b.type==='fence'&&Math.floor(x)===b.x&&Math.floor(y)===b.y)return true;}
 for(const obj of world[id]?.objects||[]){if(!obj.solid)continue;if(collected(s,id,obj))continue;if(Math.abs(x-(obj.x+.5))<.55&&Math.abs(y-(obj.y+.5))<.55)return true;}
 return false;
}
export function canMove(id,x,y,s,r=.21){return !blocked(id,x-r,y-r,s)&&!blocked(id,x+r,y-r,s)&&!blocked(id,x-r,y+r,s)&&!blocked(id,x+r,y+r,s);}
export function collected(s,id,o){const stamp=s.gathered[`${id}:${o.id}`];return stamp!==undefined&&(o.type==='clod'||o.type==='pipe'||o.type==='crate'?true:s.day-stamp<((o.type==='wood'||o.type==='stone')?3:2));}
export function objectAt(s,id,x,y,r=1.5){return (world[id]?.objects||[]).filter(o=>!collected(s,id,o)&&Math.hypot(o.x+.5-x,o.y+.5-y)<r).sort((a,b)=>Math.hypot(a.x+.5-x,a.y+.5-y)-Math.hypot(b.x+.5-x,b.y+.5-y))[0];}
export function doorwayNear(id,x,y){return HOMES.filter(h=>h.map===id&&h.to).map(h=>({h,x:h.x+Math.floor(h.w/2)+.5,y:h.y+h.h+.5})).find(o=>Math.hypot(o.x-x,o.y-y)<1.8);}
export function portalNear(id,x,y){return (PORTALS[id]||[]).find(o=>Math.hypot(o.x+.5-x,o.y+.5-y)<1.8);}
export function inFarmPlot(x,y){return x>=14&&x<=31&&y>=15&&y<=33;}
export function validBuild(s,type,id,x,y,w=1,h=1){if(type==='fence'||type==='drain'||type==='burrow'||type==='stall'){
 if(id!=='farm'||x<13||y<14||x+w>=37||y+h>=34)return 'Build on your own farm near the garden.';
 for(let a=x;a<x+w;a++)for(let b=y;b<y+h;b++){
 if(blocked(id,a+.5,b+.5,s))return 'That ground is blocked.';
 if((world[id]?.objects||[]).some(o=>!collected(s,id,o)&&a===o.x&&b===o.y))return 'Clear the objects from that ground first.';
 if(s.crops[`${a},${b}`]?.crop)return 'Harvest this crop first.';
 }
 return null;
 }return 'Use town projects for civic buildings.';
}
function makeObjects(id){const objects=[];let counter=0;const add=(type,x,y,extra={})=>objects.push({id:`o${counter++}`,type,x,y,...extra});
 if(id==='farm'){
  [[17,16],[20,17],[22,16],[27,19],[30,21],[18,29]].forEach(p=>add('clod',...p));add('pipe',22,15);
  [[34,18],[39,26],[42,16],[4,29],[35,41]].forEach(p=>add('wood',...p));[[40,17],[34,27],[42,39],[16,37]].forEach(p=>add('stone',...p));
  add('shipping',43,22);add('mailbox',14,10);add('bedmarker',10,12);add('farmSign',12,15);
 }
 if(id==='town'){
  add('notice',46,45);add('townProject',51,45);add('travel',58,51);add('crate',33,43);add('fountain',49,49);add('bridgeSite',62,50);add('watchSite',60,54);
  for(const [x,y] of [[26,39],[32,57],[41,70],[60,29],[54,65],[39,46],[58,75]])add('wood',x,y);
  for(const [x,y] of [[60,42],[22,61],[54,73],[29,30]])add('stone',x,y);
 }
 if(id==='tunnel'){
  for(const [x,y] of [[12,6],[18,15],[25,27],[49,21],[35,38],[55,38]])add('stone',x,y);
  for(const [x,y] of [[10,5],[19,28],[45,11],[50,39]])add('metal',x,y);add('tunnelSign',4,5);
 }
 if(id==='woods'){
  for(let i=0;i<36;i++){let x=5+Math.floor(seededHash(i,1)*55),y=5+Math.floor(seededHash(i,2)*53);if(mapTile('woods',x,y,{dug:{}})!=='grove'&&mapTile('woods',x,y,{dug:{}})!=='water')add(i%4===0?'herb':i%3===0?'stone':'wood',x,y);}
  add('caravan',44,27);add('forestSign',5,27);
 }
 return objects;}
