/** Rules for the two mini-games, kept free of rendering so they can be tested. */

/** Goal mouth in world units (half the real 7.32 × 2.44 m). */
export const GOAL = { width: 3.66, height: 1.22, lineZ: -6 } as const;

export type Dive = "left" | "centre" | "right";
export type ShotResult = "goal" | "saved" | "miss";

export interface Aim {
  /** Across the goal: 0 is the middle, negative is the shooter's left. */
  x: number;
  /** Height above the ground. */
  y: number;
}

/** The keeper guesses: a little more often to a side than staying put. */
export function pickDive(random: () => number): Dive {
  const roll = random();
  if (roll < 0.4) return "left";
  if (roll < 0.8) return "right";
  return "centre";
}

/** Where the keeper's body ends up for each dive. */
export function diveX(dive: Dive): number {
  if (dive === "left") return -GOAL.width * 0.3;
  if (dive === "right") return GOAL.width * 0.3;
  return 0;
}

export function judgeShot(aim: Aim, dive: Dive): ShotResult {
  const halfWidth = GOAL.width / 2;
  if (Math.abs(aim.x) > halfWidth - 0.05 || aim.y > GOAL.height - 0.04 || aim.y < 0) return "miss";
  // Top corners are out of anyone's reach.
  if (Math.abs(aim.x) > halfWidth - 0.4 && aim.y > GOAL.height * 0.62) return "goal";
  const reach = dive === "centre" ? 0.42 : 0.72;
  const height = dive === "centre" ? GOAL.height * 0.9 : GOAL.height * 0.7;
  const saved = Math.abs(aim.x - diveX(dive)) < reach && aim.y < height;
  return saved ? "saved" : "goal";
}

export interface SwingOutcome {
  runs: 0 | 1 | 2 | 4 | 6;
  out: boolean;
  label: string;
}

/**
 * `offset` is how early (negative) or late (positive) the swing is, in seconds, against the
 * moment the ball reaches the bat. Middle it and it goes for six; miss it and you're bowled.
 */
export function judgeSwing(offset: number): SwingOutcome {
  const error = Math.abs(offset);
  if (error < 0.045) return { runs: 6, out: false, label: "Six!" };
  if (error < 0.09) return { runs: 4, out: false, label: "Four!" };
  if (error < 0.14) return { runs: 2, out: false, label: "Two runs" };
  if (error < 0.2) return { runs: 1, out: false, label: "A quick single" };
  return { runs: 0, out: true, label: "Bowled!" };
}

/** Not swinging at all: the ball is on the stumps. */
export const LEFT_ALONE: SwingOutcome = { runs: 0, out: true, label: "Bowled!" };

export const PENALTY_SHOTS = 5;
export const BALLS_PER_OVER = 6;
