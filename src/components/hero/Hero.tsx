import { site } from "@/content/site";
import { HeroName } from "./HeroName";

/** First screen: the name behind the room, the tagline in front of it. The room itself is the fixed layer. */
export function Hero() {
  return (
    <section id="hero" aria-labelledby="hero-name" className="relative h-[100svh] min-h-[600px]">
      <div aria-hidden className="night-vignette absolute inset-0" />
      <HeroName first={site.firstName} last={site.lastName} />
      <div className="absolute bottom-7 left-[4vw] z-30 max-w-[22rem] md:bottom-10">
        <p className="text-xl font-semibold leading-tight text-paper md:text-[1.6rem]">{site.tagline}</p>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-haze">
          {site.role} from {site.city}. {site.intro}
        </p>
        <p className="mt-5 flex items-center gap-3 text-sm text-paper">
          <span className="relative block h-8 w-px overflow-hidden bg-line">
            <span className="absolute inset-x-0 top-0 block h-1/2 animate-[scroll-cue_1.8s_var(--ease-in-out-quart)_infinite] bg-lamp" />
          </span>
          Scroll to walk in, or click anything in the room.
        </p>
      </div>
    </section>
  );
}
