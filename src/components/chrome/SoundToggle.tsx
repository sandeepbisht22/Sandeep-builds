"use client";

import { useEffect } from "react";
import { startSound, stopSound } from "@/lib/sound";
import { useExperience } from "@/lib/store";

const KEY = "sb-sound";
const EQ_DELAYS = ["[animation-delay:0s]", "[animation-delay:0.15s]", "[animation-delay:0.3s]", "[animation-delay:0.45s]"];

function remember(on: boolean): void {
  try {
    window.localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    // Storage unavailable (private mode): the toggle still works for this visit.
  }
}

function recalled(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "on";
  } catch {
    return false;
  }
}

/** Turns the room's generated beat on and off. Off by default; remembers the visitor's choice. */
export async function setSound(on: boolean): Promise<void> {
  const ok = on ? await startSound() : (stopSound(), true);
  useExperience.getState().setSoundOn(on && ok);
  remember(on && ok);
}

interface SoundToggleProps {
  className?: string;
}

export function SoundToggle({ className = "" }: SoundToggleProps) {
  const on = useExperience((state) => state.soundOn);

  // Browsers only allow audio after a gesture: if they left it on last time, start on first interaction.
  useEffect(() => {
    if (!recalled()) return;
    const resume = (): void => {
      void setSound(true);
    };
    window.addEventListener("pointerdown", resume, { once: true });
    window.addEventListener("keydown", resume, { once: true });
    return () => {
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => void setSound(!on)}
      aria-pressed={on}
      data-cursor={on ? "Turn the beat off" : "Turn the beat on"}
      className={`group flex items-center gap-2.5 rounded-full border border-line bg-ink/55 px-3.5 py-2 text-sm text-paper backdrop-blur-md transition-colors hover:border-lamp ${className}`}
    >
      <span aria-hidden className="flex h-3.5 items-end gap-[2px]">
        {EQ_DELAYS.map((delay) => (
          <span key={delay} className={`w-[3px] rounded-full bg-lamp ${on ? `animate-[eq_0.9s_ease-in-out_infinite] ${delay}` : "h-[3px]"}`} />
        ))}
      </span>
      {on ? "Sound on" : "Sound off"}
    </button>
  );
}
