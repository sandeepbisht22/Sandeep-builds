"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import type { Group } from "three";
import { ROOM_COLORS } from "../palette";
import { usePainted } from "../usePainted";
import { aipanRugTexture, clockFaceTexture, posterTexture } from "../textures/surfaces";

const BACK_Z = -3.47;

export function Rug() {
  const map = usePainted(aipanRugTexture);
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0.55, 0.006, 0.6]} receiveShadow>
      <planeGeometry args={[3.0, 2.25]} />
      <meshStandardMaterial map={map} transparent alphaTest={0.5} roughness={0.95} />
    </mesh>
  );
}

function SnakePlant() {
  const leaves = [0, 1, 2, 3, 4, 5, 6];
  return (
    <group position={[2.95, 0, -3.05]}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.19, 0.15, 0.4, 24]} />
        <meshStandardMaterial color="#2a2d3d" roughness={0.8} />
      </mesh>
      {leaves.map((i) => {
        const angle = (i / leaves.length) * Math.PI * 2;
        const height = 0.7 + ((i * 37) % 5) * 0.12;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.06, 0.4 + height / 2, Math.sin(angle) * 0.06]}
            rotation={[Math.sin(angle) * 0.18, angle, Math.cos(angle) * 0.18]}
            scale={[1, 1, 0.28]}
            castShadow
          >
            <coneGeometry args={[0.055, height, 4]} />
            <meshStandardMaterial color={i % 2 ? ROOM_COLORS.leaf : "#4f7d55"} roughness={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}

function Poster() {
  const map = usePainted(posterTexture);
  return (
    <group position={[-1.12, 2.5, BACK_Z]}>
      <RoundedBox args={[0.78, 1.05, 0.03]} radius={0.01} position={[0, 0, 0.005]} castShadow>
        <meshStandardMaterial color="#0f1018" roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0, 0.022]}>
        <planeGeometry args={[0.72, 0.99]} />
        <meshStandardMaterial map={map} roughness={0.8} />
      </mesh>
    </group>
  );
}

/** A wall clock that keeps Haldwani time (IST). */
function Clock() {
  const face = usePainted(clockFaceTexture);
  const hour = useRef<Group>(null);
  const minute = useRef<Group>(null);

  useFrame(() => {
    const now = new Date();
    const ist = new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60_000);
    const minutes = ist.getMinutes() + ist.getSeconds() / 60;
    const hours = (ist.getHours() % 12) + minutes / 60;
    if (minute.current) minute.current.rotation.z = -(minutes / 60) * Math.PI * 2;
    if (hour.current) hour.current.rotation.z = -(hours / 12) * Math.PI * 2;
  });

  return (
    <group position={[-2.55, 3.5, BACK_Z]}>
      <mesh position={[0, 0, 0.02]} rotation-x={Math.PI / 2} castShadow>
        <cylinderGeometry args={[0.27, 0.27, 0.04, 40]} />
        <meshStandardMaterial color="#0f1018" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.041]}>
        <circleGeometry args={[0.25, 40]} />
        <meshStandardMaterial map={face} roughness={0.8} />
      </mesh>
      <group ref={hour} position={[0, 0, 0.05]}>
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[0.02, 0.13, 0.006]} />
          <meshStandardMaterial color={ROOM_COLORS.paper} />
        </mesh>
      </group>
      <group ref={minute} position={[0, 0, 0.056]}>
        <mesh position={[0, 0.09, 0]}>
          <boxGeometry args={[0.014, 0.19, 0.006]} />
          <meshStandardMaterial color={ROOM_COLORS.lamp} />
        </mesh>
      </group>
    </group>
  );
}

export function Decor() {
  return (
    <group>
      <Rug />
      <SnakePlant />
      <Poster />
      <Clock />
    </group>
  );
}
