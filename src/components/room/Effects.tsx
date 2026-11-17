"use client";

import { Bloom, EffectComposer, Outline, ToneMapping } from "@react-three/postprocessing";
import { KernelSize, ToneMappingMode } from "postprocessing";

interface EffectsProps {
  /** MSAA samples; the quality tier lowers this on slower GPUs. */
  multisampling: number;
}

/** Bloom for the lamp, screens and neon; a lamp-coloured outline on the hovered object. */
export function Effects({ multisampling }: EffectsProps) {
  return (
    <EffectComposer multisampling={multisampling} autoClear={false}>
      <Outline
        visibleEdgeColor={0xff8a1f}
        hiddenEdgeColor={0xff8a1f}
        edgeStrength={6}
        width={1200}
        kernelSize={KernelSize.VERY_SMALL}
        blur
      />
      <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.92} luminanceSmoothing={0.12} radius={0.7} />
      <ToneMapping mode={ToneMappingMode.AGX} />
    </EffectComposer>
  );
}
