import type { CanvasTexture } from "three";
import { RepeatWrapping } from "three";
import { fontFamily, paint, roundedRect, seeded, toTexture } from "./canvas";

const PAPER = "#f3ead8";

export function woodFloorTexture(): CanvasTexture {
  const p = paint(1024, 1024);
  const { ctx } = p;
  const rand = seeded(7);
  const rows = 8;
  const rowH = 1024 / rows;
  for (let r = 0; r < rows; r++) {
    let x = -rand() * 400;
    while (x < 1024) {
      const len = 300 + rand() * 380;
      ctx.fillStyle = `hsl(${22 + rand() * 6} ${30 + rand() * 10}% ${19 + rand() * 7}%)`;
      ctx.fillRect(x, r * rowH, len, rowH);
      for (let g = 0; g < 7; g++) {
        const y = r * rowH + 6 + rand() * (rowH - 12);
        ctx.strokeStyle = `rgba(20, 10, 4, ${0.08 + rand() * 0.12})`;
        ctx.lineWidth = 1 + rand() * 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.bezierCurveTo(x + len * 0.3, y + (rand() - 0.5) * 10, x + len * 0.7, y + (rand() - 0.5) * 10, x + len, y);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(12, 7, 4, 0.9)";
      ctx.fillRect(x, r * rowH, 3, rowH);
      x += len;
    }
    ctx.fillStyle = "rgba(12, 7, 4, 0.95)";
    ctx.fillRect(0, r * rowH, 1024, 3);
  }
  const texture = toTexture(p);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(2.4, 2.4);
  return texture;
}

function lotus(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, petals: number): void {
  for (let i = 0; i < petals; i++) {
    const angle = (i / petals) * Math.PI * 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(0, -radius * 0.62, radius * 0.2, radius * 0.42, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.18, 0, Math.PI * 2);
  ctx.stroke();
}

function dotRing(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, count: number, size: number): void {
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** A rug in the style of Kumaoni aipan: rice-paste white patterns on red ochre. */
export function aipanRugTexture(): CanvasTexture {
  const p = paint(1024, 768);
  const { ctx, width, height } = p;
  roundedRect(ctx, 6, 6, width - 12, height - 12, 46);
  ctx.save();
  ctx.clip();
  ctx.fillStyle = "#6e2a1e";
  ctx.fillRect(0, 0, width, height);
  const rand = seeded(11);
  for (let i = 0; i < 2400; i++) {
    ctx.fillStyle = `rgba(0,0,0,${rand() * 0.08})`;
    ctx.fillRect(rand() * width, rand() * height, 2, 2);
  }
  ctx.strokeStyle = PAPER;
  ctx.fillStyle = PAPER;
  ctx.lineCap = "round";

  ctx.lineWidth = 7;
  roundedRect(ctx, 40, 40, width - 80, height - 80, 30);
  ctx.stroke();
  ctx.lineWidth = 3;
  roundedRect(ctx, 64, 64, width - 128, height - 128, 22);
  ctx.stroke();
  for (let x = 90; x < width - 80; x += 26) {
    ctx.beginPath();
    ctx.arc(x, 52, 4, 0, Math.PI * 2);
    ctx.arc(x, height - 52, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  // creeper ("bel") along the long sides
  ctx.lineWidth = 4;
  for (const y of [110, height - 110]) {
    ctx.beginPath();
    for (let x = 120; x <= width - 120; x += 4) {
      const yy = y + Math.sin(x / 26) * 12;
      if (x === 120) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
    for (let x = 146; x < width - 120; x += 82) {
      ctx.beginPath();
      ctx.ellipse(x, y + 18, 7, 13, 0.5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  // centre: lotus mandala
  const cx = width / 2;
  const cy = height / 2;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, 190, 0, Math.PI * 2);
  ctx.stroke();
  dotRing(ctx, cx, cy, 168, 40, 4.5);
  lotus(ctx, cx, cy, 150, 12);
  ctx.lineWidth = 4;
  lotus(ctx, cx, cy, 82, 8);
  ctx.beginPath();
  ctx.arc(cx, cy, 10, 0, Math.PI * 2);
  ctx.fill();
  // corner lotuses
  ctx.lineWidth = 3.5;
  for (const [x, y] of [[150, 190], [width - 150, 190], [150, height - 190], [width - 150, height - 190]]) {
    lotus(ctx, x, y, 52, 8);
  }
  ctx.restore();
  return toTexture(p);
}

/** The view through the window: the foothills at night with Haldwani's lights below. */
export function nightViewTexture(): CanvasTexture {
  const p = paint(1024, 768);
  const { ctx, width, height } = p;
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#070a1f");
  sky.addColorStop(0.55, "#16204a");
  sky.addColorStop(1, "#2a2f5c");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);
  const rand = seeded(23);
  for (let i = 0; i < 260; i++) {
    const s = rand() * 1.8 + 0.3;
    ctx.fillStyle = `rgba(255,255,255,${0.25 + rand() * 0.75})`;
    ctx.fillRect(rand() * width, rand() * height * 0.6, s, s);
  }
  const moon = ctx.createRadialGradient(720, 180, 10, 720, 180, 140);
  moon.addColorStop(0, "rgba(255,240,210,0.55)");
  moon.addColorStop(1, "rgba(255,240,210,0)");
  ctx.fillStyle = moon;
  ctx.fillRect(560, 20, 320, 320);
  ctx.fillStyle = "#f6ecd4";
  ctx.beginPath();
  ctx.arc(720, 180, 44, 0, Math.PI * 2);
  ctx.fill();
  const ridges: [number, string, number][] = [
    [430, "#1a2148", 0.006],
    [500, "#121838", 0.009],
    [580, "#0b0f26", 0.013],
  ];
  ridges.forEach(([base, color, freq], layer) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let x = 0; x <= width; x += 4) {
      const y = base - Math.sin(x * freq + layer * 2) * 46 - Math.sin(x * freq * 2.7 + layer) * 18;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.fill();
  });
  for (let i = 0; i < 420; i++) {
    const x = rand() * width;
    const y = 610 + rand() * 150 - Math.sin(x * 0.01) * 20;
    const size = rand() * 2.4 + 0.8;
    ctx.fillStyle = rand() > 0.85 ? "#ffffff" : "#ffcb7d";
    ctx.globalAlpha = 0.5 + rand() * 0.5;
    ctx.fillRect(x, y, size, size);
  }
  ctx.globalAlpha = 1;
  return toTexture(p);
}

/** An original poster: speed lines and a ball, in the lamp colour. */
export function posterTexture(): CanvasTexture {
  const p = paint(512, 704);
  const { ctx, width, height } = p;
  ctx.fillStyle = "#ff8a1f";
  ctx.fillRect(0, 0, width, height);
  const cx = width / 2;
  const cy = height * 0.42;
  ctx.fillStyle = "#14121c";
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    const spread = 0.022 + (i % 3) * 0.006;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * 120, cy + Math.sin(a) * 120);
    ctx.lineTo(cx + Math.cos(a - spread) * 900, cy + Math.sin(a - spread) * 900);
    ctx.lineTo(cx + Math.cos(a + spread) * 900, cy + Math.sin(a + spread) * 900);
    ctx.fill();
  }
  ctx.fillStyle = "#f3ead8";
  ctx.beginPath();
  ctx.arc(cx, cy, 104, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#14121c";
  ctx.lineWidth = 7;
  ctx.stroke();
  ctx.lineWidth = 6;
  for (const curve of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(cx + curve * 30, cy, 60, 104, 0, -Math.PI / 2, Math.PI / 2, curve < 0);
    ctx.stroke();
  }
  ctx.fillStyle = "#14121c";
  ctx.font = `900 64px ${fontFamily("--font-anybody", "sans-serif")}`;
  ctx.textAlign = "center";
  ctx.fillText("NO DAYS OFF", cx, height - 70);
  return toTexture(p);
}

/** Equirectangular football: dark pentagons at the twelve icosahedron vertices. */
export function footballTexture(): CanvasTexture {
  const p = paint(1024, 512);
  const { ctx, width, height } = p;
  ctx.fillStyle = "#f6f2ea";
  ctx.fillRect(0, 0, width, height);
  const centers: [number, number][] = [[0, 90], [0, -90]];
  const lat = Math.atan(0.5) * (180 / Math.PI);
  for (let i = 0; i < 5; i++) {
    centers.push([i * 72, lat], [i * 72 + 36, -lat]);
  }
  ctx.fillStyle = "#1a1822";
  for (const [lon, la] of centers) {
    const x = (lon / 360) * width;
    const y = ((90 - la) / 180) * height;
    const stretch = 1 / Math.max(0.2, Math.cos((la * Math.PI) / 180));
    for (const dx of [-width, 0, width]) {
      ctx.beginPath();
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
        const px = x + dx + Math.cos(a) * 42 * stretch;
        const py = y + Math.sin(a) * 42;
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }
  }
  return toTexture(p);
}

export function cricketBallTexture(): CanvasTexture {
  const p = paint(512, 256);
  const { ctx, width, height } = p;
  ctx.fillStyle = "#a3201a";
  ctx.fillRect(0, 0, width, height);
  const rand = seeded(5);
  for (let i = 0; i < 1500; i++) {
    ctx.fillStyle = `rgba(0,0,0,${rand() * 0.15})`;
    ctx.fillRect(rand() * width, rand() * height, 2, 2);
  }
  ctx.fillStyle = "#e9dcc6";
  ctx.fillRect(0, height / 2 - 5, width, 10);
  ctx.fillStyle = "#7a1712";
  for (let x = 0; x < width; x += 10) {
    ctx.fillRect(x, height / 2 - 12, 5, 3);
    ctx.fillRect(x, height / 2 + 9, 5, 3);
  }
  return toTexture(p);
}

export function vinylTexture(): CanvasTexture {
  const p = paint(512, 512);
  const { ctx } = p;
  const c = 256;
  ctx.fillStyle = "#0b0b0f";
  ctx.beginPath();
  ctx.arc(c, c, 256, 0, Math.PI * 2);
  ctx.fill();
  for (let r = 96; r < 250; r += 3) {
    ctx.strokeStyle = `rgba(255,255,255,${0.025 + (r % 9 === 0 ? 0.04 : 0)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  const sheen = ctx.createConicGradient(0.6, c, c);
  sheen.addColorStop(0, "rgba(255,255,255,0)");
  sheen.addColorStop(0.08, "rgba(255,255,255,0.08)");
  sheen.addColorStop(0.16, "rgba(255,255,255,0)");
  sheen.addColorStop(0.5, "rgba(255,255,255,0)");
  sheen.addColorStop(0.58, "rgba(255,255,255,0.07)");
  sheen.addColorStop(0.66, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.beginPath();
  ctx.arc(c, c, 250, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff8a1f";
  ctx.beginPath();
  ctx.arc(c, c, 88, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#14121c";
  ctx.font = `900 40px ${fontFamily("--font-anybody", "sans-serif")}`;
  ctx.textAlign = "center";
  ctx.fillText("SB", c, c - 22);
  ctx.font = `600 18px ${fontFamily("--font-hanken", "sans-serif")}`;
  ctx.fillText("side A", c, c + 46);
  ctx.beginPath();
  ctx.arc(c, c, 7, 0, Math.PI * 2);
  ctx.fill();
  return toTexture(p);
}

export function clockFaceTexture(): CanvasTexture {
  const p = paint(512, 512);
  const { ctx } = p;
  const c = 256;
  ctx.fillStyle = "#14172a";
  ctx.beginPath();
  ctx.arc(c, c, 252, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PAPER;
  ctx.lineCap = "round";
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const long = i % 3 === 0;
    ctx.lineWidth = long ? 12 : 6;
    ctx.beginPath();
    ctx.moveTo(c + Math.cos(a) * (long ? 170 : 190), c + Math.sin(a) * (long ? 170 : 190));
    ctx.lineTo(c + Math.cos(a) * 222, c + Math.sin(a) * 222);
    ctx.stroke();
  }
  ctx.fillStyle = "#9b98b3";
  ctx.font = `600 30px ${fontFamily("--font-hanken", "sans-serif")}`;
  ctx.textAlign = "center";
  ctx.fillText("Haldwani", c, c + 104);
  return toTexture(p);
}

/** A hand-drawn trail map of the hills above Haldwani: contours, a river and a dashed route up. */
export function trailMapTexture(): CanvasTexture {
  const p = paint(900, 700);
  const { ctx, width, height } = p;
  ctx.fillStyle = "#e9e1cf";
  ctx.fillRect(0, 0, width, height);
  const rand = seeded(31);
  for (let i = 0; i < 2500; i++) {
    ctx.fillStyle = `rgba(90,60,30,${rand() * 0.06})`;
    ctx.fillRect(rand() * width, rand() * height, 2, 2);
  }
  const peaks: [number, number, number][] = [
    [620, 210, 9],
    [330, 250, 7],
    [700, 470, 5],
  ];
  peaks.forEach(([cx, cy, rings], pi) => {
    for (let r = 1; r <= rings; r++) {
      ctx.beginPath();
      for (let s = 0; s <= 64; s++) {
        const a = (s / 64) * Math.PI * 2;
        const wobble = 1 + Math.sin(a * 3 + pi + r * 0.4) * 0.12 + Math.sin(a * 5 + r) * 0.05;
        const radius = r * 26 * wobble;
        const x = cx + Math.cos(a) * radius * 1.25;
        const y = cy + Math.sin(a) * radius;
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = r % 4 === 0 ? "rgba(140,96,60,0.75)" : "rgba(160,118,80,0.45)";
      ctx.lineWidth = r % 4 === 0 ? 2.4 : 1.4;
      ctx.stroke();
    }
    ctx.fillStyle = "#2a1f18";
    ctx.beginPath();
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx + 9, cy + 6);
    ctx.lineTo(cx - 9, cy + 6);
    ctx.fill();
  });
  ctx.strokeStyle = "#6b9bc4";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 520);
  ctx.bezierCurveTo(220, 470, 300, 600, 480, 560);
  ctx.bezierCurveTo(640, 525, 760, 640, 900, 600);
  ctx.stroke();
  // the route, from the town up to the highest peak
  ctx.strokeStyle = "#ff8a1f";
  ctx.lineWidth = 6;
  ctx.setLineDash([14, 10]);
  ctx.beginPath();
  ctx.moveTo(110, 640);
  ctx.bezierCurveTo(200, 520, 330, 470, 350, 330);
  ctx.bezierCurveTo(380, 250, 520, 300, 600, 228);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#ff8a1f";
  ctx.beginPath();
  ctx.arc(110, 640, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2a1f18";
  ctx.font = `700 30px ${fontFamily("--font-hanken", "sans-serif")}`;
  ctx.fillText("Haldwani", 136, 650);
  ctx.font = `italic 600 44px ${fontFamily("--font-hanken", "sans-serif")}`;
  ctx.fillText("Kumaon", 40, 70);
  ctx.strokeStyle = "#2a1f18";
  ctx.lineWidth = 3;
  ctx.strokeRect(14, 14, width - 28, height - 28);
  return toTexture(p);
}

/** Striped fan scarf in Sandeep's own colours. */
export function scarfTexture(): CanvasTexture {
  const p = paint(128, 512);
  const { ctx, width, height } = p;
  const stripes = ["#ff8a1f", "#1d2140", "#f2eadb", "#1d2140"];
  const band = height / 16;
  for (let i = 0; i < 16; i++) {
    ctx.fillStyle = stripes[i % stripes.length];
    ctx.fillRect(0, i * band, width, band);
  }
  ctx.fillStyle = "#f2eadb";
  ctx.font = `900 34px ${fontFamily("--font-anybody", "sans-serif")}`;
  ctx.textAlign = "center";
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("SEVEN", 0, 12);
  ctx.restore();
  return toTexture(p);
}

export function keyboardTexture(): CanvasTexture {
  const p = paint(1024, 320);
  const { ctx } = p;
  ctx.fillStyle = "#15161f";
  ctx.fillRect(0, 0, 1024, 320);
  const rows = [14, 14, 13, 12];
  rows.forEach((count, r) => {
    const keyW = 1000 / 14.5;
    for (let k = 0; k < count; k++) {
      const x = 12 + k * keyW + r * 12;
      roundedRect(ctx, x, 14 + r * 60, keyW - 8, 50, 8);
      ctx.fillStyle = r === 0 && k === 0 ? "#ff8a1f" : "#262838";
      ctx.fill();
    }
  });
  roundedRect(ctx, 260, 254, 460, 50, 8);
  ctx.fillStyle = "#262838";
  ctx.fill();
  return toTexture(p);
}
