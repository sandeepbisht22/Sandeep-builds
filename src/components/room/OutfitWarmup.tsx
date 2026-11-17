"use client";

import { useState, type RefObject } from "react";
import { MiniMe3D } from "@/components/minime/MiniMe3D";
import { createControl, type MiniMeControl } from "@/components/minime/rig";
import { chapters } from "@/lib/chapters";
import { useExperience } from "@/lib/store";
import { ANCHORS } from "./layout";

/** Every outfit mini-me changes into on the way through the page (he starts in the first). */
const LATER_OUTFITS = [...new Set(chapters.map((chapter) => chapter.outfit))].slice(1);

/**
 * While the preloader covers the screen, a speck-sized mini-me is dressed once in every
 * chapter outfit. That paints and uploads their textures and compiles their shaders up front,
 * so the outfit spin mid-scroll swaps clothes without a dropped frame.
 * Afterwards the figures stay mounted but hidden: hidden objects cost nothing to draw, and
 * three would otherwise free the shaders only they use, which the swaps would then recompile.
 * Returning visitors (preloader skipped) don't need it: the textures are already painted.
 */
export function OutfitWarmup() {
  const ready = useExperience((state) => state.ready);
  const [skip] = useState(() => useExperience.getState().ready);
  // Each warm-up figure gets its own control, created once (MiniMe3D only reads it inside useFrame).
  const [controls] = useState<RefObject<MiniMeControl>[]>(() => LATER_OUTFITS.map((outfit) => ({ current: createControl(outfit) })));

  if (skip) return null;
  return (
    <group position={ANCHORS.room} scale={0.001} visible={!ready}>
      {LATER_OUTFITS.map((outfit, i) => (
        <MiniMe3D key={outfit} controlRef={controls[i]} initialOutfit={outfit} />
      ))}
    </group>
  );
}
