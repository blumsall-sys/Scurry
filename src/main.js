import {UI} from './ui.js';import {Game} from './game.js';import {paint} from './render.js';
// Scurry startup diagnostics: view window.SCurryStatus in browser dev tools.
const status=window.SCurryStatus={version:'1.2.0-mobile-story',ready:false,frames:0,painted:false,error:null};
function failure(error){const message=error?.stack||error?.message||String(error);status.error=message;console.error('[Scurry] Runtime error:',error);
 const frame=document.querySelector('.viewport-frame');if(frame&&!frame.querySelector('.game-failure')){
 const notice=document.createElement('div');notice.className='game-failure';notice.setAttribute('role','alert');
 notice.textContent='SCURRY COULD NOT START. '+message.slice(0,400)+' — Please see README.md troubleshooting.';frame.appendChild(notice);}}
window.addEventListener('error',e=>failure(e.error||e.message));
window.addEventListener('unhandledrejection',e=>failure(e.reason));
try {
 const ui=new UI();const game=new Game(ui);ui.setGame(game);
 const saved=await ui.storage.load();game.start(saved);ui.welcome(Boolean(saved));
 status.ready=true;
 function frame(now){if(status.error)return;try{const dt=game.last?(now-game.last)/1000:0;game.last=now;game.update(dt);paint(game);status.frames++;status.painted=true;requestAnimationFrame(frame);}catch(error){failure(error);}}
 requestAnimationFrame(frame);
 // Read-only debugging hook for smoke checks.
 window.SCurryDebug={snapshot:()=>structuredClone(game.s),map:()=>game.map,version:'1.2.0-mobile-story',diagnostics:()=>({...status})};
} catch(error){failure(error);}
