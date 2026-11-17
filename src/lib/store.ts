"use client";

import { create } from "zustand";
import type Lenis from "lenis";
import type { ChapterId } from "./chapters";

interface ExperienceState {
  /** The preloader has finished and the page is interactive. */
  ready: boolean;
  /** The 3D scene has rendered its first frame. */
  sceneReady: boolean;
  /** Room object under the pointer (hero only). */
  hovered: ChapterId | null;
  /** Text shown inside the custom cursor. */
  cursorLabel: string | null;
  /** True while any part of the room is on screen; the canvas pauses otherwise. */
  roomVisible: boolean;
  lenis: Lenis | null;
  /** The generated beat is playing. */
  soundOn: boolean;
  setSoundOn: (on: boolean) => void;
  setReady: (ready: boolean) => void;
  setSceneReady: (ready: boolean) => void;
  setHovered: (id: ChapterId | null) => void;
  setCursorLabel: (label: string | null) => void;
  setRoomVisible: (visible: boolean) => void;
  setLenis: (lenis: Lenis | null) => void;
}

export const useExperience = create<ExperienceState>((set) => ({
  ready: false,
  sceneReady: false,
  hovered: null,
  cursorLabel: null,
  roomVisible: true,
  lenis: null,
  soundOn: false,
  setSoundOn: (soundOn) => set({ soundOn }),
  setReady: (ready) => set({ ready }),
  setSceneReady: (sceneReady) => set({ sceneReady }),
  setHovered: (hovered) => set({ hovered }),
  setCursorLabel: (cursorLabel) => set({ cursorLabel }),
  setRoomVisible: (roomVisible) => set({ roomVisible }),
  setLenis: (lenis) => set({ lenis }),
}));

// Expose the store in development so browser tests can drive the scroll precisely.
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  (window as unknown as { __experience: typeof useExperience }).__experience = useExperience;
}

/** Scroll smoothly to a chapter's section (or the top for the room). */
export function scrollToChapter(id: ChapterId): void {
  const { lenis } = useExperience.getState();
  const target = id === "room" ? 0 : document.getElementById(`chapter-${id}`);
  if (target === null) return;
  if (lenis) {
    lenis.scrollTo(target, { duration: 2.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
    return;
  }
  if (typeof target === "number") window.scrollTo({ top: target });
  else target.scrollIntoView();
}
