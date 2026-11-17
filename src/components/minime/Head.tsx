"use client";

import { useMemo, type RefObject } from "react";
import { CatmullRomCurve3, Quaternion, Vector3, type Group } from "three";
import { usePainted } from "@/components/room/usePainted";
import { Eyewear } from "./Eyewear";
import { Hair } from "./Hair";
import type { Outfit } from "./outfits";
import { EYE, GOLD, HAIR, LAMP, SKIN, SKIN_SHADE, STRAP } from "./palette";
import { BODY, EARRING_SIDE, onHead } from "./rig";
import { FACE_CAP, faceTexture } from "./textures";

const R = BODY.headR;
const DEG = Math.PI / 180;
const Z = new Vector3(0, 0, 1);

/** Rotation that turns +z into the head's surface normal at (a, theta). */
function surface(a: number, theta: number): Quaternion {
  return new Quaternion().setFromUnitVectors(Z, new Vector3(...onHead(a, theta, 1)).normalize());
}

function Eyes({ eyesRef }: { eyesRef: RefObject<Group | null> }) {
  const placements = useMemo(() => [-21, 21].map((a) => ({ a, q: surface(a, 93), p: onHead(a, 93, R * 0.985) })), []);
  return (
    <group ref={eyesRef}>
      {placements.map(({ a, q, p }) => (
        <group key={a} position={p} quaternion={q}>
          <group name="eye">
            <mesh scale={[0.028, 0.038, 0.016]}>
              <sphereGeometry args={[1, 20, 16]} />
              <meshStandardMaterial color={EYE} roughness={0.15} />
            </mesh>
            <mesh position={[-0.009, 0.012, 0.013]}>
              <sphereGeometry args={[0.0075, 10, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

/** Thick, dark, nearly straight brows. */
function Brows() {
  const placements = useMemo(() => [-1, 1].map((side) => ({ side, q: surface(side * 21, 79), p: onHead(side * 21, 79, R * 1.0) })), []);
  return (
    <group>
      {placements.map(({ side, q, p }) => (
        <group key={side} position={p} quaternion={q}>
          <mesh rotation-z={Math.PI / 2} scale={[1, 1, 0.7]}>
            <capsuleGeometry args={[0.016, 0.058, 4, 10]} />
            <meshStandardMaterial color={HAIR} roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

const EAR_THETA = 98;
const EAR_LIFT = 0.96;

/** A small gold hoop through the lobe of the tucked ear, hanging face-on. */
function Earring() {
  const [x, y, z] = onHead(EARRING_SIDE * 92, EAR_THETA, R * EAR_LIFT);
  return (
    <mesh position={[x + EARRING_SIDE * 0.004, y - 0.06, z]} rotation-y={EARRING_SIDE * 0.5}>
      <torusGeometry args={[0.017, 0.0038, 10, 28]} />
      <meshStandardMaterial color={GOLD} metalness={0.85} roughness={0.28} />
    </mesh>
  );
}

function Face() {
  const face = usePainted(faceTexture);
  const ears = useMemo(() => [-1, 1].map((side) => ({ side, p: onHead(side * 92, EAR_THETA, R * EAR_LIFT) })), []);
  return (
    <group>
      <mesh castShadow>
        <sphereGeometry args={[R, 48, 36]} />
        <meshStandardMaterial color={SKIN} roughness={0.62} />
      </mesh>
      <mesh>
        <sphereGeometry
          args={[
            R * 1.003,
            64,
            40,
            Math.PI / 2 - (FACE_CAP.phiSpanDeg / 2) * DEG,
            FACE_CAP.phiSpanDeg * DEG,
            FACE_CAP.thetaStartDeg * DEG,
            FACE_CAP.thetaSpanDeg * DEG,
          ]}
        />
        <meshStandardMaterial map={face} transparent alphaTest={0.02} roughness={0.8} polygonOffset polygonOffsetFactor={-2} />
      </mesh>
      {ears.map(({ side, p }) => (
        <mesh key={side} position={p} scale={[0.028, 0.05, 0.04]}>
          <sphereGeometry args={[1, 14, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.62} />
        </mesh>
      ))}
      <Earring />
      <mesh position={onHead(0, 106, R * 0.995)} scale={[0.028, 0.024, 0.026]}>
        <sphereGeometry args={[1, 14, 12]} />
        <meshStandardMaterial color={SKIN_SHADE} roughness={0.6} />
      </mesh>
      <Brows />
    </group>
  );
}

/** Earcups sit out at the hair's edge rather than on the head. */
const CUP_X = R * 1.2;

function Headphones() {
  const mic = useMemo(
    () =>
      new CatmullRomCurve3([
        new Vector3(-CUP_X - 0.005, -0.03, 0.02),
        new Vector3(-0.29, -0.13, 0.15),
        new Vector3(-0.1, -0.16, 0.25),
      ]),
    [],
  );
  return (
    <group>
      <mesh>
        <torusGeometry args={[CUP_X, 0.022, 10, 40, Math.PI]} />
        <meshStandardMaterial color={STRAP} roughness={0.4} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * CUP_X, -0.01, 0]} rotation-z={Math.PI / 2}>
          <mesh castShadow>
            <cylinderGeometry args={[0.075, 0.075, 0.06, 24]} />
            <meshStandardMaterial color={LAMP} roughness={0.45} />
          </mesh>
          <mesh position={[0, side * -0.035, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.02, 24]} />
            <meshStandardMaterial color={STRAP} roughness={0.8} />
          </mesh>
        </group>
      ))}
      <mesh>
        <tubeGeometry args={[mic, 20, 0.008, 8, false]} />
        <meshStandardMaterial color={STRAP} />
      </mesh>
      <mesh position={[-0.1, -0.16, 0.25]}>
        <sphereGeometry args={[0.018, 12, 10]} />
        <meshStandardMaterial color={STRAP} />
      </mesh>
    </group>
  );
}

function BucketHat() {
  return (
    <group position={[0, R * 0.62, 0]}>
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[R * 0.95, R * 1.13, 0.16, 32]} />
        <meshStandardMaterial color="#17171f" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.14, 0]} scale={[1, 0.25, 1]}>
        <sphereGeometry args={[R * 0.95, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#17171f" roughness={0.85} />
      </mesh>
      <mesh position={[0, -0.005, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[R * 1.12, 0.012, 8, 40]} />
        <meshStandardMaterial color={LAMP} roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.04, 0]} rotation-x={0}>
        <cylinderGeometry args={[R * 1.12, R * 1.45, 0.06, 40, 1, true]} />
        <meshStandardMaterial color="#1d1d26" roughness={0.85} side={2} />
      </mesh>
    </group>
  );
}

function Beanie() {
  return (
    <group>
      <mesh castShadow>
        <sphereGeometry args={[R * 1.1, 36, 20, 0, Math.PI * 2, 0, 0.42 * Math.PI]} />
        <meshStandardMaterial color="#1d1f2b" roughness={0.95} />
      </mesh>
      <mesh position={[0, R * 0.26, 0]}>
        <cylinderGeometry args={[R * 1.075, R * 1.1, 0.075, 40, 1, true]} />
        <meshStandardMaterial color={LAMP} roughness={0.95} side={2} />
      </mesh>
      <mesh position={[0, R * 1.12, 0]}>
        <sphereGeometry args={[0.045, 14, 12]} />
        <meshStandardMaterial color={LAMP} roughness={1} />
      </mesh>
    </group>
  );
}

interface HeadProps {
  outfit: Outfit;
  headRef: RefObject<Group | null>;
  eyesRef: RefObject<Group | null>;
}

export function Head({ outfit, headRef, eyesRef }: HeadProps) {
  const covered = outfit.head === "bucket" || outfit.head === "beanie";
  return (
    <group ref={headRef} position={[0, BODY.headY, 0]}>
      <group scale={BODY.headScale}>
        <Face />
        <Eyes eyesRef={eyesRef} />
        <Hair covered={covered} />
        <Eyewear kind={outfit.eyewear} />
        {outfit.head === "headphones" && <Headphones />}
        {outfit.head === "bucket" && <BucketHat />}
        {outfit.head === "beanie" && <Beanie />}
      </group>
    </group>
  );
}
