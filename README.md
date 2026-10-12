# SCURRY — A Little Life. A Big Town.

**A playable, single-player, top-down woodland RPG alpha that can be hosted directly on GitHub Pages.** You play Nim the earthworm, digging, planting, building and deciding how to treat Clovercross and its neighbours. Original pixel-like artwork is rendered by the bundled Canvas renderer. No third-party runtime dependencies or binary sprite sheets are necessary.

## v0.9.2 hotfix — leaving rooms, resting, and clicking to interact

**Symptoms solved:** You could see Nim and the furnished burrow but pressing **E** did nothing at the exit or bed. The cause was a missing `INTERIORS` import in the gameplay engine. It threw a JavaScript `ReferenceError` before either interaction could run. v0.9.2 fixes it and tests every interior.

**How to play:** On the starting screen, close the welcome prompt. Press **E** while near the **EXIT ↓** sign at the bottom of the room, **walk south through the marked exit**, or click the EXIT sign when nearby. Nim should appear on the farm in front of the burrow door. Walk up to the doorway outside and press **E** to return inside. To sleep, walk to the bed at the upper-left of Nim's room, press **E** or click the mattress when nearby, then select **Go to sleep · Next day**. You can also click the new **E Interact** button below the game. A visible hint in the game changes when you are near a door or bed.

**Fastest GitHub update:** Replace the **root** `index.html` with the file from this ZIP and commit to `main`. You do not need to delete saves, reinstall anything, or re-upload the other files to use the repaired game. Make sure the GitHub Pages deployment finishes, then do **Ctrl+Shift+R** to bypass cached HTML. `VERSION 0.9.2` should be displayed below the Town Chronicle; existing day, inventory and town state should continue from your saved game.

**Developer note:** The root `index.html` is a *generated self-contained runtime*. If you change `src/*.js` or `style.css`, run `python tools/build_single_file.py` and upload the regenerated `index.html`. Editing only `src/` does not change the deployed game. The main regression tests are `node --test tests/game.test.js`; standalone integrity check is `python tests/standalone_check.py`.

## v0.9.1 hotfix: blank dark-green game window (October 2026)

The original v0.9.0 package loaded `./style.css` and `./src/main.js` as separate resources. If `src` was flattened, missing, or renamed while uploading to GitHub, the HTML/CSS interface appeared, but no JavaScript ever started the Canvas renderer. A similar problem occurred when opening the ES-module version via `file://` on many browsers. The tell-tale symptom is the static `SPRING · DAY 1 / 08:00 · Clear skies` placeholder in the HUD and a completely flat dark green playing field.

**Fixed:** `index.html` now embeds the complete game JavaScript AND CSS. All original game-art pixel graphics are rendered by code; there were never separate image assets to download. **Only `index.html` is required for the playable game.** The modular files remain under `src/` as editable developer source, and `tools/build_single_file.py` regenerates the single-file release.

### To update an existing GitHub Pages deployment

1. **Back up any progress** from the original game's Pause/Settings → Export Save before changing your deployment, if the original version can still load. Existing saves should remain available because the save schema and origin are unchanged.
2. Open the repository, click **`index.html` → Edit** (pencil), replace its content with the new `index.html` supplied in the ZIP, then **Commit changes**. Alternatively, upload the new root `index.html` and overwrite the existing file using GitHub Desktop, or commit all files from the ZIP. **Do not upload the ZIP itself.**
3. Confirm the file is at the repository root (next to `README.md`), not in an extra outer folder. In **Settings → Pages**, keep **Deploy from branch → `main` → `/ (root)`**.
4. Wait for the GitHub Pages deployment and reload your live game with **Ctrl+Shift+R**. The version at the lower right should say **0.9.2** and the HUD should include **YEAR 1**.
5. Close the welcome modal and confirm you see Nim, a furnished room and the `EXIT ↓` sign. Press WASD to move, E to interact, or click the nearby bed/EXIT artwork.

If it still fails, open Chrome/Edge **F12 → Console** and run `window.SCurryStatus`. It should show `ready: true`, `painted: true`, `frames` increasing, and `error: null`. If an exception prevents drawing, this version now displays a visible error over the game instead of silently leaving a green canvas.

### Fresh deployment / uploading fewer than 100 files

1. Extract the ZIP. **Upload only `index.html` to your repository root** if you just want to play. (Optional: upload the remaining development files, totalling fewer than 100.)
2. Open your GitHub repository → **Settings → Pages**. Select **Deploy from a branch** → `main` → `/ (root)` → Save.
3. Your game will appear at `https://YOURUSERNAME.github.io/REPOSITORYNAME/` after publishing.

The single HTML file contains all runtime CSS, pixel drawing routines, interactions and gameplay; it makes **zero external runtime asset or module requests**. Browser save files are stored locally using IndexedDB with a localStorage fallback. You can also double-click `index.html` locally; unlike v0.9.0 there are no ES-module imports to be blocked, although some browsers restrict local save persistence.

### For developers modifying the modular source

Edit `src/data.js`, `src/world.js`, `src/game.js`, `src/render.js`, `src/ui.js`, or `src/main.js`, and/or `style.css`, then regenerate the deployable file using **Python 3**:

```bash
python tools/build_single_file.py
```

Upload the newly generated `index.html` to GitHub Pages. Editing the `src/` files *without regenerating* `index.html` **will not change the deployed game**. `tools/index.template.html` is the HTML scaffold used by the builder. No network connection or external libraries are required to build it.

