import type { ChapterId } from "@/lib/chapters";

export type Vec3 = readonly [number, number, number];

/** Inner floor spans -half…half on x and z. Back wall at z = -half, left wall at x = -half. */
export const ROOM = {
  half: 3.5,
  wallHeight: 4.2,
  wallThickness: 0.25,
  floorThickness: 0.35,
} as const;

/** The window opening in the left wall. */
export const WINDOW = { z: -1.0, y: 2.45, width: 1.9, height: 1.5 } as const;

export interface ShotSpec {
  target: Vec3;
  /** Direction from the target towards the camera; normalised when used. */
  dir: Vec3;
  /** World-space width and height that must fit on screen. */
  fitW: number;
  fitH: number;
  fov: number;
  /** Width that fills the screen at the end of the dive into the object. */
  diveW: number;
  diveTarget?: Vec3;
  /** Screen-space shift of the subject, as a fraction of the visible width/height (camera trucks, no rotation). */
  shiftX?: number;
  shiftY?: number;
}

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export const SHOTS: Record<ChapterId, ShotSpec> = {
  room: { target: [0, 1.35, 0], dir: [1, 0.72, 1], fitW: 13.2, fitH: 9.6, fov: 28, diveW: 13.2 },
  desk: { target: [0.7, 1.22, -2.85], dir: [0.34, 0.26, 1], fitW: 4.0, fitH: 2.9, fov: 30, diveW: 1.3, diveTarget: [0.55, 1.68, -3.24] },
  wall: { target: [0.75, 2.2, -3.1], dir: [0.16, 0.02, 1], fitW: 3.4, fitH: 3.1, fov: 30, diveW: 0.62, diveTarget: [0.8, 2.84, -3.43] },
  kit: { target: [-3.15, 1.95, 1.78], dir: [1, 0.24, 0.26], fitW: 4.4, fitH: 3.9, fov: 30, diveW: 1.1, diveTarget: [-3.42, 2.3, 1.78] },
  turntable: { target: [-2.95, 0.85, -0.95], dir: [1, 0.55, 0.36], fitW: 3.2, fitH: 2.3, fov: 30, diveW: 0.5, diveTarget: [-3.2, 0.9, -1.05] },
  shelf: { target: [-2.3, 1.4, -2.9], dir: [0.36, 0.16, 1], fitW: 3.0, fitH: 3.4, fov: 30, diveW: 0.7, diveTarget: [-2.4, 1.0, -3.15] },
  window: { target: [-3.3, 1.85, -1.0], dir: [1, 0.08, 0.14], fitW: 3.2, fitH: 3.0, fov: 30, diveW: 1.2, diveTarget: [-3.5, 2.45, -1.0] },
};

/** Where mini-me stands for each chapter (floor positions), in front of each object and clear of furniture. */
export const ANCHORS: Record<ChapterId, Vec3> = {
  room: [0.95, 0, 1.0],
  desk: [-0.5, 0, -1.9],
  wall: [2.5, 0, -1.95],
  kit: [-2.55, 0, 1.75],
  turntable: [-2.15, 0, 0.5],
  shelf: [-0.75, 0, -2.35],
  window: [2.15, 0, 1.3],
};

/** The camera's angle on mini-me at each stop: his front, with that chapter's object behind him. */
export const MEET: Record<ChapterId, Vec3> = {
  room: [1, 0.55, 1],
  desk: [0.45, 0.3, 1],
  wall: [0.2, 0.25, 1],
  kit: [1, 0.28, 0.35],
  turntable: [0.62, 0.3, 0.9],
  shelf: [0.55, 0.28, 1],
  window: [0.6, 0.3, 1],
};

/** Height of each travel spacer in vh. Keep in sync with TravelSpacer's class (h-[330vh]). */
export const TRAVEL_SPACER_VH = 330;

/** Progress at which the previous sheet has fully slid away / the next sheet starts rising. */
export const SHEET_GONE_T = 100 / (TRAVEL_SPACER_VH + 100);
export const SHEET_RISE_T = TRAVEL_SPACER_VH / (TRAVEL_SPACER_VH + 100);

/**
 * One travel, as fractions of its scroll distance, in five beats:
 * follow mini-me as he walks over → settle on him while he changes → frame the object →
 * close in on it and hold → dive in as the next sheet rises over it.
 * Everything before the dive happens while the room is fully on screen.
 */
export const TRAVEL = {
  pullBack: 0.15,
  walkStart: 0.25,
  walkEnd: 0.43,
  meet: 0.475,
  outfitSwap: 0.485,
  hold: 0.545,
  arrive: 0.62,
  focus: 0.71,
} as const;

/** How far into the object the held close-up goes (0 = framing, 1 = inside). */
const FOCUS_DIVE = 0.75;

/** Full-body framing of mini-me (he's 1.2× life-size in the room, about 1.55 tall). */
const FIGURE = { centre: 0.82, fitW: 2.7, fitH: 2.3 } as const;
/** How much wider the camera frames him while following him across the room. */
const FOLLOW_SCALE = 1.75;

const DEG = Math.PI / 180;

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function lerp3(a: Vec3, b: Vec3, t: number): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function normalize(v: Vec3): [number, number, number] {
  const length = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / length, v[1] / length, v[2] / length];
}

