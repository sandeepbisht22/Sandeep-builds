"use client";

import { ROOM, WINDOW } from "../layout";
import { ROOM_COLORS } from "../palette";
import { usePainted } from "../usePainted";
import { woodFloorTexture } from "../textures/surfaces";

const { half, wallHeight: H, wallThickness: T, floorThickness: F } = ROOM;
const LEFT_X = -half - T / 2;
const WIN_BACK = WINDOW.z - WINDOW.width / 2;
const WIN_FRONT = WINDOW.z + WINDOW.width / 2;
const WIN_BOTTOM = WINDOW.y - WINDOW.height / 2;
const WIN_TOP = WINDOW.y + WINDOW.height / 2;

interface BlockProps {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}

function Block({ position, size, color }: BlockProps) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  );
}

/** Floor slab, two walls (the left one with a window opening), caps and skirting. */
export function Shell() {
  const wood = usePainted(woodFloorTexture);
  const backZ = -half - T / 2;
  const fullX = half * 2 + T;

  return (
    <group>
      <Block position={[-T / 2, -F / 2, -T / 2]} size={[fullX, F, fullX]} color={ROOM_COLORS.slab} />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, 0]} receiveShadow>
        <planeGeometry args={[half * 2, half * 2]} />
        <meshStandardMaterial map={wood} roughness={0.72} />
      </mesh>

      <Block position={[-T / 2, H / 2, backZ]} size={[fullX, H, T]} color={ROOM_COLORS.wall} />

      {/* left wall, built around the window opening */}
      <Block position={[LEFT_X, H / 2, (-half - T + WIN_BACK) / 2]} size={[T, H, WIN_BACK + half + T]} color={ROOM_COLORS.wall} />
      <Block position={[LEFT_X, H / 2, (WIN_FRONT + half) / 2]} size={[T, H, half - WIN_FRONT]} color={ROOM_COLORS.wall} />
      <Block position={[LEFT_X, WIN_BOTTOM / 2, WINDOW.z]} size={[T, WIN_BOTTOM, WINDOW.width]} color={ROOM_COLORS.wall} />
      <Block position={[LEFT_X, (WIN_TOP + H) / 2, WINDOW.z]} size={[T, H - WIN_TOP, WINDOW.width]} color={ROOM_COLORS.wall} />

      {/* the cut edges of the diorama */}
      <Block position={[-T / 2, H + 0.012, backZ]} size={[fullX, 0.024, T]} color={ROOM_COLORS.wallCap} />
      <Block position={[LEFT_X, H + 0.012, -T / 2]} size={[T, 0.024, fullX]} color={ROOM_COLORS.wallCap} />

      <Block position={[0, 0.07, -half + 0.02]} size={[half * 2, 0.14, 0.04]} color={ROOM_COLORS.skirting} />
      <Block position={[-half + 0.02, 0.07, 0]} size={[0.04, 0.14, half * 2]} color={ROOM_COLORS.skirting} />
    </group>
  );
}
