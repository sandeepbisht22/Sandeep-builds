"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";

type Setter = (value: number) => void;

/** Tilts its content gently towards the pointer, like a card picked up off the desk. */
export function Tilt({ children, className = "" }: { children: ReactNode; className?: string }) {
  const card = useRef<HTMLDivElement>(null);
  /** The card's box, measured when the pointer arrives rather than on every move. */
  const rect = useRef<DOMRect | null>(null);
  const tilt = useRef<{ x: Setter; y: Setter } | null>(null);
  /** The spring back to flat; stopped if the pointer comes back mid-wobble. */
  const settle = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const el = card.current;
    if (!el) return;
    tilt.current = {
      x: gsap.quickTo(el, "rotateX", { duration: 0.6, ease: "power3.out" }),
      y: gsap.quickTo(el, "rotateY", { duration: 0.6, ease: "power3.out" }),
    };
    return () => {
      tilt.current = null;
      gsap.killTweensOf(el);
    };
  }, []);

  const enter = (event: React.PointerEvent<HTMLDivElement>): void => {
    settle.current?.kill();
    rect.current = event.currentTarget.getBoundingClientRect();
  };
  const move = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (event.pointerType !== "mouse") return;
    const box = rect.current ?? event.currentTarget.getBoundingClientRect();
    rect.current = box;
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    tilt.current?.y(x * 10);
    tilt.current?.x(-y * 8);
  };
  const leave = (): void => {
    rect.current = null;
    settle.current = gsap.to(card.current, { rotateY: 0, rotateX: 0, duration: 0.9, ease: "elastic.out(1, 0.6)", overwrite: "auto" });
  };

  return (
    <div onPointerEnter={enter} onPointerMove={move} onPointerLeave={leave} className={`[perspective:1200px] ${className}`}>
      <div ref={card} className="[transform-style:preserve-3d]">
        {children}
      </div>
    </div>
  );
}
