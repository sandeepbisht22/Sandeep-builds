"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Object3D, type DirectionalLight, type HemisphereLight, type PointLight, type SpotLight } from "three";
import { lights } from "@/lib/travel";
import { LAMP_BULB, LAMP_TARGET } from "./objects/Desk";

/** Moonlight through the window, the desk lamp, screen glow, fairy lights and the neon. */
export function Lights() {
  const hemi = useRef<HemisphereLight>(null);
  const moon = useRef<DirectionalLight>(null);
  const lamp = useRef<SpotLight>(null);
  const screen = useRef<PointLight>(null);
  const fairy = useRef<PointLight>(null);
  const neon = useRef<PointLight>(null);
  const fill = useRef<PointLight>(null);
  const lampTarget = useMemo(() => {
    const target = new Object3D();
    target.position.set(...LAMP_TARGET);
    return target;
  }, []);

  useEffect(() => {
    if (lamp.current) lamp.current.target = lampTarget;
  }, [lampTarget]);

  useFrame(() => {
    if (hemi.current) hemi.current.intensity = 0.5 + lights.ambient * 0.9;
    if (moon.current) moon.current.intensity = 0.6 + lights.ambient * 1.6;
    if (lamp.current) lamp.current.intensity = lights.lamp * 9;
    if (screen.current) screen.current.intensity = lights.screens * 1.6;
    if (fairy.current) fairy.current.intensity = lights.fairy * 1.8;
    if (neon.current) neon.current.intensity = lights.neon * 1.8;
    if (fill.current) fill.current.intensity = 2 + lights.ambient * 5;
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={["#5a64a6", "#1c140e", 0.6]} />
      <directionalLight
        ref={moon}
        position={[-9, 4.3, -2.6]}
        color="#a3b4ff"
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-camera-near={1}
        shadow-camera-far={25}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-radius={3}
      />
      <spotLight
        ref={lamp}
        position={LAMP_BULB}
        angle={0.8}
        penumbra={0.7}
        distance={5}
        decay={2}
        color="#ffb46b"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0006}
      />
      <primitive object={lampTarget} />
      <pointLight ref={screen} position={[0.6, 1.62, -2.75]} color="#a9c4ff" distance={3} decay={2} />
      <pointLight ref={fairy} position={[0.8, 3.15, -3.05]} color="#ffc77a" distance={3.2} decay={2} />
      <pointLight ref={neon} position={[-3.15, 3.4, 1.78]} color="#ff8a1f" distance={3.2} decay={2} />
      <pointLight ref={fill} position={[3.2, 4.6, 3.2]} color="#ffdcb8" distance={14} decay={2} />
    </>
  );
}
