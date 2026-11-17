"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { outfits, type OutfitId } from "@/components/minime/outfits";
import { createControl, type MiniMeControl } from "@/components/minime/rig";

const LabScene = dynamic(() => import("./LabScene"), { ssr: false });
const ORDER = Object.keys(outfits) as OutfitId[];

const BUTTON = "rounded-full border border-line px-3 py-1.5 text-sm text-paper transition-colors hover:border-lamp";

export function MiniMeLab() {
  const control = useRef<MiniMeControl>(createControl("casual", 0));
  const [active, setActive] = useState<OutfitId>("casual");
  const [walking, setWalking] = useState(false);

  const wear = (id: OutfitId): void => {
    control.current.outfit = id;
    setActive(id);
  };
  const toggleWalk = (): void => {
    const next = !walking;
    control.current.walking = next;
    control.current.autoStep = next;
    setWalking(next);
  };

  return (
    <div className="mt-10 flex flex-col gap-12">
      <section className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="h-[68vh] overflow-hidden rounded-3xl border border-line">
          <LabScene controlRef={control} />
        </div>
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="font-semibold text-paper">Outfit</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {ORDER.map((id) => (
                <button key={id} type="button" onClick={() => wear(id)} className={`${BUTTON} ${active === id ? "border-lamp text-lamp" : ""}`}>
                  {id}
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm text-haze">{outfits[active].label}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={toggleWalk} className={BUTTON}>
              {walking ? "Stop walking" : "Walk"}
            </button>
            <button type="button" onClick={() => (control.current.waves += 1)} className={BUTTON}>
              Wave
            </button>
          </div>
          <p className="text-sm text-haze">Drag to orbit, scroll to zoom.</p>
        </div>
      </section>
      <section>
        <h2 className="font-semibold text-paper">Every outfit</h2>
        <div className="mt-4 h-[52vh] overflow-hidden rounded-3xl border border-line">
          <LabScene lineup />
        </div>
      </section>
    </div>
  );
}
