"use client";

import type { RefObject } from "react";
import { RoundedBox } from "@react-three/drei";
import type { Group } from "three";
import type { Outfit } from "./outfits";
import { LAMP, SKIN, STRAP } from "./palette";
import { Book, CricketBall, Mug, Pole } from "./Props";
import { BODY } from "./rig";

/** -1 = mini-me's right (the -x side), 1 = his left. */
type Side = -1 | 1;

interface ArmProps {
  side: Side;
  outfit: Outfit;
  armRef: RefObject<Group | null>;
  propRef?: RefObject<Group | null>;
}

function Capsule({ y, radius, length, color }: { y: number; radius: number; length: number; color: string }) {
  return (
    <mesh position={[0, y, 0]} castShadow>
      <capsuleGeometry args={[radius, length, 6, 14]} />
      <meshStandardMaterial color={color} roughness={0.75} />
    </mesh>
  );
}

const STRIPE_GAP = 0.011;

/** Two plain stripes down the outside of a track-jacket sleeve, curving over the shoulder. */
function SleeveStripes({ side, radius, color }: { side: Side; radius: number; color: string }) {
  return (
    <group>
      {[-STRIPE_GAP, STRIPE_GAP].map((z) => {
        const out = Math.sqrt(radius * radius - z * z) + 0.0012;
        return (
          <group key={z}>
            <mesh position={[side * out, -0.135, z]}>
              <boxGeometry args={[0.004, 0.2, 0.008]} />
              <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.035, z]} rotation-y={side === 1 ? 0 : Math.PI}>
              <torusGeometry args={[out, 0.0038, 6, 12, Math.PI / 2]} />
              <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function HeldProp({ outfit }: { outfit: Outfit }) {
  if (outfit.prop === "mug") return <Mug />;
  if (outfit.prop === "book") return <Book />;
  if (outfit.prop === "cricketBall") return <CricketBall />;
  if (outfit.prop === "pole") return <Pole />;
  return null;
}

export function Arm({ side, outfit, armRef, propRef }: ArmProps) {
  const long = outfit.sleeves === "long";
  const bulky = outfit.top.kind === "puffer" || outfit.top.kind === "oversized";
  const sleeveRadius = bulky ? 0.066 : 0.057;
  return (
    <group ref={armRef} position={[side * BODY.shoulderX, BODY.shoulderY, 0]}>
      {long ? (
        <Capsule y={-0.135} radius={sleeveRadius} length={0.2} color={outfit.top.color} />
      ) : (
        <>
          <Capsule y={-0.19} radius={0.046} length={0.12} color={SKIN} />
          <Capsule y={-0.075} radius={sleeveRadius} length={0.08} color={outfit.top.color} />
          {outfit.top.trim && (
            <mesh position={[0, -0.13, 0]} rotation-x={Math.PI / 2}>
              <torusGeometry args={[0.052, 0.009, 8, 20]} />
              <meshStandardMaterial color={outfit.top.trim} roughness={0.7} />
            </mesh>
          )}
        </>
      )}
      {long && outfit.top.kind === "track" && <SleeveStripes side={side} radius={sleeveRadius} color={outfit.top.trim ?? "#f2eadb"} />}
      {long && (
        <mesh position={[0, -0.25, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[sleeveRadius - 0.008, 0.012, 8, 20]} />
          <meshStandardMaterial color={outfit.top.shade} roughness={0.8} />
        </mesh>
      )}
      {side === 1 && (
        <group position={[0, -0.235, 0]}>
          <mesh rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.05, 0.011, 8, 20]} />
            <meshStandardMaterial color={STRAP} roughness={0.5} />
          </mesh>
          <mesh position={[0.05, 0, 0]} rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.02, 0.02, 0.012, 16]} />
            <meshStandardMaterial color={LAMP} roughness={0.3} />
          </mesh>
        </group>
      )}
      <mesh position={[0, -0.3, 0]} castShadow>
        <sphereGeometry args={[0.056, 16, 14]} />
        <meshStandardMaterial color={SKIN} roughness={0.62} />
      </mesh>
      {propRef && (
        <group ref={propRef} position={[0, -0.3, 0]}>
          <HeldProp outfit={outfit} />
        </group>
      )}
    </group>
  );
}

function Shoe({ outfit }: { outfit: Outfit }) {
  const { kind, color, sole, accent } = outfit.shoes;
  const soleHeight = kind === "chunky" ? 0.045 : 0.026;
  return (
    <group position={[0, -0.3, 0.03]}>
      <RoundedBox args={[0.12, kind === "hiker" ? 0.09 : 0.075, 0.2]} radius={0.035} position={[0, 0.01, 0]} castShadow>
        <meshStandardMaterial color={color} roughness={0.6} />
      </RoundedBox>
      <RoundedBox args={[0.126, soleHeight, 0.206]} radius={0.01} position={[0, -0.035 - soleHeight / 2 + 0.013, 0]} castShadow>
        <meshStandardMaterial color={sole} roughness={0.7} />
      </RoundedBox>
      <mesh position={[0.061, 0.005, -0.01]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[0.11, 0.02]} />
        <meshStandardMaterial color={accent} roughness={0.6} side={2} />
      </mesh>
      {kind === "hiker" && (
        <mesh position={[0, 0.06, -0.03]}>
          <cylinderGeometry args={[0.062, 0.066, 0.06, 16]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      )}
    </group>
  );
}

interface LegProps {
  side: Side;
  outfit: Outfit;
  legRef: RefObject<Group | null>;
}

export function Leg({ side, outfit, legRef }: LegProps) {
  const { kind, color, shade, socks } = outfit.bottom;
  return (
    <group ref={legRef} position={[side * BODY.hipX, BODY.hipY, 0]}>
      {kind === "shorts" ? (
        <>
          <Capsule y={-0.05} radius={0.08} length={0.05} color={color} />
          <Capsule y={-0.17} radius={0.052} length={0.1} color={SKIN} />
          <mesh position={[0, -0.235, 0]}>
            <cylinderGeometry args={[0.056, 0.058, 0.1, 14]} />
            <meshStandardMaterial color={socks ?? "#f5f2ea"} roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.2, 0]} rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.056, 0.007, 6, 18]} />
            <meshStandardMaterial color={outfit.top.trim ?? shade} />
          </mesh>
        </>
      ) : (
        <>
          <Capsule y={-0.13} radius={kind === "cargo" ? 0.08 : 0.07} length={0.17} color={color} />
          {kind === "joggers" && (
            <mesh position={[0, -0.25, 0]} rotation-x={Math.PI / 2}>
              <torusGeometry args={[0.058, 0.014, 8, 18]} />
              <meshStandardMaterial color={shade} roughness={0.85} />
            </mesh>
          )}
          {kind === "cargo" && (
            <RoundedBox args={[0.02, 0.07, 0.07]} radius={0.008} position={[side * 0.082, -0.12, 0]}>
              <meshStandardMaterial color={shade} roughness={0.85} />
            </RoundedBox>
          )}
        </>
      )}
      <Shoe outfit={outfit} />
    </group>
  );
}
