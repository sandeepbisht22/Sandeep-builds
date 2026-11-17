"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";

/** Tilts its content gently towards the pointer, like a card picked up off the desk. */
export function Tilt({ children, className = "" }: { children: ReactNode; className?: string }) {
  const card = useRef<HTMLDivElement>(null);

  const move = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    gsap.to(card.current, { rotateY: x * 10, rotateX: -y * 8, duration: 0.6, ease: "power3.out", overwrite: "auto" });
  };
  const leave = (): void => {
    gsap.to(card.current, { rotateY: 0, rotateX: 0, duration: 0.9, ease: "elastic.out(1, 0.6)" });
  };

  return (
    <div onPointerMove={move} onPointerLeave={leave} className={`[perspective:1200px] ${className}`}>
      <div ref={card} className="[transform-style:preserve-3d]">
        {children}
      </div>
    </div>
  );
}
