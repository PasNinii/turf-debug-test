# Turf.js nearestPointOnLine Debug

Minimal MapLibre app to visualize `nearestPointOnLine` behavior against a polygon border.

## Run

Install nvm (skip if `command -v nvm` prints something):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash
exec $SHELL          # reload so `nvm` is on PATH
```

Then, from the repo root:

```bash
nvm install          # reads .nvmrc (Node 24)
nvm use
npm install
npm start
```

Open http://localhost:4200 and move the mouse over the map.

> nvm is a bash/zsh function and does nothing under fish. On fish, use [fnm](https://github.com/Schniz/fnm) instead — it reads the same `.nvmrc`:
> ```fish
> curl -fsSL https://fnm.vercel.app/install | bash
> fnm use --install-if-missing
> ```

## Colors

| Color | Meaning |
|-------|---------|
| Teal | Test polygon (`POLY`) |
| Green | Border returned by `polygonToLine` |
| Blue | Cursor |
| Red | Nearest point returned by `nearestPointOnLine` |

## What to look for

1. **Jumping** — move smoothly along the border, watch whether the red point pops between positions.
2. **Off-line results** — the red point should always sit on the green line.
3. **Endpoint snapping** — move far from the polygon and check which vertex it picks.
4. **Precision drift** — follow a long edge, then zoom in and repeat.

## The code

Everything lives in `src/app/app.component.ts`:

```ts
const BORDER = polygonToLine(POLY) as Feature<LineString>;
const nearest = nearestPointOnLine(BORDER, cursor);
```

Edit `POLY` to test other shapes — large polygons, irregular outlines, many vertices, or latitudes above 70°.

## Stack

| Package | Version |
|---------|---------|
| Angular | 22 (zoneless) |
| MapLibre GL | 6 |
| Turf.js | 7.4 |
| TypeScript | 6.0 |

MapLibre 6 loads its worker from a separate file, copied to the app root by the `assets` entry in `angular.json` and pinned via `config.WORKER_URL`.
