"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MiniMe3D } from "@/components/minime/MiniMe3D";
import { outfits, type OutfitId } from "@/components/minime/outfits";
import { createControl, type MiniMeControl } from "@/components/minime/rig";

interface SpriteSpec {
  outfit: OutfitId;
  pose: "idle" | "wave" | "walk";
  facing: number;
}

function readSpec(): SpriteSpec {
  const params = new URLSearchParams(window.location.search);
  const outfit = params.get("outfit") as OutfitId | null;
  const pose = params.get("pose");
  return {
    outfit: outfit && outfit in outfits ? outfit : "casual",
    pose: pose === "wave" || pose === "walk" ? pose : "idle",
    facing: Number(params.get("facing") ?? "-0.35"),
  };
}

/** Flags the page as ready once the figure has settled, so the capture script can shoot it. */
function Settle({ spec, controlRef }: { spec: SpriteSpec; controlRef: React.RefObject<MiniMeControl> }) {
  const elapsed = useRef(0);
  useFrame((_, dt) => {
    elapsed.current += dt;
    const control = controlRef.current;
    if (spec.pose === "wave" && elapsed.current > 0.6 && control.waves === 0) control.waves = 1;
    if (elapsed.current > (spec.pose === "wave" ? 1.25 : 1.6)) {
      document.body.dataset.spriteReady = "true";
    }
  });
  return null;
}

function Figure({ spec }: { spec: SpriteSpec }) {
  const control = useRef<MiniMeControl>({
    ...createControl(spec.outfit, spec.facing),
    walking: spec.pose === "walk",
    autoStep: spec.pose === "walk",
    blinks: false,
  });
  return (
    <>
      <MiniMe3D controlRef={control} initialOutfit={spec.outfit} />
      <Settle spec={spec} controlRef={control} />
    </>
  );
}

/** Renders one mini-me pose on a transparent canvas for capture into /public/minime. */
export default function SpriteStage() {
  // Client-only component (loaded with ssr: false), so the URL is available on first render.
  const [spec] = useState<SpriteSpec>(readSpec);

  useEffect(() => {
    document.documentElement.dataset.capture = "true";
    return () => {
      delete document.documentElement.dataset.capture;
    };
  }, []);
  return (
    <Canvas
      id="sprite"
      dpr={2}
      gl={{ alpha: true, preserveDrawingBuffer: true }}
      camera={{ position: [0, 0.95, 3.1], fov: 26 }}
      onCreated={({ camera, gl }) => {
        gl.setClearColor(0x000000, 0);
        camera.lookAt(0, 0.66, 0);
      }}
    >
      <hemisphereLight args={["#c9cff5", "#3a2a20", 1.6]} />
      <directionalLight position={[2, 4, 3]} intensity={2.4} />
      <directionalLight position={[-3, 2, -2]} intensity={1.6} color="#ff9c4a" />
      <Figure spec={spec} />
    </Canvas>
  );
}
