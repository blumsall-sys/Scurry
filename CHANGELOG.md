# SCURRY – Release history

## v1.1 – Complete GitHub package and artwork integration
- Rebuilt six original concept sheets as actual evenly spaced sprite atlases, correcting clipped and squashed frames from v1.0.
- Replaced repetitive ground tile borders with authored seamless 16×16 pixel grass, paths, wood floors, soil, stone and water.
- Added an original seventh atlas for 14 named town residents and four facing directions each.
- Integrated new assets into player animation, soil/farm stages, enemies, tools, objects, UI hotbar, bed and town decorations.
- Added visual detail for building frontages and seven interior room styles while retaining collision and doorway alignment.
- Preserved the v0.9.2 bed/exit fixes and compatible schema-v3 browser saves.
- Included the original PDF and Markdown design report and full-resolution art-source sheets.
- Verified with 16 Node gameplay tests, static package checks and a Chromium smoke test.

## Art Overhaul v1.0
- Added cohesive pixel-art sprite sheets for Nim, terrain, crops, structures, enemies, and UI icons.
- Updated renderer to use asset-driven sprites with robust fallbacks.
- Added GitHub-ready assets folder and rebuilt standalone index.html.

# Changelog

## 0.9.2 — Interior exit and bed interaction repair
- Fixed a missing `INTERIORS` import in `src/game.js` that caused `ReferenceError` whenever E was pressed inside a building. This prevented leaving the starting burrow, resting at the bed, and interacting in all seven interiors.
- Added a physically passable exit threshold at the visible center doorway of each interior, while keeping neighbouring wall tiles solid. Walk straight down through the exit or press **E** near the EXIT label.
- Centralized the interior/exterior doorway logic so every mapped building exits to its own accurately aligned outside doorstep; verified every spawn is unblocked and can re-enter.
- Mouse clicks now use the nearby bed, inside EXIT, outside doors, and region travel signs as interactions, rather than swinging a trowel at those controls. Distant hotspots instruct the player to move closer instead of teleporting.
- Added a dedicated clickable **E Interact** hotbar button and contextual HUD hint for bed and exit.
- Indoor scenes no longer draw outdoor rainfall across furniture and walls; weather reports still appear in the HUD.
- Extended automated game tests with bedroom interaction, rest advancement, all seven exits, doorstep collision, walking through thresholds, and click actions (16 passing tests).
- Kept `index.html` self-contained. Replaced just this file on GitHub to deploy. Save schema remains v3 so existing browser saves should remain compatible.

## 0.9.1 — Fix blank game canvas on GitHub / local files
- Inlined the complete JavaScript and CSS into `index.html`, removing all runtime module and asset-path dependencies.
- GitHub Pages now requires only one root-level file to play, avoiding broken `src/` paths from directory upload mistakes.
- Retained modular developer sources and added a Python stdlib rebuild command.
- Added a visible in-game error overlay for runtime rendering exceptions, plus `window.SCurryStatus` startup diagnostics.
- Kept original artwork renderer, world data, save schema, and gameplay mechanics intact.
- Added smoke verification of canvas rendering, character movement, JS error reporting and no network requests.

## 0.9.0 — First playable browser alpha
- Original low-resolution Canvas art and sprite renderer
- Connected farm, town, burrow, interior buildings, tunnels, woods
- Nim worm movement, digging, combat, tools, crop growth, weather, saves
- Town reputation, faction standing, water pump choice, NPCs and relationships
- Construction, river bridge navigation, economy, daily hazards and caravan events
- Browser UI, menus, settings, save export/import, responsive desktop presentation
