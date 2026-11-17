"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import type { Group } from "three";
import { lights } from "@/lib/travel";
import { ROOM_COLORS } from "../palette";
import { usePainted } from "../usePainted";
import { vinylTexture } from "../textures/surfaces";
import { Segment } from "./primitives";

const CAB = { x: -3.225, z: -1.0, w: 0.55, len: 1.9, h: 0.7, legs: 0.08 };
const TOP = CAB.legs + CAB.h;
const RECORD_COLORS = ["#1b1424", "#f2eadb", "#3c5a7a", "#ff8a1f", "#2b2b3b", "#b44b2a", "#e4dccb", "#6b3a4a"];

function Speaker({ z }: { z: number }) {
  return (
    <group position={[-3.2, TOP, z]}>
      <RoundedBox args={[0.3, 0.44, 0.28]} radius={0.02} position={[0, 0.22, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#15151b" roughness={0.6} />
      </RoundedBox>
      {[
        { y: 0.15, r: 0.085 },
        { y: 0.33, r: 0.03 },
      ].map(({ y, r }) => (
        <group key={y} position={[0.151, y, 0]} rotation-z={-Math.PI / 2}>
          <mesh>
            <cylinderGeometry args={[r, r, 0.01, 28]} />
            <meshStandardMaterial color="#0a0a0d" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.006, 0]} rotation-x={Math.PI / 2}>
            <torusGeometry args={[r, 0.008, 8, 28]} />
            <meshStandardMaterial color="#2b2b33" roughness={0.4} metalness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Low cabinet under the window with a turntable, records and two speakers. */
export function Turntable() {
  const vinyl = usePainted(vinylTexture);
  const disc = useRef<Group>(null);

  useFrame((_, delta) => {
    if (disc.current) disc.current.rotation.y -= delta * (0.3 + lights.screens * 3.2);
  });

  return (
    <group>
      <RoundedBox args={[CAB.w, CAB.h, CAB.len]} radius={0.02} position={[CAB.x, CAB.legs + CAB.h / 2, CAB.z]} castShadow receiveShadow>
        <meshStandardMaterial color={ROOM_COLORS.walnutDark} roughness={0.7} />
      </RoundedBox>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[CAB.x + sx * 0.22, CAB.legs / 2, CAB.z + sz * 0.88]}>
            <cylinderGeometry args={[0.02, 0.015, CAB.legs, 8]} />
            <meshStandardMaterial color="#121218" />
          </mesh>
        )),
      )}
      {/* two open compartments full of records, facing the room */}
      {[-0.45, 0.45].map((offset) => (
        <group key={offset} position={[CAB.x + CAB.w / 2 + 0.001, CAB.legs + CAB.h / 2, CAB.z + offset]}>
          <mesh rotation-y={Math.PI / 2}>
            <planeGeometry args={[0.8, 0.56]} />
            <meshStandardMaterial color="#120d0a" roughness={1} />
          </mesh>
          {RECORD_COLORS.map((color, i) => (
            <mesh key={color} position={[-0.02, -0.02, -0.34 + i * 0.095]} rotation-x={(i % 3) * 0.04}>
              <boxGeometry args={[0.04, 0.48, 0.012]} />
              <meshStandardMaterial color={color} roughness={0.85} />
            </mesh>
          ))}
        </group>
      ))}

      <RoundedBox args={[0.42, 0.07, 0.5]} radius={0.015} position={[-3.2, TOP + 0.035, -1.05]} castShadow receiveShadow>
        <meshStandardMaterial color={ROOM_COLORS.walnutLight} roughness={0.55} />
      </RoundedBox>
      <group position={[-3.23, TOP + 0.08, -1.08]}>
        <mesh>
          <cylinderGeometry args={[0.175, 0.175, 0.018, 40]} />
          <meshStandardMaterial color="#1b1b20" metalness={0.6} roughness={0.35} />
        </mesh>
        <group ref={disc} position={[0, 0.011, 0]}>
          <mesh rotation-x={-Math.PI / 2}>
            <circleGeometry args={[0.165, 48]} />
            <meshStandardMaterial map={vinyl} roughness={0.35} metalness={0.2} />
          </mesh>
        </group>
      </group>
      <mesh position={[-3.06, TOP + 0.09, -0.88]}>
        <cylinderGeometry args={[0.022, 0.026, 0.05, 16]} />
        <meshStandardMaterial color={ROOM_COLORS.chrome} metalness={0.7} roughness={0.3} />
      </mesh>
      <Segment from={[-3.06, TOP + 0.115, -0.88]} to={[-3.14, TOP + 0.105, -1.15]} radius={0.006} color={ROOM_COLORS.chrome} metalness={0.7} roughness={0.3} />

      <Speaker z={-1.72} />
      <Speaker z={-0.3} />
    </group>
  );
}
