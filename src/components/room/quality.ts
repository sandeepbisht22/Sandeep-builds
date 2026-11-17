/**
 * Rendering budgets for the room, best first. Postprocessing dominates the room's GPU cost
 * (measured: MSAA ×4 at DPR 1.75 held an M4 to ~35fps in travel), so resolution is what we trade.
 * MSAA stays the same on every tier on purpose: changing it rebuilds the whole effect chain
 * (a shader recompile and a visible hitch), while changing resolution only resizes buffers.
 * The room starts at the top tier and only ever steps down, so it can't flip-flop.
 */
export interface QualityTier {
  /** Upper bound for the canvas pixel ratio (the device's own ratio still caps it). */
  dpr: number;
  /** MSAA samples on the postprocessing buffer. */
  msaa: number;
}

export const QUALITY_TIERS: readonly QualityTier[] = [
  { dpr: 1.5, msaa: 2 },
  { dpr: 1.25, msaa: 2 },
  { dpr: 1, msaa: 2 },
];

/** The next tier down, staying on the last one once there. */
export function stepDown(current: number): number {
  return Math.min(QUALITY_TIERS.length - 1, current + 1);
}

/**
 * Average fps below which the room counts as struggling (and steps down), per display refresh
 * rate; the upper value is only used by the monitor to tell trends apart.
 * 120Hz screens step down under 70fps, 60Hz screens under 50fps.
 */
export function fpsBounds(refreshRate: number): [lower: number, upper: number] {
  return refreshRate > 90 ? [70, 110] : [50, 58];
}
