"use client";

import { useRef, useState, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import type { Group, Mesh, MeshStandardMaterial } from "three";
import { Body } from "./Body";
import { Head } from "./Head";
import { Arm, Leg } from "./Limbs";
import { outfits, type Outfit, type OutfitId } from "./outfits";
import { PAPER } from "./palette";
import { Football } from "./Props";
import { POSES, type MiniMeControl } from "./rig";

const SPIN_TIME = 0.62;
const KICK_TIME = 0.42;
const BOWL_TIME = 0.55;
const PUFF_TIME = 0.75;
/** Radians of walk cycle per world unit travelled, so feet don't slide. */
const STEP_RATE = 13;
const PUFF_ANGLES = Array.from({ length: 9 }, (_, i) => (i / 9) * Math.PI * 2);

interface AnimState {
  facing: number;
  walk: number;
  phase: number;
  spinStart: number;
  spinTarget: OutfitId;
  swapped: boolean;
  blinkNext: number;
  blinkStart: number;
  waveStart: number;
  seenWaves: number;
  puffStart: number;
  kickStart: number;
  seenKicks: number;
  bowlStart: number;
  seenBowls: number;
}

interface Rig {
  root: RefObject<Group | null>;
  body: RefObject<Group | null>;
  head: RefObject<Group | null>;
  eyes: RefObject<Group | null>;
  armR: RefObject<Group | null>;
  armL: RefObject<Group | null>;
  legR: RefObject<Group | null>;
  legL: RefObject<Group | null>;
  prop: RefObject<Group | null>;
  ball: RefObject<Group | null>;
  puff: RefObject<Group | null>;
}

const easeInOut = (p: number): number => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

/** Small idle habits per outfit: sipping, nodding, reading, toe-taps, planting the pole. */
function idleHabit(outfit: Outfit, t: number): { armRX: number; headX: number; tapL: number; bounce: number } {
  const habit = { armRX: 0, headX: 0, tapL: 0, bounce: 0 };
  if (outfit.prop === "mug") {
    const q = (t % 5.5) - 4.4;
    if (q > 0 && q < 1.1) habit.armRX = -Math.sin((q / 1.1) * Math.PI) * 0.85;
    habit.headX = habit.armRX * 0.12;
  } else if (outfit.id === "street") {
    const beat = Math.sin(t * Math.PI * 3);
    habit.headX = beat * beat * 0.14;
    habit.bounce = Math.abs(beat) * 0.012;
  } else if (outfit.prop === "book") {
    habit.headX = 0.2 + Math.sin(t * 0.7) * 0.03;
  } else if (outfit.prop === "football") {
    habit.tapL = Math.max(0, Math.sin(t * 3.2)) * -0.45;
  } else if (outfit.prop === "pole") {
    habit.armRX = Math.sin(t * 1.4) * 0.12;
  } else {
    habit.headX = Math.sin(t * 0.9) * 0.03;
  }
  return habit;
}

function animateLimbs(rig: Rig, outfit: Outfit, a: AnimState, t: number, dt: number): void {
  const { armR, armL, legR, legL, prop, ball } = rig;
  if (!armR.current || !armL.current || !legR.current || !legL.current) return;
  const pose = POSES[outfit.pose];
  const swing = Math.sin(a.phase) * a.walk;
  const habit = idleHabit(outfit, t);
  const rightFree = outfit.pose === "idle";
  const leftFree = outfit.pose !== "holdBook";
  const waving = t - a.waveStart < 1.9;

  const smooth = 0.09;
  easing.damp(armR.current.rotation, "x", pose.right.x + (rightFree ? swing * 0.55 : 0) + habit.armRX * (1 - a.walk), smooth, dt);
  easing.damp(armR.current.rotation, "z", pose.right.z, smooth, dt);
  if (waving) {
    easing.damp(armL.current.rotation, "x", -0.25, 0.08, dt);
    easing.damp(armL.current.rotation, "z", 2.55 + Math.sin(t * 13) * 0.28, 0.06, dt);
  } else {
    easing.damp(armL.current.rotation, "x", pose.left.x - (leftFree ? swing * 0.55 : 0), smooth, dt);
    easing.damp(armL.current.rotation, "z", pose.left.z, smooth, dt);
  }
  legR.current.rotation.x = swing * 0.55;
  legL.current.rotation.x = -swing * 0.55 + habit.tapL * (1 - a.walk);

  const kick = (t - a.kickStart) / KICK_TIME;
  if (kick >= 0 && kick <= 1) legR.current.rotation.x = -Math.sin(kick * Math.PI) * 1.35 + (kick < 0.25 ? kick * 1.6 : 0);
  const bowl = (t - a.bowlStart) / BOWL_TIME;
  if (bowl >= 0 && bowl <= 1) {
    armR.current.rotation.x = -bowl * Math.PI * 2;
    armR.current.rotation.z = -0.05;
  }

  // Held props stay upright: undo the arm's rotation.
  if (prop.current) prop.current.rotation.set(-armR.current.rotation.x, 0, -armR.current.rotation.z, "ZYX");
  if (ball.current) {
    ball.current.position.y = 0.1 + Math.max(0, -habit.tapL) * 0.05;
    ball.current.rotation.x += dt * 0.6;
  }
}

function animateFace(rig: Rig, outfit: Outfit, a: AnimState, t: number, dt: number, blinks: boolean): void {
  if (blinks && t > a.blinkNext) {
    a.blinkStart = t;
    a.blinkNext = t + 2.4 + Math.random() * 3.2;
  }
  const p = (t - a.blinkStart) / 0.16;
  const lid = p >= 0 && p <= 1 ? 1 - Math.sin(p * Math.PI) * 0.92 : 1;
  rig.eyes.current?.children.forEach((placement) => {
    const eye = placement.children[0];
    if (eye) eye.scale.y = lid;
  });
  if (rig.head.current) {
    const habit = idleHabit(outfit, t);
    easing.damp(rig.head.current.rotation, "x", habit.headX * (1 - a.walk), 0.12, dt);
    rig.head.current.rotation.z = Math.sin(t * 0.8) * 0.025;
  }
}

function animatePuff(rig: Rig, a: AnimState, t: number): void {
  const group = rig.puff.current;
  if (!group) return;
  const p = (t - a.puffStart) / PUFF_TIME;
  const active = p >= 0 && p <= 1;
  group.visible = active;
  if (!active) return;
  group.children.forEach((child, i) => {
    const mesh = child as Mesh;
    const angle = PUFF_ANGLES[i];
    const spread = 0.12 + p * 0.38;
    mesh.position.set(Math.cos(angle) * spread, 0.04 + p * 0.16 + (i % 3) * 0.02, Math.sin(angle) * spread);
    mesh.scale.setScalar(0.05 + p * 0.07);
    (mesh.material as MeshStandardMaterial).opacity = (1 - p) * 0.85;
  });
}

interface MiniMe3DProps {
  controlRef: RefObject<MiniMeControl>;
  initialOutfit: OutfitId;
  /** Hide the mug, book, balls and pole (games bring their own). */
  showProps?: boolean;
}

/**
 * The 3D mini-me: a chibi figure built from primitives. Everything moves procedurally —
 * walking from distance travelled, a spin into each new outfit, blinking and small habits.
 */
export function MiniMe3D({ controlRef, initialOutfit, showProps = true }: MiniMe3DProps) {
  const [outfitId, setOutfitId] = useState<OutfitId>(initialOutfit);
  const outfit = outfits[outfitId];
  const rootRef = useRef<Group>(null);
  const bodyRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const eyesRef = useRef<Group>(null);
  const armRRef = useRef<Group>(null);
  const armLRef = useRef<Group>(null);
  const legRRef = useRef<Group>(null);
  const legLRef = useRef<Group>(null);
  const propRef = useRef<Group>(null);
  const ballRef = useRef<Group>(null);
  const puffRef = useRef<Group>(null);
  const anim = useRef<AnimState>({
    facing: 0,
    walk: 0,
    phase: 0,
    spinStart: -1,
    spinTarget: initialOutfit,
    swapped: true,
    blinkNext: 2,
    blinkStart: -1,
    waveStart: -10,
    seenWaves: 0,
    puffStart: -10,
    kickStart: -10,
    seenKicks: 0,
    bowlStart: -10,
    seenBowls: 0,
  });

  useFrame((state, dt) => {
    const rig: Rig = {
      root: rootRef,
      body: bodyRef,
      head: headRef,
      eyes: eyesRef,
      armR: armRRef,
      armL: armLRef,
      legR: legRRef,
      legL: legLRef,
      prop: propRef,
      ball: ballRef,
      puff: puffRef,
    };
    const control = controlRef.current;
    const a = anim.current;
    const t = state.clock.elapsedTime;
    const root = rig.root.current;
    const body = rig.body.current;
    if (!root || !body) return;

    if (control.outfit !== a.spinTarget && a.spinStart < 0) {
      a.spinStart = t;
      a.spinTarget = control.outfit;
      a.swapped = false;
    }
    let spin = 0;
    let stretch = 1;
    if (a.spinStart >= 0) {
      const p = Math.min(1, (t - a.spinStart) / SPIN_TIME);
      spin = easeInOut(p) * Math.PI * 2;
      stretch = 1 + Math.sin(p * Math.PI) * 0.14;
      if (p >= 0.5 && !a.swapped) {
        a.swapped = true;
        a.puffStart = t;
        setOutfitId(a.spinTarget);
      }
      if (p >= 1) a.spinStart = -1;
    }
    if (control.waves !== a.seenWaves) {
      a.seenWaves = control.waves;
      a.waveStart = t;
    }
    if (control.kicks !== a.seenKicks) {
      a.seenKicks = control.kicks;
      a.kickStart = t;
    }
    if (control.bowls !== a.seenBowls) {
      a.seenBowls = control.bowls;
      a.bowlStart = t;
    }

    easing.dampAngle(a, "facing", control.facing, 0.16, dt);
    easing.damp(a, "walk", control.walking ? 1 : 0, 0.1, dt);
    a.phase += control.autoStep ? dt * 9 : control.stride * STEP_RATE;

    root.rotation.y = a.facing + spin;
    root.scale.set(1 / Math.sqrt(stretch), stretch, 1 / Math.sqrt(stretch));
    const habit = idleHabit(outfit, t);
    body.position.y = Math.abs(Math.sin(a.phase)) * 0.035 * a.walk + Math.sin(t * 2.1) * 0.004 + habit.bounce;
    body.rotation.y = Math.sin(a.phase) * 0.08 * a.walk;
    body.rotation.x = 0.05 * a.walk;

    animateLimbs(rig, outfit, a, t, dt);
    animateFace(rig, outfit, a, t, dt, control.blinks);
    animatePuff(rig, a, t);
  });

  return (
    <group ref={rootRef}>
      <group ref={bodyRef}>
        <Body outfit={outfit} />
        <Head outfit={outfit} headRef={headRef} eyesRef={eyesRef} />
        <Arm side={-1} outfit={outfit} armRef={armRRef} propRef={showProps ? propRef : undefined} />
        <Arm side={1} outfit={outfit} armRef={armLRef} />
      </group>
      <Leg side={-1} outfit={outfit} legRef={legRRef} />
      <Leg side={1} outfit={outfit} legRef={legLRef} />
      {showProps && outfit.prop === "football" && (
        <group ref={ballRef} position={[0.2, 0.1, 0.2]}>
          <Football />
        </group>
      )}
      <group ref={puffRef} visible={false}>
        {PUFF_ANGLES.map((angle) => (
          <mesh key={angle}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial color={PAPER} transparent opacity={0} roughness={1} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
