"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { travel } from "@/lib/travel";

const RoomCanvas = dynamic(() => import("./RoomCanvas"), { ssr: false });

/**
 * The fixed layer behind the page: the 3D room with mini-me in it.
 * Sections scroll over this layer; the hero lets it show through.
 */
export function RoomStage() {
  useEffect(() => {
    const onMove = (event: PointerEvent): void => {
      travel.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      travel.pointerY = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div className="fixed inset-0 z-10">
      <RoomCanvas />
    </div>
  );
}
