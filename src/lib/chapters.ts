import type { OutfitId } from "@/components/minime/outfits";

/** Each chapter is one object in the room the camera travels to. */
export type ChapterId = "room" | "desk" | "wall" | "kit" | "turntable" | "shelf" | "window";

export interface Chapter {
  id: ChapterId;
  /** Component-style name the cursor shows over the object, e.g. "Desk" → <Desk />. */
  tag: string;
  /** Section heading once the camera has moved into the object. */
  title: string;
  /** What mini-me wears while we're here. */
  outfit: OutfitId;
}

export const chapters: readonly Chapter[] = [
  { id: "room", tag: "Room", title: "My room", outfit: "casual" },
  { id: "desk", tag: "Desk", title: "Things I've built", outfit: "coding" },
  { id: "wall", tag: "PhotoWall", title: "How I got here", outfit: "college" },
  { id: "kit", tag: "KitCorner", title: "Matchday", outfit: "football" },
  { id: "turntable", tag: "Turntable", title: "On repeat", outfit: "street" },
  { id: "shelf", tag: "Shelf", title: "The shelf", outfit: "cozy" },
  { id: "window", tag: "Window", title: "Out there", outfit: "trek" },
] as const;

export function getChapter(id: ChapterId): Chapter {
  const chapter = chapters.find((c) => c.id === id);
  if (!chapter) throw new Error(`Unknown chapter: ${id}`);
  return chapter;
}

export function chapterIndex(id: ChapterId): number {
  return chapters.findIndex((c) => c.id === id);
}
