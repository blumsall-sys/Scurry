# SCURRY — A Little Life. A Big Town.

**Version 1.1 • Complete GitHub deployment package • Playable alpha**

Scurry is a single-player retro woodland action-RPG, farm game and town-building simulation. Play as Nim, an anthropomorphic earthworm, and help or exploit the village of Clovercross. **All required runtime files are included.** The game does not require accounts, subscriptions, a game server, npm or paid assets.

This package incorporates the v0.9.2 doorway/bed interaction fixes and a new seven-sheet pixel-art system. The images are **actual game-ready, aligned sprite atlases**, corrected from the earlier loosely spaced concept sheets. The `index.html` contains the gameplay code and CSS; the `assets` folder supplies the new graphics. **Both are required to see the intended artwork.**

## Deploy to GitHub Pages

1. Unzip the release ZIP on your computer. The ZIP has `index.html`, `assets/`, `src/`, `docs/` and other files **at its root**. Do not add an extra directory level when uploading.
2. Open or create your `scurry` repository on GitHub. Upload all the **extracted files and folders** into the repository root. Do not upload the ZIP as a single file. There are fewer than 100 files.
3. Confirm that these paths exist in GitHub: `index.html`, `assets/nim_sheet.png`, `assets/terrain_sheet.png`, `assets/crops_sheet.png`, `assets/objects_sheet.png`, `assets/enemies_sheet.png`, `assets/ui_sheet.png`, and `assets/npc_sheet.png`.
4. In GitHub **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then Save. Wait until GitHub Pages reports the site is live.
5. Visit `https://YOURUSERNAME.github.io/scurry/` (or the actual URL reported by GitHub Pages) and use **Ctrl + Shift + R** after the update. Verify **VERSION 1.1** below the right-hand Chronicle panel.

**Updating an existing Scurry deployment:** Keep the same repository address to preserve browser-origin saves. Back up your game first with **Pause → Export save JSON**. Replace `index.html` **and the entire `assets/` directory**. Uploading only the HTML will run with fallback graphics instead of the refreshed sprite sheets. You may also replace all files to keep source code aligned. Existing schema-v3 saves remain compatible.

**Playing locally:** You may double-click `index.html` directly. It contains the executable game code and loads adjacent artwork images; browser security and persistence policies vary when opened with `file://`. For reliable local hosting, run `python -m http.server 8000` in the extracted root and open `http://localhost:8000`.

## Controls

| Action | Keys / mouse |
|---|---|
| Walk / face | WASD / arrow keys |
| Interact, talk, harvest, enter, sleep near bed | E or on-screen Interact button; nearby hotspots can be clicked |
| Use selected trowel/hoe/seeds/water | Space, or nearby map click |
| Select tools | 1–4 or mouse on hotbar |
| Attack | Q / on-screen Strike button |
| Burrow dash | K |
| Soil Sense | F / on-screen Sense button |
| Sprint | Hold Shift |
| Inventory / Journal | I / J |
| Build / Map / Town ledger | B / M / Tab |
| Pause / settings | Esc |

**Start:** Close the welcome panel. Nim appears in the burrow. Walk south to the `EXIT ↓` doorway, or press E at the threshold. On the farm, walk to the garden, face a soil clod, press **1** for Trowel and **Space** to dig it. After three clods, defeat two invading thorn grubs with **Q**. Inspect the old pump part, decide who gets it, and visit Clovercross through the east-side travel marker. Plant/harvest crops, trade, build, defend and explore the connected regions.

**Bed:** Walk near the upper-left bed in the burrow. Press **E** to open the rest dialogue; choose **Go to sleep · Next day**. You can also click the bed when close. The Chronicle sidebar has a separate Sleep / Next Day shortcut.

## Artwork and project structure

