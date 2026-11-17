"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { CatmullRomCurve3, Vector3, type MeshStandardMaterial } from "three";
import { lights } from "@/lib/travel";
import { ROOM_COLORS } from "../palette";
import { usePainted } from "../usePainted";
import { polaroidTexture, type PolaroidKind } from "../textures/screens";

const WALL_Z = -3.47;
const BOARD = { x: 0.8, y: 2.86, w: 1.95, h: 0.98 };

interface PolaroidProps {
  kind: PolaroidKind;
  x: number;
  y: number;
  tilt: number;
}

function Polaroid({ kind, x, y, tilt }: PolaroidProps) {
  const map = usePainted(() => polaroidTexture(kind), `polaroid:${kind}`);
  return (
    <group position={[x, y, WALL_Z + 0.035]} rotation-z={tilt}>
      <mesh castShadow>
        <planeGeometry args={[0.32, 0.384]} />
        <meshStandardMaterial map={map} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.17, 0.012]}>
        <sphereGeometry args={[0.016, 12, 12]} />
        <meshStandardMaterial color={ROOM_COLORS.lamp} roughness={0.4} />
      </mesh>
    </group>
  );
}

/** Fairy lights draped above the board; bulbs glow with the "fairy" light level. */
function FairyLights() {
  const bulbs = useRef<MeshStandardMaterial[]>([]);
  const { points, wire } = useMemo(() => {
    const curve = new CatmullRomCurve3([
      new Vector3(-0.3, 3.5, WALL_Z + 0.03),
      new Vector3(0.3, 3.32, WALL_Z + 0.05),
      new Vector3(0.8, 3.42, WALL_Z + 0.04),
      new Vector3(1.35, 3.3, WALL_Z + 0.05),
      new Vector3(1.9, 3.5, WALL_Z + 0.03),
    ]);
    return { points: curve.getSpacedPoints(16), wire: curve };
  }, []);

  useFrame(({ clock }) => {
    bulbs.current.forEach((material, i) => {
      const twinkle = 0.75 + Math.sin(clock.elapsedTime * 2 + i * 1.7) * 0.25;
      material.emissiveIntensity = lights.fairy * 4 * twinkle;
    });
  });

  return (
    <group>
      <mesh>
        <tubeGeometry args={[wire, 64, 0.005, 6, false]} />
        <meshStandardMaterial color="#1a1a20" />
      </mesh>
      {points.map((point, i) => (
        <mesh key={i} position={point}>
          <sphereGeometry args={[0.022, 10, 10]} />
          <meshStandardMaterial
            ref={(m) => {
              if (m) bulbs.current[i] = m;
            }}
            color="#ffe3b8"
            emissive="#ffc77a"
            emissiveIntensity={0}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

export function PhotoWall() {
  return (
    <group>
      <RoundedBox args={[BOARD.w + 0.08, BOARD.h + 0.08, 0.035]} radius={0.012} position={[BOARD.x, BOARD.y, WALL_Z + 0.005]} castShadow>
        <meshStandardMaterial color={ROOM_COLORS.walnutDark} roughness={0.7} />
      </RoundedBox>
      <mesh position={[BOARD.x, BOARD.y, WALL_Z + 0.024]} receiveShadow>
        <planeGeometry args={[BOARD.w, BOARD.h]} />
        <meshStandardMaterial color={ROOM_COLORS.cork} roughness={1} />
      </mesh>
      <Polaroid kind="college" x={0.22} y={2.9} tilt={0.07} />
      <Polaroid kind="quark" x={0.8} y={2.84} tilt={-0.04} />
      <Polaroid kind="dew" x={1.38} y={2.9} tilt={0.05} />
      <mesh position={[1.62, 2.5, WALL_Z + 0.03]} rotation-z={-0.1}>
        <planeGeometry args={[0.14, 0.14]} />
        <meshStandardMaterial color="#f7d774" roughness={0.9} />
      </mesh>
      <mesh position={[0.02, 2.52, WALL_Z + 0.03]} rotation-z={0.12}>
        <planeGeometry args={[0.13, 0.13]} />
        <meshStandardMaterial color="#a7e3c4" roughness={0.9} />
      </mesh>
      <FairyLights />
    </group>
  );
}
