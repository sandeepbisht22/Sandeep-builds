"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";
import type { SkillGroup } from "@/content/types";

const GROUP_COLOURS: Record<string, string> = {
  web: "bg-paper",
  backend: "bg-lamp",
  infra: "bg-[#9cc3e6]",
  mobile: "bg-[#a7e3c4]",
  desktop: "bg-[#c9b6f2]",
  ai: "bg-[#f6a6c1]",
};

interface Sticker {
  label: string;
  group: string;
  learning: boolean;
}

function flatten(groups: SkillGroup[]): Sticker[] {
  return groups.flatMap((group) => group.skills.map((label) => ({ label, group: group.id, learning: Boolean(group.learning) })));
}

const WALL = 200;
/** Physics runs in fixed 120Hz steps, so the pile falls at the same speed on 60Hz and 120Hz screens. */
const STEP_MS = 1000 / 120;
/** Never try to catch up more than this after a stall (a backgrounded tab, a long frame). */
const MAX_CATCH_UP_MS = 100;
const KICK_EVERY_MS = 4200;

/** Builds the physics world for the sticker pile and wires DOM nodes to bodies. Returns a cleanup. */
function startPile(box: HTMLDivElement): () => void {
  const { Engine, Bodies, Composite, Body, Mouse, MouseConstraint, Sleeping } = Matter;
  // Settled stickers fall asleep, so a resting pile costs nothing and its layers stay still.
  const engine = Engine.create({ gravity: { x: 0, y: 1.1 }, enableSleeping: true });
  const width = box.clientWidth;
  const height = box.clientHeight;
  const nodes = Array.from(box.querySelectorAll<HTMLElement>("[data-body]"));
  // Read every size once, up front: reading them per frame forced a layout for each sticker.
  const sizes = nodes.map((node) => ({ w: node.offsetWidth, h: node.offsetHeight }));

  const walls = [
    Bodies.rectangle(width / 2, height + WALL / 2, width * 2, WALL, { isStatic: true }),
    Bodies.rectangle(-WALL / 2, height / 2, WALL, height * 4, { isStatic: true }),
    Bodies.rectangle(width + WALL / 2, height / 2, WALL, height * 4, { isStatic: true }),
  ];
  const bodies = nodes.map((node, i) => {
    const { w, h } = sizes[i];
    const x = 60 + ((i * 137) % Math.max(1, width - 120));
    const y = -80 - i * 46;
    const round = node.dataset.body === "ball";
    return round
      ? Bodies.circle(x, y, w / 2, { restitution: 0.75, friction: 0.05, density: 0.002 })
      : Bodies.rectangle(x, y, w, h, { chamfer: { radius: h / 2 }, restitution: 0.3, friction: 0.5, angle: ((i % 7) - 3) * 0.12 });
  });
  Composite.add(engine.world, [...walls, ...bodies]);

  let mouse: Matter.Mouse | null = null;
  if (window.matchMedia("(pointer: fine)").matches) {
    mouse = Mouse.create(box);
    // Let the page keep scrolling when the wheel turns over the pile.
    const wheel = (mouse as unknown as { mousewheel: EventListener }).mousewheel;
    box.removeEventListener("wheel", wheel);
    box.removeEventListener("mousewheel", wheel);
    box.removeEventListener("DOMMouseScroll", wheel);
    Composite.add(engine.world, MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.18, damping: 0.1 } }));
  }

  const draw = (): void => {
    nodes.forEach((node, i) => {
      const body = bodies[i];
      if (body.isSleeping) return;
      const { w, h } = sizes[i];
      node.style.transform = `translate3d(${body.position.x - w / 2}px, ${body.position.y - h / 2}px, 0) rotate(${body.angle}rad)`;
    });
  };

  let frame = 0;
  let running = false;
  let last = 0;
  let pending = 0;
  let sinceKick = 0;
  const tick = (now: number): void => {
    const elapsed = Math.min(now - last, MAX_CATCH_UP_MS);
    last = now;
    pending += elapsed;
    sinceKick += elapsed;
    // Every few seconds the ball gets a kick, like someone's always got a ball at their feet.
    if (sinceKick >= KICK_EVERY_MS) {
      sinceKick = 0;
      const ball = bodies[bodies.length - 1];
      Sleeping.set(ball, false);
      Body.applyForce(ball, ball.position, { x: (Math.random() - 0.5) * 0.06, y: -0.05 });
    }
    while (pending >= STEP_MS) {
      Engine.update(engine, STEP_MS);
      pending -= STEP_MS;
    }
    draw();
    frame = requestAnimationFrame(tick);
  };
  // Park every sticker above the box straight away, so the first visible frame is already mid-drop.
  draw();
  // Only simulate while the pile is on screen; the clock (and the kick timer) pause with it.
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !running) {
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    } else if (!entry.isIntersecting && running) {
      running = false;
      cancelAnimationFrame(frame);
    }
  });
  observer.observe(box);

  return () => {
    observer.disconnect();
    cancelAnimationFrame(frame);
    if (mouse) Mouse.clearSourceEvents(mouse);
    Composite.clear(engine.world, false);
    Engine.clear(engine);
  };
}

