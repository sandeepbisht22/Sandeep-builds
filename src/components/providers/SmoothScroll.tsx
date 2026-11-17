"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useExperience } from "@/lib/store";

/** Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync. */
export function SmoothScroll(): null {
  const setLenis = useExperience((state) => state.setLenis);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // lerp 0.1 (Lenis's own default): still silky, but the page answers the wheel without feeling a beat behind.
    // Touch keeps native scrolling (syncTouch off), which is the smoothest thing a phone can do.
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.8, touchMultiplier: 1.1 });
    const onTick = (time: number): void => lenis.raf(time * 1000);

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);
    setLenis(lenis);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      setLenis(null);
    };
  }, [setLenis]);

  return null;
}
