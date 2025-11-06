# Turf.js nearestPointOnLine Debug

Minimal test app (50 lines) using pure MapLibre (no D3/SVG) to visualize `nearestPointOnLine` behavior.

## Run

```bash
cd /home/nini/playground/turf-debug-test
npm install
npm start
```

Open http://localhost:4200 - move mouse over polygon.

## Colors

- **Green** = Border (`polygonToLine`)
- **Red** = Nearest point (`nearestPointOnLine`)
- **Blue** = Cursor
- **Orange dashed** = Distance line

## What to Look For

### Known Issues to Observe:

1. **Random Jumping**: The red point may "pop" or jump to different positions as you move smoothly
2. **Inaccuracy**: The red point may not actually be on the green line
3. **Endpoint Selection**: When far from the polygon, it may snap to the wrong endpoint
4. **Precision Drift**: Distance calculations may be inconsistent

### Testing Scenarios:

1. **Move cursor smoothly along the border** - Watch if the red point follows smoothly or jumps
2. **Move far from the polygon** - Check which endpoint it snaps to
3. **Move along long edges** - See if precision drifts
4. **Zoom in/out** - Check if behavior changes with scale

## The Code

The calculation happens in `src/app/app.component.ts`:

```typescript
// Convert polygon to lines (same as your distanceToPoint does)
const lines = polygonToLine(this.testPolygon);

// Get nearest point on line
const nearestPoint = nearestPointOnLine(lines, cursorCoords);
```

This is the **exact same calculation** your production code uses.

## Modifying the Test Polygon

Edit the `testPolygon` in `app.component.ts` to test different shapes:

```typescript
this.testPolygon = polygon([[
  [-10, 50],   // Northwest corner
  [10, 50],    // Northeast corner
  [10, 40],    // Southeast corner
  [-10, 40],   // Southwest corner
  [-10, 50]    // Close the polygon
]]);
```

Try:
- Larger polygons (will show more precision drift)
- Irregular shapes
- Polygons with many vertices
- Polygons near poles (lat > 70°)

## Dependencies

- Angular 18
- MapLibre GL 4.0
- Turf.js 7.1 (latest)
- D3-selection 3.0

## Files

```
turf-debug-test/
├── README.md
├── package.json
├── tsconfig.json
├── angular.json
└── src/
    ├── index.html
    ├── main.ts
    ├── styles.css
    └── app/
        └── app.component.ts
```
