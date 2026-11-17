"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { getAnalyser } from "@/lib/sound";
import { useExperience } from "@/lib/store";
import { setSound } from "@/components/chrome/SoundToggle";

/** A big record that spins slowly, then properly once the beat is on; the arm drops onto it. */
export function Vinyl() {
  const disc = useRef<HTMLDivElement>(null);
  const arm = useRef<HTMLDivElement>(null);
  const spin = useRef<gsap.core.Tween | null>(null);
  const on = useExperience((state) => state.soundOn);

  useEffect(() => {
    const tween = gsap.to(disc.current, { rotate: 360, duration: 1.8, ease: "none", repeat: -1 });
    tween.timeScale(0.15);
    spin.current = tween;
    return () => {
      tween.kill();
      spin.current = null;
    };
  }, []);

  // The record speeds up and the arm drops when the beat is on.
  useEffect(() => {
    if (spin.current) gsap.to(spin.current, { timeScale: on ? 1 : 0.15, duration: 1.2, ease: "power2.inOut" });
    gsap.to(arm.current, { rotate: on ? 24 : 0, duration: 0.9, ease: "power3.inOut" });
  }, [on]);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      {/* the outer layer turns with the scroll (scratching); the record itself keeps spinning inside it */}
      <div data-scratch className="absolute inset-[4%]">
      <div
        ref={disc}
        className="absolute inset-0 rounded-full bg-[repeating-radial-gradient(circle_at_center,#141218_0px,#141218_3px,#1f1c24_4px,#141218_5px)] shadow-[0_40px_80px_rgb(80_30_0/0.45)]"
      >
        <div className="absolute inset-[34%] grid place-items-center rounded-full bg-paper text-ink">
          <div className="text-center">
            <p className="type-display text-4xl leading-none [--wdth:70]">SB</p>
            <p className="mt-1 text-xs font-semibold">side A</p>
          </div>
        </div>
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink" />
        <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_40deg,transparent_0deg,rgb(255_255_255/0.08)_30deg,transparent_60deg,transparent_180deg,rgb(255_255_255/0.06)_210deg,transparent_240deg)]" />
      </div>
      </div>
      <div ref={arm} className="absolute right-[2%] top-[2%] h-[62%] w-[10%] origin-[50%_8%]">
        <span className="absolute left-1/2 top-0 h-[16%] w-full -translate-x-1/2 rounded-full bg-ink" />
        <span className="absolute left-1/2 top-[8%] h-[80%] w-[18%] -translate-x-1/2 -rotate-6 rounded-full bg-[#2a2630]" />
        <span className="absolute bottom-0 left-[10%] h-[10%] w-[60%] -rotate-12 rounded-md bg-ink" />
      </div>
    </div>
  );
}

const BARS = 28;

/** Frequency bars: real ones from the beat when it's on, a slow idle wave when it's off. */
export function Visualizer() {
  const bars = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    let data: Uint8Array<ArrayBuffer> | null = null;
    const draw = (time: number): void => {
      const analyser = getAnalyser();
      const children = bars.current?.children;
      if (children) {
        if (analyser) {
          data ??= new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(data);
        }
        for (let i = 0; i < children.length; i++) {
          const level = analyser && data ? data[Math.floor((i / BARS) * data.length * 0.75)] / 255 : 0.12 + Math.sin(time / 500 + i * 0.5) * 0.08;
          (children[i] as HTMLElement).style.transform = `scaleY(${Math.max(0.06, level)})`;
        }
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div ref={bars} aria-hidden className="flex h-24 items-end gap-[3px]">
      {Array.from({ length: BARS }, (_, i) => (
        <span key={i} className="h-full flex-1 origin-bottom rounded-full bg-ink" />
      ))}
    </div>
  );
}

export function BeatButton() {
  const on = useExperience((state) => state.soundOn);
  return (
    <button
      type="button"
      onClick={() => void setSound(!on)}
      aria-pressed={on}
      className="rounded-full bg-ink px-7 py-4 text-base font-bold text-paper shadow-[0_0_0_4px_var(--color-paper)] transition-transform hover:scale-105"
    >
      {on ? "Stop the beat" : "Play the room's beat"}
    </button>
  );
}
