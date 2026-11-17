import { ChapterSection } from "@/components/journey/Chapter";
import { Sprite } from "@/components/minime/Sprite";
import { interests } from "@/content/interests";
import { MusicStage } from "./MusicStage";
import { BeatButton, Vinyl, Visualizer } from "./Turntable";

/** The turntable chapter, on the lamp colour: the track on repeat and the room's own beat. */
export function MusicSection() {
  const { music } = interests;
  return (
    <ChapterSection
      id="turntable"
      tone="lamp"
      title="On repeat"
      lead="Desi hip-hop, mostly. This one hasn't left the turntable in a while."
      aside={<Sprite name="street" className="w-52" />}
    >
      <MusicStage>
        <Vinyl />
        <div>
          <p data-track className="type-display text-[22vw] leading-[0.8] text-ink [--wdth:75] md:text-[10vw]">
            {music.track}
          </p>
          <p className="mt-4 text-2xl font-semibold text-ink">{music.artist}</p>
          <div className="mt-10">
            <Visualizer />
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <BeatButton />
            {music.link && (
              <a
                href={music.link}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border-2 border-ink px-6 py-3.5 font-bold text-ink transition-colors hover:bg-ink hover:text-lamp"
              >
                Listen to {music.track}
              </a>
            )}
          </div>
          <p className="mt-6 max-w-sm text-sm text-ink/65">The beat is made live in your browser. No track plays from this page.</p>
        </div>
      </MusicStage>
    </ChapterSection>
  );
}