function cross(a: Vec3, b: Vec3): [number, number, number] {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

/**
 * In the hero the room sits right of centre on wide screens (the name reads on the left)
 * and low on tall screens (the name reads above it).
 */
export function heroShift(aspect: number): { shiftX: number; shiftY: number; zoom: number } {
  if (aspect >= 1.15) return { shiftX: 0.16, shiftY: 0.02, zoom: 1 };
  if (aspect >= 0.85) return { shiftX: 0, shiftY: -0.12, zoom: 0.92 };
  return { shiftX: 0, shiftY: -0.1, zoom: 0.74 };
}

function overviewShot(aspect: number): ShotSpec {
  const { shiftX, shiftY, zoom } = heroShift(aspect);
  const base = SHOTS.room;
  return { ...base, shiftX, shiftY, fitW: base.fitW * zoom, fitH: base.fitH * zoom, diveW: base.diveW * zoom };
}

/** Camera pose that fits a shot on a screen of the given aspect ratio. `dive` 0 = framing, 1 = inside. */
export function frame(spec: ShotSpec, aspect: number, dive = 0): CameraPose {
  const width = lerp(spec.fitW, spec.diveW, dive);
  const height = spec.fitH * (width / spec.fitW);
  const target = spec.diveTarget ? lerp3(spec.target, spec.diveTarget, dive) : ([...spec.target] as [number, number, number]);
  const tanV = Math.tan((spec.fov * DEG) / 2);
  const tanH = tanV * aspect;
  const distance = Math.max(width / 2 / tanH, height / 2 / tanV);
  const dir = normalize(spec.dir);
  const position: [number, number, number] = [
    target[0] + dir[0] * distance,
    target[1] + dir[1] * distance,
    target[2] + dir[2] * distance,
  ];

  const shiftX = spec.shiftX ?? 0;
  const shiftY = spec.shiftY ?? 0;
  if (shiftX !== 0 || shiftY !== 0) {
    const forward: Vec3 = [-dir[0], -dir[1], -dir[2]];
    const right = normalize(cross(forward, [0, 1, 0]));
    const up = cross(right, forward);
    const dx = -shiftX * 2 * distance * tanH;
    const dy = -shiftY * 2 * distance * tanV;
    for (let i = 0; i < 3; i++) {
      const offset = right[i] * dx + up[i] * dy;
      position[i] += offset;
      target[i] += offset;
    }
  }
  return { position, target, fov: spec.fov };
}

function blendPose(a: CameraPose, b: CameraPose, t: number): CameraPose {
  return {
    position: lerp3(a.position, b.position, t),
    target: lerp3(a.target, b.target, t),
    fov: lerp(a.fov, b.fov, t),
  };
}

/** A shot of mini-me standing at `spot`, seen from `dir`. `scale` > 1 frames more of the room around him. */
function figureShot(spot: Vec3, dir: Vec3, aspect: number, scale = 1): CameraPose {
  return frame(
    {
      target: [spot[0], FIGURE.centre * (scale > 1 ? 1.15 : 1), spot[2]],
      dir,
      fitW: FIGURE.fitW * scale,
      fitH: FIGURE.fitH * scale,
      fov: 30,
      diveW: FIGURE.fitW * scale,
    },
    aspect,
  );
}

/** Camera pose while travelling from one chapter's object to the next. */
export function travelPose(from: ChapterId, to: ChapterId, t: number, aspect: number): CameraPose {
  const k = Math.min(1, Math.max(0, t));
  const T = TRAVEL;
  const fromRoom = from === "room";
  const segment = (a: number, b: number): number => smoothstep(a, b, k);

  // While he walks, the camera follows him, turning from the old angle to the new one.
  const follow = (progress: number): CameraPose => {
    const spot = lerp3(ANCHORS[from], ANCHORS[to], progress);
    const dir = normalize(lerp3(normalize(MEET[from]), normalize(MEET[to]), progress));
    return figureShot(spot, [dir[0], dir[1] + 0.25, dir[2]], aspect, FOLLOW_SCALE);
  };

  // From the hero, start gliding down to mini-me as soon as the name scrolls away: it's a long way in.
  const settled = fromRoom ? 0.05 : T.pullBack;
  if (k <= settled) {
    if (fromRoom) return frame(overviewShot(aspect), aspect);
    return blendPose(frame(SHOTS[from], aspect, 1), frame(SHOTS[from], aspect, 0), segment(0, T.pullBack));
  }
  if (k <= T.walkStart) {
    const pulled = fromRoom ? frame(overviewShot(aspect), aspect) : frame(SHOTS[from], aspect, 0);
    return blendPose(pulled, follow(0), segment(settled, T.walkStart));
  }
  if (k <= T.walkEnd) return follow(segment(T.walkStart, T.walkEnd));
  const meet = figureShot(ANCHORS[to], MEET[to], aspect);
  if (k <= T.meet) return blendPose(follow(1), meet, segment(T.walkEnd, T.meet));
  if (k <= T.hold) return meet;
  const arrive = frame(SHOTS[to], aspect, 0);
  if (k <= T.arrive) return blendPose(meet, arrive, segment(T.hold, T.arrive));
  // Close in on the object and hold it until the sheet starts to rise, so it's seen uncovered.
  const focus = frame(SHOTS[to], aspect, FOCUS_DIVE);
  if (k <= T.focus) return blendPose(arrive, focus, segment(T.arrive, T.focus));
  if (k <= SHEET_RISE_T) return focus;
  return blendPose(focus, frame(SHOTS[to], aspect, 1), segment(SHEET_RISE_T, 1));
}

/** Mini-me's floor position during a travel. */
export function anchorAt(from: ChapterId, to: ChapterId, t: number): [number, number, number] {
  const progress = smoothstep(TRAVEL.walkStart, TRAVEL.walkEnd, t);
  return lerp3(ANCHORS[from], ANCHORS[to], progress);
}
