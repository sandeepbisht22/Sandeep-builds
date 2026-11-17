"use client";

import { RoundedBox } from "@react-three/drei";
import { usePainted } from "@/components/room/usePainted";
import { cricketBallTexture, footballTexture } from "@/components/room/textures/surfaces";
import { LAMP, PAPER, STRAP } from "./palette";

/** Hand-held props are drawn around the centre of the hand holding them; their group stays upright. */

export function Mug() {
  return (
    <group position={[0.01, 0.03, 0.05]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.04, 0.037, 0.09, 20]} />
        <meshStandardMaterial color={PAPER} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.005, 0]}>
        <cylinderGeometry args={[0.0405, 0.0385, 0.022, 20]} />
        <meshStandardMaterial color={LAMP} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.0455, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.035, 20]} />
        <meshStandardMaterial color="#3b2216" roughness={0.3} />
      </mesh>
      <mesh position={[0.045, 0, 0]}>
        <torusGeometry args={[0.022, 0.007, 8, 14]} />
        <meshStandardMaterial color={PAPER} roughness={0.45} />
      </mesh>
    </group>
  );
}

export function Book() {
  return (
    <group position={[0.115, 0.03, 0.07]} rotation-x={-0.35}>
      <RoundedBox args={[0.17, 0.21, 0.035]} radius={0.006} castShadow>
        <meshStandardMaterial color={LAMP} roughness={0.7} />
      </RoundedBox>
      <mesh position={[0, 0, 0.018]}>
        <planeGeometry args={[0.15, 0.19]} />
        <meshStandardMaterial color={PAPER} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.0185]}>
        <planeGeometry args={[0.004, 0.19]} />
        <meshStandardMaterial color="#c9bfae" />
      </mesh>
    </group>
  );
}

export function CricketBall() {
  const map = usePainted(cricketBallTexture);
  return (
    <mesh position={[0, 0.015, 0.05]} rotation={[0.4, 0, 0.9]} castShadow>
      <sphereGeometry args={[0.038, 20, 16]} />
      <meshStandardMaterial map={map} roughness={0.45} />
    </mesh>
  );
}

/** Trekking pole from the hand down to the ground. */
export function Pole() {
  return (
    <group position={[0, 0, 0.02]}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.018, 0.016, 0.09, 12]} />
        <meshStandardMaterial color={STRAP} roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.2, 0]} castShadow>
        <cylinderGeometry args={[0.008, 0.007, 0.42, 8]} />
        <meshStandardMaterial color="#9aa0b4" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.32, 0]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.03, 0.03, 0.006, 16]} />
        <meshStandardMaterial color={LAMP} />
      </mesh>
    </group>
  );
}

export function Football() {
  const map = usePainted(footballTexture);
  return (
    <mesh castShadow>
      <sphereGeometry args={[0.1, 28, 20]} />
      <meshStandardMaterial map={map} roughness={0.5} />
    </mesh>
  );
}
