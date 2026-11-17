"use client";

import type { ReactNode } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { Select } from "@react-three/postprocessing";
import { getChapter, type ChapterId } from "@/lib/chapters";
import { scrollToChapter, useExperience } from "@/lib/store";
import { travel } from "@/lib/travel";

interface HoverableProps {
  id: ChapterId;
  children: ReactNode;
}

/** Only the resting room (top of the page) is interactive; during travel the scroll drives everything. */
export function interactive(): boolean {
  return travel.from === "room" && travel.t < 0.06 && useExperience.getState().ready;
}

/** Wraps a room object: outlines it on hover, labels the cursor, and travels to its chapter on click. */
export function Hoverable({ id, children }: HoverableProps) {
  const hovered = useExperience((state) => state.hovered === id);

  const onOver = (event: ThreeEvent<PointerEvent>): void => {
    event.stopPropagation();
    if (!interactive()) return;
    const { setHovered, setCursorLabel } = useExperience.getState();
    setHovered(id);
    setCursorLabel(getChapter(id).hoverLabel);
    document.body.style.cursor = "pointer";
  };

  const onOut = (): void => {
    const { hovered: current, setHovered, setCursorLabel } = useExperience.getState();
    if (current !== id) return;
    setHovered(null);
    setCursorLabel(null);
    document.body.style.cursor = "";
  };

  const onClick = (event: ThreeEvent<MouseEvent>): void => {
    event.stopPropagation();
    if (!interactive()) return;
    onOut();
    scrollToChapter(id);
  };

  return (
    <Select enabled={hovered}>
      <group onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
        {children}
      </group>
    </Select>
  );
}
