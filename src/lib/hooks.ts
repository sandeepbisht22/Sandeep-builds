"use client";

import { useEffect, useState, type RefObject } from "react";

/** Tracks the visitor's "reduce motion" setting. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = (): void => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

/**
 * Calls `onChange(true/false)` as the element enters or leaves the viewport (grown by `margin`).
 * For loops and tweens that should stop costing anything while nobody can see them.
 */
export function useOnScreen(ref: RefObject<Element | null>, onChange: (visible: boolean) => void, margin = "0px"): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => onChange(entry.isIntersecting), { rootMargin: margin });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, onChange, margin]);
}
