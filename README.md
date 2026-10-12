# SCURRY — A Little Life. A Big Town.

**A playable, single-player, top-down woodland RPG alpha that can be hosted directly on GitHub Pages.** You play Nim the earthworm, digging, planting, building and deciding how to treat Clovercross and its neighbours. Original pixel-like artwork is rendered by the bundled Canvas renderer. No third-party runtime dependencies or binary sprite sheets are necessary.

## Play immediately on GitHub Pages (no Node.js needed)

1. **Unzip** this archive. Open the unzipped `Scurry_GitHub_Ready` folder; upload the files **inside it** (including `index.html`, `src/`, `style.css`, and `.nojekyll`) to the **root** of a new public GitHub repository, e.g. `scurry`.
2. GitHub repository → **Add file → Upload files** → drag the project files and the `src` / `docs` folders into the uploader. **Important:** GitHub's web uploader can flatten/misplace folder contents in some workflows. Drag the *contents of the directory*, preserving each nested folder path, or use GitHub Desktop / Git for Windows for consistent folder structure. All files together are well below 100.
3. Commit to the default `main` branch.
4. Repository → **Settings → Pages → Build and deployment → Deploy from a branch** → `main` / `(root)` → **Save**.
5. Open `https://YOURUSERNAME.github.io/scurry/` after the Pages deployment becomes available. The source uses only `./`-relative imports, so a nested repository pathname works without a `base` setting.

**Local play:** Because JavaScript ES modules are blocked by some browsers when opened via `file://`, run from a local HTTP server. With Python installed, open a terminal in the extracted folder and run `python -m http.server 8000`. Go to `http://localhost:8000/` in Chrome, Edge, or Firefox. On Windows, `py -m http.server 8000` may work. No `npm install` or backend is required.

## Controls

| Key | Action |
|---|---|
| WASD / arrows | Walk (diagonal movement normalized) |
| E | Talk, enter a doorway, gather, harvest, interact |
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

No npm dependency, purchased art asset or third-party service is necessary. A browser with Canvas 2D, IndexedDB/localStorage and modern ES module support is sufficient. Font fallback uses built-in fonts.

**License note:** Source and original artwork are reserved to the creator by default. Add an explicit OSS license if intending open-source redistribution.

## Documentation and tests

- [`docs/Original_Game_Design_Report.md`](docs/Original_Game_Design_Report.md): the complete supplied game design blueprint.
- [`docs/FEATURE_COVERAGE.md`](docs/FEATURE_COVERAGE.md): exact system-by-system alpha coverage and remaining work.
- [`docs/QA_CHECKLIST.md`](docs/QA_CHECKLIST.md): manual testing, GitHub and save verification.
- `npm test` runs 10 dependency-free Node.js simulation checks and requires no `npm install`.
