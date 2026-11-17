import { Preloader } from "@/components/chrome/Preloader";
import { TopBar } from "@/components/chrome/TopBar";
import { CareerSection } from "@/components/career/CareerSection";
import { Hero } from "@/components/hero/Hero";
import { ChapterRail } from "@/components/journey/ChapterRail";
import { TravelSpacer } from "@/components/journey/Chapter";
import { MatchdaySection } from "@/components/matchday/MatchdaySection";
import { MusicSection } from "@/components/music/MusicSection";
import { OutThereSection } from "@/components/outthere/OutThereSection";
import { RoomStage } from "@/components/room/RoomStage";
import { ShelfSection } from "@/components/shelf/ShelfSection";
import { WorkSection } from "@/components/work/WorkSection";
import { site } from "@/content/site";

export default function Home() {
  return (
    <>
      <Preloader />
      <TopBar />
      <RoomStage />
      <ChapterRail />
      <main id="top">
        <Hero />
        <TravelSpacer id="desk" />
        <WorkSection />
        <TravelSpacer id="wall" />
        <CareerSection />
        <TravelSpacer id="kit" />
        <MatchdaySection />
        <TravelSpacer id="turntable" />
        <MusicSection />
        <TravelSpacer id="shelf" />
        <ShelfSection />
        <TravelSpacer id="window" />
        <OutThereSection />
      </main>
      <footer className="relative z-20 flex flex-wrap justify-between gap-4 bg-ink px-[4vw] py-10 text-sm text-haze">
        <span>
          Built by {site.name} in {site.city}.
        </span>
        <span>Every pixel of the room is code.</span>
      </footer>
    </>
  );
}
