"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import { MiniMe3D } from "@/components/minime/MiniMe3D";
import { createControl, type MiniMeControl } from "@/components/minime/rig";
import { usePainted } from "@/components/room/usePainted";
import { cricketBallTexture } from "@/components/room/textures/surfaces";
import { playSfx } from "@/lib/sound";
import { BALLS_PER_OVER, LEFT_ALONE, judgeSwing, type SwingOutcome } from "./logic";
import { Floodlights, Line, LookAt, Turf, ease, type GameProps } from "./shared";

type Phase = "waiting" | "runup" | "bowling" | "delivery" | "outcome";
type Vec = [number, number, number];

const RUN_FROM: Vec = [-0.2, 0, -12.6];
const RUN_TO: Vec = [-0.2, 0, -10.9];
const RELEASE: Vec = [-0.05, 1.5, -10.6];
const BOUNCE: Vec = [0.03, 0.04, -3.6];
const AT_BAT: Vec = [0, 0.3, 0.3];
const TO_PITCH = 0.5;
const TO_BAT = 0.3;

interface GameState {
  phase: Phase;
  start: number;
  balls: number;
  runs: number;
  wickets: number;
  outcome: SwingOutcome;
  direction: number;
  swingAt: number;
  request: boolean;
  readyAt: number;
}

const fresh = (): GameState => ({
  phase: "waiting",
  start: 0,
  balls: 0,
  runs: 0,
  wickets: 0,
  outcome: LEFT_ALONE,
  direction: 0,
  swingAt: -10,
  request: false,
  readyAt: -1,
});

const lerp3 = (a: Vec, b: Vec, t: number): Vec => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

function Stumps({ z, stumpsRef }: { z: number; stumpsRef?: React.RefObject<Group | null> }) {
  return (
    <group ref={stumpsRef} position={[0, 0, z]}>
      {[-0.07, 0, 0.07].map((x) => (
        <mesh key={x} position={[x, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 0.5, 8]} />
          <meshStandardMaterial color="#efe3cc" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 0.505, 0]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.008, 0.008, 0.15, 6]} />
        <meshStandardMaterial color="#efe3cc" />
      </mesh>
    </group>
  );
}

function Bat({ batRef }: { batRef: React.RefObject<Group | null> }) {
  return (
    <group ref={batRef} position={[0.34, 0.78, 0.42]} rotation={[-0.6, 0.4, 0.25]}>
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
        <meshStandardMaterial color="#1f3a8a" roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.42, 0]} castShadow>
        <boxGeometry args={[0.11, 0.44, 0.04]} />
        <meshStandardMaterial color="#dcc08e" roughness={0.65} />
      </mesh>
    </group>
  );
}

