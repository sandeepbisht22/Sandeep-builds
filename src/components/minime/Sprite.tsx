import Image from "next/image";

export type SpriteName =
  | "coding"
  | "college"
  | "office"
  | "senior"
  | "football"
  | "cricket"
  | "street"
  | "cozy"
  | "trek-walk"
  | "wave";

const ALT: Record<SpriteName, string> = {
  coding: "Mini Sandeep in a hoodie and headphones, holding a coffee",
  college: "Mini Sandeep in a flannel shirt with a backpack",
  office: "Mini Sandeep in an office shirt with an ID card",
  senior: "Mini Sandeep in an overshirt with headphones and coffee",
  football: "Mini Sandeep in a white number 7 football kit with a ball",
  cricket: "Mini Sandeep in a yellow number 7 cricket kit holding a ball",
  street: "Mini Sandeep in an oversized hoodie and bucket hat",
  cozy: "Mini Sandeep in a hoodie and glasses, reading a book",
  "trek-walk": "Mini Sandeep walking in a puffer jacket and sunglasses with a trekking pole",
  wave: "Mini Sandeep in a white T-shirt, waving",
};

interface SpriteProps {
  name: SpriteName;
  className?: string;
  priority?: boolean;
}

/** A pre-rendered pose of the 3D mini-me (see scripts/render-sprites.cjs). */
export function Sprite({ name, className = "w-44", priority = false }: SpriteProps) {
  return (
    <Image
      src={`/minime/${name}.png`}
      alt={ALT[name]}
      width={600}
      height={800}
      sizes="(min-width: 768px) 240px, 160px"
      priority={priority}
      className={`h-auto select-none drop-shadow-[0_18px_24px_rgb(3_4_12/0.45)] ${className}`}
      draggable={false}
    />
  );
}
