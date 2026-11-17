"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { GameEvent, GameMode } from "./games/shared";

const PenaltyGame = dynamic(() => import("./games/PenaltyGame"), { ssr: false });
const CricketGame = dynamic(() => import("./games/CricketGame"), { ssr: false });

type Game = "penalty" | "cricket";

const COPY: Record<Game, { title: string; how: string; demo: string }> = {
  penalty: { title: "Penalty", how: "Aim with your mouse or finger, click to shoot. Five shots.", demo: "Mini-me's taking one first." },
  cricket: { title: "Cricket", how: "Click, tap or press space to swing as the ball reaches you. One over.", demo: "Watch me bowl one first." },
};

interface Status {
  mode: GameMode;
  ready: boolean;
  score: string;
  message: string | null;
  good: boolean;
  summary: string | null;
}

const initial: Status = { mode: "demo", ready: false, score: "", message: null, good: false, summary: null };

/** Two small games under the floodlights. Mini-me plays first, then hands over. */
export function MiniGames() {
  const box = useRef<HTMLDivElement>(null);
  const [game, setGame] = useState<Game>("penalty");
  const [status, setStatus] = useState<Status>(initial);
  const [round, setRound] = useState(0);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting) setMounted(true);
    }, { rootMargin: "200px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const onEvent = useCallback((event: GameEvent) => {
    if (event.type === "demo-done") setStatus((s) => ({ ...s, ready: true }));
    if (event.type === "result") setStatus((s) => ({ ...s, score: event.score, message: event.label, good: event.good }));
    if (event.type === "over") setStatus((s) => ({ ...s, summary: event.summary }));
  }, []);

  const pick = (next: Game): void => {
    setGame(next);
    setStatus(initial);
    setRound((r) => r + 1);
  };

  const play = (): void => {
    setStatus({ ...initial, mode: "play" });
    setRound((r) => r + 1);
  };

  const Scene = game === "penalty" ? PenaltyGame : CricketGame;

  return (
    <div className="mt-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h3 className="type-display text-6xl text-paper [--wdth:86] md:text-7xl">Your turn</h3>
          <p className="mt-3 max-w-md text-haze">{COPY[game].how}</p>
        </div>
        <div role="tablist" aria-label="Choose a game" className="flex rounded-full border border-line p-1">
          {(Object.keys(COPY) as Game[]).map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={game === id}
              onClick={() => pick(id)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${game === id ? "bg-lamp text-ink" : "text-paper hover:text-lamp"}`}
            >
              {COPY[id].title}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={box}
        data-cursor={status.mode === "play" ? (game === "penalty" ? "Shoot" : "Swing") : undefined}
        data-cursor-title="Matchday"
        data-cursor-path={game === "penalty" ? "/matchday?shoot" : "/matchday?swing"}
        className="relative mt-8 aspect-[4/5] overflow-hidden rounded-[28px] border border-line bg-[#07120d] sm:aspect-[16/9]"
      >
        {mounted && <Scene key={`${game}-${round}`} mode={status.mode} round={round} active={visible} onEvent={onEvent} />}

        <div className="pointer-events-none absolute inset-x-5 top-5 flex items-start justify-between text-sm">
          <span className="rounded-full bg-ink/70 px-4 py-2 text-paper backdrop-blur">
            {status.mode === "demo" ? COPY[game].demo : status.score || "Ready when you are"}
          </span>
        </div>

        {status.message && status.mode === "play" && !status.summary && (
          <p
            key={`${status.score}-${status.message}`}
            className={`type-display pointer-events-none absolute inset-x-0 top-[38%] animate-[pop_1.2s_ease-out_forwards] text-center text-[14vw] [--wdth:95] sm:text-[7vw] ${status.good ? "text-lamp" : "text-paper"}`}
          >
            {status.message}
          </p>
        )}

        {(status.ready || status.summary) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-ink/55 backdrop-blur-[2px]">
            {status.summary && <p className="max-w-sm px-6 text-center text-2xl font-semibold text-paper">{status.summary}</p>}
            <button
              type="button"
              onClick={play}
              className="rounded-full bg-lamp px-8 py-4 text-lg font-bold text-ink shadow-[0_0_0_4px_var(--color-paper)] transition-transform hover:scale-105"
            >
              {status.summary ? "Play again" : "Your turn"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
