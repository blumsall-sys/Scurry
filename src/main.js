import {UI} from './ui.js';import {Game} from './game.js';import {paint} from './render.js';
const ui=new UI();const game=new Game(ui);ui.setGame(game);
const saved=await ui.storage.load();game.start(saved);ui.welcome(Boolean(saved));
function frame(now){const dt=game.last?(now-game.last)/1000:0;game.last=now;game.update(dt);paint(game);requestAnimationFrame(frame);}requestAnimationFrame(frame);
// Read-only debugging hook for automated smoke checks; not required for gameplay.
window.SCurryDebug={snapshot:()=>structuredClone(game.s),map:()=>game.map,version:'0.9.0'};
