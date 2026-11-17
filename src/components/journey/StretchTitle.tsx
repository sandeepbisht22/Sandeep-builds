"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

interface StretchTitleProps {
  id: string;
  children: ReactNode;
  className?: string;
}

/** Section heading whose letters widen (Anybody's width axis) as its sheet slides up. */
export function StretchTitle({ id, children, className = "" }: StretchTitleProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        ref.current,
        { "--wdth": 44, yPercent: 18 },
        {
          "--wdth": 66,
          yPercent: 0,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top bottom", end: "top 35%", scrub: true },
        },
      );
    },
    { scope: ref },
  );

  return (
    <h2 ref={ref} id={id} className={`type-display text-[15vw] [--wdth:66] md:text-[9.5vw] ${className}`}>
      {children}
    </h2>
  );
}
