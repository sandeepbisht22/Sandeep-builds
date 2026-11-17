import { ChapterSection } from "@/components/journey/Chapter";
import { Sprite } from "@/components/minime/Sprite";
import { interests } from "@/content/interests";
import { site } from "@/content/site";
import { BackToRoom, Email } from "./Contact";
import { TrailScene } from "./TrailScene";

/** The window chapter: the hills outside, the trail log, and how to get in touch. */
export function OutThereSection() {
  const { travel } = interests;
  return (
    <ChapterSection
      id="window"
      tone="ink"
      title="Out there"
      lead={`${travel.base} sits right where ${travel.region} begin. Give me a free weekend and I'll be on a trail.`}
    >
      <TrailScene />

      {travel.treks.length > 0 && (
        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {travel.treks.map((trek) => (
            <li key={trek.name} className="rounded-3xl border border-line p-6">
              <p className="text-xl font-semibold text-paper">{trek.name}</p>
              <p className="mt-1 text-haze">{[trek.when, trek.altitude].filter(Boolean).join(", ")}</p>
            </li>
          ))}
        </ul>
      )}

      <div id="contact" className="mt-32 grid items-end gap-12 md:grid-cols-12">
        <div className="md:col-span-8">
          <h3 className="type-display text-[18vw] leading-[0.8] text-paper [--wdth:79] md:text-[9vw]">Say hello</h3>
          <p className="mt-6 max-w-lg text-lg text-haze">
            Got something to build, or a trail I should walk? I&apos;m a message away.
          </p>
          <div className="mt-10">
            <Email email={site.email} />
          </div>
          <ul className="mt-10 flex flex-wrap gap-3">
            {site.socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block rounded-full border border-line px-5 py-2 text-paper transition-colors hover:border-lamp hover:text-lamp"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col items-start gap-8 md:col-span-4 md:items-end">
          <Sprite name="wave" className="w-48 md:w-60" />
          <BackToRoom />
        </div>
      </div>
    </ChapterSection>
  );
}
