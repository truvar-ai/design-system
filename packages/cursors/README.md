# Truvar Cursors

The Truvar OS mouse cursors for Windows and Linux, in Truvar Blue, Truvar Gold and Truvar Duo (both colours). People download them from [design-system.truvar.ai/docs/cursors](https://design-system.truvar.ai/docs/cursors/), which also explains how to use the Truvar pointer colours on macOS, since macOS doesn't allow other cursor shapes.

## What it builds

`pnpm cursors:build` (from the repo root) draws every cursor from [src/shapes.mjs](src/shapes.mjs) and writes:

| File | What |
|---|---|
| `apps/docs/public/downloads/truvar-cursors-windows.zip` | A `.cur` file per pointer (`.ani` for the animated ones) and an `install.inf`, for each of the three colours |
| `apps/docs/public/downloads/truvar-cursors-linux.zip` | An Xcursor theme per colour, with every name apps ask for, and `install.sh` |
| `apps/docs/public/cursors/<colour>/` | The preview images on the docs page |
| `apps/docs/src/docs/cursors.json` | The cursor list the docs page reads |

The outputs are committed, so the docs build doesn't run this. Run it after changing a shape and commit the results.

## The shapes

Every cursor is drawn once on a 32 × 32 grid and rendered at each size: 32 to 256 px for Windows, 24 to 96 px for Linux. The shapes are solid, with no outline. Duo adds a band in its second colour around each shape, so it stays visible on any background, including navy and gold. Busy and Working in background are the orbit from `OrbitLoader`: 12 frames at 33 ms, one turn every 1.6 s.

The file formats are written in [src/encode.mjs](src/encode.mjs) with no other dependency than the SVG renderer ([resvg](https://github.com/yisibl/resvg-js)). Windows cursors store sizes of 64 px and up as PNG, which keeps the animated files small enough for Windows to load them.

## Checking a change

- **Windows:** unzip the download, right-click `install.inf` › Install, then choose the scheme in Mouse settings › Pointers.
- **Linux:** `sh install.sh` from the unzipped folder, or copy the theme folders into `~/.local/share/icons`.
