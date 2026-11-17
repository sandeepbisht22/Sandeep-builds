"use client";

import { ROOM_COLORS } from "../palette";
import { Glow } from "./primitives";

/**
 * Soft light spill on the walls (monitor bias light, fairy lights, neon 7).
 * Kept outside the hoverable objects so the hover outline only traces real things.
 */
export function Ambience() {
  return (
    <group>
      <Glow position={[0.55, 1.72, -3.47]} size={2.2} color={ROOM_COLORS.lamp} opacity={0.35} />
      <Glow position={[0.8, 3.3, -3.465]} size={2.6} color="#ffc77a" opacity={0.18} />
      <Glow position={[-3.44, 3.55, 1.78]} size={1.4} color={ROOM_COLORS.lamp} opacity={0.4} rotation={[0, Math.PI / 2, 0]} />
    </group>
  );
}
