"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import { MiniMe3D } from "@/components/minime/MiniMe3D";
import { createControl, type MiniMeControl } from "@/components/minime/rig";
import { usePainted } from "@/components/room/usePainted";
import { footballTexture } from "@/components/room/textures/surfaces";
import { paint, toTexture } from "@/components/room/textures/canvas";
import { playSfx } from "@/lib/sound";
import { GOAL, PENALTY_SHOTS, diveX, judgeShot, pickDive, type Aim, type Dive, type ShotResult } from "./logic";
import { Floodlights, Line, LookAt, Turf, ease, type GameProps } from "./shared";

type Phase = "idle" | "runup" | "kick" | "flight" | "result";

const SPOT: [number, number, number] = [0, 0.1, -0.5];
const START: [number, number, number] = [0.5, 0, 0.75];
const LABEL: Record<ShotResult, string> = { goal: "Goal!", saved: "Saved!", miss: "Off target" };

interface GameState {
  phase: Phase;
  start: number;
  aim: Aim;
  dive: Dive;
  result: ShotResult;
  shots: number;
  goals: number;
  readyAt: number;
  demoFired: boolean;
  /** A click waiting for the next frame, so timing uses the scene clock. */
  request: Aim | null;
}

const fresh = (): GameState => ({
  phase: "idle",
  start: 0,
  aim: { x: 0, y: 0.6 },
  dive: "centre",
  result: "goal",
  shots: 0,
  goals: 0,
  readyAt: -1,
  demoFired: false,
  request: null,
});

function netTexture() {
  const p = paint(256, 256);
  p.ctx.strokeStyle = "rgba(240,240,240,0.55)";
  p.ctx.lineWidth = 3;
  for (let i = 0; i <= 256; i += 21) {
    p.ctx.beginPath();
    p.ctx.moveTo(i, 0);
    p.ctx.lineTo(i, 256);
    p.ctx.moveTo(0, i);
    p.ctx.lineTo(256, i);
    p.ctx.stroke();
  }
  return toTexture(p);
}

function Goal() {
  const net = useMemo(() => netTexture(), []);
  const { width: w, height: h, lineZ } = GOAL;
  const post = (x: number) => (
    <mesh position={[x, h / 2, lineZ]} castShadow>
      <cylinderGeometry args={[0.04, 0.04, h, 12]} />
      <meshStandardMaterial color="#f4f4f4" roughness={0.4} />
    </mesh>
  );
  return (
    <group>
      {post(-w / 2)}
      {post(w / 2)}
      <mesh position={[0, h, lineZ]} rotation-z={Math.PI / 2} castShadow>
        <cylinderGeometry args={[0.04, 0.04, w + 0.08, 12]} />
        <meshStandardMaterial color="#f4f4f4" roughness={0.4} />
      </mesh>
      {[
        { p: [0, h / 2, lineZ - 0.8] as const, r: [0, 0, 0] as const, s: [w, h] as const },
        { p: [-w / 2, h / 2, lineZ - 0.4] as const, r: [0, Math.PI / 2, 0] as const, s: [0.8, h] as const },
        { p: [w / 2, h / 2, lineZ - 0.4] as const, r: [0, Math.PI / 2, 0] as const, s: [0.8, h] as const },
        { p: [0, h, lineZ - 0.4] as const, r: [Math.PI / 2, 0, 0] as const, s: [w, 0.8] as const },
      ].map(({ p, r, s }, i) => (
        <mesh key={i} position={[...p]} rotation={[...r]}>
          <planeGeometry args={[...s]} />
          <meshStandardMaterial map={net} transparent alphaTest={0.2} side={2} />
        </mesh>
      ))}
    </group>
  );
}