| Files | Purpose |
|---|---|
| `index.html` | GitHub Pages entry point with embedded CSS and executable game engine. Generated; do not edit this alone when editing source. |
| `assets/nim_sheet.png` | Animated Nim: facing, moving, digging and attacking. |
| `assets/terrain_sheet.png` | 16×16 logical tiles, reworked into seamless terrain and soil textures; tilled soil, water, bridge, hedges, markers. |
| `assets/crops_sheet.png` | Four growth stages for six crops plus farming props. |
| `assets/objects_sheet.png` | Bridges, market stalls, town pump, bed, crates, fountain, repair workbench, decorations. |
| `assets/enemies_sheet.png` | Thorn grub, Brambler beetle and Thornband scout poses/effects. |
| `assets/ui_sheet.png` | Trowel, hoe, seed pouch, watering, interaction, combat and system icons. |
| `assets/npc_sheet.png` | Four directions for each of 14 named animal residents, created with original pixel-drawing code. |
| `art-source/*.png` | Full-resolution image-generated **source sheets**, kept for future visual updates. |
| `src/*.js` | Editable world, simulation, rendering, interface and startup source. |
| `style.css` | Editable UI styles. |
| `tools/` | Rebuild pipeline; see below. |
| `docs/` | Full original game design PDF + Markdown, exact feature coverage, sprite atlas metadata and QA notes. |

The new in-game atlases are on strict cell grids (mostly 8×4, objects 4×4). The **terrain is a 16×16 logical tile grid** in a 512×288 logical Canvas viewport and is scaled by the browser with nearest-neighbour CSS. The game runs on dependency-free JavaScript + Canvas 2D, rather than migrating to Phaser 4 at this stage; this is a deliberate deployment simplification.

### Editing artwork / gameplay

**To update the game engine:** edit `src/*.js` or `style.css`, then run `python tools/build_single_file.py` and commit the regenerated `index.html`.

**To rebuild the pixel sheets:** Python with Pillow is needed for the optional art tools:

```bash
python -m pip install pillow
python tools/normalize_sprite_atlases.py
python tools/clean_terrain.py
python tools/create_npc_atlas.py
python tools/build_single_file.py
```

The first script reads `art-source/*.png` and produces precisely aligned game atlases in `assets/`. The second makes the repeated terrain textures seamless, and the third creates resident sprites. If modifying only the PNG files, rebuilding `index.html` is not necessary, but you must commit the new `assets/` files.

## Testing

- Dependency-free gameplay regression suite: `node --test tests/game.test.js` (16 tests).
- Static runtime and asset consistency: `python tests/standalone_check.py`.
- Optional real-browser smoke test: `python tests/browser_smoke.py` (requires Python Playwright plus Chromium). The smoke test exercises boot, all seven art sheets, leaving the burrow, using the bed and rendering all outdoor regions.
- Before publishing, verify the live GitHub Pages asset paths and export a sample save.

## What's implemented, and what remains

**Playable:** Six crops, seasonal planting and watering; inventory and shipping; personal currency vs. town treasury; 14 named NPCs with basic schedules and individual relationships; three enemy types and health/stamina/dash combat; four outdoor maps and seven interiors; independent reputation and factions; pump-part moral choice; six structure types; an accessible footbridge that changes actual traversal; weather and disaster events; raids and protection; caravans; journal, dialogue and local saves with JSON import/export.

**Still simplified compared with the original 19-page design report:** NPCs use lightweight schedules and simplified needs/pathfinding; many buildings/interiors remain code-drawn rather than fully illustrated room-specific atlases; the caravan is an event-driven trip rather than real-time escort; floods/fires affect simulation meters rather than fluid physics; the story is a starter arc, not a complete branching narrative with endings; characters have frame-based animations without full independent pose sheets for every action; and there are no editable key bindings or gamepad support. This is a **finished uploadable alpha package**, not a claim that every proposed future system in the design report is content-complete. See `docs/FEATURE_COVERAGE.md`.

Save data is stored in the browser's IndexedDB (with localStorage fallback), and remains on the same site origin. Export important progress before changing your domain or browser. All art is original for this project and no sprites from the classic reference games have been copied.
