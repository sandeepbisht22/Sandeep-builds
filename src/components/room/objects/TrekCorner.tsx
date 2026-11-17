"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import type { MeshStandardMaterial, PointLight } from "three";
import { lights } from "@/lib/travel";
import { ROOM_COLORS } from "../palette";
import { usePainted } from "../usePainted";
import { trailMapTexture } from "../textures/surfaces";
import { Segment } from "./primitives";

const PACK = "#2f4038";
const PACK_DARK = "#24332c";

function Rucksack() {
  return (
    <group position={[2.6, 0, 1.75]} rotation-y={-0.5}>
      <RoundedBox args={[0.44, 0.6, 0.3]} radius={0.09} position={[0, 0.31, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={PACK} roughness={0.85} />
      </RoundedBox>
      <RoundedBox args={[0.42, 0.13, 0.31]} radius={0.05} position={[0, 0.63, 0.005]} castShadow>
        <meshStandardMaterial color={PACK_DARK} roughness={0.85} />
      </RoundedBox>
      <RoundedBox args={[0.3, 0.22, 0.08]} radius={0.035} position={[0, 0.22, 0.17]} castShadow>
        <meshStandardMaterial color={PACK_DARK} roughness={0.85} />
      </RoundedBox>
      {[-0.24, 0.24].map((x) => (
        <RoundedBox key={x} args={[0.08, 0.2, 0.18]} radius={0.03} position={[x, 0.25, 0]} castShadow>
          <meshStandardMaterial color={PACK_DARK} roughness={0.85} />
        </RoundedBox>
      ))}
      {/* rolled sleeping mat strapped on top */}
      <mesh position={[0, 0.77, -0.02]} rotation-z={Math.PI / 2} castShadow>
        <cylinderGeometry args={[0.075, 0.075, 0.5, 20]} />
        <meshStandardMaterial color={ROOM_COLORS.lamp} roughness={0.9} />
      </mesh>
      {[-0.12, 0.12].map((x) => (
        <mesh key={x} position={[x, 0.77, -0.02]} rotation-y={Math.PI / 2}>
          <torusGeometry args={[0.077, 0.008, 6, 20]} />
          <meshStandardMaterial color="#121218" />
        </mesh>
      ))}
      <mesh position={[0.1, 0.5, 0.16]} rotation-y={Math.PI / 2}>
        <torusGeometry args={[0.025, 0.006, 6, 14]} />
        <meshStandardMaterial color={ROOM_COLORS.chrome} metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Poles() {
  return (
    <group>
      <Segment from={[2.92, 0, 2.02]} to={[2.68, 1.0, 1.82]} radius={0.01} color="#9aa0b4" metalness={0.7} roughness={0.3} />
      <Segment from={[2.98, 0, 1.92]} to={[2.74, 0.98, 1.74]} radius={0.01} color="#9aa0b4" metalness={0.7} roughness={0.3} />
      <Segment from={[2.69, 0.96, 1.83]} to={[2.66, 1.08, 1.81]} radius={0.018} color="#121218" />
      <Segment from={[2.75, 0.94, 1.75]} to={[2.72, 1.06, 1.73]} radius={0.018} color="#121218" />
    </group>
  );
}

function Boots() {
  return (
    <group position={[2.2, 0, 2.4]} rotation-y={0.4}>
      {[-0.08, 0.08].map((x, i) => (
        <group key={x} position={[x, 0, i * 0.04]} rotation-y={i * 0.15}>
          <RoundedBox args={[0.12, 0.08, 0.26]} radius={0.035} position={[0, 0.05, 0.02]} castShadow>
            <meshStandardMaterial color="#6b4a33" roughness={0.7} />
          </RoundedBox>
          <mesh position={[0, 0.14, -0.04]} castShadow>
            <cylinderGeometry args={[0.055, 0.06, 0.13, 16]} />
            <meshStandardMaterial color="#6b4a33" roughness={0.7} />
          </mesh>
          <RoundedBox args={[0.126, 0.025, 0.27]} radius={0.01} position={[0, 0.012, 0.02]}>
            <meshStandardMaterial color="#1d1b26" roughness={0.8} />
          </RoundedBox>
        </group>
      ))}
    </group>
  );
}

/** A camping lantern that comes on with the fairy lights. */
function Lantern() {
  const glass = useRef<MeshStandardMaterial>(null);
  const light = useRef<PointLight>(null);
  useFrame(({ clock }) => {
    const flicker = 0.92 + Math.sin(clock.elapsedTime * 9) * 0.04 + Math.sin(clock.elapsedTime * 23) * 0.03;
    if (glass.current) glass.current.emissiveIntensity = lights.fairy * 3.2 * flicker;
    if (light.current) light.current.intensity = lights.fairy * 1.6 * flicker;
  });
  return (
    <group position={[3.0, 0, 1.1]}>
      <mesh position={[0, 0.03, 0]} castShadow>
        <cylinderGeometry args={[0.085, 0.095, 0.06, 20]} />
        <meshStandardMaterial color="#2b2b33" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.18, 20]} />
        <meshStandardMaterial ref={glass} color="#ffd9a0" emissive="#ffb35c" emissiveIntensity={0} transparent opacity={0.9} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.265, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.09, 0.05, 20]} />
        <meshStandardMaterial color="#2b2b33" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.31, 0]}>
        <torusGeometry args={[0.04, 0.006, 6, 16, Math.PI]} />
        <meshStandardMaterial color="#2b2b33" metalness={0.5} />
      </mesh>
      <pointLight ref={light} position={[0, 0.2, 0]} color="#ffb35c" distance={2.4} decay={2} intensity={0} />
    </group>
  );
}

function TrailMap() {
  const map = usePainted(trailMapTexture);
  return (
    <group position={[2.85, 2.55, -3.47]}>
      <RoundedBox args={[0.98, 0.78, 0.03]} radius={0.01} position={[0, 0, 0.005]} castShadow>
        <meshStandardMaterial color={ROOM_COLORS.walnutDark} roughness={0.6} />
      </RoundedBox>
      <mesh position={[0, 0, 0.022]}>
        <planeGeometry args={[0.9, 0.7]} />
        <meshStandardMaterial map={map} roughness={0.9} />
      </mesh>
    </group>
  );
}

/** Everything for the hills: a packed rucksack, poles, boots, a lantern and the trail map. */
export function TrekCorner() {
  return (
    <group>
      <Rucksack />
      <Poles />
      <Boots />
      <Lantern />
      <TrailMap />
    </group>
  );
}
