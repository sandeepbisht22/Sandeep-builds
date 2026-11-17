import type { CanvasTexture } from "three";
import { fontFamily, paint, roundedRect, seeded, toTexture } from "./canvas";

type Token = [text: string, color: string];

const C = {
  bg: "#11121b",
  panel: "#191a27",
  gutter: "#4b4e6b",
  text: "#c9cbe0",
  key: "#ff9e4a",
  str: "#a6d189",
  prop: "#8cc8ff",
  num: "#f28fad",
  comment: "#666a8a",
};

const CODE: Token[][] = [
  [["// the person behind this room", C.comment]],
  [["export const ", C.key], ["sandeep", C.text], [" = {", C.text]],
  [["  role", C.prop], [": ", C.text], ['"Senior Software Engineer"', C.str], [",", C.text]],
  [["  city", C.prop], [": ", C.text], ['"Haldwani"', C.str], [",", C.text]],
  [["  builds", C.prop], [": [", C.text], ['"web"', C.str], [", ", C.text], ['"mobile"', C.str], [", ", C.text], ['"desktop"', C.str], ["],", C.text]],
  [["  onRepeat", C.prop], [": ", C.text], ['"Do Guna"', C.str], [",", C.text]],
  [["  plays", C.prop], [": { ", C.text], ["football", C.prop], [": ", C.text], ['"full-back"', C.str], [", ", C.text], ["cricket", C.prop], [": ", C.text], ['"bowler"', C.str], [" },", C.text]],
  [["  number", C.prop], [": ", C.text], ["7", C.num], [",", C.text]],
  [["} ", C.text], ["as const", C.key], [";", C.text]],
  [],
  [["ship", C.prop], ["(sandeep);", C.text]],
];

