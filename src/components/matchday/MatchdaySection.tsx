import type { ReactNode } from "react";
import { ChapterSection } from "@/components/journey/Chapter";
import { Sprite, type SpriteName } from "@/components/minime/Sprite";
import { Stretch } from "@/components/motion/Stretch";
import { interests } from "@/content/interests";
import { FieldDiagram, PitchDiagram } from "./Diagrams";
import { MiniGames } from "./MiniGames";

const SEVENS = [
  { colour: "text-[#f5f2ea]", caption: "Cristiano Ronaldo" },
  { colour: "text-[#f2c21b]", caption: "MS Dhoni" },
  { colour: "text-lamp", caption: "Sandeep" },
];

interface SportCardProps {
  sport: string;
  facts: [string, string][];
  note: string;
  sprite: SpriteName;
  diagram: ReactNode;
}

function SportCard({ sport, facts, note, sprite, diagram }: SportCardProps) {
  return (
    <article className="relative overflow-hidden rounded-[28px] border border-line bg-[#0b1a14] p-7 md:p-9">
      <div className="flex items-start justify-between gap-6">
        <h3 className="type-display text-6xl text-paper [--wdth:70] md:text-7xl">{sport}</h3>
        <Sprite name={sprite} className="-mb-24 -mr-4 -mt-4 w-32 md:w-40" />
      </div>
      <div className="mt-8 rounded-2xl border border-white/10 bg-[#0f241b] p-4">{diagram}</div>
      <p className="mt-4 text-sm text-haze">{note}</p>
      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4">
        {facts.map(([term, value]) => (
          <div key={term}>
            <dt className="text-sm text-haze">{term}</dt>
            <dd className="text-lg font-semibold text-paper">{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

/** The kit-corner chapter: the number 7, football, cricket, and the games. */
export function MatchdaySection() {
  const { football, cricket } = interests;
  return (
    <ChapterSection id="kit" tone="ink" title="Matchday" lead="Football on weekends, cricket all summer. Same number on both shirts.">
      <Stretch className="grid grid-cols-3 gap-[2vw]" from={34} to={92}>
        {SEVENS.map((seven) => (
          <figure key={seven.caption} className="flex flex-col items-center">
            <span aria-hidden className={`type-display text-[34vw] leading-[0.78] md:text-[22vw] ${seven.colour}`}>
              7
            </span>
            <figcaption className="mt-4 text-center text-sm text-haze md:text-base">{seven.caption}</figcaption>
          </figure>
        ))}
      </Stretch>
      <p className="mx-auto mt-10 max-w-xl text-balance text-center text-xl text-paper md:text-2xl">Ronaldo wears 7. Dhoni wears 7. So do I.</p>

      <div className="mt-24 grid gap-6 md:grid-cols-2">
        <SportCard
          sport="Football"
          sprite="football"
          diagram={<PitchDiagram />}
          note="Full-back: defend first, then overlap down the wing."
          facts={[
            ["Club", football.club],
            ["Hero", football.player],
            ["Position", football.position],
            ["Number", String(football.number)],
          ]}
        />
        <SportCard
          sport="Cricket"
          sprite="cricket"
          diagram={<FieldDiagram />}
          note="Bowler: the run-up is half the fun."
          facts={[
            ["Team", cricket.team],
            ["Heroes", cricket.players.join(", ")],
            ["Role", cricket.role],
            ["Number", String(cricket.number)],
          ]}
        />
      </div>

      <MiniGames />
    </ChapterSection>
  );
}
