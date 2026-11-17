"use client";

import { RoundedBox } from "@react-three/drei";
import { usePainted } from "@/components/room/usePainted";
import type { Outfit } from "./outfits";
import { LAMP, PAPER, SKIN, STRAP } from "./palette";
import { BODY } from "./rig";
import { flannelTexture, kitTexture, streetGraphicTexture } from "./textures";

const { torsoY, torsoH, neckY, hipY } = BODY;
const DEPTH = 0.74;

interface TorsoShape {
  top: number;
  bottom: number;
  height: number;
  y: number;
}

const SHAPES: Record<Outfit["top"]["kind"], TorsoShape> = {
  tee: { top: 0.185, bottom: 0.158, height: torsoH, y: torsoY },
  shirt: { top: 0.185, bottom: 0.158, height: torsoH, y: torsoY },
  jersey: { top: 0.185, bottom: 0.16, height: torsoH, y: torsoY },
  hoodie: { top: 0.196, bottom: 0.174, height: 0.34, y: torsoY - 0.005 },
  oversized: { top: 0.216, bottom: 0.206, height: 0.39, y: torsoY - 0.03 },
  puffer: { top: 0.212, bottom: 0.19, height: 0.35, y: torsoY - 0.005 },
  track: { top: 0.19, bottom: 0.166, height: 0.33, y: torsoY - 0.003 },
};

interface ShellProps {
  shape: TorsoShape;
  color: string;
  map?: ReturnType<typeof kitTexture>;
}

