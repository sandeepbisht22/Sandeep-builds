"use client";

import { useMemo } from "react";
import { DoubleSide, Quaternion, Shape, Vector3 } from "three";
import type { Eyewear as EyewearKind } from "./outfits";
import { STRAP } from "./palette";
import { BODY, onHead } from "./rig";

const R = BODY.headR;
const Z = new Vector3(0, 0, 1);
const Y = new Vector3(0, 1, 0);

/** Pale gold metal frame and smoked lenses, after his square sunglasses. */
const FRAME = "#d8cdb0";
const LENS = "#14171c";

function surface(a: number, theta: number): Quaternion {
  return new Quaternion().setFromUnitVectors(Z, new Vector3(...onHead(a, theta, 1)).normalize());
}

function roundedRect(width: number, height: number, radius: number): Shape {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

/** Round reading glasses for the cosy outfit. */
function RoundGlasses() {
  const placements = useMemo(() => [-21, 21].map((a) => ({ a, q: surface(a, 93), p: onHead(a, 93, R * 1.07) })), []);
  return (
    <group>
      {placements.map(({ a, q, p }) => (
        <group key={a} position={p} quaternion={q}>
          <mesh>
            <torusGeometry args={[0.045, 0.006, 8, 24]} />
            <meshStandardMaterial color={STRAP} roughness={0.3} />
          </mesh>
          <mesh>
            <circleGeometry args={[0.044, 20]} />
            <meshStandardMaterial color="#cfe0ff" transparent opacity={0.15} roughness={0.05} />
          </mesh>
        </group>
      ))}
      <mesh position={onHead(0, 91, R * 1.08)} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.005, 0.005, 0.05, 6]} />
        <meshStandardMaterial color={STRAP} />
      </mesh>
    </group>
  );
}

const LENS_W = 0.112;
const LENS_H = 0.088;
const LENS_X = 0.097;
const LENS_Y = -0.012;
const LENS_Z = 0.284;
const WRAP = 0.22;
const RIM = 0.007;

interface Bar {
  from: Vector3;
  to: Vector3;
}

/** A thin metal rod between two points. */
function Rod({ from, to }: Bar) {
  const { mid, length, quaternion } = useMemo(() => {
    const dir = new Vector3().subVectors(to, from);
    return {
      mid: new Vector3().addVectors(from, to).multiplyScalar(0.5),
      length: dir.length(),
      quaternion: new Quaternion().setFromUnitVectors(Y, dir.normalize()),
    };
  }, [from, to]);
  return (
    <mesh position={mid} quaternion={quaternion}>
      <cylinderGeometry args={[0.0038, 0.0038, length, 6]} />
      <meshStandardMaterial color={FRAME} metalness={0.85} roughness={0.3} />
    </mesh>
  );
}

/** Square metal-frame sunglasses with a double bridge, slightly wrapped round the face. */
function Shades() {
  const { rim, lens } = useMemo(() => {
    const outer = roundedRect(LENS_W + RIM * 2, LENS_H + RIM * 2, 0.02);
    outer.holes.push(roundedRect(LENS_W, LENS_H, 0.014));
    return { rim: outer, lens: roundedRect(LENS_W, LENS_H, 0.014) };
  }, []);
  const bars = useMemo<Bar[]>(() => {
    const hinge = (side: number): Vector3 =>
      new Vector3(side * (LENS_X + (LENS_W / 2 + RIM) * Math.cos(WRAP)), LENS_Y + 0.03, LENS_Z - (LENS_W / 2) * Math.sin(WRAP));
    return [
      // brow bar and nose bridge
      { from: new Vector3(-0.046, LENS_Y + 0.038, LENS_Z + 0.008), to: new Vector3(0.046, LENS_Y + 0.038, LENS_Z + 0.008) },
      { from: new Vector3(-0.044, LENS_Y + 0.012, LENS_Z + 0.008), to: new Vector3(0.044, LENS_Y + 0.012, LENS_Z + 0.008) },
      // temples back to the ears
      ...[-1, 1].map((side) => ({ from: hinge(side), to: new Vector3(side * 0.29, LENS_Y + 0.034, 0.01) })),
    ];
  }, []);
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * LENS_X, LENS_Y, LENS_Z]} rotation-y={side * WRAP}>
          <mesh>
            <extrudeGeometry args={[rim, { depth: 0.006, bevelEnabled: false, curveSegments: 6 }]} />
            <meshStandardMaterial color={FRAME} metalness={0.85} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.002]}>
            <shapeGeometry args={[lens, 6]} />
            <meshStandardMaterial color={LENS} transparent opacity={0.9} metalness={0.3} roughness={0.08} side={DoubleSide} />
          </mesh>
        </group>
      ))}
      {bars.map((bar, i) => (
        <Rod key={i} {...bar} />
      ))}
    </group>
  );
}

export function Eyewear({ kind }: { kind: EyewearKind }) {
  if (kind === "round") return <RoundGlasses />;
  if (kind === "shades") return <Shades />;
  return null;
}
