export type OutfitId =
  | "casual"
  | "coding"
  | "college"
  | "office"
  | "senior"
  | "football"
  | "cricket"
  | "street"
  | "cozy"
  | "trek"
  | "track";

export type TopKind = "tee" | "hoodie" | "shirt" | "jersey" | "oversized" | "puffer" | "track";
export type BottomKind = "joggers" | "jeans" | "shorts" | "trousers" | "cargo";
export type ShoeKind = "sneaker" | "boot" | "chunky" | "hiker";
export type HeadGear = "none" | "headphones" | "bucket" | "beanie";
export type Eyewear = "none" | "round" | "shades";
export type NeckGear = "none" | "chain" | "lanyard";
export type Prop = "none" | "mug" | "book" | "football" | "cricketBall" | "pole";
export type ArmPose = "idle" | "holdMug" | "holdBook" | "holdBall" | "holdPole";

export interface Top {
  kind: TopKind;
  color: string;
  shade: string;
  trim?: string;
  /** Flannel check colour for shirts. */
  check?: string;
  /** Which match shirt to print, for jerseys. */
  kit?: "madrid" | "chennai";
}

export interface Bottom {
  kind: BottomKind;
  color: string;
  shade: string;
  socks?: string;
}

export interface Shoes {
  kind: ShoeKind;
  color: string;
  sole: string;
  accent: string;
}

export interface Outfit {
  id: OutfitId;
  /** Plain-language name, used for labels and alt text. */
  label: string;
  top: Top;
  sleeves: "short" | "long";
  bottom: Bottom;
  shoes: Shoes;
  head: HeadGear;
  eyewear: Eyewear;
  neck: NeckGear;
  backpack: boolean;
  prop: Prop;
  pose: ArmPose;
}

const SNEAKER_WHITE: Shoes = { kind: "sneaker", color: "#f4efe6", sole: "#d8d0c2", accent: "#ff8a1f" };

