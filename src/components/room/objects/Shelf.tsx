"use client";

import { useMemo } from "react";
import { RoundedBox } from "@react-three/drei";
import { ROOM_COLORS } from "../palette";
import { seeded } from "../textures/canvas";

const X0 = -3.45;
const X1 = -1.65;
const Z = -3.2;
const DEPTH = 0.5;
const HEIGHT = 2.9;
const BOARDS = [0.06, 0.7, 1.34, 1.98, 2.62];

interface BookSpec {
  x: number;
  y: number;
  w: number;
  h: number;
  d: number;
  color: string;
  band?: string;
  tilt?: number;
}

/** Manga volumes: each series gets its own spine colour and band. Abstract — no artwork. */
const MANGA_SERIES: { color: string; band: string; count: number }[] = [
  { color: "#e8742a", band: "#1b1424", count: 7 },
  { color: "#f0b429", band: "#c0392b", count: 6 },
  { color: "#1b1b22", band: "#c0392b", count: 5 },
  { color: "#f39c12", band: "#111111", count: 6 },
  { color: "#5d4a36", band: "#9c2f2f", count: 5 },
];

const NOVEL_COLORS = ["#d9d2c3", "#2b2b3b", "#b44b2a", "#3c5a7a", "#e4dccb", "#6b3a4a", "#2e4a3b", "#c9a44c"];

function buildBooks(): BookSpec[] {
  const rand = seeded(42);
  const books: BookSpec[] = [];
  // manga row
  let x = X0 + 0.08;
  for (const series of MANGA_SERIES) {
    for (let i = 0; i < series.count; i++) {
      books.push({ x, y: BOARDS[1] + 0.02, w: 0.03, h: 0.36, d: 0.26, color: series.color, band: series.band });
      x += 0.033;
    }
    x += 0.012;
  }
  // novels row
  x = X0 + 0.1;
  while (x < X1 - 0.35) {
    const w = 0.04 + rand() * 0.04;
    const h = 0.4 + rand() * 0.14;
    books.push({ x, y: BOARDS[2] + 0.02, w, h, d: 0.3, color: NOVEL_COLORS[Math.floor(rand() * NOVEL_COLORS.length)] });
    x += w + 0.004;
  }
  books.push({ x: x + 0.08, y: BOARDS[2] + 0.02, w: 0.05, h: 0.46, d: 0.3, color: "#d9d2c3", tilt: -0.28 });
  // bottom row: big books
  x = X0 + 0.12;
  for (let i = 0; i < 7; i++) {
    const w = 0.06 + rand() * 0.05;
    books.push({ x, y: BOARDS[0] + 0.02, w, h: 0.5 + rand() * 0.06, d: 0.36, color: NOVEL_COLORS[(i * 3) % NOVEL_COLORS.length] });
    x += w + 0.006;
  }
  // a stack lying flat on the fourth shelf
  for (let i = 0; i < 4; i++) {
    books.push({ x: X1 - 0.42, y: BOARDS[3] + 0.02 + i * 0.05, w: 0.34 - i * 0.02, h: 0.045, d: 0.26, color: NOVEL_COLORS[(i + 2) % NOVEL_COLORS.length] });
  }
  return books;
}

function Book({ spec }: { spec: BookSpec }) {
  const { x, y, w, h, d, color, band, tilt = 0 } = spec;
  return (
    <group position={[x + w / 2, y, Z + 0.04]} rotation-z={tilt}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>
      {band && (
        <mesh position={[0, h * 0.8, d / 2 + 0.001]}>
          <planeGeometry args={[w * 0.9, h * 0.1]} />
          <meshStandardMaterial color={band} roughness={0.85} />
        </mesh>
      )}
    </group>
  );
}

function Plant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.07, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.055, 0.14, 16]} />
        <meshStandardMaterial color="#c97a4a" roughness={0.8} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} position={[Math.cos(i) * 0.04, 0.2, Math.sin(i) * 0.04]} rotation={[Math.sin(i) * 0.4, i, Math.cos(i) * 0.4]} castShadow>
          <sphereGeometry args={[0.06, 10, 8]} />
          <meshStandardMaterial color={ROOM_COLORS.leaf} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

