"use client";

import { useEffect, useMemo, useState } from "react";
import type { Texture } from "three";
import { fontFamily } from "./textures/canvas";

let fontsLoaded = false;

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

/** True once the web fonts used inside canvas textures are ready to draw with. */
export function useFontsReady(): boolean {
  const [ready, setReady] = useState(fontsLoaded);
  useEffect(() => {
    if (ready) return;
    let cancelled = false;
    const wait = async (): Promise<void> => {
      await loadFonts();
      if (!cancelled) setReady(true);
    };
    void wait();
    return () => {
      cancelled = true;
    };
  }, [ready]);
  return ready;
}

/** A canvas-drawn texture, redrawn once fonts arrive and disposed on unmount. */
export function usePainted<T extends Texture>(factory: () => T): T {
  const fonts = useFontsReady();
  // The factory is a stable module-level function; `fonts` is the only reason to redraw.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const texture = useMemo(() => factory(), [fonts]);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}
