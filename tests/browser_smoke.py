#!/usr/bin/env python3
"""Optional local Chromium smoke test. Requires playwright, but the game itself does not.
Uses inline test-only image data to avoid relying on an HTTP server.
"""
from __future__ import annotations
import asyncio,base64,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
async def main():
    html=(ROOT/'index.html').read_text(encoding='utf-8')
    html=html.replace('const saved=await ui.storage.load();','window.__scurrySmokeGame=game;const saved=await ui.storage.load();')
    html=html.replace('const SHEETS={','const SHEETS=window.__scurrySmokeSheets={')
    for img in (ROOT/'assets').glob('*.png'):
        html=html.replace('assets/'+img.name,'data:image/png;base64,'+base64.b64encode(img.read_bytes()).decode())
    errors=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        page=await browser.new_page(viewport={'width':1440,'height':1000})
        page.on('pageerror',lambda e:errors.append(str(e)))
        await page.set_content(html,wait_until='load')
        await page.wait_for_timeout(600)
        status=await page.evaluate('window.SCurryStatus')
        assert status['ready'] and status['painted'] and not status['error'],status
        images=await page.evaluate('Object.fromEntries(Object.entries(window.__scurrySmokeSheets).map(([k,v])=>[k,[v.image.complete,v.image.naturalWidth,v.image.naturalHeight]]))')
        assert all(v[0] and v[1]>0 and v[2]>0 for v in images.values()), images
        await page.get_by_text('Begin Nim’s day',exact=True).click()
        assert await page.evaluate('window.__scurrySmokeGame.map')=='home'
        # Real keyboard controls: walk south from spawn through interior exit.
        await page.keyboard.down('s');await page.wait_for_timeout(1000);await page.keyboard.up('s')
        assert await page.evaluate('window.__scurrySmokeGame.map')=='farm', 'Walking through burrow exit failed'
        # Bed interact uses the same UI flow as player gameplay.
        await page.evaluate("window.__scurrySmokeGame.enter('home',5.0,5.0,true)")
        await page.keyboard.press('e')
        assert 'Call it a day' in await page.locator('#modalTitle').inner_text(),'Bed menu did not open'
        await page.get_by_text('Go to sleep · Next day',exact=True).click()
        assert await page.evaluate('window.__scurrySmokeGame.s.day')==2,'Bed rest did not advance day'
        await page.get_by_text('Back to the valley',exact=True).click()
        # Verify farm / town / woods / tunnels run through rendering without exceptions.
        for loc in [('farm',23.5,18.5),('town',49,49),('woods',30,30),('tunnel',29,25)]:
            await page.evaluate('([m,x,y])=>window.__scurrySmokeGame.enter(m,x,y,true)',list(loc))
            await page.wait_for_timeout(75)
            assert await page.evaluate('window.SCurryStatus.error') is None,loc
        assert not errors,errors
        print('PASS: boot, seven sprite atlas loads, interior exit, bed rest, and rendering in all four outdoor regions')
        await browser.close()
if __name__=='__main__':asyncio.run(main())
