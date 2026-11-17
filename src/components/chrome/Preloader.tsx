"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useExperience } from "@/lib/store";
import { site } from "@/content/site";

/**
 * Counts to 100 while the room loads — the digits widen as they climb — then lifts away
 * and hands over to the "lights on" moment in the room.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const digits = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  // Only the first visit gets the countdown; coming back from a project page goes straight in.
  const [gone, setGone] = useState(() => useExperience.getState().ready);

  useGSAP(
    (_, contextSafe) => {
      if (!contextSafe || useExperience.getState().ready) return;
      const progress = { value: 0 };
      let countedUp = false;
      let leaving = false;

      window.history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
      document.documentElement.classList.add("is-loading");
      useExperience.getState().lenis?.stop();

      const draw = (): void => {
        const value = Math.round(progress.value);
        if (digits.current) {
          digits.current.textContent = String(value).padStart(3, "0");
          digits.current.style.setProperty("--wdth", String(68 + value * 0.55));
        }
        if (bar.current) bar.current.style.transform = `scaleX(${value / 100})`;
      };

      const finish = contextSafe(() => {
        if (leaving || !countedUp || !useExperience.getState().sceneReady) return;
        leaving = true;
        gsap
          .timeline({ onComplete: () => setGone(true) })
          .to(progress, { value: 100, duration: 0.45, ease: "power2.inOut", onUpdate: draw })
          .call(() => {
            document.documentElement.classList.remove("is-loading");
            useExperience.getState().lenis?.start();
            useExperience.getState().setReady(true);
          })
          .to(root.current, { yPercent: -100, duration: 1.1, ease: "expo.inOut" }, "+=0.1");
      });

      gsap.to(progress, {
        value: 84,
        duration: 1.7,
        ease: "power2.out",
        onUpdate: draw,
        onComplete: () => {
          countedUp = true;
          finish();
        },
      });
      // Never trap the visitor if the 3D scene can't load.
      gsap.delayedCall(8, () => useExperience.getState().setSceneReady(true));
      const unsubscribe = useExperience.subscribe((state) => {
        if (state.sceneReady) finish();
      });
      return () => {
        unsubscribe();
        document.documentElement.classList.remove("is-loading");
      };
    },
    { scope: root },
  );

  if (gone) return null;

  return (
    <div ref={root} className="fixed inset-0 z-[80] flex flex-col justify-between bg-night px-[4vw] py-7" aria-live="polite">
      <div className="flex justify-between text-sm text-haze">
        <span className="text-paper">{site.name}</span>
        <span>Switching the lights on</span>
      </div>
      <span
        ref={digits}
        className="type-display block text-[38vw] tabular-nums leading-[0.75] text-paper [--wdth:68] md:text-[27vw]"
        aria-label="Loading"
      >
        000
      </span>
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-line">
        <div ref={bar} className="h-full origin-left rounded-full bg-lamp [transform:scaleX(0)]" />
      </div>
    </div>
  );
}
