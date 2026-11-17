"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Select } from "@react-three/postprocessing";
import type { Group, SpotLight } from "three";
import { MiniMe3D } from "@/components/minime/MiniMe3D";
import { createControl, type MiniMeControl } from "@/components/minime/rig";
import { getChapter } from "@/lib/chapters";
import { CURSOR_HOST, type CursorTarget } from "@/lib/cursor";
import { useExperience } from "@/lib/store";
import { travel } from "@/lib/travel";
import { interactive } from "./Hoverable";
import { ANCHORS, TRAVEL, anchorAt } from "./layout";

/** Seconds he keeps stepping after the scroll stops moving him, so pauses don't look jittery. */
const HOLD = 0.18;
/** A touch bigger than life-size next to the furniture, so he reads from the hero camera. */
const ROOM_SCALE = 1.2;
/** He takes the pointer on one box around his body (in his own units), not on every lock of hair. */
const HIT_BOX = { size: [0.62, 1.32, 0.62] as [number, number, number], y: 0.66 };
/** Hovering mini-me reads <MiniMe /> and offers a wave. */
const MINI_ME_TARGET: CursorTarget = { tag: "MiniMe", title: "Say hi", address: { host: CURSOR_HOST, path: "/say-hi" }, tip: true };

/**
 * Puts 3D mini-me in the room: his spot follows the scroll, he faces the way he walks,
 * turns to the camera when he stops, and spins into the outfit of the chapter he reaches.
 */
export function MiniMeWalker() {
  const group = useRef<Group>(null);
  const keyLight = useRef<SpotLight>(null);
  const control = useRef<MiniMeControl>(createControl("casual", Math.PI / 4));
  const memory = useRef({ x: ANCHORS.room[0], z: ANCHORS.room[2], movedAt: -10 });
  const [hovered, setHovered] = useState(false);
  const ready = useExperience((state) => state.ready);

  // Once the lights are on, he says hi.
  useEffect(() => {
    if (!ready) return;
    const id = window.setTimeout(() => {
      control.current.waves += 1;
    }, 2300);
    return () => window.clearTimeout(id);
  }, [ready]);

  useEffect(() => {
    if (keyLight.current && group.current) keyLight.current.target = group.current;
  }, []);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const { from, to, t } = travel;
    const [x, , z] = anchorAt(from, to, t);
    g.position.set(x, 0, z);

    const c = control.current;
    const mem = memory.current;
    const now = state.clock.elapsedTime;
    const dx = x - mem.x;
    const dz = z - mem.z;
    const moved = Math.hypot(dx, dz);
    if (moved > 1e-4) {
      mem.movedAt = now;
      c.facing = Math.atan2(dx, dz);
    }
    c.stride = moved;
    c.walking = now - mem.movedAt < HOLD;
    if (!c.walking) {
      const cam = state.camera.position;
      c.facing = Math.atan2(cam.x - x, cam.z - z);
    }
    mem.x = x;
    mem.z = z;
    c.outfit = t >= TRAVEL.outfitSwap ? getChapter(to).outfit : getChapter(from).outfit;
    keyLight.current?.position.set(x + 1.2, 2.7, z + 1.7);
  });

  const onOver = (event: ThreeEvent<PointerEvent>): void => {
    event.stopPropagation();
    if (!interactive()) return;
    setHovered(true);
    useExperience.getState().setCursorTarget(MINI_ME_TARGET);
  };
  const onOut = (): void => {
    setHovered(false);
    if (useExperience.getState().hovered === null) useExperience.getState().setCursorTarget(null);
  };
  const onClick = (event: ThreeEvent<MouseEvent>): void => {
    event.stopPropagation();
    if (interactive()) control.current.waves += 1;
  };

  return (
    <>
      <spotLight ref={keyLight} angle={0.5} penumbra={1} intensity={11} distance={7} decay={2} color="#ffe9d2" />
      <group ref={group} scale={ROOM_SCALE}>
        <Select enabled={hovered}>
          <MiniMe3D controlRef={control} initialOutfit="casual" />
        </Select>
        <mesh position-y={HIT_BOX.y} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
          <boxGeometry args={HIT_BOX.size} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </group>
    </>
  );
}
