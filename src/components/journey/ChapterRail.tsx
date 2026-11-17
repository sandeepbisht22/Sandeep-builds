"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { chapters } from "@/lib/chapters";
import { useExperience } from "@/lib/store";
import { setSoundChapter } from "@/lib/sound";
import { travel } from "@/lib/travel";

/**
 * Connects the page's scroll position to the room: while a travel spacer is on screen,
 * its progress moves the camera and mini-me from the previous object to the next.
 */
export function ChapterRail() {
  useGSAP(() => {
    const triggers: ScrollTrigger[] = [];
    const syncVisibility = (): void => {
      useExperience.getState().setRoomVisible(triggers.some((trigger) => trigger.isActive));
    };

    // These triggers are created before the sections' own pins (career, music) exist, so they
    // refresh last (priority -1): their positions must include the space those pins add.
    triggers.push(
      ScrollTrigger.create({ trigger: "#hero", start: "top bottom", end: "bottom top", refreshPriority: -1, onToggle: syncVisibility }),
    );

    chapters.forEach((chapter, index) => {
      if (index === 0) return;
      const previous = chapters[index - 1];
      triggers.push(
        ScrollTrigger.create({
          trigger: `#travel-${chapter.id}`,
          start: "top bottom",
          end: "bottom top",
          refreshPriority: -1,
          onUpdate: (self) => {
            travel.from = previous.id;
            travel.to = chapter.id;
            travel.t = self.progress;
          },
          onToggle: syncVisibility,
        }),
      );
    });

    // The beat remixes for whichever chapter is on screen.
    ScrollTrigger.create({
      trigger: "#hero",
      start: "top top",
      end: "bottom 40%",
      onToggle: (self) => self.isActive && setSoundChapter("room"),
    });
    chapters.slice(1).forEach((chapter) => {
      ScrollTrigger.create({
        trigger: `#chapter-${chapter.id}`,
        start: "top 55%",
        end: "bottom 45%",
        refreshPriority: -1,
        onToggle: (self) => self.isActive && setSoundChapter(chapter.id),
      });
    });

    syncVisibility();
    // Once every section has mounted its pins, recalculate in priority order.
    gsap.delayedCall(0.15, () => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });

    // A late web font changes how tall the headings are, which moves every trigger below them.
    let cancelled = false;
    const refreshOnceFontsLoad = async (): Promise<void> => {
      if (document.fonts.status === "loaded") return;
      try {
        await document.fonts.ready;
      } catch {
        return;
      }
      if (!cancelled) ScrollTrigger.refresh();
    };
    void refreshOnceFontsLoad();
    return () => {
      cancelled = true;
    };
  });

  return null;
}