function Keeper() {
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.17, 0.4, 6, 14]} />
        <meshStandardMaterial color="#38d98a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.98, 0]} castShadow>
        <sphereGeometry args={[0.17, 18, 14]} />
        <meshStandardMaterial color="#c99a78" roughness={0.6} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.28, 0.74, 0]} rotation-z={side * -0.9}>
          <mesh position={[0, 0.14, 0]} castShadow>
            <capsuleGeometry args={[0.05, 0.22, 4, 10]} />
            <meshStandardMaterial color="#38d98a" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.32, 0]} castShadow>
            <sphereGeometry args={[0.08, 12, 10]} />
            <meshStandardMaterial color="#f4f4f4" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** The shootout itself: run-up, kick, flight, keeper's dive, verdict, reset. */
function Shootout({ mode, round, onEvent }: Omit<GameProps, "active">) {
  const ballMap = usePainted(footballTexture);
  const ball = useRef<Mesh>(null);
  const keeper = useRef<Group>(null);
  const shooter = useRef<Group>(null);
  const reticle = useRef<Mesh>(null);
  const control = useRef<MiniMeControl>(createControl("football", Math.PI));
  const game = useRef<GameState>(fresh());
  const emit = useRef(onEvent);

  useEffect(() => {
    emit.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    game.current = fresh();
  }, [round, mode]);

  const shoot = (aim: Aim, now: number): void => {
    const g = game.current;
    if (g.phase !== "idle" || (mode === "play" && g.shots >= PENALTY_SHOTS)) return;
    g.aim = aim;
    g.dive = mode === "demo" ? "left" : pickDive(Math.random);
    g.phase = "runup";
    g.start = now;
  };

  const settle = (now: number): void => {
    const g = game.current;
    g.result = judgeShot(g.aim, g.dive);
    g.phase = "result";
    g.start = now;
    if (mode === "demo") return;
    g.shots += 1;
    if (g.result === "goal") g.goals += 1;
    emit.current({ type: "result", label: LABEL[g.result], good: g.result === "goal", score: `${g.goals} of ${g.shots}` });
    if (g.result === "goal") {
      control.current.waves += 1;
      playSfx("cheer");
    }
  };

  const reset = (): void => {
    const g = game.current;
    g.phase = "idle";
    shooter.current?.position.set(...START);
    keeper.current?.position.set(0, 0, GOAL.lineZ + 0.25);
    keeper.current?.rotation.set(0, 0, 0);
    ball.current?.position.set(...SPOT);
    if (mode === "demo") emit.current({ type: "demo-done" });
    else if (g.shots >= PENALTY_SHOTS) emit.current({ type: "over", summary: `You scored ${g.goals} of ${PENALTY_SHOTS}.` });
  };

  useFrame((state) => {
    const now = state.clock.elapsedTime;
    const g = game.current;
    const c = control.current;
    if (g.readyAt < 0) g.readyAt = now;
    if (g.request) {
      shoot(g.request, now);
      g.request = null;
    }
    if (mode === "demo" && !g.demoFired && g.phase === "idle" && now - g.readyAt > 1.2) {
      g.demoFired = true;
      shoot({ x: 1.42, y: 1.0 }, now);
    }
    const p = now - g.start;
    const sh = shooter.current;
    const b = ball.current;
    const k = keeper.current;
    if (!sh || !b || !k) return;

    c.walking = g.phase === "runup";
    if (g.phase === "runup") {
      const t = Math.min(1, p / 0.55);
      const z = START[2] + (-0.12 - START[2]) * t;
      c.stride = Math.abs(z - sh.position.z);
      sh.position.set(START[0] + (0.18 - START[0]) * t, 0, z);
      if (t >= 1) {
        c.kicks += 1;
        g.phase = "kick";
        g.start = now;
      }
    } else if (g.phase === "kick" && p > 0.16) {
      g.phase = "flight";
      g.start = now;
      playSfx("kick");
    } else if (g.phase === "flight") {
      const t = Math.min(1, p / 0.62);
      const e = ease(t);
      b.position.set(SPOT[0] + (g.aim.x - SPOT[0]) * e, SPOT[1] + (g.aim.y - SPOT[1]) * e + Math.sin(t * Math.PI) * 0.22, SPOT[2] + (GOAL.lineZ - SPOT[2]) * e);
      b.rotation.x -= 0.4;
      const dive = ease(p / 0.45);
      const side = Math.sign(diveX(g.dive));
      k.position.set(diveX(g.dive) * dive, Math.sin(dive * Math.PI) * 0.22, GOAL.lineZ + 0.25);
      k.rotation.z = -side * 1.2 * dive;
      if (t >= 1) settle(now);
    } else if (g.phase === "result") {
      const t = Math.min(1, p / 0.5);
      if (g.result === "goal") b.position.set(g.aim.x, Math.max(0.1, g.aim.y - t * 0.6), GOAL.lineZ - 0.6 * t);
      if (g.result === "saved") b.position.set(g.aim.x * (1 - t * 0.5), 0.1 + (g.aim.y - 0.1) * (1 - t), GOAL.lineZ + 1.6 * t);
      if (g.result === "miss") b.position.set(g.aim.x * (1 + t * 0.3), g.aim.y + t * 0.4, GOAL.lineZ - 2 * t);
      if (p > 1.7) reset();
    } else if (g.phase === "idle") {
      k.position.x = Math.sin(now * 1.6) * 0.25;
    }
    if (reticle.current) reticle.current.visible = mode === "play" && g.phase === "idle" && g.shots < PENALTY_SHOTS;
  });

  const aimAt = (event: ThreeEvent<PointerEvent | MouseEvent>): Aim => ({
    x: Math.max(-2.6, Math.min(2.6, event.point.x)),
    y: Math.max(0.08, Math.min(1.9, event.point.y)),
  });

  return (
    <>
      <group ref={shooter} position={START}>
        <MiniMe3D controlRef={control} initialOutfit="football" showProps={false} />
      </group>
      <mesh ref={ball} position={SPOT} castShadow>
        <sphereGeometry args={[0.1, 24, 18]} />
        <meshStandardMaterial map={ballMap} roughness={0.5} />
      </mesh>
      <group ref={keeper} position={[0, 0, GOAL.lineZ + 0.25]}>
        <Keeper />
      </group>
      <mesh ref={reticle} position={[0, 0.6, GOAL.lineZ + 0.02]} visible={false}>
        <ringGeometry args={[0.11, 0.15, 32]} />
        <meshBasicMaterial color="#ff8a1f" toneMapped={false} />
      </mesh>
      <mesh
        position={[0, 1.1, GOAL.lineZ + 0.01]}
        onPointerMove={(event) => {
          const aim = aimAt(event);
          reticle.current?.position.set(aim.x, aim.y, GOAL.lineZ + 0.02);
        }}
        onClick={(event) => {
          if (mode === "play") game.current.request = aimAt(event);
        }}
      >
        <planeGeometry args={[9, 3.2]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  );
}

export default function PenaltyGame({ active, ...props }: GameProps) {
  return (
    <Canvas shadows="percentage" dpr={[1, 1.75]} frameloop={active ? "always" : "never"} camera={{ position: [-0.7, 2.05, 3.6], fov: 38 }}>
      <LookAt target={[0.1, 0.55, -5.4]} />
      <color attach="background" args={["#07120d"]} />
      <fog attach="fog" args={["#07120d", 10, 26]} />
      <Floodlights />
      <Turf />
      <Line z={GOAL.lineZ} width={14} />
      <Line z={GOAL.lineZ + 2.75} width={9.16} />
      <Line x={-4.58} z={GOAL.lineZ + 1.375} width={0.05} depth={2.75} />
      <Line x={4.58} z={GOAL.lineZ + 1.375} width={0.05} depth={2.75} />
      <mesh rotation-x={-Math.PI / 2} position={[SPOT[0], 0.005, SPOT[2]]}>
        <circleGeometry args={[0.06, 16]} />
        <meshStandardMaterial color="#e9efe4" />
      </mesh>
      <Goal />
      <Shootout {...props} />
    </Canvas>
  );
}
