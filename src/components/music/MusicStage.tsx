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
      const scratch = stage.current?.querySelector("[data-scratch]");
      const track = stage.current?.querySelector("[data-track]");
      const mm = gsap.matchMedia();
      const pin = (start: string): void => {
        ScrollTrigger.create({
          trigger: stage.current,
          start,
          end: "+=130%",
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            gsap.to(scratch ?? [], { rotation: self.progress * 900, duration: 0.5, ease: "power3.out", overwrite: "auto" });
            gsap.set(track ?? [], { "--wdth": 44 + self.progress * 46 });
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
