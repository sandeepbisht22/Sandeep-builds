"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { CurvePath, LineCurve3, Vector3, type MeshStandardMaterial } from "three";
import { lights } from "@/lib/travel";
import { ROOM_COLORS } from "../palette";
import { usePainted } from "../usePainted";
import { jerseyTexture, type JerseyKind } from "../textures/screens";
import { cricketBallTexture, footballTexture, scarfTexture } from "../textures/surfaces";

const WALL_X = -3.47;
const JERSEY_Y = 2.3;
/** Shelf, neon and Sandeep's own shirt line up on this z. */
const CENTRE_Z = 1.78;

function FramedJersey({ kind, z }: { kind: JerseyKind; z: number }) {
  const map = usePainted(() => jerseyTexture(kind));
  return (
    <group position={[WALL_X, JERSEY_Y, z]} rotation-y={Math.PI / 2}>
      <RoundedBox args={[0.96, 1.12, 0.06]} radius={0.015} castShadow>
        <meshStandardMaterial color="#101119" roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0, 0.031]}>
        <planeGeometry args={[0.86, 1.02]} />
        <meshStandardMaterial color="#1c2036" roughness={0.95} />
      </mesh>
      <mesh position={[0, -0.02, 0.036]}>
        <planeGeometry args={[0.78, 0.86]} />
        <meshStandardMaterial map={map} transparent alphaTest={0.4} roughness={0.85} />
      </mesh>
    </group>
  );
}

/** A neon "7" — Ronaldo's number, Dhoni's number, and Sandeep's. */
function NeonSeven() {
  const material = useRef<MeshStandardMaterial>(null);
  const path = useMemo(() => {
    // Seen from inside the room, +z is the viewer's left.
    const curve = new CurvePath<Vector3>();
    curve.add(new LineCurve3(new Vector3(0, 0.33, 0.2), new Vector3(0, 0.33, -0.2)));
    curve.add(new LineCurve3(new Vector3(0, 0.33, -0.2), new Vector3(0, -0.33, 0.03)));
    return curve;
  }, []);

  useFrame(({ clock }) => {
    if (!material.current) return;
    const t = clock.elapsedTime;
    const flicker = Math.sin(t * 37) > 0.97 ? 0.55 : 1;
    material.current.emissiveIntensity = lights.neon * 3.2 * flicker;
  });

  return (
    <group position={[WALL_X + 0.05, 3.55, CENTRE_Z]} scale={0.85}>
      <mesh>
        <tubeGeometry args={[path, 64, 0.022, 10, false]} />
        <meshStandardMaterial ref={material} color="#ffd2a8" emissive={ROOM_COLORS.lamp} emissiveIntensity={0} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Bat() {
  return (
    <group position={[-3.18, 0, 1.2]} rotation-z={0.29}>
      <RoundedBox args={[0.04, 0.58, 0.11]} radius={0.012} position={[0, 0.33, 0]} castShadow>
        <meshStandardMaterial color="#dcc08e" roughness={0.7} />
      </RoundedBox>
      <mesh position={[0, 0.76, 0]} castShadow>
        <cylinderGeometry args={[0.017, 0.017, 0.3, 12]} />
        <meshStandardMaterial color={ROOM_COLORS.lamp} roughness={0.8} />
      </mesh>
    </group>
  );
}

function Stumps() {
  return (
    <group position={[-3.18, 0, 2.95]}>
      {[-0.11, 0, 0.11].map((z) => (
        <mesh key={z} position={[0, 0.355, z]} castShadow>
          <cylinderGeometry args={[0.017, 0.017, 0.71, 10]} />
          <meshStandardMaterial color="#eadfc9" roughness={0.6} />
        </mesh>
      ))}
      {[-0.055, 0.055].map((z) => (
        <mesh key={z} position={[0, 0.72, z]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.009, 0.009, 0.1, 8]} />
          <meshStandardMaterial color="#eadfc9" />
        </mesh>
      ))}
    </group>
  );
}

function Balls() {
  const football = usePainted(footballTexture);
  const cricket = usePainted(cricketBallTexture);
  return (
    <group>
      <mesh position={[-2.3, 0.11, 2.85]} rotation={[0.3, 0.6, 0.2]} castShadow>
        <sphereGeometry args={[0.11, 32, 24]} />
        <meshStandardMaterial map={football} roughness={0.55} />
      </mesh>
      <mesh position={[-2.95, 0.036, 2.55]} rotation={[0.4, 0.2, 0.9]} castShadow>
        <sphereGeometry args={[0.036, 20, 16]} />
        <meshStandardMaterial map={cricket} roughness={0.45} />
      </mesh>
    </group>
  );
}

function CricketCap() {
  return (
    <group position={[WALL_X + 0.13, 1.37, CENTRE_Z + 0.32]} rotation-y={Math.PI / 2 + 0.5}>
      <mesh castShadow>
        <sphereGeometry args={[0.085, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#f2c21b" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.004, 0.1]} rotation-x={-0.12} scale={[1, 1, 0.75]}>
        <cylinderGeometry args={[0.08, 0.085, 0.008, 20, 1, false, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color="#1f3a8a" roughness={0.8} />
      </mesh>
    </group>
  );
}

function ShelfBoots() {
  return (
    <group position={[WALL_X + 0.13, 1.35, CENTRE_Z - 0.32]} rotation-y={0.35}>
      {[-0.07, 0.07].map((x) => (
        <group key={x} position={[0, 0, x]}>
          <RoundedBox args={[0.22, 0.07, 0.09]} radius={0.03} position={[0, 0.04, 0]} castShadow>
            <meshStandardMaterial color="#1c1c26" roughness={0.5} />
          </RoundedBox>
          <mesh position={[0, 0.045, 0.046]}>
            <planeGeometry args={[0.16, 0.018]} />
            <meshStandardMaterial color={ROOM_COLORS.lamp} side={2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** A floating shelf under the shirts: boots, a cap and a scarf hanging off the edge. */
function WallShelf() {
  const scarf = usePainted(scarfTexture);
  return (
    <group>
      <RoundedBox args={[0.26, 0.04, 1.4]} radius={0.01} position={[WALL_X + 0.13, 1.33, CENTRE_Z]} castShadow receiveShadow>
        <meshStandardMaterial color={ROOM_COLORS.walnut} roughness={0.7} />
      </RoundedBox>
      <ShelfBoots />
      <CricketCap />
      <mesh position={[WALL_X + 0.265, 1.0, CENTRE_Z + 0.5]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[0.15, 0.62]} />
        <meshStandardMaterial map={scarf} roughness={0.95} side={2} />
      </mesh>
    </group>
  );
}

export function KitCorner() {
  return (
    <group>
      <FramedJersey kind="chennai" z={0.72} />
      <FramedJersey kind="own" z={CENTRE_Z} />
      <FramedJersey kind="madrid" z={2.84} />
      <NeonSeven />
      <WallShelf />
      <Bat />
      <Stumps />
      <Balls />
    </group>
  );
}
