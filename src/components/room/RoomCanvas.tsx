"use client";

import { Component, Suspense, useEffect, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { gsap } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { useExperience } from "@/lib/store";
import { lights } from "@/lib/travel";
import { CameraRig } from "./CameraRig";
import { RoomScene } from "./RoomScene";

/** Tells the preloader the room has actually drawn (a couple of frames, so shaders are compiled). */
function ReadySignal() {
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 3) useExperience.getState().setSceneReady(true);
  });
  return null;
}

/** "Lights on": ambient, lamp, screens, fairy lights, then the neon flickers awake. */
function LightsDirector({ reducedMotion }: { reducedMotion: boolean }) {
  const ready = useExperience((state) => state.ready);
  useEffect(() => {
    if (!ready) return;
    if (reducedMotion) {
      Object.assign(lights, { ambient: 1, lamp: 1, screens: 1, fairy: 1, neon: 1 });
      return;
    }
    const tl = gsap.timeline({ delay: 0.2 });
    tl.to(lights, { ambient: 1, duration: 1.8, ease: "power2.out" }, 0)
      .to(lights, { keyframes: { lamp: [0, 0.7, 0.15, 1] }, duration: 0.45, ease: "none" }, 0.3)
      .to(lights, { screens: 1, duration: 0.7, ease: "power2.out" }, 0.7)
      .to(lights, { fairy: 1, duration: 1, ease: "power1.inOut" }, 1.0)
      .to(lights, { keyframes: { neon: [0, 1, 0.1, 0.9, 0.3, 1] }, duration: 0.8, ease: "none" }, 1.3);
    return () => {
      tl.kill();
    };
  }, [ready, reducedMotion]);
  return null;
}

interface BoundaryState {
  failed: boolean;
}

/** If WebGL isn't available the page still works — the room just stays empty. */
class RoomBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  componentDidCatch(): void {
    useExperience.getState().setSceneReady(true);
  }

  render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}

export default function RoomCanvas() {
  const visible = useExperience((state) => state.roomVisible);
  const sceneReady = useExperience((state) => state.sceneReady);
  const reducedMotion = usePrefersReducedMotion();
  // Keep drawing until the first frames are in, even if the room is scrolled out of view.
  const running = visible || !sceneReady;

  return (
    <RoomBoundary>
      <Canvas
        shadows="percentage"
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance", stencil: false }}
        camera={{ fov: 28, near: 0.1, far: 60, position: [12, 9, 12] }}
        frameloop={running ? "always" : "never"}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <Suspense fallback={null}>
          <RoomScene />
          <ReadySignal />
        </Suspense>
        <CameraRig reducedMotion={reducedMotion} />
        <LightsDirector reducedMotion={reducedMotion} />
      </Canvas>
    </RoomBoundary>
  );
}
