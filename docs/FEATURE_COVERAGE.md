# Scurry — design report implementation coverage

This document distinguishes **playable alpha systems** from features that the research and design blueprint proposed for the eventual full game. It prevents confusing a proposed design feature with completed functionality.

| Proposed feature | Included in GitHub-ready alpha? | Notes |
| --- | --- | --- |
| Nim the earthworm begins on a day off | Yes | Starts in burrow with a short gameplay onboarding. |
| Low-resolution original pixel style | Yes | Canvas artwork is original code-rendered art, editable in `src/render.js`. |
| Four outdoor regions | Yes | Farm, town, Root Tunnels, Bramblewood, with generated reusable ground art. |
| Enterable buildings, aligned thresholds | Yes | Home plus store, bakery, town hall, clinic, works shed, watch house. Their interiors are simplified. |
| Player movement / NPC interaction | Yes | WASD, diagonals, facing, E, basic time-of-day position changes. |
| Digging and tunnel changes | Yes | Earth-only digging and persistent excavated cells; no advanced tunnel structural analysis. |
| Burrow dash and Soil Sense | Yes | Dash uses stamina and cooldown; Soil Sense highlights resources. Dash physics are simplified. |
| Health, stamina, fullness, morale | Yes | Five hearts and lightweight personal survival values. |
| Four seasons and weather | Yes | 14-day seasons; dawn-only crop growth, daily weather and hazards. |
| Six crops and complete farm cycle | Yes | Tilling, seasonal planting, watering, day progression, harvesting, shipping. Quality and fertilizer are simplified. |
| Individual inventory / shell currency | Yes | Wallet and stackable supplies. |
| Town treasury / economy | Yes | Separate balance, day-scale services/food/commerce/population/satisfaction/upkeep. Not a full SimCity zoning model. |
| Six structure types | Yes | Farm placement for fence, drain, burrow extension and stall; two town projects built from menu. |
| Build changes actual access | Yes | River tile collision becomes passable on bridge construction. |
| NPC schedules and needs | Partial | 14 named NPC identities with work/rest/social positions, basic dawn needs. No deep multi-agent pathfinding/households. |
| NPC gifts and relationships | Yes | Individual relationships and repeatable gift interaction. |
| Four factions, trust, suspicion, ecology | Yes | Independent values and consequences; legal consequences are simplified. |
| Witnessed crime and restitution | Yes | Crate theft and pump trade; evidence is discovered later rather than universally broadcast immediately. |
| Pump choice with three outcomes | Yes | Public restoration, private irrigation or sale change wallet, water, factions and memory. |
| Real-time hack-and-slash | Yes | Directional attack hit arc, knockback, enemy states, telegraph, damage, invulnerability, recoverable faint. |
| Three enemy archetypes | Yes | Thorn grub, armoured beetle and Thornband scout with simplified steering. |
| Guards/neighbour defense | Partial | Defence mitigates raid losses, and the town watch resolves raids at dawn. No deep combat squad AI. |
| Disaster/event families | Yes, abstracted | Floods, windstorms, drought, fires, tunnel collapse, pests, market shortage and raids are bounded daily events with service effects. No fluid/fire physics. |
| Oregon Trail-like caravan | Yes, abbreviated | Two routes, limited supplies, event choices, cargo rewards and economic consequences. Not full-length escort traversal. |
| Journal, bulletin, maps, HUD, menus | Yes | Includes original player-facing UI, feedback and quest milestones. |
| Local persistence and import/export | Yes | IndexedDB, localStorage fallback, versioned JSON export/import. |
| Full controller remapping / gamepad | No | Fixed controls shown in help. |
| Complete multi-chapter endings / festivals | No | First quest arc and repeatable sandbox only. |
| Large interactive city zoning / RTS | No | Deliberately outside the first-release boundary of the blueprint. |
| Custom authored audio tracks | No | Original simple synthesized SFX. |
| Phaser 4 / TypeScript / Vite build | No — conscious alternative | Immediately deployable dependency-free Canvas ES modules. See README. |

**Recommended next iteration:** 1) extend NPC movement/pathfinding, 2) deepen farm irrigation and soil quality, 3) add a complete interior/exterior tile atlas and character walk-cycle art sheets, 4) expand combat weapon/attack variations, 5) add deeper faction quests, investigations and ending states, 6) refine disaster prevention and recovery contracts. The existing simulation values live in the data/state engine; preserve current saves via explicit schema migrations as features expand.
