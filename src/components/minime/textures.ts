import type { CanvasTexture } from "three";
import { fontFamily, paint, seeded, toTexture } from "@/components/room/textures/canvas";
import { BEARD, LIP } from "./palette";

/** The face decal is a spherical cap: 207° around, from 54° to 166° down from the crown. */
export const FACE_CAP = { phiSpanDeg: 207, thetaStartDeg: 54, thetaSpanDeg: 112 } as const;

const W = 1024;
const H = 640;
const X = (a: number): number => (0.5 + a / FACE_CAP.phiSpanDeg) * W;
const Y = (theta: number): number => ((theta - FACE_CAP.thetaStartDeg) / FACE_CAP.thetaSpanDeg) * H;

/**
 * One half of the full beard, mirrored by `side`, trimmed short so it follows the jaw:
 * sideburn, jaw corner and chin on the outside; a soft cheek line running down into the moustache.
 */
function beardHalf(ctx: CanvasRenderingContext2D, side: 1 | -1): void {
  const p = (a: number, t: number): [number, number] => [X(side * a), Y(t)];
  ctx.beginPath();
  ctx.moveTo(...p(70, 86));
  ctx.lineTo(...p(80, 86));
  ctx.quadraticCurveTo(...p(83, 102), ...p(81, 116));
  ctx.quadraticCurveTo(...p(78, 132), ...p(63, 140));
  // Run a little past the middle so the two halves overlap instead of leaving a seam.
  ctx.quadraticCurveTo(...p(36, 150.5), ...p(-2, 151.5));
  ctx.lineTo(...p(-2, 126));
  ctx.quadraticCurveTo(...p(14, 125.5), ...p(24, 121));
  ctx.quadraticCurveTo(...p(44, 116), ...p(62, 110));
  ctx.quadraticCurveTo(...p(70, 105), ...p(70, 86));
  ctx.closePath();
  ctx.fill();
}

/** Clear skin under the lower lip, so the chin beard starts below it rather than at the mouth. */
function underLipGap(ctx: CanvasRenderingContext2D): void {
  ctx.beginPath();
  ctx.moveTo(X(-16), Y(121));
  ctx.quadraticCurveTo(X(0), Y(153), X(16), Y(121));
  ctx.closePath();
  ctx.fill();
}

/** A full moustache that wraps the mouth corners into the chin beard. */
function moustache(ctx: CanvasRenderingContext2D): void {
  ctx.beginPath();
  ctx.moveTo(X(-26), Y(125));
  ctx.quadraticCurveTo(X(-25), Y(112.5), X(-11), Y(110));
  ctx.quadraticCurveTo(X(-3), Y(109.5), X(0), Y(111.5));
  ctx.quadraticCurveTo(X(3), Y(109.5), X(11), Y(110));
  ctx.quadraticCurveTo(X(25), Y(112.5), X(26), Y(125));
  ctx.lineTo(X(21.5), Y(126));
  ctx.quadraticCurveTo(X(17), Y(118), X(9), Y(117.6));
  ctx.quadraticCurveTo(X(2), Y(117.6), X(0), Y(118.1));
  ctx.quadraticCurveTo(X(-2), Y(117.6), X(-9), Y(117.6));
  ctx.quadraticCurveTo(X(-17), Y(118), X(-21.5), Y(126));
  ctx.closePath();
  ctx.fill();
}

const MOUTH = "#33110e";
/** Lighter than SKIN: the chin sits in the head's shadow, so bare skin there needs lifting to read. */
const CHIN_SKIN = "#dca47d";
const TEETH = "#fbf6ee";
const CORNER = 14.5;
const CORNER_T = 120.2;

/** The open mouth's outline: a curved top lip line and a deep lower edge. */
function mouthPath(ctx: CanvasRenderingContext2D, depth: number): void {
  ctx.beginPath();
  ctx.moveTo(X(-CORNER), Y(CORNER_T));
  ctx.quadraticCurveTo(X(0), Y(122.8), X(CORNER), Y(CORNER_T));
  ctx.quadraticCurveTo(X(0), Y(depth), X(-CORNER), Y(CORNER_T));
  ctx.closePath();
}

/** A wide, toothy grin: lower lip, dark mouth, then a row of top teeth. */
function grin(ctx: CanvasRenderingContext2D): void {
  mouthPath(ctx, 136.5);
  ctx.fillStyle = LIP;
  ctx.fill();
  mouthPath(ctx, 132.5);
  ctx.fillStyle = MOUTH;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(X(-11.5), Y(121.1));
  ctx.quadraticCurveTo(X(0), Y(123.8), X(11.5), Y(121.1));
  ctx.lineTo(X(10.5), Y(124.2));
  ctx.quadraticCurveTo(X(0), Y(127), X(-10.5), Y(124.2));
  ctx.closePath();
  ctx.fillStyle = TEETH;
  ctx.fill();
}

