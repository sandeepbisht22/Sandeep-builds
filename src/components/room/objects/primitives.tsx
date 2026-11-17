"use client";

import { useMemo } from "react";
import { CanvasTexture, Quaternion, Vector3, AdditiveBlending } from "three";
import type { Vec3 } from "../layout";

interface SegmentProps {
  from: Vec3;
  to: Vec3;
  radius: number;
  color: string;
  roughness?: number;
  metalness?: number;
}

/** A cylinder stretched between two points (lamp arms, bat handles, wires). */
export function Segment({ from, to, radius, color, roughness = 0.6, metalness = 0 }: SegmentProps) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new Vector3(...from);
    const b = new Vector3(...to);
    const dir = b.clone().sub(a);
    const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir.clone().normalize());
    return { position: a.add(b).multiplyScalar(0.5), quaternion: q, length: dir.length() };
  }, [from, to]);

  return (
    <mesh position={position} quaternion={quaternion} castShadow>
      <cylinderGeometry args={[radius, radius, length, 12]} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  );
}

let glowTexture: CanvasTexture | null = null;

/** Shared soft radial falloff used for fake bloom halos. */
export function getGlowTexture(): CanvasTexture {
  if (glowTexture) return glowTexture;
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.45)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  }
  glowTexture = new CanvasTexture(canvas);
  return glowTexture;
}

interface GlowProps {
  position: Vec3;
  size: number;
  color: string;
  opacity?: number;
  rotation?: Vec3;
}

/** A flat additive halo, placed against walls behind light sources. */
export function Glow({ position, size, color, opacity = 0.6, rotation = [0, 0, 0] }: GlowProps) {
  const map = useMemo(() => getGlowTexture(), []);
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial
        map={map}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
}
