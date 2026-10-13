# SCURRY v1.1 – pixel art atlas guide

All runtime images live under `assets/`, next to `index.html`. `index.html` includes the Canvas game engine but accesses PNG images relative to its own location.

| File | Grid | Content | Used by |
| --- | --- | --- | --- |
| `nim_sheet.png` | 8 × 4, each 64px | Nim 4 directions and idle/walk/dig/attack/dash frames | game player actor |
| `terrain_sheet.png` | 8 × 4, each 64px | Grass, flowers, paths, soils, stone, water, floors, walls, doors, fences | maps, farm, tunnels, interiors |
| `crops_sheet.png` | 8 × 4, each 64px | 6 crops × 4 growth stages; extras | player farming plots |
| `objects_sheet.png` | 4 × 4, each 64px | Bed, bridge, market stall, pump, crate, fountain, caravan, workbench, signs | interactive world objects and structures |
| `enemies_sheet.png` | 8 × 4, each 64px | 3 combat enemy types and their actions, effects | combat renderer |
| `ui_sheet.png` | 8 × 4, each 64px | Tools, food, shells, player actions, city stats | active hotbar buttons; remaining icons reserved |
| `npc_sheet.png` | 14 × 4, each 48×56px | One column per named citizen, 4 facings | town NPC renderer |

16×16 refers to logical gameplay terrain, not necessarily PNG export pixel dimensions. Each 64px tile image is rendered into 16 logical canvas pixels with nearest-neighbour scaling to preserve the appearance. The original generated images are stored as `art-source/*.png`; the normalized in-game atlases are different files, because the concept sheets did not have even row spacing.

**Important:** A fully custom illustration does not yet exist for every building frontage or indoor object. The runtime retains code-drawn house exteriors and interior furniture until those assets are authored; this prevents blank maps and preserves aligned entrance collision.

Use `tools/normalize_sprite_atlases.py`, then `tools/clean_terrain.py`, `tools/create_npc_atlas.py` to rebuild the assets. Rebuild `index.html` with `tools/build_single_file.py` only if source engine/CSS has changed.
