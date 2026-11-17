"use client";

import { ROOM, WINDOW } from "../layout";
import { ROOM_COLORS } from "../palette";
import { usePainted } from "../usePainted";
import { nightViewTexture } from "../textures/surfaces";

const INNER_X = -ROOM.half;
const FRAME = "#c8c0ae";

/**
 * The hills at night, set back behind the wall so they parallax as the camera moves.
 * It's bigger than the opening, so it stays outside the window's hover outline: the
 * outline draws through walls and would otherwise spill over the jerseys next door.
 */
export function WindowBackdrop() {
  const view = usePainted(nightViewTexture);
  return (
    <mesh position={[INNER_X - 0.55, WINDOW.y + 0.05, WINDOW.z]} rotation-y={Math.PI / 2}>
      <planeGeometry args={[2.9, 2.1]} />
      <meshBasicMaterial map={view} toneMapped={false} />
    </mesh>
  );
}

/** Window in the left wall: frame, glass and sill. The view through it is WindowBackdrop. */
export function WindowView() {
  const { z, y, width, height } = WINDOW;
  const bar = 0.06;

  return (
    <group>
      {/* frame */}
      <group position={[INNER_X + 0.01, y, z]}>
        {[
          { p: [0, height / 2, 0], s: [0.08, bar, width + bar] },
          { p: [0, -height / 2, 0], s: [0.08, bar, width + bar] },
          { p: [0, 0, width / 2], s: [0.08, height, bar] },
          { p: [0, 0, -width / 2], s: [0.08, height, bar] },
          { p: [0, 0, 0], s: [0.06, height, 0.035] },
          { p: [0, 0.1, 0], s: [0.06, 0.035, width] },
        ].map(({ p, s }, i) => (
          <mesh key={i} position={p as [number, number, number]} castShadow>
            <boxGeometry args={s as [number, number, number]} />
            <meshStandardMaterial color={FRAME} roughness={0.7} />
          </mesh>
        ))}
        {/* glass */}
        <mesh rotation-y={Math.PI / 2} position={[-0.02, 0, 0]}>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial color="#9fb3ff" transparent opacity={0.07} roughness={0.1} metalness={0.2} depthWrite={false} />
        </mesh>
      </group>

      {/* sill */}
      <mesh position={[INNER_X + 0.12, y - height / 2 - 0.03, z]} castShadow receiveShadow>
        <boxGeometry args={[0.28, 0.05, width + 0.2]} />
        <meshStandardMaterial color={ROOM_COLORS.walnut} roughness={0.8} />
      </mesh>
    </group>
  );
}