## Controls

| Key | Action |
|---|---|
| WASD / arrows | Walk (diagonal movement normalized) |
| E or click E Interact | Talk, enter a doorway, gather, harvest, rest |
| 1 / 2 / 3 / 4 | Trowel/dig, hoe/till, plant selected seed, water |
| Space / nearby mouse click | Use selected tool (trowel also attacks nearby enemies) |
| Q | Attack with trowel, independent of equipped tool |
| K | Burrow dash (stamina + cooldown) |
| F | Soil Sense (temporary mineral highlights) |
| Shift | Sprint, using stamina |
| I / J / B / M / Tab | Pack / Journal / Build / Map / Town ledger |
| Esc | Pause/settings, or cancel a building placement |

**First 15 minutes:** Read Nim's note, leave your burrow via the marked exit at the bottom of the room, walk east to the garden, use the trowel on three clods, defeat two thorn grubs using Q, inspect the pipe at the top of the garden using E, decide whether to return/sell/keep it, and enter Clovercross at the east-side direction sign. Meet Bram or Mara, plant/water/harvest a crop, ship it, restore the footbridge and take a caravan journey.

**Farming:** A plot must be tilled (2), planted with a valid seasonal seed (3) and watered (4) before dawn growth occurs. Press E next to a mature crop to harvest. Open your pack (I) to select another seed. Shipping bin is at the east side of the farm.

**Building:** Press B. Public projects work in Clovercross and are built from the menu; private farm buildings launch a tile placement cursor. Left-click a clear owned tile. Click placement exactly where it should be built, not on a building doorway. ESC cancels placement.

**Persistence:** IndexedDB save plus localStorage fallback; save on map changes, projects, sleep and periodically, with an export/import JSON feature. Saves are tied to the browser and website origin, not synced between devices.

## What's playable in this alpha

- Four outdoor regions / one original home / six shop-and-service interiors; drawn doors and accessible triggers in matching positions.
- Nim as animated worm, 14 named anthropomorphic NPCs with schedules and relationships, six crops / four seasons, tools, farming and shipping.
- Real-time direction-based hit arc, damage, stamina, health, invulnerability, recovery and 3 enemy categories.
- Multi-dimensional reputation, four factions, witness/evidence and delayed discovery, restitution, pump decision outcomes.
- Six construction project types, dynamically navigable footbridge, personal farm placement, separate town and personal funds, simple population/services economy.
- Daily weather, crop growth, bounded price/economy, several hazard types, raid mitigation, bulletin log and open-ended progress.
- A repeatable caravan activity with pretrip choices and event encounters; export/import saves; synthesized SFX toggle.

## Scope and known limitations

This is an **original, functional alpha / interconnected early sandbox**, *not a fully content-complete realization of every proposed mechanic in the 19-page blueprint*. Included mechanics have simplified balancing, AI, pathfinding, and art. In particular: no procedurally sculpted all-direction underground tunnel editor, unrestricted RTS simulation, complex interior NPC pathfinding, full NPC households, deep multi-chapter quest story, animated music tracks, crop quality grades, or remappable keys. The caravan is a decision-driven encounter and resource transaction, not an on-foot escort level. Disaster mitigation is town-meter/event based rather than a continuous fluid/fire physics simulation. Portals are designated world-region entry tiles. The separate report under `docs/` is **a design proposal**, and its roadmap also identifies these as extended work.

**Technical deviation from report**: This deployable version uses a dependency-free JavaScript Canvas 2D renderer and ES modules instead of the proposed Phaser 4 / TypeScript / Vite stack. This was deliberate so the supplied GitHub Pages ZIP is immediately runnable, includes all runtime code, and never relies on unavailable npm packages or any installation process. `src/data.js` is the content layer, `src/world.js` map/terrain rules, `src/game.js` simulation, `src/render.js` artwork, `src/ui.js` HUD/interactions/saves, `src/main.js` entry point. A future Phaser+TypeScript migration is possible while retaining most world data and rules.

## Adding more content

- Add new NPCs in `src/data.js` → `NPCS` (make sure locations correspond to unobstructed map tiles).
- Update crop types or balance values in `CROPS`; artwork appears automatically via crop palette data.
- Update recipes, building costs and dialogue in `src/data.js` and relevant UI handlers.
- Add world objects and new authored terrain layouts in `src/world.js`.
- Adjust pixel drawing, sprites, buildings and day/night palette in `src/render.js`.
- Change world rules, consequences, combat and NPC AI in `src/game.js`.
- Change controls and menus in `src/ui.js` and styling in `style.css`.

No npm dependency, purchased art asset or third-party service is necessary. A browser with JavaScript and Canvas 2D is sufficient; the distributed HTML no longer requires ES module loading. Font fallback uses built-in fonts.

**License note:** Source and original artwork are reserved to the creator by default. Add an explicit OSS license if intending open-source redistribution.

## Documentation and tests

- [`docs/Original_Game_Design_Report.md`](docs/Original_Game_Design_Report.md): the complete supplied game design blueprint.
- [`docs/FEATURE_COVERAGE.md`](docs/FEATURE_COVERAGE.md): exact system-by-system alpha coverage and remaining work.
- [`docs/QA_CHECKLIST.md`](docs/QA_CHECKLIST.md): manual testing, GitHub and save verification.
- `npm test` runs 10 dependency-free Node.js simulation checks and requires no `npm install`.
