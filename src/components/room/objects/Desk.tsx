"use client";

import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import type { MeshBasicMaterial, MeshStandardMaterial } from "three";
import { lights } from "@/lib/travel";
import { ROOM_COLORS } from "../palette";
import { usePainted } from "../usePainted";
import { codeEditorTexture, readerTexture, tutorTexture } from "../textures/screens";
import { keyboardTexture } from "../textures/surfaces";
import { Segment } from "./primitives";

const DESK_TOP = 1.0;

/** Desk lamp bulb position — Lights.tsx aims the spotlight from here. */
export const LAMP_BULB: [number, number, number] = [0.02, 1.76, -2.96];
export const LAMP_TARGET: [number, number, number] = [0.5, 1.0, -2.78];

interface MonitorProps {
  position: [number, number, number];
  size: [number, number];
  rotationY?: number;
  screenRef: RefObject<MeshBasicMaterial | null>;
  map: MeshBasicMaterial["map"];
}

function Monitor({ position, size, rotationY = 0, screenRef, map }: MonitorProps) {
  const [w, h] = size;
  const deskOffset = DESK_TOP - position[1];
  return (
    <group position={position} rotation-y={rotationY}>
      <RoundedBox args={[w + 0.06, h + 0.06, 0.045]} radius={0.015} castShadow>
        <meshStandardMaterial color="#0d0d12" roughness={0.4} />
      </RoundedBox>
      <mesh position={[0, 0, 0.024]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial ref={screenRef} map={map} toneMapped={false} />
      </mesh>
      <mesh position={[0, deskOffset / 2, -0.05]} castShadow>
        <boxGeometry args={[0.06, -deskOffset, 0.05]} />
        <meshStandardMaterial color="#16161d" roughness={0.5} />
      </mesh>
      <mesh position={[0, deskOffset + 0.012, -0.03]} castShadow>
        <boxGeometry args={[0.34, 0.024, 0.2]} />
        <meshStandardMaterial color="#16161d" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Chair() {
  return (
    <group position={[0.72, 0, -1.98]} rotation-y={0.3}>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <group key={i} rotation-y={a}>
            <mesh position={[0.17, 0.08, 0]} castShadow>
              <boxGeometry args={[0.34, 0.035, 0.05]} />
              <meshStandardMaterial color="#111117" roughness={0.5} />
            </mesh>
            <mesh position={[0.32, 0.035, 0]}>
              <sphereGeometry args={[0.035, 12, 12]} />
              <meshStandardMaterial color="#0b0b10" />
            </mesh>
          </group>
        );
      })}
      <mesh position={[0, 0.29, 0]}>
        <cylinderGeometry args={[0.026, 0.026, 0.4, 12]} />
        <meshStandardMaterial color={ROOM_COLORS.chrome} metalness={0.7} roughness={0.3} />
      </mesh>
      <RoundedBox args={[0.56, 0.1, 0.54]} radius={0.04} position={[0, 0.52, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={ROOM_COLORS.charcoal} roughness={0.85} />
      </RoundedBox>
      <RoundedBox args={[0.52, 0.74, 0.08]} radius={0.04} position={[0, 0.99, 0.26]} rotation-x={-0.12} castShadow>
        <meshStandardMaterial color={ROOM_COLORS.charcoal} roughness={0.85} />
      </RoundedBox>
      <RoundedBox args={[0.07, 0.6, 0.085]} radius={0.03} position={[0, 1.0, 0.262]} rotation-x={-0.12}>
        <meshStandardMaterial color={ROOM_COLORS.lamp} roughness={0.7} />
      </RoundedBox>
    </group>
  );
}

function Lamp() {
  const bulb = useRef<MeshStandardMaterial>(null);
  useFrame(() => {
    if (bulb.current) bulb.current.emissiveIntensity = 0.2 + lights.lamp * 5;
  });
  const base: [number, number, number] = [-0.42, 1.04, -3.3];
  const elbow: [number, number, number] = [-0.34, 1.66, -3.24];
  return (
    <group>
      <mesh position={[base[0], 1.017, base[2]]} castShadow>
        <cylinderGeometry args={[0.1, 0.11, 0.035, 24]} />
        <meshStandardMaterial color="#121218" roughness={0.4} />
      </mesh>
      <Segment from={base} to={elbow} radius={0.014} color="#16161d" />
      <Segment from={elbow} to={[LAMP_BULB[0] - 0.03, LAMP_BULB[1] + 0.07, LAMP_BULB[2] - 0.05]} radius={0.014} color="#16161d" />
      <mesh position={elbow}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshStandardMaterial color="#16161d" />
      </mesh>
      <group position={[LAMP_BULB[0], LAMP_BULB[1] + 0.04, LAMP_BULB[2]]} rotation={[0.35, 0, -0.35]}>
        <mesh castShadow>
          <coneGeometry args={[0.12, 0.17, 28, 1, true]} />
          <meshStandardMaterial color={ROOM_COLORS.lamp} roughness={0.55} side={2} />
        </mesh>
      </group>
      <mesh position={LAMP_BULB}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial ref={bulb} color="#fff1d6" emissive="#ffc48a" emissiveIntensity={0.2} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Mug() {
  return (
    <group position={[-0.18, 1.0, -2.7]}>
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.052, 0.048, 0.12, 24]} />
        <meshStandardMaterial color={ROOM_COLORS.paper} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.0525, 0.0505, 0.03, 24]} />
        <meshStandardMaterial color={ROOM_COLORS.lamp} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.115, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.046, 24]} />
        <meshStandardMaterial color="#3b2216" roughness={0.3} />
      </mesh>
      <mesh position={[0.058, 0.06, 0]}>
        <torusGeometry args={[0.03, 0.009, 8, 16]} />
        <meshStandardMaterial color={ROOM_COLORS.paper} roughness={0.5} />
      </mesh>
    </group>
  );
}

