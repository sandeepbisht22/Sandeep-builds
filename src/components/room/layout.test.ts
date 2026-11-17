import { chapters, type ChapterId } from "@/lib/chapters";
import {
  ANCHORS,
  SHOTS,
  SHEET_GONE_T,
  SHEET_RISE_T,
  TRAVEL,
  HIT_ZONES,
  ROOM,
  WINDOW,
  type HitZone,
  anchorAt,
  frame,
  heroShift,
  lerp,
  smoothstep,
  travelPose,
  type CameraPose,
} from "./layout";

const WIDE = 16 / 9;
const TALL = 390 / 844;

function distance(a: readonly number[], b: readonly number[]): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function visibleWidth(pose: CameraPose, aspect: number): number {
  const d = distance(pose.position, pose.target);
  return 2 * d * Math.tan((pose.fov * Math.PI) / 360) * aspect;
}

describe("smoothstep and lerp", () => {
  it("clamps and eases between the edges", () => {
    expect(smoothstep(0, 1, -1)).toBe(0);
    expect(smoothstep(0, 1, 2)).toBe(1);
    expect(smoothstep(0, 1, 0.5)).toBeCloseTo(0.5);
    expect(lerp(2, 4, 0.25)).toBe(2.5);
  });
});

describe("frame", () => {
  it("fits the requested width on a wide screen", () => {
    const pose = frame(SHOTS.desk, WIDE);
    expect(visibleWidth(pose, WIDE)).toBeGreaterThanOrEqual(SHOTS.desk.fitW - 1e-6);
  });

  it("backs the camera away on tall screens so the subject still fits", () => {
    const wide = frame(SHOTS.desk, WIDE);
    const tall = frame(SHOTS.desk, TALL);
    expect(distance(tall.position, tall.target)).toBeGreaterThan(distance(wide.position, wide.target));
  });

  it("moves closer when diving into an object", () => {
    const framing = frame(SHOTS.turntable, WIDE, 0);
    const inside = frame(SHOTS.turntable, WIDE, 1);
    expect(distance(inside.position, inside.target)).toBeLessThan(distance(framing.position, framing.target));
  });

  it("trucks the camera without changing its viewing direction when shifted", () => {
    const plain = frame(SHOTS.room, WIDE);
    const shifted = frame({ ...SHOTS.room, shiftX: 0.2 }, WIDE);
    const dirOf = (p: CameraPose): number[] => p.position.map((v, i) => v - p.target[i]);
    expect(dirOf(shifted).map((v) => +v.toFixed(6))).toEqual(dirOf(plain).map((v) => +v.toFixed(6)));
    expect(distance(shifted.target, plain.target)).toBeGreaterThan(0.5);
  });
});

describe("heroShift", () => {
  it("puts the room right of centre on wide screens and lower on tall ones", () => {
    expect(heroShift(WIDE).shiftX).toBeGreaterThan(0);
    expect(heroShift(TALL).shiftX).toBe(0);
    expect(heroShift(TALL).shiftY).toBeLessThan(0);
    expect(heroShift(TALL).zoom).toBeLessThan(1);
  });
});

describe("travelPose", () => {
  it("starts at the overview and ends inside the first object", () => {
    const start = travelPose("room", "desk", 0, WIDE);
    const end = travelPose("room", "desk", 1, WIDE);
    const inside = frame(SHOTS.desk, WIDE, 1);
    expect(distance(end.position, inside.position)).toBeLessThan(1e-6);
    expect(distance(start.position, end.position)).toBeGreaterThan(1);
  });

  it("arrives at the object's framing at the arrival point", () => {
    const arrived = travelPose("desk", "wall", TRAVEL.arrive, WIDE);
    expect(distance(arrived.position, frame(SHOTS.wall, WIDE).position)).toBeLessThan(1e-6);
  });

  it("moves continuously, without jumps, across the whole travel", () => {
    const pairs: [ChapterId, ChapterId][] = chapters.slice(1).map((c, i) => [chapters[i].id, c.id]);
    for (const [from, to] of pairs) {
      let previous = travelPose(from, to, 0, WIDE);
      for (let step = 1; step <= 200; step++) {
        const next = travelPose(from, to, step / 200, WIDE);
        expect(distance(previous.position, next.position)).toBeLessThan(0.6);
        previous = next;
      }
    }
  });

  it("holds a close-up of the object, uncovered, until the next sheet starts rising", () => {
    const framed = travelPose("kit", "turntable", TRAVEL.arrive, WIDE);
    const closeUp = travelPose("kit", "turntable", TRAVEL.focus, WIDE);
    const stillHeld = travelPose("kit", "turntable", SHEET_RISE_T, WIDE);
    expect(distance(closeUp.position, closeUp.target)).toBeLessThan(distance(framed.position, framed.target));
    expect(distance(closeUp.position, stillHeld.position)).toBeLessThan(1e-9);
    expect(TRAVEL.focus).toBeLessThan(SHEET_RISE_T);
  });

  it("clamps progress outside 0…1", () => {
    expect(travelPose("desk", "wall", -1, WIDE)).toEqual(travelPose("desk", "wall", 0, WIDE));
    expect(travelPose("desk", "wall", 2, WIDE)).toEqual(travelPose("desk", "wall", 1, WIDE));
  });
});