/** One over: run-up, delivery, your swing (or not), the verdict, next ball. */
function Over({ mode, round, onEvent }: Omit<GameProps, "active">) {
  const ballMap = usePainted(cricketBallTexture);
  const ball = useRef<Mesh>(null);
  const bowler = useRef<Group>(null);
  const bat = useRef<Group>(null);
  const stumps = useRef<Group>(null);
  const control = useRef<MiniMeControl>(createControl("cricket", 0));
  const game = useRef<GameState>(fresh());
  const emit = useRef(onEvent);

  useEffect(() => {
    emit.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    game.current = fresh();
  }, [round, mode]);

  useEffect(() => {
    if (mode !== "play") return;
    const onKey = (event: KeyboardEvent): void => {
      if (event.code !== "Space") return;
      event.preventDefault();
      game.current.request = true;
    };
    const onPointer = (): void => {
      game.current.request = true;
    };
    const surface = document.getElementById("cricket-surface");
    window.addEventListener("keydown", onKey);
    surface?.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      surface?.removeEventListener("pointerdown", onPointer);
    };
  }, [mode]);

  const finishBall = (): void => {
    const g = game.current;
    if (mode === "demo") {
      emit.current({ type: "demo-done" });
      return;
    }
    g.balls += 1;
    g.runs += g.outcome.runs;
    if (g.outcome.out) g.wickets += 1;
    emit.current({ type: "result", label: g.outcome.label, good: !g.outcome.out, score: `${g.runs} off ${g.balls}` });
    if (g.balls >= BALLS_PER_OVER) {
      const wickets = g.wickets === 0 ? "" : g.wickets === 1 ? ", bowled once" : `, bowled ${g.wickets} times`;
      emit.current({ type: "over", summary: `You scored ${g.runs} off ${BALLS_PER_OVER} balls${wickets}.` });
    }
  };

  const decide = (outcome: SwingOutcome, now: number): void => {
    const g = game.current;
    g.outcome = outcome;
    g.phase = "outcome";
    g.start = now;
    if (outcome.out) {
      playSfx("stumps");
      control.current.waves += 1;
    } else {
      playSfx(outcome.runs >= 4 ? "cheer" : "bat");
    }
  };

  useFrame((state) => {
    const now = state.clock.elapsedTime;
    const g = game.current;
    const c = control.current;
    const b = ball.current;
    const bw = bowler.current;
    if (!b || !bw) return;
    if (g.readyAt < 0) g.readyAt = now;
    const p = now - g.start;

    if (g.request) {
      g.request = false;
      if (now - g.swingAt > 0.5) g.swingAt = now;
      if (g.phase === "delivery" && p > TO_PITCH * 0.6) {
        const outcome = judgeSwing(p - (TO_PITCH + TO_BAT));
        g.direction = Math.sign(p - (TO_PITCH + TO_BAT)) || 1;
        if (!outcome.out) decide(outcome, now);
      }
    }

    const swing = (now - g.swingAt) / 0.24;
    if (bat.current) {
      const s = swing >= 0 && swing <= 1 ? ease(swing) : swing > 1 && swing < 3 ? 1 : 0;
      bat.current.rotation.set(-0.6 + s * 2.1, 0.4 - s * 1.3, 0.25);
    }

    c.walking = g.phase === "runup";
    if (g.phase === "waiting") {
      b.visible = false;
      const wait = mode === "demo" ? 1.0 : 0.9;
      if (now - Math.max(g.start, g.readyAt) > wait && (mode === "play" ? g.balls < BALLS_PER_OVER : g.balls === 0 && p < 5)) {
        g.phase = "runup";
        g.start = now;
        stumps.current?.rotation.set(0, 0, 0);
        bw.position.set(...RUN_FROM);
      }
    } else if (g.phase === "runup") {
      const t = Math.min(1, p / 0.75);
      const pos = lerp3(RUN_FROM, RUN_TO, t);
      c.stride = Math.abs(pos[2] - bw.position.z);
      bw.position.set(...pos);
      if (t >= 1) {
        c.bowls += 1;
        g.phase = "bowling";
        g.start = now;
      }
    } else if (g.phase === "bowling" && p > 0.33) {
      g.phase = "delivery";
      g.start = now;
      b.visible = true;
    } else if (g.phase === "delivery") {
      const pos = p < TO_PITCH ? lerp3(RELEASE, BOUNCE, p / TO_PITCH) : lerp3(BOUNCE, AT_BAT, Math.min(1.15, (p - TO_PITCH) / TO_BAT));
      b.position.set(...pos);
      b.rotation.x -= 0.5;
      if (p > TO_PITCH + TO_BAT + 0.06) decide(LEFT_ALONE, now);
    } else if (g.phase === "outcome") {
      const t = Math.min(1, p / 1.2);
      const { runs, out } = g.outcome;
      if (out) {
        if (stumps.current) stumps.current.rotation.x = -ease(p / 0.25) * 0.9;
      } else {
        const reach = runs === 6 ? 16 : runs === 4 ? 13 : 5;
        const height = runs === 6 ? 4.2 : 0.25;
        b.position.set(AT_BAT[0] + g.direction * reach * 0.45 * t, 0.1 + Math.sin(t * Math.PI) * height, AT_BAT[2] - reach * t);
      }
      if (p > 1.6) {
        finishBall();
        g.phase = "waiting";
        g.start = now;
        g.outcome = LEFT_ALONE;
      }
    }
  });

  return (
    <>
      <group ref={bowler} position={RUN_FROM}>
        <MiniMe3D controlRef={control} initialOutfit="cricket" showProps={false} />
      </group>
      <mesh ref={ball} visible={false} castShadow>
        <sphereGeometry args={[0.045, 18, 14]} />
        <meshStandardMaterial map={ballMap} roughness={0.45} />
      </mesh>
      <Stumps z={0} stumpsRef={stumps} />
      <Stumps z={-11} />
      <Bat batRef={bat} />
    </>
  );
}

export default function CricketGame({ active, ...props }: GameProps) {
  return (
    <div id="cricket-surface" className="h-full w-full">
      <Canvas shadows="percentage" dpr={[1, 1.75]} frameloop={active ? "always" : "never"} camera={{ position: [0.45, 1.35, 2.5], fov: 38 }}>
        <LookAt target={[0, 0.55, -8]} />
        <color attach="background" args={["#0a1328"]} />
        <fog attach="fog" args={["#0a1328", 12, 30]} />
        <Floodlights />
        <Turf size={50} />
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.003, -5.5]} receiveShadow>
          <planeGeometry args={[1.6, 12.4]} />
          <meshStandardMaterial color="#c8b38a" roughness={0.95} />
        </mesh>
        <Line z={0.6} width={1.8} />
        <Line z={-11.6} width={1.8} />
        <Over {...props} />
      </Canvas>
    </div>
  );
}