/** The main monitor: an editor with a small, honest object about the owner of the room. */
export function codeEditorTexture(): CanvasTexture {
  const p = paint(1280, 736);
  const { ctx, width, height } = p;
  const mono = fontFamily("--face-code", "monospace");
  const sans = fontFamily("--face-body", "sans-serif");
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = C.panel;
  ctx.fillRect(0, 0, width, 54);
  ctx.fillRect(0, 54, 64, height - 54);
  ["#ff5f57", "#febc2e", "#28c840"].forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(28 + i * 26, 27, 8, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = C.bg;
  ctx.fillRect(120, 10, 210, 44);
  ctx.fillStyle = "#ff8a1f";
  ctx.fillRect(120, 10, 210, 3);
  ctx.font = `500 22px ${sans}`;
  ctx.fillStyle = C.text;
  ctx.fillText("sandeep.ts", 146, 40);
  ctx.fillStyle = C.gutter;
  ctx.fillText("way-in-india.tsx", 360, 40);

  ctx.font = `500 30px ${mono}`;
  CODE.forEach((line, i) => {
    const y = 112 + i * 48;
    ctx.fillStyle = C.gutter;
    ctx.textAlign = "right";
    ctx.fillText(String(i + 1), 50, y);
    ctx.textAlign = "left";
    let x = 96;
    for (const [text, color] of line) {
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      x += ctx.measureText(text).width;
    }
  });
  ctx.fillStyle = "#ff8a1f";
  ctx.fillRect(96 + ctx.measureText("ship(sandeep);").width + 4, 112 + 10 * 48 - 28, 14, 34);

  ctx.fillStyle = "#ff8a1f";
  ctx.fillRect(0, height - 38, width, 38);
  ctx.fillStyle = "#14121c";
  ctx.font = `600 20px ${sans}`;
  ctx.fillText("main", 22, height - 12);
  ctx.textAlign = "right";
  ctx.fillText("TypeScript", width - 22, height - 12);
  ctx.textAlign = "left";
  return toTexture(p);
}

/** The vertical monitor: Tutor's sticky-note questions. */
export function tutorTexture(): CanvasTexture {
  const p = paint(512, 900);
  const { ctx, width, height } = p;
  const sans = fontFamily("--face-body", "sans-serif");
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, "#1c1f3a");
  grad.addColorStop(1, "#11132a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#f3ead8";
  ctx.font = `800 40px ${sans}`;
  ctx.fillText("Tutor", 36, 70);
  ctx.fillStyle = "#9b98b3";
  ctx.font = `500 22px ${sans}`;
  ctx.fillText("3 questions from your notes", 36, 106);
  const notes: [string, string, number][] = [
    ["#f7d774", "What does Tauri use to draw the UI?", -0.04],
    ["#f6a6c1", "Name three states in the North-East.", 0.03],
    ["#a7e3c4", "When does useEffect run?", -0.02],
  ];
  notes.forEach(([color, text, tilt], i) => {
    ctx.save();
    ctx.translate(width / 2, 260 + i * 220);
    ctx.rotate(tilt);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(-196, -84, 400, 184);
    ctx.fillStyle = color;
    ctx.fillRect(-200, -92, 400, 180);
    ctx.fillStyle = "#1b1424";
    ctx.font = `700 28px ${sans}`;
    const words = text.split(" ");
    let line = "";
    let y = -44;
    for (const word of words) {
      const test = `${line}${word} `;
      if (ctx.measureText(test).width > 340 && line) {
        ctx.fillText(line, -170, y);
        line = `${word} `;
        y += 36;
      } else {
        line = test;
      }
    }
    ctx.fillText(line, -170, y);
    roundedRect(ctx, -170, 40, 120, 34, 17);
    ctx.fillStyle = "#1b1424";
    ctx.fill();
    ctx.fillStyle = color;
    ctx.font = `700 18px ${sans}`;
    ctx.fillText("Answer", -144, 63);
    ctx.restore();
  });
  return toTexture(p);
}

/** The phone on the desk: Book Reader with a highlight and a note. */
export function readerTexture(): CanvasTexture {
  const p = paint(300, 600);
  const { ctx, width, height } = p;
  const sans = fontFamily("--face-body", "sans-serif");
  ctx.fillStyle = "#f3ead8";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#1b1424";
  ctx.font = `800 26px ${sans}`;
  ctx.fillText("Chapter 3", 24, 70);
  const rand = seeded(3);
  for (let i = 0; i < 16; i++) {
    const y = 110 + i * 26;
    const w = 180 + rand() * 70;
    if (i === 5 || i === 6) {
      ctx.fillStyle = "rgba(255,138,31,0.55)";
      ctx.fillRect(20, y - 12, i === 6 ? 150 : w + 8, 20);
    }
    ctx.fillStyle = "#4a4458";
    ctx.fillRect(24, y - 6, i === 15 ? 120 : w, 8);
  }
  roundedRect(ctx, 30, 520, 240, 54, 12);
  ctx.fillStyle = "#1b1424";
  ctx.fill();
  ctx.fillStyle = "#f3ead8";
  ctx.font = `600 18px ${sans}`;
  ctx.fillText("Note: read this twice", 48, 553);
  ctx.fillStyle = "#1b1424";
  ctx.fillRect(width / 2 - 40, height - 14, 80, 5);
  return toTexture(p);
}

export type PolaroidKind = "college" | "quark" | "dew";

const POLAROID_CAPTION: Record<PolaroidKind, string> = {
  college: "Chandigarh '15",
  quark: "Quark '19",
  dew: "Dew '22",
};

function drawScene(ctx: CanvasRenderingContext2D, kind: PolaroidKind, x: number, y: number, size: number): void {
  const sky = ctx.createLinearGradient(0, y, 0, y + size);
  const tones: Record<PolaroidKind, [string, string]> = {
    college: ["#f5a35c", "#7a4a7a"],
    quark: ["#6aa7d8", "#2b3f6e"],
    dew: ["#ff8a1f", "#3b2a4a"],
  };
  sky.addColorStop(0, tones[kind][0]);
  sky.addColorStop(1, tones[kind][1]);
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, size, size);
  ctx.fillStyle = "#1b1424";
  if (kind === "college") {
    ctx.fillRect(x + 40, y + 120, 176, 100);
    ctx.beginPath();
    ctx.arc(x + 128, y + 120, 44, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "#ffd08a";
    for (let i = 0; i < 5; i++) ctx.fillRect(x + 56 + i * 32, y + 150, 14, 22);
  } else if (kind === "quark") {
    ctx.fillRect(x + 30, y + 180, 196, 12);
    ctx.fillRect(x + 50, y + 100, 70, 52);
    ctx.fillRect(x + 136, y + 100, 70, 52);
    ctx.fillStyle = "#8cc8ff";
    ctx.fillRect(x + 56, y + 106, 58, 40);
    ctx.fillRect(x + 142, y + 106, 58, 40);
  } else {
    ctx.fillRect(x + 54, y + 170, 150, 12);
    ctx.fillRect(x + 74, y + 100, 110, 72);
    ctx.fillStyle = "#11121b";
    ctx.fillRect(x + 80, y + 106, 98, 60);
    ctx.fillStyle = "#ff8a1f";
    ctx.fillRect(x + 90, y + 118, 50, 6);
    ctx.fillRect(x + 90, y + 132, 70, 6);
    ctx.fillStyle = "#f3ead8";
    ctx.fillRect(x + 200, y + 140, 26, 34);
  }
}

export function polaroidTexture(kind: PolaroidKind): CanvasTexture {
  const p = paint(300, 360);
  const { ctx, width } = p;
  ctx.fillStyle = "#f4efe4";
  ctx.fillRect(0, 0, width, 360);
  drawScene(ctx, kind, 22, 22, 256);
  ctx.fillStyle = "#2a2433";
  ctx.font = `italic 600 30px ${fontFamily("--face-body", "sans-serif")}`;
  ctx.textAlign = "center";
  ctx.fillText(POLAROID_CAPTION[kind], width / 2, 330);
  return toTexture(p);
}

export type JerseyKind = "madrid" | "chennai" | "own";

interface JerseyStyle {
  name: string;
  body: string;
  trim: string;
  ink: string;
}

/** The heroes' shirts, and Sandeep's own. Club colours only, no badges. */
const JERSEYS: Record<JerseyKind, JerseyStyle> = {
  madrid: { name: "RONALDO", body: "#f4f1ea", trim: "#c9a44c", ink: "#24243a" },
  chennai: { name: "DHONI", body: "#f2c21b", trim: "#1f3a8a", ink: "#1f3a8a" },
  own: { name: "BISHT", body: "#1d2140", trim: "#ff8a1f", ink: "#ff8a1f" },
};

/** A framed shirt seen from the back: name and number 7. */
export function jerseyTexture(kind: JerseyKind): CanvasTexture {
  const p = paint(512, 560);
  const { ctx } = p;
  const { name, body, trim, ink } = JERSEYS[kind];
  ctx.beginPath();
  ctx.moveTo(176, 40);
  ctx.quadraticCurveTo(256, 80, 336, 40);
  ctx.lineTo(450, 92);
  ctx.lineTo(500, 220);
  ctx.lineTo(412, 252);
  ctx.lineTo(398, 200);
  ctx.lineTo(398, 530);
  ctx.lineTo(114, 530);
  ctx.lineTo(114, 200);
  ctx.lineTo(100, 252);
  ctx.lineTo(12, 220);
  ctx.lineTo(62, 92);
  ctx.closePath();
  ctx.fillStyle = body;
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.stroke();
  ctx.strokeStyle = trim;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(180, 44);
  ctx.quadraticCurveTo(256, 82, 332, 44);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(20, 214);
  ctx.lineTo(102, 244);
  ctx.moveTo(492, 214);
  ctx.lineTo(410, 244);
  ctx.stroke();
  const display = fontFamily("--face-display", "sans-serif");
  ctx.fillStyle = ink;
  ctx.textAlign = "center";
  ctx.font = `800 ${name.length > 5 ? 46 : 54}px ${display}`;
  ctx.fillText(name, 256, 170);
  ctx.font = `900 250px ${display}`;
  ctx.fillText("7", 256, 420);
  return toTexture(p);
}
