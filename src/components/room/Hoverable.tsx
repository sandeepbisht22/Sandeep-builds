"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { Select } from "@react-three/postprocessing";
import { getChapter, type ChapterId } from "@/lib/chapters";
import { chapterTarget } from "@/lib/cursor";
import { scrollToChapter, useExperience } from "@/lib/store";
import { travel } from "@/lib/travel";
import { HIT_ZONES } from "./layout";

type RoomObjectId = Exclude<ChapterId, "room">;

interface HoverableProps {
  id: RoomObjectId;
  children: ReactNode;
}

/**
 * Hover intent: an object lights up only once the pointer has (nearly) stopped on its core.
 * Every SAMPLE_MS we check how far it moved; under STILL_PX counts as resting, so sweeping
 * across the room on the way somewhere else lights nothing up.
 */
const SAMPLE_MS = 60;
const STILL_PX = 8;

/** The pointer in CSS pixels (RoomStage keeps travel.pointerX/Y in -1…1). */
function pointerPx(): { x: number; y: number } {
  return { x: ((travel.pointerX + 1) / 2) * window.innerWidth, y: ((travel.pointerY + 1) / 2) * window.innerHeight };
}

/** Add ?zones to the URL in development to see the hit boxes. */
const SHOW_ZONES =
  process.env.NODE_ENV !== "production" && typeof window !== "undefined" && new URLSearchParams(window.location.search).has("zones");

/** Only the resting room (top of the page) is interactive; during travel the scroll drives everything. */
export function interactive(): boolean {
  return travel.from === "room" && travel.t < 0.06 && useExperience.getState().ready;
}

/**
 * Wraps a room object: outlines it on hover, names it in the cursor, and travels to its chapter on click.
 * Only the object's core (its HIT_ZONES) takes the pointer, never its every edge.
 */
export function Hoverable({ id, children }: HoverableProps) {
  const hovered = useExperience((state) => state.hovered === id);
  const intent = useRef<number | null>(null);

  const clearIntent = (): void => {
    if (intent.current !== null) window.clearInterval(intent.current);
    intent.current = null;
  };
  useEffect(() => clearIntent, []);

  const activate = (): void => {
    clearIntent();
    if (!interactive()) return;
    const { setHovered, setCursorTarget } = useExperience.getState();
    setHovered(id);
    setCursorTarget(chapterTarget(getChapter(id)));
    document.body.style.cursor = "pointer";
  };

  const onOver = (event: ThreeEvent<PointerEvent>): void => {
    event.stopPropagation();
    if (!interactive()) return;
    clearIntent();
    let last = pointerPx();
    intent.current = window.setInterval(() => {
      const now = pointerPx();
      if (Math.hypot(now.x - last.x, now.y - last.y) < STILL_PX) activate();
      last = now;
    }, SAMPLE_MS);
  };

  const onOut = (): void => {
    clearIntent();
    const { hovered: current, setHovered, setCursorTarget } = useExperience.getState();
    if (current !== id) return;
    setHovered(null);
    setCursorTarget(null);
    document.body.style.cursor = "";
  };

  const onClick = (event: ThreeEvent<MouseEvent>): void => {
    event.stopPropagation();
    if (!interactive()) return;
    onOut();
    scrollToChapter(id);
  };

  return (
    <>
      <Select enabled={hovered}>{children}</Select>
      {/* outside <Select>, so the outline follows the object and not its hit box */}
      <group onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
        {HIT_ZONES[id].map((zone) => (
          <mesh key={zone.position.join(",")} position={zone.position as [number, number, number]}>
            <boxGeometry args={zone.size as [number, number, number]} />
            <meshBasicMaterial visible={SHOW_ZONES} wireframe color="#ff8a1f" />
          </mesh>
        ))}
      </group>
    </>
  );
}
