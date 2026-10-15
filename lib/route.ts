/** The courier's path: a gentle curve from the restaurant to the door. */
export type Point = { x: number; y: number };

/** Control point that bends the path to one side by `bend` of its length. */
export function bendPoint(a: Point, b: Point, bend = 0.22): Point {
  "worklet";
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  return { x: mx - (b.y - a.y) * bend, y: my + (b.x - a.x) * bend };
}

/** Point at `t` (0..1) along the curve. */
export function pointOnCurve(a: Point, c: Point, b: Point, t: number): Point {
  "worklet";
  const u = 1 - t;
  return { x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y };
}

export function sampleCurve(a: Point, c: Point, b: Point, steps = 32): Point[] {
  return Array.from({ length: steps + 1 }, (_, i) => pointOnCurve(a, c, b, i / steps));
}
