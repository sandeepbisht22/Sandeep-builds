"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const STARS = Array.from({ length: 70 }, (_, i) => ({
  x: (i * 211) % 1440,
  y: (i * 97) % 300,
  r: 0.6 + ((i * 7) % 5) * 0.3,
}));

const RIDGES = [
  { d: "M0 330 C160 250 300 300 440 230 C560 170 700 260 820 210 C960 150 1100 250 1220 190 C1320 140 1400 200 1440 180 L1440 640 L0 640 Z", fill: "#1a2148", depth: 0.15 },
  { d: "M0 400 C140 330 260 380 400 320 C520 270 640 360 780 300 C900 250 1000 320 1080 250 C1180 170 1300 300 1440 260 L1440 640 L0 640 Z", fill: "#141a3a", depth: 0.3 },
  { d: "M0 480 C120 430 240 470 360 430 C520 380 640 460 800 410 C920 370 1000 400 1080 330 C1150 270 1260 380 1440 360 L1440 640 L0 640 Z", fill: "#0f142d", depth: 0.5 },
];

const TRAIL = "M110 600 C220 560 260 520 360 515 C470 510 520 470 600 452 C700 430 760 445 820 420 C900 388 960 400 1010 360 C1040 335 1060 320 1080 300";

/**
 * The hills above Haldwani at night. Scrolling draws the trail up to the summit while mini-me
 * walks it; the ridges drift at different speeds.
 */
export function TrailScene() {
  const root = useRef<HTMLDivElement>(null);
  const trail = useRef<SVGPathElement>(null);
  const walker = useRef<SVGImageElement>(null);
  const flag = useRef<SVGGElement>(null);

  useGSAP(
    () => {
      const path = trail.current;
      const hiker = walker.current;
      if (!path || !hiker) return;
      const length = path.getTotalLength();
      const place = (progress: number): void => {
        const point = path.getPointAtLength(length * progress);
        hiker.setAttribute("x", String(point.x - 46));
        hiker.setAttribute("y", String(point.y - 118));
        path.style.strokeDashoffset = String(length * (1 - progress));
        if (flag.current) flag.current.style.opacity = progress > 0.97 ? "1" : "0";
      };
      path.style.strokeDasharray = `${length}`;
      place(0);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        place(1);
        return;
      }
      ScrollTrigger.create({
        trigger: root.current,
        start: "top 75%",
        end: "bottom 35%",
        scrub: 0.8,
        onUpdate: (self) => place(self.progress),
      });
      gsap.utils.toArray<SVGPathElement>("[data-depth]").forEach((ridge) => {
        gsap.to(ridge, {
          y: -Number(ridge.dataset.depth) * 120,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative overflow-hidden rounded-[28px] border border-line">
      <svg viewBox="0 0 1440 640" className="block h-[62vh] min-h-[380px] w-full" preserveAspectRatio="xMidYMax slice" role="img" aria-label="A trail winding from Haldwani up into the hills at night">
        <defs>
          <linearGradient id="trail-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#070a1f" />
            <stop offset="1" stopColor="#25305e" />
          </linearGradient>
          <radialGradient id="trail-moon">
            <stop offset="0" stopColor="#fff3d6" stopOpacity="0.5" />
            <stop offset="1" stopColor="#fff3d6" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1440" height="640" fill="url(#trail-sky)" />
        {STARS.map((star, i) => (
          <circle key={i} cx={star.x} cy={star.y} r={star.r} fill="#fff" opacity={0.35 + (i % 4) * 0.15} />
        ))}
        <circle cx="1160" cy="110" r="120" fill="url(#trail-moon)" />
        <circle cx="1160" cy="110" r="34" fill="#f6ecd4" />
        {RIDGES.map((ridge) => (
          <path key={ridge.fill} data-depth={ridge.depth} d={ridge.d} fill={ridge.fill} />
        ))}
        <path d="M0 560 C180 520 320 560 480 530 C640 500 720 560 900 520 C1080 480 1200 560 1440 520 L1440 640 L0 640 Z" fill="#0a0e20" />
        {Array.from({ length: 40 }, (_, i) => (
          <circle key={i} cx={40 + ((i * 53) % 240)} cy={598 + ((i * 17) % 34)} r={1.6} fill={i % 5 ? "#ffcb7d" : "#ffffff"} opacity={0.8} />
        ))}
        <text x="70" y="632" fill="#9b98b3" fontSize="20" fontWeight="600">
          Haldwani
        </text>
        <path d={TRAIL} fill="none" stroke="rgb(255 138 31 / 0.18)" strokeWidth="4" strokeDasharray="10 9" />
        <path ref={trail} d={TRAIL} fill="none" stroke="#ff8a1f" strokeWidth="5" strokeLinecap="round" />
        <g ref={flag} opacity="0" className="transition-opacity duration-500">
          <line x1="1080" y1="300" x2="1080" y2="250" stroke="#f2eadb" strokeWidth="3" />
          <path d="M1080 250 L1116 262 L1080 274 Z" fill="#ff8a1f" />
        </g>
        <image ref={walker} href="/minime/trek-walk.png" width="92" height="123" />
      </svg>
    </div>
  );
}
