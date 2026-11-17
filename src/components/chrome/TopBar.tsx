import { site } from "@/content/site";
import { LocalTime } from "./LocalTime";
import { SoundToggle } from "./SoundToggle";

interface TopBarProps {
  /** Where the monogram leads: the top of the room, or home from inner pages. */
  home?: string;
}

/** Fixed top bar: the sticker monogram on the left, sound and Sandeep's local time on the right. */
export function TopBar({ home = "#top" }: TopBarProps) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-start justify-between px-[4vw] pt-5 md:pt-7">
      <a
        href={home}
        data-cursor="Room"
        data-cursor-title="My room"
        className="pointer-events-auto grid h-12 w-12 -rotate-6 place-items-center rounded-2xl bg-lamp text-ink shadow-[0_0_0_4px_var(--color-paper),0_8px_18px_rgb(0_0_0/0.45)] transition-transform duration-300 hover:rotate-0"
        aria-label={`${site.name}, back to the top`}
      >
        <span className="type-display text-2xl [--wdth:95]">SB</span>
      </a>
      <div className="pointer-events-auto flex items-center gap-5">
        <SoundToggle />
        <p className="hidden rounded-2xl bg-ink/55 px-3.5 py-1.5 text-right text-sm leading-snug text-haze backdrop-blur-md sm:block">
          <span className="text-paper">{site.city}</span>
          <br />
          <LocalTime timeZone={site.timeZone} />
        </p>
      </div>
    </header>
  );
}
