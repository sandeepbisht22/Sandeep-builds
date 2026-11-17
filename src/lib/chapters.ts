import type { OutfitId } from "@/components/minime/outfits";

/** Each chapter is one object in the room the camera travels to. */
export type ChapterId = "room" | "desk" | "wall" | "kit" | "turntable" | "shelf" | "window";

export interface Chapter {
  id: ChapterId;
  /** What the visitor sees when hovering the object in the room. */
  hoverLabel: string;
  /** Section heading once the camera has moved into the object. */
  title: string;
  /** What mini-me wears while we're here. */
  outfit: OutfitId;
}

export const chapters: readonly Chapter[] = [
  { id: "room", hoverLabel: "My room", title: "My room", outfit: "casual" },
  { id: "desk", hoverLabel: "The desk: what I build", title: "Things I've built", outfit: "coding" },
  { id: "wall", hoverLabel: "The photo wall: how I got here", title: "How I got here", outfit: "college" },
  { id: "kit", hoverLabel: "The kit corner: football and cricket", title: "Matchday", outfit: "football" },
  { id: "turntable", hoverLabel: "The turntable: what's on repeat", title: "On repeat", outfit: "street" },
  { id: "shelf", hoverLabel: "The shelf: anime and books", title: "The shelf", outfit: "cozy" },
  { id: "window", hoverLabel: "The window: trails and travel", title: "Out there", outfit: "trek" },
] as const;

export function getChapter(id: ChapterId): Chapter {
  const chapter = chapters.find((c) => c.id === id);
  if (!chapter) throw new Error(`Unknown chapter: ${id}`);
  return chapter;
}

export function chapterIndex(id: ChapterId): number {
  return chapters.findIndex((c) => c.id === id);
}
