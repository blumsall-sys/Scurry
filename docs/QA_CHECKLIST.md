# Scurry QA and update checklist

## Start & world
- [ ] The page loads without a blank canvas, welcome dialog opens, Esc and Resume work.
- [ ] `E` near the marked interior EXIT moves Nim to the front of the burrow's visually drawn exterior doorway; E at exterior door returns inside.
- [ ] Walk east to the sign at farm `(46,24)` then press E to travel to Clovercross. Reach the Root Tunnels from `(7,37)` and Bramblewood from the east-side town sign.
- [ ] World routes, hills, water, roofs, trees and placed construction have sensible collision.

## Farming and resources
- [ ] Select trowel (1), face a loose clod, press Space to dig; after 3 clods two grubs spawn.
- [ ] Q lands 3 successful trowel attacks on each grub; HP/stamina recover predictably.
- [ ] Inspect pipe near `(22,15)` with E; each of the three options changes distinct system state.
- [ ] Till soil (2), choose turnip seeds in Pack (I), plant (3), water (4), sleep to advance a day and repeat until harvest; E harvests into the backpack.
- [ ] Ship the crop at the farm's eastern shipping bin; stock decreases and wallet increases only once.
- [ ] Gather 12 wood and 7 stone from woodland props or buy additional wood/stone in the general store.

## Building, reputation, economy
- [ ] In Clovercross press B and fund footbridge: water tiles at river `(63–65,49–51)` turn into passable timber bridge tiles, commerce/connectivity increase and costs are deducted only once.
- [ ] In Farm press B, choose a private build type and left click valid clear farm land; clicking a blocked footprint is rejected without charging resources.
- [ ] A night market choice or witnessed theft changes the subsequent town ledger/bulletin; unobserved theft does not immediately produce universal heat.
- [ ] Donate resources and repay fines via Tab. Check two distinct balances: personal wallet versus treasury.
- [ ] Take a safe or risky caravan from the travelling board, make a single event choice, receive a meaningful success/failure result.

## Saves, accessibility, publishing
- [ ] Save, refresh the page and Continue. The bridge, farm state and reputation persist.
- [ ] Esc → Export save; import the generated JSON file; verify restored values and no errors.
- [ ] Settings changes to sound/pace survive a save.
- [ ] Test at desktop widths 1440 and 1024 and on a narrow browser window. Keyboard input works without requiring a pointer lock.
- [ ] Serve over an HTTP address (`python -m http.server 8000`), not via `file://` double-click.
- [ ] After pushing to GitHub Pages, confirm every source module loads from a nested `/scurry/` URL and no path starts with `/src/`.

## Automated tests

With Node.js 20+ installed, `npm test` invokes the built-in Node test runner. These tests use no npm packages. Browser smoke tests were performed with a temporary inlined variant of the same source modules; no external visual assets are required for the shipped project.


## v1.2 interactive QA
- Fresh save: title intro has three sequential pages; Escape and Close do not skip them.
- Existing schema-v3 save: Continue loads inventory and town state without forcing a fresh intro.
- Click or tap a walkable spot several tiles away; Nim should route around the buildings and crates. Keyboard movement cancels the route.
- Tap a town produce/herb bundle; Nim should approach and gather, and inventory should increase.
- Confirm crates, shipping bins, fountains and solid town props block the player without trapping any shop exits.
- On mobile, touch controls appear, directional buttons move Nim while held, and touch terrain navigation works.
- In a resident conversation, confirm the new NPC portrait, species, dialogue, and readable nameplate.
- Toggle VOICE ON; test a line of introductory text, dialogue and quest hint on a compatible device. Voice availability differs by browser.
- Hint shows a temporary lead marker only in the correct map; the game remains playable without the hint.
