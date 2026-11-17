"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import type { CursorAddress } from "@/lib/cursor";

interface BrowserBarProps {
  /** Text on the tab. */
  title: string;
  address: CursorAddress;
  /** Change it to make the address type itself in again (a new hover on the same target). */
  playKey?: number | string;
  className?: string;
}

/** Seconds per typed character, capped so long addresses don't drag. */
const TYPE_SPEED = 0.026;
const TYPE_MAX = 0.55;

function LockIcon() {
  return (
    <svg width="9" height="11" viewBox="0 0 9 11" aria-hidden className="flex-none text-haze">
      <rect x="0.5" y="4.5" width="8" height="6" rx="1.4" fill="currentColor" />
      <path d="M2.2 4.6V3.2a2.3 2.3 0 0 1 4.6 0v1.4" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/**
 * A tiny browser header: traffic lights, a tab with the page title, and a URL bar whose path
 * types itself in while a lamp-coloured load bar runs underneath. Width comes from the parent.
 */
export function BrowserBar({ title, address, playKey, className = "" }: BrowserBarProps) {
  const pathRef = useRef<HTMLSpanElement>(null);
  const loadRef = useRef<HTMLSpanElement>(null);
  const { host, path } = address;

  useEffect(() => {
    const out = pathRef.current;
    const bar = loadRef.current;
    if (!out || !bar) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      out.textContent = path;
      gsap.set(bar, { scaleX: 1, autoAlpha: 1 });
      return;
    }
    const typed = { count: 0 };
    out.textContent = "";
    const typing = gsap.to(typed, {
      count: path.length,
      duration: Math.min(TYPE_MAX, path.length * TYPE_SPEED),
      ease: "none",
      onUpdate: () => {
        out.textContent = path.slice(0, Math.round(typed.count));
      },
    });
    const load = gsap.fromTo(bar, { scaleX: 0, autoAlpha: 1 }, { scaleX: 1, duration: 0.9, ease: "expo.out" });
    return () => {
      typing.kill();
      load.kill();
    };
  }, [path, playKey]);

  return (
    <div
      className={`overflow-hidden rounded-[10px] border border-paper/15 bg-dusk font-code shadow-[0_18px_40px_-12px_rgb(0_0_0/0.7),0_0_0_1px_rgb(8_10_22/0.6)] ${className}`}
    >
      <div className="flex items-end gap-2.5 bg-ink px-2.5 pt-[7px]">
        <span className="flex gap-[5px] pb-2">
          <span className="h-2 w-2 rounded-full bg-[#e5675e]" />
          <span className="h-2 w-2 rounded-full bg-[#e2b24a]" />
          <span className="h-2 w-2 rounded-full bg-[#5fbf6a]" />
        </span>
        <span className="flex min-w-0 items-center gap-1.5 rounded-t-[7px] bg-dusk px-2.5 pb-1.5 pt-[5px] font-sans text-[11px] leading-none text-paper">
          <span className="type-display grid h-[13px] w-[13px] flex-none place-items-center rounded-[3px] bg-lamp text-[7.5px] text-ink [--wdth:95]">
            SB
          </span>
          <span className="truncate">{title}</span>
        </span>
      </div>
      <div className="mx-2 my-[7px] flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-[5px] text-[11px] leading-none text-paper">
        <LockIcon />
        <span className="min-w-0 flex-1 overflow-hidden whitespace-nowrap">
          <span className="text-haze">{host}</span>
          <span ref={pathRef} />
          <span className="ml-px inline-block h-3 w-1.5 animate-[blink_1s_steps(1)_infinite] bg-lamp align-[-2px] motion-reduce:animate-none" />
        </span>
        <span className="flex-none rounded border border-line px-1 text-[10px] text-haze">↵</span>
      </div>
      <span ref={loadRef} className="invisible block h-0.5 origin-left bg-lamp" />
    </div>
  );
}
