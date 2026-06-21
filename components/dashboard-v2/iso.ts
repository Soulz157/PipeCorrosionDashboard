// Isometric projection helpers for the Level 1 factory flow.
// Ground-plane coordinates are percentages (0..100) — the same `position2d`
// field the 2.5D canvas uses — projected onto a 2:1 dimetric SVG plane.

export const ISO = {
  /** SVG viewBox the Level 1 scene is drawn into. */
  viewW: 1000,
  viewH: 620,
  /** Centre X of the diamond plane. */
  cx: 500,
  /** Y of the back (top) corner of the plane. */
  top: 150,
  /** Horizontal half-span of the plane. */
  spanX: 360,
  /** Vertical half-span (2:1 ratio gives the iso look). */
  spanY: 150,
  /** Iso tile footprint under each node. */
  tileW: 46,
  tileH: 23,
} as const;

export type Pt = { x: number; y: number };

/** Project a ground-plane percent coordinate to an SVG point. */
export function projectIso(xPct: number, yPct: number): Pt {
  const gx = xPct / 100;
  const gy = yPct / 100;
  const isoX = gx - gy; // -1 .. 1
  const isoY = gx + gy; // 0 .. 2
  return {
    x: ISO.cx + isoX * ISO.spanX,
    y: ISO.top + isoY * ISO.spanY,
  };
}

/** Painter's-algorithm depth key — larger = nearer the viewer (drawn last). */
export function depthKey(xPct: number, yPct: number): number {
  return xPct + yPct;
}

/** A diamond (iso tile) polygon centred at `c`. */
export function diamond(c: Pt, w: number = ISO.tileW, h: number = ISO.tileH): string {
  return [
    `${c.x},${c.y - h / 2}`,
    `${c.x + w / 2},${c.y}`,
    `${c.x},${c.y + h / 2}`,
    `${c.x - w / 2},${c.y}`,
  ].join(" ");
}

/** The four faces of an extruded iso cuboid rising `height` above base `c`. */
export function pillarFaces(
  c: Pt,
  height: number,
  w: number = ISO.tileW,
  h: number = ISO.tileH,
) {
  const hw = w / 2;
  const hh = h / 2;
  const topY = c.y - height;
  return {
    // Left side face
    left: `${c.x - hw},${c.y} ${c.x},${c.y + hh} ${c.x},${topY + hh} ${c.x - hw},${topY}`,
    // Right side face
    right: `${c.x + hw},${c.y} ${c.x},${c.y + hh} ${c.x},${topY + hh} ${c.x + hw},${topY}`,
    // Top cap diamond
    cap: diamond({ x: c.x, y: topY }, w, h),
    topY,
  };
}
