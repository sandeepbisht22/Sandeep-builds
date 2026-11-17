"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * Holds the record on screen for a while: the section pins, scrolling scratches the
 * vinyl round, and the track name stretches out. Nobody scrolls past it by accident.
 */
export function MusicStage({ children }: { children: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const scratch = stage.current?.querySelector<HTMLElement>("[data-scratch]");
      const track = stage.current?.querySelector<HTMLElement>("[data-track]");
      const mm = gsap.matchMedia();
      const pin = (start: string): void => {
        // One reusable tween for the scratch, instead of a new one on every scroll event.
        const turn = scratch ? gsap.quickTo(scratch, "rotation", { duration: 0.5, ease: "power3.out" }) : null;
        ScrollTrigger.create({
          trigger: stage.current,
          start,
          end: "+=130%",
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            turn?.(self.progress * 900);
            track?.style.setProperty("--wdth", String(62 + self.progress * 43));
          },
        });
      };
      mm.add("(min-width: 768px)", () => pin("center center"));
      mm.add("(max-width: 767px)", () => pin("top 9%"));
      return () => mm.revert();
    },
    { scope: stage },
  );

  return (
    <div ref={stage} className="grid items-center gap-14 md:grid-cols-2">
      {children}
    </div>
  );
}
