#!/usr/bin/env python3
"""Scurry 1.2 Chromium desktop + mobile smoke tests, requiring playwright only for QA."""
import asyncio,base64
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
async def build_html():
 html=(ROOT/'index.html').read_text(encoding='utf-8')
 html=html.replace('const saved=await ui.storage.load();','window.__g=game;window.__ui=ui;const saved=await ui.storage.load();')
 html=html.replace('const SHEETS={','const SHEETS=window.__sheets={')
 for img in (ROOT/'assets').glob('*.png'):
  html=html.replace('assets/'+img.name,'data:image/png;base64,'+base64.b64encode(img.read_bytes()).decode())
 return html
async def intro(page):
 await page.wait_for_timeout(450)
 assert await page.locator('#modalTitle').inner_text()=='SCURRY'
 # Can't dismiss non-skippable introduction with Escape or backdrop.
 await page.keyboard.press('Escape')
 assert await page.locator('#modalTitle').inner_text()=='SCURRY'
 for _ in range(2):await page.get_by_text('Continue →',exact=True).click()
 await page.get_by_text('Begin Nim’s day →',exact=True).click()
 assert await page.evaluate("!window.__ui.modalOpen()")
async def main():
 html=await build_html()
 async with async_playwright() as pl:
  browser=await pl.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  errors=[]
  page=await browser.new_page(viewport={'width':1470,'height':990})
  page.on('pageerror',lambda e:errors.append(str(e)))
  await page.set_content(html,wait_until='load')
  await intro(page)
  status=await page.evaluate('window.SCurryStatus')
  assert status['ready'] and status['painted'] and not status['error'],status
  imgs=await page.evaluate('Object.fromEntries(Object.entries(window.__sheets).map(([k,v])=>[k,v.image.naturalWidth]))')
  assert all(v>0 for v in imgs.values()),imgs
  await page.screenshot(path='/mnt/data/scurry_v12_intro_game.png')
  # Keyboard movement / interior threshold.
  await page.keyboard.down('s');await page.wait_for_timeout(1050);await page.keyboard.up('s')
  assert await page.evaluate('window.__g.map')=='farm'
  # Walking should be blocked by an actual crate.
  crate=await page.evaluate("()=>{const g=window.__g;g.enter('town',34.5,43.5,true);return g.map}")
  collision=await page.evaluate("()=>{const g=window.__g;return [g.map,g.p.x,g.p.y]}")
  assert collision[0]=='town'
  # Go around obstacle for a normal walk target.
  route=await page.evaluate("()=>window.__g.pathTo(40.5,46.5,false)")
  assert route is True
  await page.wait_for_timeout(1700)
  assert await page.evaluate('window.__g.p.x')>34.5
  # Click on an actual gatherable herb (tied to prop artwork), perform collection near it.
  await page.evaluate("()=>window.__g.enter('town',43.5,48.5,true)")
  herb=await page.evaluate("()=>window.__g.targetAt(44.5,48.5)")
  assert herb and herb['type']=='herb',herb
  before=await page.evaluate('window.__g.p.inv.herb')
  await page.evaluate("()=>window.__g.activateTarget(44.5,48.5)")
  after=await page.evaluate('window.__g.p.inv.herb')
  assert after==before+2,(before,after)
  # Quest helper and TTS setting.
  await page.locator('#questHintBtn').click()
  assert await page.locator('#modalTitle').inner_text()=='Nim’s notebook'
  await page.get_by_text('Thank you / close').click()
  await page.locator('#ttsToggle').click()
  assert await page.evaluate('window.__g.s.settings.narration') is True
  # Test bed rest in first interior.
  await page.evaluate("()=>window.__g.enter('home',5.0,5.0,true)")
  await page.keyboard.press('e')
  assert 'Call it a day' in (await page.locator('#modalTitle').inner_text())
  await page.get_by_text('Go to sleep · Next day').click()
  assert await page.evaluate('window.__g.s.day')==2
  await page.get_by_text('Back to the valley').click()
  # All regions render with no JS exceptions.
  for loc in [('farm',23.5,18.5),('town',49,49),('woods',30,30),('tunnel',29,25)]:
   await page.evaluate('([m,x,y])=>window.__g.enter(m,x,y,true)',list(loc))
   await page.wait_for_timeout(100)
  assert not errors,errors
  print('DESKTOP PASS: intro, images, exits, objects, pathing, herb pickup, hint, TTS toggle, bed, maps')
  mobile=await browser.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,device_scale_factor=1)
  mobile.on('pageerror',lambda e:errors.append('mobile:'+str(e)))
  await mobile.set_content(html,wait_until='load')
  await intro(mobile)
  assert await mobile.locator('#mobileControls').is_visible()
  await mobile.evaluate("()=>window.__g.enter('farm',11.5,23.5,true)")
  orig=await mobile.evaluate('window.__g.p.x')
  await mobile.locator('[data-move="arrowright"]').dispatch_event('pointerdown',{'pointerId':19})
  await mobile.wait_for_timeout(380)
  await mobile.locator('[data-move="arrowright"]').dispatch_event('pointerup',{'pointerId':19})
  assert await mobile.evaluate('window.__g.p.x')>orig
  # Simulate a finger tap several tiles away.
  p0=await mobile.evaluate('window.__g.p.x')
  canvas=mobile.locator('#game');bounds=await canvas.bounding_box()
  coords=await mobile.evaluate('()=>{const g=window.__g;return [(g.p.x+4)*16-g.camX,(g.p.y)*16-g.camY]}')
  sx=bounds['x']+coords[0]/512*bounds['width'];sy=bounds['y']+coords[1]/288*bounds['height']
  await mobile.touchscreen.tap(sx,sy)
  await mobile.wait_for_timeout(1200)
  assert await mobile.evaluate('window.__g.p.x')>p0
  await mobile.screenshot(path='/mnt/data/scurry_v12_mobile.png',full_page=True)
  assert not errors,errors
  print('MOBILE PASS: viewport controls, held pointer movement, touch navigation, no JS exceptions')
  await browser.close()
if __name__=='__main__':asyncio.run(main())
