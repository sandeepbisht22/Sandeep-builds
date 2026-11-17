"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { sameTarget, targetFromAttributes, type CursorTarget } from "@/lib/cursor";
import { useExperience } from "@/lib/store";
import { BrowserBar } from "./BrowserBar";

/** Where the browser header sits relative to the pointer, and how close it may get to the viewport edge. */
const TIP_OFFSET = { x: 22, y: 26 };
const EDGE = 12;
/** The resting dot between < and />, in px (matches the dot's h-1.5 w-1.5 mx-[5px]). */
const DOT = { size: 6, margin: 5 };

function readTarget(el: HTMLElement): CursorTarget | null {
  return targetFromAttributes(
    {
      tag: el.dataset.cursor,
      title: el.dataset.cursorTitle,
      path: el.dataset.cursorPath,
      tip: el.dataset.cursorTip,
      href: el.getAttribute("href"),
    },
    window.location.origin,
  );
}

/**
 * A JSX tag for a cursor: `< • />` at rest. Over anything you can click it names it, so the
 * desk reads `<Desk />`, and a tiny browser header floats beside it with the address you'd land on.
 * DOM targets declare themselves with data-cursor (plus -title, -path, -tip); room objects go through the store.
 */
export function Cursor() {
  const tagRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const nameBoxRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  /** What's under the pointer right now. */
  const [current, setCurrent] = useState<CursorTarget | null>(null);
  /** The last thing hovered: kept on screen while the cursor closes. */
  const [shown, setShown] = useState<CursorTarget | null>(null);
  /** Bumped on every new hover so the address types itself in again. */
  const [hoverCount, setHoverCount] = useState(0);

  useEffect(() => {
    const tag = tagRef.current;
    const tip = tipRef.current;
    if (!tag || !tip || !window.matchMedia("(pointer: fine)").matches) return;

    const root = document.documentElement;
    root.classList.add("has-cursor");
    gsap.set(tag, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
    gsap.set(tip, { autoAlpha: 0 });

    const tagX = gsap.quickTo(tag, "x", { duration: 0.12, ease: "power3.out" });
    const tagY = gsap.quickTo(tag, "y", { duration: 0.12, ease: "power3.out" });
    const tipX = gsap.quickTo(tip, "x", { duration: 0.38, ease: "power3.out" });
    const tipY = gsap.quickTo(tip, "y", { duration: 0.38, ease: "power3.out" });

    const pointer = { x: 0, y: 0 };
    let domTarget: HTMLElement | null = null;
    let active: CursorTarget | null = null;
    let onPage = false;
    // The header's size, kept current by a ResizeObserver: reading it on every pointer move forced a layout.
    const tipSize = { width: tip.offsetWidth, height: tip.offsetHeight };
    const sizeObserver = new ResizeObserver(() => {
      tipSize.width = tip.offsetWidth;
      tipSize.height = tip.offsetHeight;
    });
    sizeObserver.observe(tip);

    // Beside the pointer, flipped to the other side near the right or bottom edge.
    const placeTip = (jump: boolean): void => {
      const { width, height } = tipSize;
      let x = pointer.x + TIP_OFFSET.x;
      if (x + width > window.innerWidth - EDGE) x = pointer.x - TIP_OFFSET.x - width;
      let y = pointer.y + TIP_OFFSET.y;
      if (y + height > window.innerHeight - EDGE) y = pointer.y - TIP_OFFSET.y - height;
      x = Math.max(EDGE, x);
      y = Math.max(EDGE, y);
      tipX(x, jump ? x : undefined);
      tipY(y, jump ? y : undefined);
    };

    const apply = (next: CursorTarget | null): void => {
      if (sameTarget(next, active)) return;
      const opening = active === null && next !== null;
      active = next;
      setCurrent(next);
      if (next === null) return;
      setShown(next);
      setHoverCount((count) => count + 1);
      if (opening) placeTip(true);
    };

    const onMove = (event: PointerEvent): void => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      tagX(pointer.x);
      tagY(pointer.y);
      placeTip(false);
      if (onPage) return;
      // Fade in once when the pointer arrives, not a fresh tween on every move.
      onPage = true;
      gsap.to(tag, { autoAlpha: 1, duration: 0.3, overwrite: "auto" });
    };
    const onLeave = (): void => {
      onPage = false;
      gsap.to([tag, tip], { autoAlpha: 0, duration: 0.25, overwrite: "auto" });
    };
    const onOver = (event: PointerEvent): void => {
      domTarget = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor]") ?? null;
      apply(domTarget ? readTarget(domTarget) : useExperience.getState().cursorTarget);
    };
    // Buttons like the sound toggle relabel themselves when clicked; read them again once React has.
    const onClick = (): void => {
      requestAnimationFrame(() => {
        if (domTarget) apply(readTarget(domTarget));
      });
    };
    const onDown = (): void => {
      gsap.to(tag, { scale: 0.86, duration: 0.12, ease: "power2.out" });
    };
    const onUp = (): void => {
      gsap.to(tag, { scale: 1, duration: 0.4, ease: "back.out(3)" });
    };
    const unsubscribe = useExperience.subscribe((state) => {
      if (domTarget === null) apply(state.cursorTarget);
    });

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerover", onOver);
    document.addEventListener("click", onClick);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      sizeObserver.disconnect();
      unsubscribe();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("click", onClick);
      root.removeEventListener("pointerleave", onLeave);
      root.classList.remove("has-cursor");
      gsap.killTweensOf([tag, tip]);
    };
  }, []);

  // Open or close the tag and the browser header whenever the target changes.
  useEffect(() => {
    const nameBox = nameBoxRef.current;
    const name = nameRef.current;
    const dot = dotRef.current;
    const tip = tipRef.current;
    if (!nameBox || !name || !dot || !tip) return;
    const open = current !== null;
    const showTip = open && current.tip;
    gsap.to(nameBox, { width: open ? name.offsetWidth : 0, duration: 0.45, ease: "expo.out", overwrite: "auto" });
    gsap.to(dot, {
      scale: open ? 0 : 1,
      width: open ? 0 : DOT.size,
      marginLeft: open ? 0 : DOT.margin,
      marginRight: open ? 0 : DOT.margin,
      duration: 0.3,
      ease: "power3.out",
      overwrite: "auto",
    });
    gsap.to(tip, { autoAlpha: showTip ? 1 : 0, scale: showTip ? 1 : 0.94, duration: showTip ? 0.25 : 0.15, ease: "power2.out" });
  }, [current, shown]);

  return (
    <div aria-hidden data-cursor-root className="pointer-events-none fixed inset-0 z-[100] hidden [@media(pointer:fine)]:block">
      <div ref={tipRef} className="invisible absolute left-0 top-0 w-[290px] origin-top-left">
        {shown && <BrowserBar title={shown.title} address={shown.address} playKey={hoverCount} />}
      </div>
      <div
        ref={tagRef}
        className="invisible absolute left-0 top-0 flex items-center whitespace-pre rounded-full bg-ink/55 px-2 py-1 font-code text-[15px] font-bold leading-none text-lamp backdrop-blur-[2px]"
      >
        <span>&lt;</span>
        <span ref={dotRef} className="mx-[5px] inline-block h-1.5 w-1.5 rounded-full bg-lamp" />
        <span ref={nameBoxRef} className="inline-block w-0 overflow-hidden">
          <span ref={nameRef} className="inline-block text-paper">
            {shown ? `${shown.tag} ` : ""}
          </span>
        </span>
        <span>/&gt;</span>
      </div>
    </div>
  );
}
