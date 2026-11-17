"use client";

import { useRef, type RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { MiniMe3D } from "@/components/minime/MiniMe3D";
import { outfits, type OutfitId } from "@/components/minime/outfits";
import { createControl, type MiniMeControl } from "@/components/minime/rig";

const ORDER = Object.keys(outfits) as OutfitId[];
const SPACING = 0.72;

function LineupFigure({ id, x }: { id: OutfitId; x: number }) {
  const control = useRef<MiniMeControl>(createControl(id, 0));
  return (
    <group position={[x, 0, 0]}>
      <MiniMe3D controlRef={control} initialOutfit={id} />
    </group>
  );
}

function Stage({ radius }: { radius: number }) {
  return (
    <>
      <color attach="background" args={["#0e1124"]} />
      <hemisphereLight args={["#8a93c9", "#1c140e", 1.3]} />
      <directionalLight
        position={[2.5, 5, 4]}
        intensity={2.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <spotLight position={[-3, 2.5, 2]} intensity={14} color="#ff8a1f" angle={0.6} penumbra={1} decay={2} />
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[radius, 64]} />
        <meshStandardMaterial color="#1a1e38" roughness={0.9} />
      </mesh>
    </>
  );
}

interface LabSceneProps {
  controlRef?: RefObject<MiniMeControl>;
  lineup?: boolean;
}

/** Workbench scene for mini-me: one figure to orbit and drive, or every outfit side by side. */
export default function LabScene({ controlRef, lineup = false }: LabSceneProps) {
  return (
    <Canvas shadows="percentage" dpr={[1, 2]} camera={{ position: lineup ? [0, 1.25, 7.2] : [0, 1.05, 3.1], fov: 30 }}>
      <Stage radius={lineup ? 5 : 1.3} />
      {lineup
        ? ORDER.map((id, i) => <LineupFigure key={id} id={id} x={(i - (ORDER.length - 1) / 2) * SPACING} />)
        : controlRef && <MiniMe3D controlRef={controlRef} initialOutfit="casual" />}
      <OrbitControls target={[0, lineup ? 0.6 : 0.68, 0]} enablePan={false} minDistance={1.5} maxDistance={10} />
    </Canvas>
  );
}