/** The torso is a tapered elliptic cylinder; thetaStart = π puts the texture's centre on the chest. */
function TorsoShell({ shape, color, map }: ShellProps) {
  return (
    <group position={[0, shape.y, 0]} scale={[1, 1, DEPTH]}>
      <mesh castShadow>
        <cylinderGeometry args={[shape.top, shape.bottom, shape.height, 32, 1, false, Math.PI]} />
        <meshStandardMaterial color={map ? "#ffffff" : color} map={map} roughness={0.8} />
      </mesh>
      <mesh position={[0, shape.height / 2, 0]} scale={[1, 0.36, 1]} castShadow>
        <sphereGeometry args={[shape.top, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0, -shape.height / 2, 0]} rotation-x={Math.PI / 2}>
        <circleGeometry args={[shape.bottom, 32]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  );
}

function JerseyTorso({ outfit }: { outfit: Outfit }) {
  const kit = outfit.top.kit ?? "madrid";
  const map = usePainted(() => kitTexture(kit), `kit:${kit}`);
  return <TorsoShell shape={SHAPES.jersey} color={outfit.top.color} map={map} />;
}

function FlannelTorso({ outfit }: { outfit: Outfit }) {
  const check = outfit.top.check ?? "#1f1a2b";
  const map = usePainted(() => flannelTexture(outfit.top.color, check), `flannel:${outfit.top.color}:${check}`);
  return <TorsoShell shape={SHAPES.shirt} color={outfit.top.color} map={map} />;
}

function Hood({ color, y }: { color: string; y: number }) {
  return (
    <mesh position={[0, y, -0.03]} rotation-x={Math.PI / 2 - 0.25} scale={[1, 1, 0.8]}>
      <torusGeometry args={[0.105, 0.05, 12, 28]} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );
}

function HoodieDetails({ outfit, oversized }: { outfit: Outfit; oversized: boolean }) {
  const shape = oversized ? SHAPES.oversized : SHAPES.hoodie;
  const front = shape.bottom * DEPTH + 0.004;
  return (
    <group>
      <Hood color={outfit.top.trim ?? outfit.top.shade} y={shape.y + shape.height / 2 + 0.01} />
      {!oversized && (
        <RoundedBox args={[0.2, 0.085, 0.02]} radius={0.01} position={[0, shape.y - 0.07, front]}>
          <meshStandardMaterial color={outfit.top.shade} roughness={0.85} />
        </RoundedBox>
      )}
      {[-0.035, 0.035].map((x) => (
        <mesh key={x} position={[x, shape.y + 0.08, front + 0.02]}>
          <cylinderGeometry args={[0.005, 0.005, 0.09, 6]} />
          <meshStandardMaterial color={PAPER} />
        </mesh>
      ))}
    </group>
  );
}

function StreetGraphic() {
  const map = usePainted(streetGraphicTexture);
  const shape = SHAPES.oversized;
  return (
    <mesh position={[0, shape.y + 0.02, shape.top * DEPTH + 0.004]}>
      <circleGeometry args={[0.075, 32]} />
      <meshStandardMaterial map={map} roughness={0.8} polygonOffset polygonOffsetFactor={-1} />
    </mesh>
  );
}

function PufferDetails({ outfit }: { outfit: Outfit }) {
  const shape = SHAPES.puffer;
  return (
    <group>
      {[-0.11, -0.03, 0.05, 0.12].map((dy) => (
        <mesh key={dy} position={[0, shape.y + dy, 0]} rotation-x={Math.PI / 2} scale={[1, DEPTH, 1]}>
          <torusGeometry args={[shape.top - 0.012 - (0.12 - dy) * 0.08, 0.014, 8, 36]} />
          <meshStandardMaterial color={outfit.top.shade} roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, shape.y + shape.height / 2 + 0.02, 0]} scale={[1, 1, 0.85]}>
        <cylinderGeometry args={[0.085, 0.1, 0.07, 24, 1, true]} />
        <meshStandardMaterial color={outfit.top.trim ?? STRAP} roughness={0.8} side={2} />
      </mesh>
      <mesh position={[0, shape.y, shape.top * DEPTH + 0.002]}>
        <boxGeometry args={[0.008, shape.height * 0.95, 0.006]} />
        <meshStandardMaterial color={STRAP} metalness={0.4} roughness={0.4} />
      </mesh>
    </group>
  );
}

/** Zip-up track jacket: stand collar with piping, a zip with a saffron pull, ribbed hem. Sleeve stripes are in Limbs. */
function TrackDetails({ outfit }: { outfit: Outfit }) {
  const shape = SHAPES.track;
  const trim = outfit.top.trim ?? PAPER;
  const collarY = shape.y + shape.height / 2 + 0.028;
  // The front leans back as the torso tapers, so the zip tilts with it.
  const lean = Math.atan(((shape.top - shape.bottom) * DEPTH) / shape.height);
  const front = ((shape.top + shape.bottom) / 2) * DEPTH + 0.003;
  return (
    <group>
      <mesh position={[0, collarY, 0]} scale={[1, 1, 0.85]}>
        <cylinderGeometry args={[0.08, 0.092, 0.06, 28, 1, true]} />
        <meshStandardMaterial color={outfit.top.color} roughness={0.75} side={2} />
      </mesh>
      <mesh position={[0, collarY + 0.03, 0]} rotation-x={Math.PI / 2} scale={[1, 0.85, 1]}>
        <torusGeometry args={[0.08, 0.004, 6, 32]} />
        <meshStandardMaterial color={trim} roughness={0.7} />
      </mesh>
      <mesh position={[0, shape.y, front]} rotation-x={lean}>
        <boxGeometry args={[0.008, shape.height * 0.96, 0.005]} />
        <meshStandardMaterial color="#9aa0ad" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, shape.y + shape.height / 2 - 0.035, shape.top * DEPTH + 0.004]} rotation-x={lean}>
        <boxGeometry args={[0.015, 0.028, 0.006]} />
        <meshStandardMaterial color={LAMP} roughness={0.4} />
      </mesh>
      <mesh position={[0, shape.y - shape.height / 2 + 0.012, 0]} rotation-x={Math.PI / 2} scale={[1, DEPTH, 1]}>
        <torusGeometry args={[shape.bottom - 0.002, 0.014, 8, 36]} />
        <meshStandardMaterial color={outfit.top.shade} roughness={0.85} />
      </mesh>
    </group>
  );
}

function ShirtDetails({ outfit }: { outfit: Outfit }) {
  const front = SHAPES.shirt.top * DEPTH;
  return (
    <group>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.045, torsoY + 0.15, front - 0.01]} rotation={[0.5, 0, side * 0.6]}>
          <boxGeometry args={[0.07, 0.035, 0.012]} />
          <meshStandardMaterial color={outfit.top.color} roughness={0.8} />
        </mesh>
      ))}
      {[0.08, 0.02, -0.04, -0.1].map((dy) => (
        <mesh key={dy} position={[0, torsoY + dy, front - 0.012 * (dy + 0.1) + 0.006]}>
          <sphereGeometry args={[0.008, 8, 6]} />
          <meshStandardMaterial color={STRAP} />
        </mesh>
      ))}
    </group>
  );
}

