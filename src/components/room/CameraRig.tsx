"use client";

import { useLayoutEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { easing } from "maath";
import { Vector3, type PerspectiveCamera } from "three";
import { travel } from "@/lib/travel";
import { smoothstep, travelPose } from "./layout";

interface CameraRigProps {
  reducedMotion: boolean;
}

function progress(reducedMotion: boolean): number {
  if (!reducedMotion) return travel.t;
  return travel.t < 0.5 ? 0 : 1;
}

/** Follows the scroll: camera pose comes from travelPose(), smoothed, plus a little pointer parallax in the hero. */
export function CameraRig({ reducedMotion }: CameraRigProps) {
  const get = useThree((state) => state.get);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const lookAt = useRef(new Vector3());
  const goalPosition = useRef(new Vector3());
  const goalTarget = useRef(new Vector3());

  // Snap into place on mount and on resize; frames below only ease towards the goal.
  useLayoutEffect(() => {
    const camera = get().camera as PerspectiveCamera;
    const pose = travelPose(travel.from, travel.to, progress(reducedMotion), width / height);
    camera.position.set(...pose.position);
    lookAt.current.set(...pose.target);
    camera.fov = pose.fov;
    camera.lookAt(lookAt.current);
    camera.updateProjectionMatrix();
  }, [get, width, height, reducedMotion]);

  useFrame((state, delta) => {
    const camera = state.camera as PerspectiveCamera;
    const pose = travelPose(travel.from, travel.to, progress(reducedMotion), state.size.width / state.size.height);
    const goal = goalPosition.current.set(...pose.position);
    goalTarget.current.set(...pose.target);

    const heroWeight = travel.from === "room" ? 1 - smoothstep(0.04, 0.18, travel.t) : 0;
    goal.x += travel.pointerX * 0.7 * heroWeight;
    goal.z -= travel.pointerX * 0.7 * heroWeight;
    goal.y += travel.pointerY * 0.45 * heroWeight;

    const smooth = reducedMotion ? 0.001 : 0.28;
    easing.damp3(camera.position, goal, smooth, delta);
    easing.damp3(lookAt.current, goalTarget.current, smooth, delta);
    camera.lookAt(lookAt.current);
    if (Math.abs(camera.fov - pose.fov) > 0.01) {
      camera.fov = pose.fov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
