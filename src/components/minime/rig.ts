import type { ArmPose, OutfitId } from "./outfits";

/**
 * Proportions of the 3D mini-me, in world units (desk top = 1.0). Feet at y = 0, facing +z.
 * "Right" means mini-me's own right, which is the -x side.
 */
export const BODY = {
  headY: 0.98,
  headR: 0.27,
  headScale: [1, 0.93, 0.95] as const,
  neckY: 0.715,
  torsoY: 0.53,
  torsoH: 0.32,
  shoulderX: 0.2,
  shoulderY: 0.645,
  hipX: 0.085,
  hipY: 0.335,
} as const;

/** His left ear (+x), where the gold hoop is. */
export const EARRING_SIDE = 1;

const DEG = Math.PI / 180;

/**
 * A point on (or just off) the head sphere. `a` is degrees from the front towards +x,
 * `theta` is degrees down from the crown.
 */
export function onHead(a: number, theta: number, r: number = BODY.headR): [number, number, number] {
  const A = a * DEG;
  const T = theta * DEG;
  return [r * Math.sin(T) * Math.sin(A), r * Math.cos(T), r * Math.sin(T) * Math.cos(A)];
}

export interface ArmAngles {
  x: number;
  z: number;
}

export interface Pose {
  right: ArmAngles;
  left: ArmAngles;
}

/** Negative x swings an arm forward; right arm swings out with negative z, left with positive. */
export const POSES: Record<ArmPose, Pose> = {
  idle: { right: { x: 0.05, z: -0.14 }, left: { x: 0.05, z: 0.14 } },
  holdMug: { right: { x: -1.2, z: 0.2 }, left: { x: 0.05, z: 0.14 } },
  holdBook: { right: { x: -0.95, z: 0.36 }, left: { x: -0.95, z: -0.36 } },
  holdBall: { right: { x: -0.55, z: -0.05 }, left: { x: 0.05, z: 0.14 } },
  holdPole: { right: { x: -0.35, z: -0.28 }, left: { x: 0.05, z: 0.14 } },
};

/** Mutable instructions from whoever drives mini-me (the room walker, the lab, a mini-game). */
export interface MiniMeControl {
  outfit: OutfitId;
  walking: boolean;
  /** World units moved since the last frame, so steps match the ground covered. */
  stride: number;
  /** Advance the walk cycle on a clock instead of by distance (lab / demos). */
  autoStep: boolean;
  /** Target heading in radians (0 = facing +z). */
  facing: number;
  /** Increment to make him wave once. */
  waves: number;
  /** Blink now and then (off for still captures). */
  blinks: boolean;
  /** Increment to kick with the right foot. */
  kicks: number;
  /** Increment to bowl (right arm over). */
  bowls: number;
}

export function createControl(outfit: OutfitId, facing = 0): MiniMeControl {
  return { outfit, walking: false, stride: 0, autoStep: false, facing, waves: 0, blinks: true, kicks: 0, bowls: 0 };
}