function Collar({ color, y }: { color: string; y: number }) {
  return (
    <mesh position={[0, y, 0]} rotation-x={Math.PI / 2} scale={[1, 0.8, 1]}>
      <torusGeometry args={[0.068, 0.013, 8, 24]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}

function Chain() {
  return (
    <group position={[0, torsoY + 0.1, 0.07]} rotation-x={Math.PI / 2 - 0.45}>
      <mesh>
        <torusGeometry args={[0.085, 0.006, 8, 32]} />
        <meshStandardMaterial color="#e0dde8" metalness={0.9} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.088, 0]}>
        <sphereGeometry args={[0.018, 12, 10]} />
        <meshStandardMaterial color="#e0dde8" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

function Lanyard() {
  const front = SHAPES.shirt.top * DEPTH;
  return (
    <group>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.03, torsoY + 0.1, front - 0.005]} rotation-z={side * 0.32}>
          <boxGeometry args={[0.012, 0.13, 0.004]} />
          <meshStandardMaterial color="#3b5ba8" />
        </mesh>
      ))}
      <mesh position={[0, torsoY - 0.005, front + 0.004]}>
        <boxGeometry args={[0.065, 0.085, 0.006]} />
        <meshStandardMaterial color={PAPER} />
      </mesh>
      <mesh position={[0, torsoY + 0.026, front + 0.008]}>
        <boxGeometry args={[0.065, 0.02, 0.002]} />
        <meshStandardMaterial color={LAMP} />
      </mesh>
    </group>
  );
}

function Backpack({ trek }: { trek: boolean }) {
  const color = trek ? "#2a2d3a" : "#2f4a3a";
  const strap = trek ? "#1d1f2b" : "#23392d";
  return (
    <group>
      <RoundedBox args={[0.3, trek ? 0.38 : 0.32, 0.15]} radius={0.05} position={[0, torsoY + 0.02, -0.18]} castShadow>
        <meshStandardMaterial color={color} roughness={0.85} />
      </RoundedBox>
      {trek && (
        <mesh position={[0, torsoY + 0.24, -0.2]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.045, 0.045, 0.3, 16]} />
          <meshStandardMaterial color={LAMP} roughness={0.9} />
        </mesh>
      )}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.1, torsoY + 0.06, 0.125]} rotation-x={-0.12}>
          <boxGeometry args={[0.035, 0.26, 0.02]} />
          <meshStandardMaterial color={strap} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/** Neck, torso and everything worn on it. */
export function Body({ outfit }: { outfit: Outfit }) {
  const kind = outfit.top.kind;
  const shape = SHAPES[kind];
  return (
    <group>
      <mesh position={[0, neckY, 0]} castShadow>
        <cylinderGeometry args={[0.062, 0.07, 0.1, 16]} />
        <meshStandardMaterial color={SKIN} roughness={0.62} />
      </mesh>
      {kind === "jersey" && <JerseyTorso outfit={outfit} />}
      {kind === "shirt" && outfit.top.check && <FlannelTorso outfit={outfit} />}
      {kind === "shirt" && !outfit.top.check && <TorsoShell shape={shape} color={outfit.top.color} />}
      {(kind === "tee" || kind === "hoodie" || kind === "oversized" || kind === "puffer" || kind === "track") && (
        <TorsoShell shape={shape} color={outfit.top.color} />
      )}
      {kind === "tee" && <Collar color={outfit.top.shade} y={shape.y + shape.height / 2 + 0.035} />}
      {kind === "jersey" && <Collar color={outfit.top.trim ?? outfit.top.shade} y={shape.y + shape.height / 2 + 0.035} />}
      {kind === "shirt" && <ShirtDetails outfit={outfit} />}
      {(kind === "hoodie" || kind === "oversized") && <HoodieDetails outfit={outfit} oversized={kind === "oversized"} />}
      {kind === "oversized" && <StreetGraphic />}
      {kind === "puffer" && <PufferDetails outfit={outfit} />}
      {kind === "track" && <TrackDetails outfit={outfit} />}
      {outfit.neck === "chain" && <Chain />}
      {outfit.neck === "lanyard" && <Lanyard />}
      {outfit.backpack && <Backpack trek={outfit.id === "trek"} />}
      {/* pelvis joins the torso to the legs */}
      <mesh position={[0, hipY + 0.03, 0]} scale={[1, 1, 0.78]} castShadow>
        <cylinderGeometry args={[0.172, 0.156, 0.1, 24]} />
        <meshStandardMaterial color={outfit.bottom.color} roughness={0.85} />
      </mesh>
    </group>
  );
}
