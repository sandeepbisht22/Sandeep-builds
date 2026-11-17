"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useExperience } from "@/lib/store";

/**
 * A lamp-coloured dot with a trailing ring. The ring opens up and shows a label over
 * anything marked with data-cursor="Label", and over objects in the 3D room.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label || !window.matchMedia("(pointer: fine)").matches) return;

    const root = document.documentElement;
    root.classList.add("has-cursor");
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 });

    const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.42, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.42, ease: "power3.out" });

    let domLabel: string | null = null;
    let shown: string | null = null;

    const show = (text: string | null): void => {
      if (text === shown) return;
      shown = text;
      const open = text !== null;
      label.textContent = text ?? "";
      gsap.to(ring, {
        width: open ? Math.max(96, (text?.length ?? 0) * 8.4 + 40) : 38,
        height: open ? 44 : 38,
        backgroundColor: open ? "rgba(255,138,31,1)" : "rgba(255,138,31,0)",
        duration: 0.45,
        ease: "expo.out",
        overwrite: "auto",
      });
      gsap.to(label, { opacity: open ? 1 : 0, duration: open ? 0.3 : 0.12, delay: open ? 0.08 : 0, overwrite: "auto" });
      gsap.to(dot, { scale: open ? 0 : 1, duration: 0.3, overwrite: "auto" });
    };

    const onMove = (event: PointerEvent): void => {
      dotX(event.clientX);
      dotY(event.clientY);
      ringX(event.clientX);
      ringY(event.clientY);
      gsap.to([dot, ring], { opacity: 1, duration: 0.3, overwrite: "auto" });
    };
    const onLeave = (): void => {
      gsap.to([dot, ring], { opacity: 0, duration: 0.3, overwrite: "auto" });
    };
    // DOM hover targets declare their label with data-cursor; room objects go through the store.
    const onOver = (event: PointerEvent): void => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor]");
      domLabel = target?.dataset.cursor ?? null;
      show(domLabel ?? useExperience.getState().cursorLabel);
    };
    const unsubscribe = useExperience.subscribe((state) => {
      if (domLabel === null) show(state.cursorLabel);
    });

    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerover", onOver);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      unsubscribe();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      root.removeEventListener("pointerleave", onLeave);
      root.classList.remove("has-cursor");
      gsap.killTweensOf([dot, ring, label]);
    };
  }, []);

  return (
    <div aria-hidden data-cursor-root className="pointer-events-none fixed inset-0 z-[100] hidden [@media(pointer:fine)]:block">
      <div
        ref={ringRef}
        className="absolute left-0 top-0 flex h-[38px] w-[38px] items-center justify-center rounded-full border border-lamp/70"
      >
        <span ref={labelRef} className="whitespace-nowrap px-4 text-[0.8125rem] font-semibold leading-none text-ink opacity-0" />
      </div>
      <div ref={dotRef} className="absolute left-0 top-0 h-2 w-2 rounded-full bg-lamp" />
    </div>
  );
}
