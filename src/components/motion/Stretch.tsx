"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

interface StretchProps {
  children: ReactNode;
  className?: string;
  from?: number;
  to?: number;
}

/** Widens display type (Anybody's width axis) as the element scrolls through the viewport. */
export function Stretch({ children, className = "", from = 40, to = 100 }: StretchProps) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        ref.current,
        { "--wdth": from },
        { "--wdth": to, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom 30%", scrub: true } },
      );
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