function Tower() {
  const led = useRef<MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (led.current) led.current.emissiveIntensity = lights.screens * (2.2 + Math.sin(clock.elapsedTime * 1.4) * 0.6);
  });
  return (
    <group position={[1.82, 0, -3.02]}>
      <RoundedBox args={[0.34, 0.86, 0.78]} radius={0.02} position={[0, 0.45, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#111118" roughness={0.45} />
      </RoundedBox>
      <mesh position={[0, 0.45, 0.392]}>
        <boxGeometry args={[0.012, 0.74, 0.004]} />
        <meshStandardMaterial ref={led} color={ROOM_COLORS.lamp} emissive={ROOM_COLORS.lamp} emissiveIntensity={0} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function Desk() {
  const code = usePainted(codeEditorTexture);
  const tutor = usePainted(tutorTexture);
  const reader = usePainted(readerTexture);
  const keys = usePainted(keyboardTexture);
  const mainScreen = useRef<MeshBasicMaterial>(null);
  const sideScreen = useRef<MeshBasicMaterial>(null);
  const phoneScreen = useRef<MeshBasicMaterial>(null);

  useFrame(() => {
    const level = 0.08 + lights.screens * 0.92;
    mainScreen.current?.color.setScalar(level);
    sideScreen.current?.color.setScalar(level);
    phoneScreen.current?.color.setScalar(level);
  });

  return (
    <group>
      <RoundedBox args={[2.9, 0.07, 1.0]} radius={0.02} position={[0.8, 0.965, -3.0]} castShadow receiveShadow>
        <meshStandardMaterial color={ROOM_COLORS.walnut} roughness={0.55} />
      </RoundedBox>
      {[-0.56, 2.16].map((x) => (
        <group key={x} position={[x, 0, -3.0]}>
          <mesh position={[0, 0.47, 0]} castShadow>
            <boxGeometry args={[0.06, 0.93, 0.06]} />
            <meshStandardMaterial color="#121218" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.02, 0]} castShadow>
            <boxGeometry args={[0.07, 0.04, 0.9]} />
            <meshStandardMaterial color="#121218" roughness={0.4} />
          </mesh>
        </group>
      ))}

      <Monitor position={[0.55, 1.68, -3.27]} size={[1.26, 0.72]} screenRef={mainScreen} map={code} />
      <Monitor position={[1.76, 1.73, -3.1]} size={[0.45, 0.8]} rotationY={-0.45} screenRef={sideScreen} map={tutor} />
      {/* Tutor's sticky notes have escaped onto the bezel */}
      <mesh position={[1.12, 1.99, -3.235]} rotation-z={0.08}>
        <planeGeometry args={[0.09, 0.09]} />
        <meshStandardMaterial color="#f7d774" roughness={0.9} />
      </mesh>
      <mesh position={[1.14, 1.88, -3.235]} rotation-z={-0.06}>
        <planeGeometry args={[0.09, 0.09]} />
        <meshStandardMaterial color="#f6a6c1" roughness={0.9} />
      </mesh>

      <RoundedBox args={[0.88, 0.03, 0.28]} radius={0.01} position={[0.55, 1.016, -2.76]} castShadow>
        <meshStandardMaterial color="#15161f" roughness={0.6} />
      </RoundedBox>
      <mesh position={[0.55, 1.032, -2.76]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.86, 0.26]} />
        <meshStandardMaterial map={keys} roughness={0.7} />
      </mesh>
      <mesh position={[1.34, 1.002, -2.76]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.44, 0.32]} />
        <meshStandardMaterial color="#1b1d2b" roughness={0.95} />
      </mesh>
      <RoundedBox args={[0.075, 0.035, 0.12]} radius={0.017} position={[1.36, 1.02, -2.74]} castShadow>
        <meshStandardMaterial color="#15161f" roughness={0.5} />
      </RoundedBox>

      <group position={[2.0, 1.0, -2.72]}>
        <mesh position={[0, 0.02, 0.02]}>
          <boxGeometry args={[0.12, 0.04, 0.1]} />
          <meshStandardMaterial color="#16161d" />
        </mesh>
        <group position={[0, 0.14, 0]} rotation-x={-0.3}>
          <RoundedBox args={[0.11, 0.22, 0.012]} radius={0.006} castShadow>
            <meshStandardMaterial color="#0d0d12" />
          </RoundedBox>
          <mesh position={[0, 0, 0.007]}>
            <planeGeometry args={[0.1, 0.2]} />
            <meshBasicMaterial ref={phoneScreen} map={reader} toneMapped={false} />
          </mesh>
        </group>
      </group>

      <Mug />
      <Lamp />
      <Tower />
      <Chair />
    </group>
  );
}
