import type { Metadata } from "next";
import { MiniMeLab } from "./MiniMeLab";

export const metadata: Metadata = {
  title: "Mini-me lab",
  robots: { index: false, follow: false },
};

/** A private workbench for reviewing mini-me's outfits and moves. Not linked from the site. */
export default function LabPage() {
  return (
    <main className="min-h-screen px-6 py-16 md:px-12">
      <h1 className="type-display text-6xl [--wdth:70] md:text-8xl">Mini-me lab</h1>
      <p className="mt-4 max-w-xl text-haze">Every outfit, with the moves the room uses. Not linked from the site.</p>
      <MiniMeLab />
    </main>
  );
}