export const outfits: Record<OutfitId, Outfit> = {
  casual: {
    id: "casual",
    label: "White T-shirt and joggers",
    top: { kind: "tee", color: "#efe7d7", shade: "#d6ccb8" },
    sleeves: "short",
    bottom: { kind: "joggers", color: "#2c3150", shade: "#1f2340" },
    shoes: SNEAKER_WHITE,
    head: "none",
    eyewear: "none",
    neck: "none",
    backpack: false,
    prop: "none",
    pose: "idle",
  },
  coding: {
    id: "coding",
    label: "Hoodie, headphones and coffee",
    top: { kind: "hoodie", color: "#2a2d45", shade: "#1e2035", trim: "#3a3e5e" },
    sleeves: "long",
    bottom: { kind: "joggers", color: "#3a3f5c", shade: "#2b2f48" },
    shoes: SNEAKER_WHITE,
    head: "headphones",
    eyewear: "none",
    neck: "none",
    backpack: false,
    prop: "mug",
    pose: "holdMug",
  },
  college: {
    id: "college",
    label: "Flannel shirt and backpack",
    top: { kind: "shirt", color: "#8c2f2f", shade: "#6e2424", check: "#1f1a2b" },
    sleeves: "long",
    bottom: { kind: "jeans", color: "#36507e", shade: "#2a3f66" },
    shoes: { kind: "sneaker", color: "#2a2a33", sole: "#f0eadf", accent: "#f0eadf" },
    head: "none",
    eyewear: "none",
    neck: "none",
    backpack: true,
    prop: "none",
    pose: "idle",
  },
  office: {
    id: "office",
    label: "Office shirt and ID card",
    top: { kind: "shirt", color: "#bcd0ea", shade: "#9fb6d6" },
    sleeves: "long",
    bottom: { kind: "trousers", color: "#2b2f3f", shade: "#1f2230" },
    shoes: { kind: "sneaker", color: "#3b2a22", sole: "#2a1e18", accent: "#3b2a22" },
    head: "none",
    eyewear: "none",
    neck: "lanyard",
    backpack: false,
    prop: "none",
    pose: "idle",
  },
  senior: {
    id: "senior",
    label: "Overshirt and headphones",
    top: { kind: "shirt", color: "#3d4a3a", shade: "#2f3a2d" },
    sleeves: "long",
    bottom: { kind: "jeans", color: "#22283c", shade: "#181d2d" },
    shoes: SNEAKER_WHITE,
    head: "headphones",
    eyewear: "none",
    neck: "lanyard",
    backpack: false,
    prop: "mug",
    pose: "holdMug",
  },
  football: {
    id: "football",
    label: "White home kit, number 7",
    top: { kind: "jersey", color: "#f5f2ea", shade: "#ddd7c9", trim: "#c9a44c", kit: "madrid" },
    sleeves: "short",
    bottom: { kind: "shorts", color: "#f5f2ea", shade: "#ddd7c9", socks: "#f5f2ea" },
    shoes: { kind: "boot", color: "#1c1c26", sole: "#c9a44c", accent: "#ff8a1f" },
    head: "none",
    eyewear: "none",
    neck: "none",
    backpack: false,
    prop: "football",
    pose: "idle",
  },
  cricket: {
    id: "cricket",
    label: "Yellow kit, number 7",
    top: { kind: "jersey", color: "#f2c21b", shade: "#d6a810", trim: "#1f3a8a", kit: "chennai" },
    sleeves: "short",
    bottom: { kind: "trousers", color: "#f2c21b", shade: "#d6a810" },
    shoes: { kind: "sneaker", color: "#f4efe6", sole: "#d8d0c2", accent: "#1f3a8a" },
    head: "none",
    eyewear: "none",
    neck: "none",
    backpack: false,
    prop: "cricketBall",
    pose: "holdBall",
  },
  street: {
    id: "street",
    label: "Oversized hoodie, bucket hat and chain",
    top: { kind: "oversized", color: "#17171f", shade: "#0f0f15" },
    sleeves: "long",
    bottom: { kind: "cargo", color: "#5a5a3e", shade: "#46462f" },
    shoes: { kind: "chunky", color: "#f4efe6", sole: "#ff8a1f", accent: "#17171f" },
    head: "bucket",
    eyewear: "none",
    neck: "chain",
    backpack: false,
    prop: "none",
    pose: "idle",
  },
  cozy: {
    id: "cozy",
    label: "Cosy hoodie, glasses and a book",
    top: { kind: "hoodie", color: "#3b4473", shade: "#2c335a", trim: "#4c5688" },
    sleeves: "long",
    bottom: { kind: "joggers", color: "#2a2d45", shade: "#1e2035" },
    shoes: SNEAKER_WHITE,
    head: "none",
    eyewear: "round",
    neck: "none",
    backpack: false,
    prop: "book",
    pose: "holdBook",
  },
  trek: {
    id: "trek",
    label: "Puffer jacket, beanie, sunglasses, daypack and trekking pole",
    top: { kind: "puffer", color: "#ff8a1f", shade: "#d9701a", trim: "#1d1f2b" },
    sleeves: "long",
    bottom: { kind: "trousers", color: "#3a3d33", shade: "#2c2e26" },
    shoes: { kind: "hiker", color: "#6b4a33", sole: "#1d1b26", accent: "#ff8a1f" },
    head: "beanie",
    eyewear: "shades",
    neck: "none",
    backpack: true,
    prop: "pole",
    pose: "holdPole",
  },
  track: {
    id: "track",
    label: "Black track jacket and joggers",
    // Two plain stripes and no logo, so it reads as his jacket without copying a brand.
    top: { kind: "track", color: "#1c1d25", shade: "#121319", trim: "#f2eadb" },
    sleeves: "long",
    bottom: { kind: "joggers", color: "#2c3150", shade: "#1f2340" },
    shoes: SNEAKER_WHITE,
    head: "none",
    eyewear: "none",
    neck: "none",
    backpack: false,
    prop: "none",
    pose: "idle",
  },
};
