import type { Metadata } from "next";
import { SpriteLoader } from "./SpriteLoader";

export const metadata: Metadata = {
  title: "Mini-me sprite",
  robots: { index: false, follow: false },
};

/** Capture surface for pre-rendering mini-me images. Not linked from the site. */
export default function SpritePage() {
  return (
    <main className="h-[800px] w-[600px] bg-transparent">
      <SpriteLoader />
    </main>
  );
}
