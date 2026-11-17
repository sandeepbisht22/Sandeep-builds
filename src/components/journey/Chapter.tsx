import type { ReactNode } from "react";
import type { ChapterId } from "@/lib/chapters";
import { StretchTitle } from "./StretchTitle";

/** Scroll distance during which the camera and mini-me travel to the next object. Height = TRAVEL_SPACER_VH. */
export function TravelSpacer({ id }: { id: ChapterId }) {
  return <div id={`travel-${id}`} aria-hidden className="h-[330vh]" />;
}

export type SheetTone = "dusk" | "paper" | "lamp" | "ink";

const TONES: Record<SheetTone, { sheet: string; lead: string }> = {
  dusk: { sheet: "bg-dusk text-paper", lead: "text-haze" },
  paper: { sheet: "bg-paper text-ink", lead: "text-ink/65" },
  lamp: { sheet: "bg-lamp text-ink", lead: "text-ink/70" },
  ink: { sheet: "bg-ink text-paper", lead: "text-haze" },
};

interface ChapterSectionProps {
  id: ChapterId;
  title: string;
  lead: string;
  tone?: SheetTone;
  /** Optional art placed beside the heading (usually mini-me). */
  aside?: ReactNode;
  children: ReactNode;
}

/** A sheet that slides over the room once the camera has moved into an object. */
export function ChapterSection({ id, title, lead, tone = "dusk", aside, children }: ChapterSectionProps) {
  const style = TONES[tone];
  return (
    <section
      id={`chapter-${id}`}
      aria-labelledby={`chapter-${id}-title`}
      className={`relative z-20 min-h-[100svh] rounded-[28px] px-[4vw] pb-24 pt-20 shadow-[0_-24px_80px_rgb(3_4_12/0.6)] md:rounded-[44px] md:pb-32 md:pt-28 ${style.sheet}`}
    >
      <div className="flex items-end justify-between gap-8">
        <div className="min-w-0">
          <StretchTitle id={`chapter-${id}-title`}>{title}</StretchTitle>
          <p className={`mt-6 max-w-xl text-balance text-lg ${style.lead}`}>{lead}</p>
        </div>
        {aside && <div className="hidden shrink-0 md:block">{aside}</div>}
      </div>
      <div className="mt-14 md:mt-20">{children}</div>
    </section>
  );
}
