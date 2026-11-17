"use client";

import { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { RepeatWrapping, type CanvasTexture } from "three";
import { paint, toTexture } from "@/components/room/textures/canvas";

export type GameMode = "demo" | "play";

export type GameEvent =
  | { type: "demo-done" }
  | { type: "result"; label: string; good: boolean; score: string }
  | { type: "over"; summary: string };

export interface GameProps {
  mode: GameMode;
  /** Bumped by the shell to start a fresh game. */
  round: number;
  /** Pause rendering while the game is off screen. */
  active: boolean;
  onEvent: (event: GameEvent) => void;
}

export function LookAt({ target }: { target: [number, number, number] }) {
  const camera = useThree((state) => state.camera);
  useLayoutEffect(() => {
    camera.lookAt(...target);
  }, [camera, target]);
  return null;
}

function stripes(): CanvasTexture {
  const p = paint(256, 256);
  for (let i = 0; i < 8; i++) {
    p.ctx.fillStyle = i % 2 ? "#1f5a37" : "#246640";
    p.ctx.fillRect(0, i * 32, 256, 32);
  }
  const texture = toTexture(p);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

/** Striped grass under floodlights. */
export function Turf({ size = 40 }: { size?: number }) {
  const map = useMemo(() => stripes(), []);
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial map={map} roughness={0.95} />
    </mesh>
  );
}

export function Floodlights() {
  return (
    <>
      <hemisphereLight args={["#a9b8ff", "#0b1a12", 0.9]} />
      <directionalLight
        position={[4, 9, 6]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-12}
      />
      <spotLight position={[-6, 8, -4]} intensity={60} angle={0.6} penumbra={0.8} decay={2} color="#fff2dc" />
    </>
  );
}

/** A thin white line painted on the grass. */
export function Line({ x = 0, z, width, depth = 0.05 }: { x?: number; z: number; width: number; depth?: number }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[x, 0.004, z]}>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial color="#e9efe4" roughness={0.9} />
    </mesh>
  );
}

export const ease = (p: number): number => 1 - Math.pow(1 - Math.min(1, Math.max(0, p)), 3);
