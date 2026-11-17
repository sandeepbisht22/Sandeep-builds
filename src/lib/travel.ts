import type { ChapterId } from "./chapters";

/**
 * Per-frame scroll state shared between the DOM (ScrollTrigger) and the 3D room.
 * Deliberately a mutable singleton: it changes every frame, and routing it through
 * React state would re-render the whole tree 60 times a second.
 */
export interface TravelState {
  from: ChapterId;
  to: ChapterId;
  /** 0 → still at `from`, 1 → fully inside `to`. */
  t: number;
  /** Pointer position in -1…1, used for the hero parallax. */
  pointerX: number;
  pointerY: number;
}

export const travel: TravelState = {
  from: "room",
  to: "desk",
  t: 0,
  pointerX: 0,
  pointerY: 0,
};

/** Light levels for the "lights on" intro, tweened by GSAP and read by the room each frame. */
export interface LightLevels {
  ambient: number;
  lamp: number;
  screens: number;
  fairy: number;
  neon: number;
}

export const lights: LightLevels = {
  ambient: 0.25,
  lamp: 0,
  screens: 0,
  fairy: 0,
  neon: 0,
};