describe("anchorAt", () => {
  it("walks mini-me from one spot to the next", () => {
    expect(distance(anchorAt("desk", "wall", 0), ANCHORS.desk)).toBeLessThan(1e-9);
    expect(distance(anchorAt("desk", "wall", 1), ANCHORS.wall)).toBeLessThan(1e-9);
    const middle = anchorAt("desk", "wall", (TRAVEL.walkStart + TRAVEL.walkEnd) / 2);
    expect(middle[0]).toBeCloseTo((ANCHORS.desk[0] + ANCHORS.wall[0]) / 2);
  });

  it("keeps every standing spot inside the room", () => {
    for (const [x, y, z] of Object.values(ANCHORS)) {
      expect(Math.abs(x)).toBeLessThan(3.5);
      expect(Math.abs(z)).toBeLessThan(3.5);
      expect(y).toBe(0);
    }
  });
});

describe("chapter coverage", () => {
  it("has a camera shot and a standing spot for every chapter", () => {
    for (const chapter of chapters) {
      expect(SHOTS[chapter.id]).toBeDefined();
      expect(ANCHORS[chapter.id]).toBeDefined();
    }
  });

  it("keeps the walk and outfit change before the next sheet rises", () => {
    expect(TRAVEL.walkStart).toBeLessThan(TRAVEL.walkEnd);
    expect(TRAVEL.walkEnd).toBeLessThan(TRAVEL.outfitSwap);
    expect(TRAVEL.outfitSwap).toBeLessThan(TRAVEL.arrive);
    expect(TRAVEL.walkStart).toBeGreaterThanOrEqual(SHEET_GONE_T - 0.15);
    expect(TRAVEL.arrive).toBeLessThan(SHEET_RISE_T);
  });
});

describe("hit zones", () => {
  type Box = { min: number[]; max: number[] };
  const box = (zone: HitZone): Box => ({
    min: zone.position.map((p, i) => p - zone.size[i] / 2),
    max: zone.position.map((p, i) => p + zone.size[i] / 2),
  });
  const overlaps = (a: Box, b: Box): boolean => [0, 1, 2].every((i) => a.min[i] < b.max[i] && b.min[i] < a.max[i]);
  const hoverable = chapters.filter((c) => c.id !== "room").map((c) => c.id as Exclude<ChapterId, "room">);

  it("gives every room object at least one core", () => {
    for (const id of hoverable) expect(HIT_ZONES[id].length).toBeGreaterThan(0);
  });

  it("keeps every core inside the room", () => {
    for (const id of hoverable) {
      for (const zone of HIT_ZONES[id]) {
        const { min, max } = box(zone);
        expect(min[0]).toBeGreaterThanOrEqual(-ROOM.half);
        expect(max[0]).toBeLessThanOrEqual(ROOM.half);
        expect(min[2]).toBeGreaterThanOrEqual(-ROOM.half);
        expect(max[2]).toBeLessThanOrEqual(ROOM.half);
        expect(min[1]).toBeGreaterThanOrEqual(0);
        expect(max[1]).toBeLessThanOrEqual(ROOM.wallHeight);
      }
    }
  });

  it("never lets two objects' cores overlap", () => {
    for (const a of hoverable) {
      for (const b of hoverable) {
        if (a >= b) continue;
        for (const za of HIT_ZONES[a]) for (const zb of HIT_ZONES[b]) expect(overlaps(box(za), box(zb))).toBe(false);
      }
    }
  });

  it("keeps the window's core inside the window opening, clear of the kit corner", () => {
    const [opening] = HIT_ZONES.window;
    const { min, max } = box(opening);
    expect(min[2]).toBeGreaterThanOrEqual(WINDOW.z - WINDOW.width / 2);
    expect(max[2]).toBeLessThanOrEqual(WINDOW.z + WINDOW.width / 2);
    expect(min[1]).toBeGreaterThanOrEqual(WINDOW.y - WINDOW.height / 2);
    expect(max[1]).toBeLessThanOrEqual(WINDOW.y + WINDOW.height / 2);
  });
});
