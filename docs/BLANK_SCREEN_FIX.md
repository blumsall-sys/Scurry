# Scurry blank-screen bugfix — v0.9.1

## Root-cause diagnosis
In the screenshot provided, the game frame is an entirely solid dark green, while the HTML navigation, tool buttons, right-hand sidebar and default values appear normally. The original HTML loads `./src/main.js` as a JavaScript module. The screenshot's `08:00 · Clear skies` and `SPRING · DAY 1` are **hardcoded defaults** in `index.html`; a correctly running game would rewrite those to `08:00 · Sunny` and `SPRING · DAY 1 · YEAR 1`. Therefore the game engine was not initializing. The precise HTTP/network error on the user's device is unconfirmed; likely causes are a missing/misplaced `src/` folder following GitHub upload, loading via `file://`, or stale caching.

## Solution
`index.html` bundles (embeds) the stylesheet and every source JS module. No network resources are needed, no relative module paths need to resolve, and no independent PNG/JPG sprites exist. All graphics are original Canvas 2D primitives; they begin drawing as soon as the single embedded script initializes.

## Updated or added files
- `index.html` – standalone runtime, full CSS and JS
- `src/main.js` – diagnostics and recoverable error message
- `style.css` – error overlay styling (bundled automatically)
- `tools/build_single_file.py` – no-dependency source bundler
- `tools/index.template.html` – HTML template for reproducible builds
- `README.md` and `CHANGELOG.md` – upgrade, verification, developer editing instructions

## User verification
After deploying the new root `index.html` and pressing Ctrl+Shift+R, close the welcome modal. Check: full pixel-art burrow shows; Nim moves using WASD; the upper status contains `YEAR 1`; footer says `0.9.1`. Optional: browser Console `window.SCurryStatus` reports `ready: true`, `painted: true`, `error: null` and increasing `frames`.

The 10 original Node gameplay tests remain valid. An automated browser smoke test of the fully inline game verified Canvas pixels, movement, console, and zero network requests. The new bundle does not change the game save schema.
