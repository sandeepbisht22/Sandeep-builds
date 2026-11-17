"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { BrowserBar } from "@/components/chrome/BrowserBar";
import { CURSOR_HOST, componentName } from "@/lib/cursor";
import { gsap } from "@/lib/gsap";

export interface ProjectRow {
  slug: string;
  name: string;
  platformLabel: string;
  pitch: string;
  stack: string;
}

interface ProjectIndexProps {
  rows: ProjectRow[];
  /** Device mock-ups, server-rendered, in the same order as `rows`. */
  previews: ReactNode[];
}

/**
 * The work list: each app's name set huge. On hover, that app's screen floats under the
 * cursor in a little browser window (so the cursor's own browser header stays hidden here);
 * on touch screens the screen sits inline under the name.
 */
export function ProjectIndex({ rows, previews }: ProjectIndexProps) {
  const root = useRef<HTMLDivElement>(null);
  const floater = useRef<HTMLDivElement>(null);
  /** The last row hovered or focused: it stays in the window while the window fades out. */
  const [shown, setShown] = useState(0);

  /** Reusable followers for the preview window (one tween each, retargeted on every move). */
  const followX = useRef<((value: number) => void) | null>(null);
  const followY = useRef<((value: number) => void) | null>(null);

  useEffect(() => {
    const el = floater.current;
    if (!el) return;
    gsap.set(el, { xPercent: -50, yPercent: -55, scale: 0.6, autoAlpha: 0, rotate: -6 });
    followX.current = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
    followY.current = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
    return () => {
      followX.current = null;
      followY.current = null;
      gsap.killTweensOf(el);
    };
  }, []);

  const follow = (event: React.PointerEvent): void => {
    followX.current?.(event.clientX);
    followY.current?.(event.clientY);
  };

  const show = (index: number | null): void => {
    if (index !== null) setShown(index);
    gsap.to(floater.current, {
      autoAlpha: index === null ? 0 : 1,
      scale: index === null ? 0.6 : 1,
      rotate: index === null ? -6 : index % 2 ? 4 : -4,
      duration: 0.5,
      ease: "expo.out",
    });
  };

  return (
    <div ref={root} onPointerMove={follow} onPointerLeave={() => show(null)}>
      <ul className="border-t border-line">
        {rows.map((row, index) => (
          <li key={row.slug} className="border-b border-line">
            <Link
              href={`/work/${row.slug}`}
              data-cursor={componentName(row.name)}
              data-cursor-title={row.name}
              data-cursor-tip="none"
              onPointerEnter={() => show(index)}
              onFocus={() => setShown(index)}
              className="group grid gap-x-8 gap-y-3 py-9 md:grid-cols-12 md:items-center md:py-12"
            >
              <span className="text-sm text-lamp md:col-span-2">{row.platformLabel}</span>
              <span className="type-display text-[15vw] leading-[0.85] text-paper transition-[font-variation-settings,color,translate] duration-500 [--wdth:79] group-hover:translate-x-3 group-hover:text-lamp group-hover:[--wdth:97] md:col-span-6 md:text-[6.6vw]">
                {row.name}
              </span>
              <span className="md:col-span-4">
                <span className="block text-lg leading-snug text-paper">{row.pitch}</span>
                <span className="mt-2 block text-sm text-haze">{row.stack}</span>
              </span>
              <span className="mt-4 block md:hidden">{previews[index]}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div ref={floater} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[70] hidden w-[340px] md:block">
        <BrowserBar
          title={rows[shown].name}
          address={{ host: CURSOR_HOST, path: `/work/${rows[shown].slug}` }}
          playKey={shown}
          className="mb-3"
        />
        {previews.map((preview, index) => (
          <div key={rows[index].slug} className={shown === index ? "block" : "hidden"}>
            {preview}
          </div>
        ))}
      </div>
    </div>
  );
}
