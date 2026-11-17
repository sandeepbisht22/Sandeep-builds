"use client";

import { Selection } from "@react-three/postprocessing";
import { Effects } from "./Effects";
import { Hoverable } from "./Hoverable";
import { Lights } from "./Lights";
import { MiniMeWalker } from "./MiniMeWalker";
import { OutfitWarmup } from "./OutfitWarmup";
import { Ambience } from "./objects/Ambience";
import { Decor } from "./objects/Decor";
import { Desk } from "./objects/Desk";
import { KitCorner } from "./objects/KitCorner";
import { PhotoWall } from "./objects/PhotoWall";
import { BeanBag, Shelf } from "./objects/Shelf";
import { Shell } from "./objects/Shell";
import { TrekCorner } from "./objects/TrekCorner";
import { Turntable } from "./objects/Turntable";
import { WindowBackdrop, WindowView } from "./objects/WindowView";

interface RoomSceneProps {
  /** MSAA samples for the postprocessing buffer (set by the quality tier). */
  multisampling: number;
}

/** Sandeep's room. Every object you can hover leads to one chapter of the page. */
export function RoomScene({ multisampling }: RoomSceneProps) {
  return (
    <Selection>
      <Lights />
      <Shell />
      <Decor />
      <Ambience />
      <WindowBackdrop />
      <Hoverable id="desk">
        <Desk />
      </Hoverable>
      <Hoverable id="wall">
        <PhotoWall />
      </Hoverable>
      <Hoverable id="kit">
        <KitCorner />
      </Hoverable>
      <Hoverable id="turntable">
        <Turntable />
      </Hoverable>
      <Hoverable id="shelf">
        <Shelf />
        <BeanBag />
      </Hoverable>
      <Hoverable id="window">
        <WindowView />
        <TrekCorner />
      </Hoverable>
      <MiniMeWalker />
      <OutfitWarmup />
      <Effects multisampling={multisampling} />
    </Selection>
  );
}
