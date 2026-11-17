import { Dela_Gothic_One } from "next/font/google";
import { ChapterSection } from "@/components/journey/Chapter";
import { Sprite } from "@/components/minime/Sprite";
import { interests } from "@/content/interests";

const dela = Dela_Gothic_One({ weight: "400", subsets: ["latin"], preload: false, display: "swap" });

/** Spine colours are our own: a nod to each show, not its artwork. */
const SPINES: Record<string, { body: string; band: string; text: string }> = {
  Naruto: { body: "bg-[#e8742a]", band: "bg-[#1f2a5a]", text: "text-ink" },
  "Dragon Ball Z": { body: "bg-[#f0b429]", band: "bg-[#b3261e]", text: "text-ink" },
  "Haikyu!!": { body: "bg-[#17171f]", band: "bg-lamp", text: "text-paper" },
  "Death Note": { body: "bg-[#0d0d10]", band: "bg-[#8e1b1b]", text: "text-paper" },
  "Attack on Titan": { body: "bg-[#5d4a36]", band: "bg-[#2a1c14]", text: "text-paper" },
};

const COVERS = [
  { bg: "bg-[#1f3d2e]", ink: "text-paper", art: "track" },
  { bg: "bg-[#23264a]", ink: "text-[#e7c46a]", art: "sun" },
  { bg: "bg-[#efe7d7]", ink: "text-ink", art: "cat" },
] as const;

function CoverArt({ art }: { art: (typeof COVERS)[number]["art"] }) {
  if (art === "track") {
    return (
      <svg viewBox="0 0 100 60" className="w-full" aria-hidden>
        {[0, 6, 12].map((i) => (
          <rect key={i} x={10 + i} y={8 + i} width={80 - i * 2} height={44 - i * 2} rx={22 - i} fill="none" stroke="#f2eadb" strokeWidth={1.4} />
        ))}
      </svg>
    );
  }
  if (art === "sun") {
    return (
      <svg viewBox="0 0 100 60" className="w-full" aria-hidden>
        <circle cx={50} cy={30} r={18} fill="none" stroke="#e7c46a" strokeWidth={2} />
        <circle cx={50} cy={30} r={6} fill="#e7c46a" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <line key={i} x1={50 + Math.cos(a) * 23} y1={30 + Math.sin(a) * 23} x2={50 + Math.cos(a) * 28} y2={30 + Math.sin(a) * 28} stroke="#e7c46a" strokeWidth={1.6} />;
        })}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 60" className="w-full" aria-hidden>
      <path d="M38 52 C36 38 40 30 50 28 C60 30 64 38 62 52 Z" fill="#14121c" />
      <circle cx={50} cy={24} r={9} fill="#14121c" />
      <path d="M43 18 L44 9 L49 16 Z M57 18 L56 9 L51 16 Z" fill="#14121c" />
      <path d="M62 50 C74 48 76 40 70 36" fill="none" stroke="#14121c" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

/** The shelf chapter: manga spines that slide out, and three books that turn towards you. */
export function ShelfSection() {
  const { anime, books } = interests;
  return (
    <ChapterSection
      id="shelf"
      title="The shelf"
      lead="Anime for the late nights, books for the slow mornings."
      aside={<Sprite name="cozy" className="w-52" />}
    >
      <div className="grid gap-20 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <h3 className="type-display text-6xl text-paper [--wdth:70] md:text-7xl">Anime</h3>
          <div className="mt-10 flex items-end gap-2 border-b-[14px] border-[#3a2a20] pb-0 sm:gap-3">
            {anime.map((show) => {
              const spine = SPINES[show.title];
              return (
                <div
                  key={show.title}
                  tabIndex={0}
                  className={`group relative flex h-[300px] flex-1 flex-col items-center justify-between rounded-t-md pb-4 pt-6 shadow-[inset_-6px_0_0_rgb(0_0_0/0.18)] outline-none transition-transform duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-6 hover:-rotate-2 focus-visible:-translate-y-6 sm:h-[360px] ${spine.body} ${spine.text}`}
                >
                  <span className={`absolute inset-x-0 top-[14%] h-[7%] ${spine.band}`} />
                  <span lang="ja" className={`${dela.className} relative z-10 text-xl leading-tight [writing-mode:vertical-rl] sm:text-2xl`}>
                    {show.native}
                  </span>
                  <span className="relative z-10 px-1 text-center text-[11px] font-bold leading-tight sm:text-xs">{show.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5">
          <h3 className="type-display text-6xl text-paper [--wdth:70] md:text-7xl">Books</h3>
          <div className="mt-10 grid grid-cols-3 gap-4 [perspective:900px]">
            {books.favourites.map((book, i) => {
              const cover = COVERS[i % COVERS.length];
              return (
                <article
                  key={book.title}
                  tabIndex={0}
                  className={`flex aspect-[2/3] flex-col justify-between rounded-r-md rounded-l-sm p-3 shadow-[-8px_14px_30px_rgb(3_4_12/0.5),inset_6px_0_0_rgb(0_0_0/0.22)] outline-none transition-transform duration-700 ease-[var(--ease-out-expo)] [transform:rotateY(-24deg)] hover:[transform:rotateY(0deg)_translateZ(30px)] focus-visible:[transform:rotateY(0deg)_translateZ(30px)] ${cover.bg} ${cover.ink}`}
                >
                  <h4 className="text-sm font-black leading-tight sm:text-base">{book.title}</h4>
                  <CoverArt art={cover.art} />
                  <p className="text-[11px] font-semibold opacity-80 sm:text-xs">{book.author}</p>
                </article>
              );
            })}
          </div>
          <p className="mt-10 text-lg text-paper">
            Favourite writer: <span className="text-lamp">{books.favouriteWriter}</span>.
          </p>
        </div>
      </div>
    </ChapterSection>
  );
}
