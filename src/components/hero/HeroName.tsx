"use client";

import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useExperience } from "@/lib/store";

interface HeroNameProps {
  first: string;
  last: string;
}

function Letters({ word }: { word: string }) {
  return (
    <>
      {word.split("").map((char, i) => (
        <span key={i} className="hero-char inline-block will-change-transform">
          {char}
        </span>
      ))}
    </>
  );
}

/**
 * The name sits behind the room in jersey-style lettering. It rises in after the lights
 * come on, then drifts and stretches wider as the visitor scrolls into the room.
 */
export function HeroName({ first, last }: HeroNameProps) {
  const root = useRef<HTMLHeadingElement>(null);
  const ready = useExperience((state) => state.ready);

  const { contextSafe } = useGSAP(
    () => {
      const chars = gsap.utils.toArray<HTMLElement>(".hero-char");
      gsap.set(chars, { yPercent: 118 });
      const hero = root.current?.closest("section") ?? undefined;
      const scrub = { trigger: hero, start: "top top", end: "bottom top", scrub: true };
      gsap.to(".hero-line-first", { yPercent: -55, ease: "none", scrollTrigger: scrub });
      gsap.to(".hero-line-last", { yPercent: -15, ease: "none", scrollTrigger: scrub });
      gsap.fromTo(root.current, { "--wdth": 58 }, { "--wdth": 112, ease: "none", scrollTrigger: scrub });
    },
    { scope: root },
  );

  const reveal = contextSafe(() => {
    gsap.to(".hero-char", { yPercent: 0, duration: 1.3, ease: "expo.out", stagger: 0.045, delay: 0.55 });
  });

  useEffect(() => {
    if (ready) reveal();
  }, [ready, reveal]);

  return (
    <h1
      ref={root}
      id="hero-name"
      className="type-display pointer-events-none absolute left-[3.6vw] top-[13vh] z-0 flex select-none flex-col text-[21vw] uppercase text-paper [--wdth:58] md:top-[15vh] md:text-[12.8vw]"
    >
      <span className="hero-line-first block overflow-hidden pb-[0.05em]">
        <Letters word={first} />
      </span>
      <span className="hero-line-last block overflow-hidden pb-[0.05em]">
        <Letters word={last} />
      </span>
    </h1>
  );
}