/** Face decal: full short beard that fades up the cheeks with a gap under the lip, a thick moustache and a grin. */
export function faceTexture(): CanvasTexture {
  const p = paint(W, H);
  const { ctx } = p;

  ctx.save();
  ctx.filter = "blur(4px)";
  ctx.fillStyle = BEARD;
  beardHalf(ctx, 1);
  beardHalf(ctx, -1);
  ctx.globalCompositeOperation = "destination-out";
  ctx.filter = "blur(1.5px)";
  underLipGap(ctx);
  ctx.restore();

  // Stubble texture inside the beard only.
  const rand = seeded(9);
  ctx.globalCompositeOperation = "source-atop";
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = rand() > 0.5 ? "rgba(70,48,36,0.35)" : "rgba(10,6,4,0.35)";
    ctx.fillRect(rand() * W, rand() * H, 2, 2);
  }
  // The fade: sideburns melt into skin at the top, cheeks stay lighter, jaw and chin are dense.
  ctx.globalCompositeOperation = "destination-in";
  const fade = ctx.createLinearGradient(0, Y(84), 0, Y(118));
  fade.addColorStop(0, "rgba(0,0,0,0)");
  fade.addColorStop(0.3, "rgba(0,0,0,0.5)");
  fade.addColorStop(0.7, "rgba(0,0,0,0.8)");
  fade.addColorStop(1, "rgba(0,0,0,0.88)");
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = "source-over";

  // Paint the gap under the lip in a lifted skin tone so it stays visible in shadow.
  ctx.save();
  ctx.filter = "blur(2px)";
  ctx.fillStyle = CHIN_SKIN;
  underLipGap(ctx);
  ctx.restore();

  ctx.save();
  ctx.filter = "blur(1.2px)";
  ctx.fillStyle = BEARD;
  moustache(ctx);
  ctx.restore();
  grin(ctx);
  return toTexture(p);
}

export type KitKind = "madrid" | "chennai";

interface KitColors {
  body: string;
  trim: string;
  ink: string;
}

const KITS: Record<KitKind, KitColors> = {
  madrid: { body: "#f5f2ea", trim: "#c9a44c", ink: "#26263a" },
  chennai: { body: "#f2c21b", trim: "#1f3a8a", ink: "#1f3a8a" },
};

/** Torso wrap for a match shirt: front number 7, name and 7 on the back. Front is the texture's centre. */
export function kitTexture(kind: KitKind): CanvasTexture {
  const p = paint(1024, 320);
  const { ctx, width, height } = p;
  const { body, trim, ink } = KITS[kind];
  ctx.fillStyle = body;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = trim;
  ctx.fillRect(width * 0.25 - 14, 0, 28, height);
  ctx.fillRect(width * 0.75 - 14, 0, 28, height);
  // V-neck at the front
  ctx.beginPath();
  ctx.moveTo(width / 2 - 70, 0);
  ctx.lineTo(width / 2, 86);
  ctx.lineTo(width / 2 + 70, 0);
  ctx.lineWidth = 18;
  ctx.strokeStyle = trim;
  ctx.stroke();
  const display = fontFamily("--font-anybody", "sans-serif");
  ctx.fillStyle = ink;
  ctx.textAlign = "center";
  ctx.font = `900 170px ${display}`;
  ctx.fillText("7", width / 2, 270);
  // back, split across the seam
  ctx.font = `800 52px ${display}`;
  for (const x of [0, width]) {
    ctx.fillText("BISHT", x, 92);
  }
  ctx.font = `900 150px ${display}`;
  for (const x of [0, width]) {
    ctx.fillText("7", x, 250);
  }
  return toTexture(p);
}

/** Flannel check for the college shirt. */
export function flannelTexture(base: string, line: string): CanvasTexture {
  const p = paint(512, 160);
  const { ctx, width, height } = p;
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = line;
  for (let x = 0; x < width; x += 40) ctx.fillRect(x + 14, 0, 12, height);
  for (let y = 0; y < height; y += 40) ctx.fillRect(0, y + 14, width, 12);
  ctx.globalAlpha = 0.25;
  for (let x = 0; x < width; x += 40) ctx.fillRect(x + 4, 0, 3, height);
  ctx.globalAlpha = 1;
  return toTexture(p);
}

/** Chest graphic for the oversized street hoodie. */
export function streetGraphicTexture(): CanvasTexture {
  const p = paint(256, 256);
  const { ctx } = p;
  ctx.fillStyle = "#ff8a1f";
  ctx.beginPath();
  ctx.arc(128, 128, 118, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#14121c";
  ctx.font = `900 120px ${fontFamily("--font-anybody", "sans-serif")}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("SB", 128, 136);
  return toTexture(p);
}
