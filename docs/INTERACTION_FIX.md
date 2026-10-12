# Interior collision and interaction fix (v0.9.2)

## Reported failure
Game art displayed but Nim could not leave the first room or interact with the bed. The screenshot shows the correct drawn EXIT and REST indicators; the failure was in gameplay, not asset loading.

## Root cause
`Game.interact()` calls `INTERIORS.includes(mapId)` but `src/game.js` had not imported the `INTERIORS` constant. This raised a `ReferenceError` as soon as E was pressed in a room. The previous automated suite tested the maps and geometry but never executed `interact()` from an interior, so the regression escaped checks.

## Code repairs
1. Imported `INTERIORS` in `src/game.js`. Centralized `exitInterior()` and `enterExteriorDoor()` to keep every building's drawn door and map transition aligned.
2. Opened the single grid cell of the interior south wall aligned with the drawn EXIT door at (8,11). Other south wall cells remain solid.
3. Walk-out automatic trigger at x near 8.5 and y above 10.65 provides natural traversal, while the E interaction remains available.
4. Canvas click hotspots for mattress, exit and exterior doors now use interaction actions. Interact button in the tool bar allows mouse-only access without clicking drawn pixels.
5. Indoor weather drawing disabled because rain was visibly falling through the room.
6. Generated standalone `index.html` from modular source, preserving save schema 3.

## Regression tests
- Interior E interaction exits to valid map, correct coordinates and walkable ground.
- All seven existing mapped interiors can exit and re-enter without throwing.
- Keyboard/mouse bed interaction opens sleep menu only when near bed; resting advances exactly one day.
- Interior doorway threshold cell is walkable; neighbouring wall remains solid; walking across marked exit transfers to the farm.
- Inside/outside mouse click doors work only at reachable range.
- Existing 10 simulation/economy tests continue to pass.

## Deployment
Only `index.html` is needed at the GitHub repository root for runtime. Upload the new one, commit, wait for Pages, and refresh with Ctrl+Shift+R. Keep existing save; the version remains schema 3.