export function Shelf() {
  const books = useMemo(() => buildBooks(), []);
  const width = X1 - X0;
  const cx = (X0 + X1) / 2;

  return (
    <group>
      {[X0 + 0.025, X1 - 0.025].map((x) => (
        <mesh key={x} position={[x, HEIGHT / 2, Z]} castShadow receiveShadow>
          <boxGeometry args={[0.05, HEIGHT, DEPTH]} />
          <meshStandardMaterial color={ROOM_COLORS.walnut} roughness={0.75} />
        </mesh>
      ))}
      {[...BOARDS, HEIGHT - 0.02].map((y) => (
        <mesh key={y} position={[cx, y, Z]} castShadow receiveShadow>
          <boxGeometry args={[width, 0.04, DEPTH]} />
          <meshStandardMaterial color={ROOM_COLORS.walnut} roughness={0.75} />
        </mesh>
      ))}
      <mesh position={[cx, HEIGHT / 2, Z - DEPTH / 2 + 0.01]} receiveShadow>
        <boxGeometry args={[width, HEIGHT, 0.02]} />
        <meshStandardMaterial color={ROOM_COLORS.walnutDark} roughness={0.9} />
      </mesh>

      {books.map((spec, i) => (
        <Book key={i} spec={spec} />
      ))}

      {/* fourth shelf: a cricket ball on a stand and a plant */}
      <mesh position={[X0 + 0.3, BOARDS[3] + 0.04, Z + 0.05]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.04, 16]} />
        <meshStandardMaterial color="#1b1424" />
      </mesh>
      <mesh position={[X0 + 0.3, BOARDS[3] + 0.1, Z + 0.05]} castShadow>
        <sphereGeometry args={[0.036, 16, 16]} />
        <meshStandardMaterial color="#a3201a" roughness={0.6} />
      </mesh>
      <Plant position={[X0 + 0.7, BOARDS[3] + 0.02, Z + 0.06]} />
      <RoundedBox args={[0.09, 0.09, 0.09]} radius={0.01} position={[X0 + 1.0, BOARDS[3] + 0.065, Z + 0.06]} rotation-y={0.4} castShadow>
        <meshStandardMaterial color={ROOM_COLORS.lamp} roughness={0.6} />
      </RoundedBox>
      {/* top shelf: records */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[X0 + 0.25 + i * 0.05, BOARDS[4] + 0.17, Z + 0.02]} rotation-z={0.08 * (i - 2)} castShadow>
          <boxGeometry args={[0.012, 0.31, 0.31]} />
          <meshStandardMaterial color={["#1b1424", "#f2eadb", "#3c5a7a", ROOM_COLORS.lamp, "#2b2b3b"][i]} roughness={0.8} />
        </mesh>
      ))}
      <Plant position={[X1 - 0.35, HEIGHT, Z + 0.02]} scale={1.6} />
    </group>
  );
}

/** Bean bag for reading and late-night episodes. */
export function BeanBag() {
  return (
    <group position={[-1.8, 0, -2.1]}>
      <mesh position={[0, 0.3, 0]} scale={[1, 0.6, 1]} castShadow receiveShadow>
        <sphereGeometry args={[0.55, 32, 24]} />
        <meshStandardMaterial color={ROOM_COLORS.olive} roughness={0.95} />
      </mesh>
      <mesh position={[0.05, 0.5, 0.12]} scale={[1, 0.45, 0.9]}>
        <sphereGeometry args={[0.36, 24, 18]} />
        <meshStandardMaterial color="#4a5036" roughness={0.95} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0.62, 0.03 + i * 0.045, 0.3]} rotation-y={i * 0.3} castShadow>
          <boxGeometry args={[0.14, 0.04, 0.2]} />
          <meshStandardMaterial color={["#e8742a", "#1b1b22", "#f0b429"][i]} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}
