"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * On wide screens the timeline pins and slides sideways as you scroll; each stop's bulb on
 * the fairy-light string switches on as it reaches the middle. Phones get a simple stack.
 */
export function CareerTrack({ children }: { children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current;
        if (!el) return;
        const distance = (): number => el.scrollWidth - window.innerWidth;
        const slide = gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: wrap.current,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 0.6,
            pin: true,
            invalidateOnRefresh: true,
          },
        });
        gsap.utils.toArray<HTMLElement>("[data-stop]").forEach((stop) => {
          ScrollTrigger.create({
            trigger: stop,
            containerAnimation: slide,
            start: "left 60%",
            toggleClass: { targets: stop, className: "is-lit" },
          });
        });
      });
      mm.add("(max-width: 767px), (prefers-reduced-motion: reduce)", () => {
        gsap.utils.toArray<HTMLElement>("[data-stop]").forEach((stop) => stop.classList.add("is-lit"));
      });
      return () => mm.revert();
    },
    { scope: wrap },
  );

  return (
    <div ref={wrap} className="relative md:h-screen md:overflow-hidden">
      <div aria-hidden className="absolute inset-x-0 top-[15vh] hidden h-px bg-ink/25 md:block" />
      <div ref={track} className="flex flex-col gap-20 md:w-max md:flex-row md:items-start md:gap-[7vw] md:pl-[4vw] md:pr-[14vw] md:pt-[22vh]">
        {children}
      </div>
    </div>
  );
}
