"use client";

import dynamic from "next/dynamic";

const SpriteStage = dynamic(() => import("./SpriteStage"), { ssr: false });

export function SpriteLoader() {
  return <SpriteStage />;
}
