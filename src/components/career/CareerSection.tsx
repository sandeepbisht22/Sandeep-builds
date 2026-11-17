import { ChapterSection } from "@/components/journey/Chapter";
import { Sprite, type SpriteName } from "@/components/minime/Sprite";
import { career } from "@/content/career";
import type { CareerStop } from "@/content/types";
import { CareerTrack } from "./CareerTrack";

const LOOK: Record<CareerStop["id"], { sprite: SpriteName; backdrop: string; tilt: string }> = {
  college: { sprite: "college", backdrop: "from-[#f5a35c] to-[#7a4a7a]", tilt: "-rotate-3" },
  quark: { sprite: "office", backdrop: "from-[#8cc8ff] to-[#2b3f6e]", tilt: "rotate-2" },
  dew: { sprite: "senior", backdrop: "from-[#ffb46b] to-[#3b2a4a]", tilt: "-rotate-1" },
};

function Stop({ stop }: { stop: CareerStop }) {
  const look = LOOK[stop.id];
  const years = `${stop.from}–${stop.to === "now" ? "now" : stop.to}`;
  return (
    <article data-stop className="group/stop relative flex w-full flex-col gap-8 md:w-[58vw] md:flex-row md:items-start md:gap-12 lg:w-[50vw]">
      {/* fairy-light bulb on the string above */}
      <span aria-hidden className="absolute -top-[7vh] left-28 hidden h-[7vh] w-px bg-ink/25 md:block" />
      <span
        aria-hidden
        className="absolute -top-[7vh] left-28 hidden h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink/20 transition-all duration-700 group-[.is-lit]/stop:bg-lamp group-[.is-lit]/stop:shadow-[0_0_24px_8px_rgb(255_138_31/0.55)] md:block"
      />
      <figure className={`w-56 shrink-0 bg-white p-3 pb-4 shadow-[0_24px_48px_rgb(14_17_36/0.22)] md:w-64 ${look.tilt}`}>
        <div className={`flex aspect-square items-end justify-center overflow-hidden bg-gradient-to-b ${look.backdrop}`}>
          <Sprite name={look.sprite} className="w-[78%] translate-y-[6%]" />
        </div>
        <figcaption className="mt-3 text-center text-sm font-semibold italic text-ink/75">{stop.place}</figcaption>
      </figure>
      <div>
        <p className="type-display text-[16vw] leading-[0.8] text-ink [--wdth:73] md:text-[6.2vw]">{years}</p>
        <h3 className="mt-5 text-2xl font-bold text-ink">{stop.role}</h3>
        <p className="text-ink/70">{stop.place}</p>
        <p className="mt-4 max-w-sm text-lg leading-relaxed text-ink/80">{stop.note}</p>
      </div>
    </article>
  );
}

/** The photo-wall chapter: college, first job, now. */
export function CareerSection() {
  return (
    <ChapterSection id="wall" tone="paper" title="How I got here" lead="A degree, a first job, and the job I'm in now. Scroll sideways through it.">
      <CareerTrack>
        {career.map((stop) => (
          <Stop key={stop.id} stop={stop} />
        ))}
      </CareerTrack>
    </ChapterSection>
  );
}