/** Skills as stickers that tumble into a pile; grab and throw them. Calm layout for reduced motion. */
export function SkillsPile({ groups }: { groups: SkillGroup[] }) {
  const box = useRef<HTMLDivElement>(null);
  const stickers = flatten(groups);

  useEffect(() => {
    const el = box.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.dataset.physics = "on";
    return startPile(el);
  }, []);

  return (
    <div
      ref={box}
      className="group/pile relative flex h-[480px] flex-wrap content-start gap-3 overflow-hidden rounded-[28px] border border-line bg-night/50 p-6 md:h-[540px] data-[physics=on]:block data-[physics=on]:p-0"
    >
      {stickers.map((sticker) => (
        <span
          key={sticker.label}
          data-body="sticker"
          className={`select-none whitespace-nowrap rounded-full px-5 py-2.5 text-base font-bold text-ink shadow-[0_0_0_3px_var(--color-paper),0_10px_18px_rgb(3_4_12/0.45)] group-data-[physics=on]/pile:absolute group-data-[physics=on]/pile:left-0 group-data-[physics=on]/pile:top-0 group-data-[physics=on]/pile:cursor-grab group-data-[physics=on]/pile:will-change-transform md:text-lg ${GROUP_COLOURS[sticker.group] ?? "bg-paper"}`}
        >
          {sticker.label}
          {sticker.learning && <span className="ml-2 align-middle text-xs font-semibold text-ink/60">learning</span>}
        </span>
      ))}
      <span
        data-body="ball"
        aria-hidden
        className="grid h-14 w-14 place-items-center rounded-full bg-[#f8f5ee] shadow-[0_0_0_3px_var(--color-paper),0_10px_18px_rgb(3_4_12/0.45)] group-data-[physics=on]/pile:absolute group-data-[physics=on]/pile:left-0 group-data-[physics=on]/pile:top-0 group-data-[physics=on]/pile:will-change-transform"
      >
        <svg viewBox="-12 -12 24 24" className="h-full w-full">
          <path d="M0 -5.5 L5.2 -1.7 L3.2 4.4 L-3.2 4.4 L-5.2 -1.7 Z" fill="#1b1424" />
          <path d="M0 -5.5 L0 -11 M5.2 -1.7 L10.5 -3.4 M3.2 4.4 L6.5 9 M-3.2 4.4 L-6.5 9 M-5.2 -1.7 L-10.5 -3.4" stroke="#1b1424" strokeWidth={1.4} />
        </svg>
      </span>
      <p className="pointer-events-none absolute bottom-5 left-6 text-sm text-haze">Grab a sticker and throw it.</p>
    </div>
  );
}
