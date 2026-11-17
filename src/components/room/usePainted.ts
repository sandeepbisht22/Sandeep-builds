"use client";

import { useEffect, useMemo, useState } from "react";
import type { Texture } from "three";
import { fontFamily } from "./textures/canvas";

let fontsLoaded = false;
let fontsLoading: Promise<void> | null = null;

async function loadFonts(): Promise<void> {
  try {
    await Promise.all([
      document.fonts.load(`800 40px ${fontFamily("--face-display", "sans-serif")}`),
      document.fonts.load(`900 40px ${fontFamily("--face-display", "sans-serif")}`),
      document.fonts.load(`600 20px ${fontFamily("--face-body", "sans-serif")}`),
      document.fonts.load(`500 30px ${fontFamily("--face-code", "monospace")}`),
    ]);
    await document.fonts.ready;
  } catch {
    // Font loading API unavailable — textures fall back to system fonts.
  }
  fontsLoaded = true;
}

/** One shared wait for the fonts, however many textures ask. */
function whenFontsLoad(): Promise<void> {
  fontsLoading ??= loadFonts();
  return fontsLoading;
}

/** True once the web fonts used inside canvas textures are ready to draw with. */
export function useFontsReady(): boolean {
  const [ready, setReady] = useState(fontsLoaded);
  useEffect(() => {
    if (ready) return;
    let cancelled = false;
    const wait = async (): Promise<void> => {
      await whenFontsLoad();
      if (!cancelled) setReady(true);
    };
    void wait();
    return () => {
      cancelled = true;
    };
  }, [ready]);
  return ready;
}

interface PaintedEntry {
  texture: Texture;
  /** Painted after the web fonts arrived (otherwise it's redrawn once they do). */
  withFonts: boolean;
}

/**
 * Every painted texture lives for the whole visit and is shared by all the meshes that use it,
 * so mini-me's outfit swaps (which remount his torso mid-walk) never repaint a canvas or
 * re-upload a texture during the scroll. Keys are the factory itself, or a string for
 * factories that take arguments.
 */
const painted = new Map<unknown, PaintedEntry>();
/** Fallback-font versions replaced by font-ready ones, disposed after React has swapped them out. */
const retired: Texture[] = [];

export function paintOnce<T extends Texture>(factory: () => T, key: unknown, fonts: boolean): T {
  const hit = painted.get(key);
  if (hit && (hit.withFonts || !fonts)) return hit.texture as T;
  const texture = factory();
  painted.set(key, { texture, withFonts: fonts });
  if (hit) retired.push(hit.texture);
  return texture;
}

/**
 * A canvas-drawn texture, painted once (and again once the fonts arrive) and shared.
 * Pass a string `key` whenever `factory` is an inline closure, e.g. `usePainted(() => kit(kind), \`kit:${kind}\`)`.
 */
export function usePainted<T extends Texture>(factory: () => T, key: string | (() => T) = factory): T {
  const fonts = useFontsReady();
  // `key` identifies the factory; an inline closure is a new function every render, so it can't be a dependency.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const texture = useMemo(() => paintOnce(factory, key, fonts), [key, fonts]);
  useEffect(() => {
    // Runs after the commit that handed every mesh its new texture, so the old ones are unused.
    while (retired.length > 0) retired.pop()?.dispose();
  }, [texture]);
  return texture;
}
