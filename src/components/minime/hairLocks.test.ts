import { Vector3 } from "three";
import { lockGeometry, mergeLocks, type LockSpec } from "./hairLocks";

const RADIAL = 8;
const TUBULAR = 24;
const SHORT_RINGS = 8;

const STRAIGHT: LockSpec = {
  points: [
    [0, 0, 0],
    [0, -0.1, 0],
    [0, -0.2, 0],
  ],
  radius: 0.04,
  tip: 0.25,
};

/** Mean distance of one ring of tube vertices from the lock's centre line (x = z = 0). */
function ringRadius(spec: LockSpec, ring: number): number {
  const position = lockGeometry(spec, TUBULAR, RADIAL).getAttribute("position");
  const v = new Vector3();
  let total = 0;
  for (let j = 0; j <= RADIAL; j++) {
    v.fromBufferAttribute(position, ring * (RADIAL + 1) + j);
    total += Math.hypot(v.x, v.z);
  }
  return total / (RADIAL + 1);
}

describe("hair locks", () => {
  it("starts a lock at its full radius", () => {
    expect(ringRadius(STRAIGHT, 0)).toBeCloseTo(0.04, 4);
  });

  it("tapers a lock to its tip radius", () => {
    expect(ringRadius(STRAIGHT, TUBULAR)).toBeCloseTo(0.01, 4);
  });

  it("narrows steadily from root to tip", () => {
    const radii = [0, 6, 12, 18, 24].map((ring) => ringRadius(STRAIGHT, ring));
    for (let i = 1; i < radii.length; i++) expect(radii[i]).toBeLessThan(radii[i - 1]);
  });

  it("merges every lock into one indexed geometry", () => {
    const second: LockSpec = { ...STRAIGHT, points: STRAIGHT.points.map(([x, y, z]) => [x + 0.2, y, z] as const) };
    const one = lockGeometry(STRAIGHT);
    const merged = mergeLocks([STRAIGHT, second]);
    expect(merged.getAttribute("position").count).toBe(one.getAttribute("position").count * 2);
    expect(merged.getAttribute("normal").count).toBe(merged.getAttribute("position").count);
    expect(merged.getIndex()?.count).toBe((one.getIndex()?.count ?? 0) * 2);
    // The second lock's triangles point at its own vertices, not the first lock's.
    const index = merged.getIndex();
    const offset = one.getAttribute("position").count;
    expect(index?.getX(index.count - 1)).toBeGreaterThanOrEqual(offset);
  });

  it("flattens a lock against the head, keeping its width along the surface", () => {
    // A lock lying across the front of the head: the head normal there is +z.
    const across: LockSpec = { points: [[-0.1, 0, 0.3], [0, 0, 0.3], [0.1, 0, 0.3]], radius: 0.04, tip: 1, flat: 0.5 };
    const position = lockGeometry(across, SHORT_RINGS, RADIAL).getAttribute("position");
    const v = new Vector3();
    let maxDepth = 0;
    let maxHeight = 0;
    for (let j = 0; j <= RADIAL; j++) {
      v.fromBufferAttribute(position, (SHORT_RINGS / 2) * (RADIAL + 1) + j);
      maxDepth = Math.max(maxDepth, Math.abs(v.z - 0.3));
      maxHeight = Math.max(maxHeight, Math.abs(v.y));
    }
    expect(maxHeight).toBeCloseTo(0.04, 3);
    expect(maxDepth).toBeCloseTo(0.02, 3);
  });

  it("starts narrow at the root when asked, so a lock grows out of the scalp", () => {
    expect(ringRadius({ ...STRAIGHT, root: 0.3 }, 0)).toBeCloseTo(0.012, 4);
    expect(ringRadius({ ...STRAIGHT, root: 0.3 }, 6)).toBeGreaterThan(ringRadius({ ...STRAIGHT, root: 0.3 }, 0) * 2);
  });

  it("refuses a flatness that would collapse the lock", () => {
    expect(() => lockGeometry({ ...STRAIGHT, flat: 0 })).toThrow("flat");
  });

  it("refuses a lock with fewer than two points", () => {
    expect(() => lockGeometry({ points: [[0, 0, 0]], radius: 0.02 })).toThrow("at least two points");
  });
});
