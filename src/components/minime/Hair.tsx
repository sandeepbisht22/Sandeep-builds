"use client";

import { useEffect, useMemo } from "react";
import { CatmullRomCurve3, DoubleSide, Vector3 } from "three";
import { mergeLocks, type LockSpec, type Point } from "./hairLocks";
import { HAIR, HAIR_DEEP } from "./palette";
import { BODY, onHead } from "./rig";

/*
 * Long hair with no part, combed back and slightly outwards, with a gentle, orderly wave
 * that builds towards the back, falling behind both ears to around the jaw.
 *
 * Each lock starts tucked under a smooth hairline roll and runs over the head in a near-vertical
 * plane that drifts away from the middle as it goes back. Every lock follows the same wave (mirrored
 * either side of the middle), so the crests stay in line instead of crossing.
 */

const R = BODY.headR;
const DEG = Math.PI / 180;

/** Locks are laid out on this sphere, then pulled in or out by their lift. */
const LAYOUT = R * 1.1;
/** Crown angle, in degrees up and over from the front (90 = top of the head, 180 = straight back). */
const HAIRLINE_PSI = 32;
const NAPE_PSI = 166;
/** One full wave every WAVE_DEG of crown angle, swinging WAVE_X sideways at its fullest. Kept gentle. */
const WAVE_DEG = 72;
const WAVE_X = 0.012;
/** How far the locks near the middle drift outwards by the back of the head. Outer locks drift less. */
const SPLAY = 0.05;
/** The widest a lock may sit, so it stays on the head. */
const MAX_X = 0.295;
/** The shell's band over the temples stops just behind the hairline roll. */
const TEMPLE_EDGE = 68;
/** The shell's lower band and curtain start well behind each ear, so the falling locks hide their edges. */
const BEHIND_EARS = 118;

const clamp01 = (t: number): number => Math.min(1, Math.max(0, t));
const smooth = (t: number): number => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

/** The point at crown angle `psi` in the vertical plane x = `x`, at `lift` × the head radius. */
function over(x: number, psi: number, lift: number): Point {
  const ryz = Math.sqrt(Math.max(LAYOUT * LAYOUT - x * x, 1e-4));
  const k = (R * lift) / LAYOUT;
  return [x * k, ryz * Math.sin(psi * DEG) * k, ryz * Math.cos(psi * DEG) * k];
}

/**
 * The front edge of the hair: a smooth roll from one sideburn, up over the temple, across the forehead
 * and down to the other sideburn. It hides the locks' roots so the hairline reads as one clean line.
 */
const HAIRLINE: readonly (readonly [number, number])[] = [
  [-74, 89],
  [-67, 77],
  [-57, 66],
  [-36, 59.5],
  [0, 57.5],
  [36, 59.5],
  [57, 66],
  [67, 77],
  [74, 89],
];
const ROLL: LockSpec = {
  points: HAIRLINE.map(([a, theta]) => onHead(a, theta, R * 1.05)),
  radius: 0.032,
  root: 0.3,
  tip: 0.3,
  flat: 0.5,
};

/** Crown angle where the plane x = `x` meets the hairline roll; beyond the roll's ends, the nearest end. */
const hairlinePsi = (() => {
  const curve = new CatmullRomCurve3(ROLL.points.map(([x, y, z]) => new Vector3(x, y, z)), false, "centripetal");
  const samples = curve.getSpacedPoints(240);
  return (x: number): number => {
    let best = samples[0];
    for (const point of samples) if (Math.abs(point.x - x) < Math.abs(best.x - x)) best = point;
    return Math.atan2(best.y, best.z) / DEG;
  };
})();

/** 0 at the hairline, 1 at the nape: the wave, the outward drift and the volume all build with it. */
const progress = (psi: number): number => clamp01((psi - HAIRLINE_PSI) / (NAPE_PSI - HAIRLINE_PSI));
const wave = (psi: number): number => Math.sin((psi / WAVE_DEG) * Math.PI * 2);

interface Comb {
  /** Lateral position where the lock leaves the hairline. */
  x: number;
  /** Which side of the middle: -1 or 1, or 0 for the centre lock, which runs straight back. */
  side: -1 | 0 | 1;
  radius: number;
}

/** Sideways position of a lock at crown angle `psi`: drifting outwards, with the shared wave on top. */
function lateral({ x, side }: Comb, psi: number): number {
  const reach = Math.abs(x) / MAX_X;
  const grow = smooth(progress(psi));
  const drift = side * SPLAY * (1 - reach) * grow;
  // Narrow meridian circles at the sides would exaggerate the wave, so ease it there.
  const sway = side * WAVE_X * (1 - 0.5 * reach * reach) * grow * wave(psi);
  return Math.max(-MAX_X, Math.min(MAX_X, x + drift + sway));
}

/** Volume: the hair lifts off the forehead, stays full over the crown, and is fuller at the sides. */
function lift({ x }: Comb, psi: number): number {
  const reach = Math.abs(x) / MAX_X;
  const crest = 0.006 * smooth(progress(psi)) * Math.cos((psi / WAVE_DEG) * Math.PI * 2);
  return 1.12 + 0.03 * Math.sin(Math.PI * progress(psi)) + 0.015 * reach + crest;
}

/** From under the hairline roll, back over the crown to the nape. */
function crownPoints(comb: Comb): Point[] {
  const start = hairlinePsi(comb.x) + 1.5;
  const psis = [start, start + 12, ...[52, 76, 100, 124, 146].filter((psi) => psi > start + 18), NAPE_PSI];
  return psis.map((psi, i) => over(lateral(comb, psi), psi, i === 0 ? 1.03 : lift(comb, psi)));
}

const FALL_Y = [0, -0.075, -0.145, -0.2];

/** Down the back of the head to around the jaw, keeping the wave, and flaring out a little at the ends. */
function fallPoints(comb: Comb): Point[] {
  const x = lateral(comb, NAPE_PSI) * 0.92;
  return FALL_Y.map((y, k) => {
    const last = k === FALL_Y.length - 1;
    const psi = NAPE_PSI + (k + 1) * 18;
    const sway = comb.side * WAVE_X * 1.2 * wave(psi);
    const wx = Math.max(-0.28, Math.min(0.28, x + comb.side * 0.008 * k + sway));
    const radius = 0.302 + 0.01 * k + (last ? 0.014 : 0);
    return [wx, y, -Math.sqrt(Math.max(radius * radius - wx * wx, 0.01))];
  });
}

/** Ribbons with some body: neighbours overlap into one combed mass with shallow grooves between them. */
const LOCK_SHAPE = { tip: 0.4, flat: 0.55 } as const;

function combedLock(comb: Comb): LockSpec {
  return { points: [...crownPoints(comb), ...fallPoints(comb)], radius: comb.radius, root: 0.75, ...LOCK_SHAPE };
}

/** Under a hat only the hair below the back of the brim shows. */
function coveredLock(comb: Comb): LockSpec {
  return { points: [over(comb.x * 0.95, 160, 1.02), ...fallPoints(comb)], radius: comb.radius, root: 0.6, ...LOCK_SHAPE };
}

/** Where the locks leave the hairline, mirrored either side of a centre lock, so the hair is symmetric. */
const OFFSETS = [0.045, 0.09, 0.135, 0.178, 0.218, 0.252];
const COMBS: Comb[] = [
  { x: 0, side: 0, radius: 0.052 },
  ...([-1, 1] as const).flatMap((side) => OFFSETS.map((offset, i) => ({ x: side * offset, side, radius: 0.05 - i * 0.0015 }))),
];

/** A point on a horizontal circle round the head's vertical axis; `a` is degrees from the front towards +x. */
function ring(a: number, y: number, radius: number): Point {
  return [radius * Math.sin(a * DEG), y, radius * Math.cos(a * DEG)];
}

/** Above each ear the hair is swept straight back from the temple, then falls behind the ear. */
function sideLocks(side: -1 | 1): LockSpec[] {
  const at = (a: number, theta: number, lift: number): Point => onHead(side * a, theta, R * lift);
  const around = (a: number, y: number, radius: number): Point => ring(side * a, y, radius);
  return [
    {
      points: [at(64, 70, 1.05), at(88, 70, 1.12), at(116, 75, 1.13), around(138, 0, 0.302), around(142, -0.09, 0.308), around(145, -0.19, 0.326)],
      radius: 0.046,
      root: 0.5,
      ...LOCK_SHAPE,
    },
    {
      points: [at(70, 80, 1.04), at(92, 80, 1.1), at(114, 85, 1.11), around(126, -0.02, 0.3), around(129, -0.1, 0.306), around(131, -0.18, 0.322)],
      radius: 0.04,
      root: 0.5,
      ...LOCK_SHAPE,
    },
  ];
}

const SIDES = [...sideLocks(-1), ...sideLocks(1)];
const UNCOVERED = [ROLL, ...SIDES, ...COMBS.map(combedLock)];
const COVERED = COMBS.map(coveredLock);

function Locks({ specs }: { specs: readonly LockSpec[] }) {
  const geometry = useMemo(() => mergeLocks(specs, 56, 10), [specs]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial color={HAIR} roughness={0.42} />
    </mesh>
  );
}

/** The smooth under-layer the locks lie on. Sphere phi runs from -x, so phi = 90° + a. */
function Shell({ covered }: { covered: boolean }) {
  const sweep = 360 - BEHIND_EARS * 2;
  return (
    <group>
      {!covered && (
        <mesh castShadow>
          <sphereGeometry args={[R * 1.08, 40, 16, 0, Math.PI * 2, 0, 0.32 * Math.PI]} />
          <meshStandardMaterial color={HAIR} roughness={0.55} />
        </mesh>
      )}
      {/* Temples, sides and back, down to the top of both ears. */}
      <mesh castShadow>
        <sphereGeometry args={[R * 1.085, 40, 10, (90 + TEMPLE_EDGE) * DEG, (360 - TEMPLE_EDGE * 2) * DEG, 0.3 * Math.PI, 0.18 * Math.PI]} />
        <meshStandardMaterial color={HAIR} roughness={0.55} side={DoubleSide} />
      </mesh>
      {/* Behind the ears, below them. */}
      <mesh>
        <sphereGeometry args={[R * 1.08, 36, 10, (90 + BEHIND_EARS) * DEG, sweep * DEG, 0.48 * Math.PI, 0.16 * Math.PI]} />
        <meshStandardMaterial color={HAIR_DEEP} roughness={0.6} side={DoubleSide} />
      </mesh>
      {/* The curtain the falling locks lie on, down to the jaw. Cylinder angle = a. */}
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.292, 0.3, 0.16, 36, 1, true, BEHIND_EARS * DEG, sweep * DEG]} />
        <meshStandardMaterial color={HAIR_DEEP} roughness={0.6} side={DoubleSide} />
      </mesh>
    </group>
  );
}

export function Hair({ covered }: { covered: boolean }) {
  return (
    <group>
      <Shell covered={covered} />
      <Locks specs={covered ? COVERED : UNCOVERED} />
    </group>
  );
}
