/**
 * Renders mini-me poses from /lab/sprite into transparent PNGs in public/minime.
 * Usage (with `npm run dev` running): npm run sprites [-- baseUrl]
 */
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

interface SpriteJob {
  name: string;
  outfit: string;
  pose: "idle" | "wave" | "walk";
  facing: number;
}

const SPRITES: SpriteJob[] = [
  { name: "coding", outfit: "coding", pose: "idle", facing: -0.3 },
  { name: "college", outfit: "college", pose: "idle", facing: 0.25 },
  { name: "office", outfit: "office", pose: "idle", facing: -0.2 },
  { name: "senior", outfit: "senior", pose: "idle", facing: 0.3 },
  { name: "football", outfit: "football", pose: "idle", facing: -0.3 },
  { name: "cricket", outfit: "cricket", pose: "idle", facing: 0.3 },
  { name: "street", outfit: "street", pose: "idle", facing: -0.25 },
  { name: "cozy", outfit: "cozy", pose: "idle", facing: 0.3 },
  { name: "trek-walk", outfit: "trek", pose: "walk", facing: 1.35 },
  { name: "wave", outfit: "casual", pose: "wave", facing: -0.2 },
];

async function main(): Promise<void> {
  const base = process.argv[2] ?? "http://localhost:3210";
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 600, height: 800 }, deviceScaleFactor: 1 });
    for (const sprite of SPRITES) {
      await page.goto(`${base}/lab/sprite?outfit=${sprite.outfit}&pose=${sprite.pose}&facing=${sprite.facing}`, { waitUntil: "networkidle" });
      await page.waitForSelector("body[data-sprite-ready='true']", { timeout: 30_000 });
      const out = fileURLToPath(new URL(`../public/minime/${sprite.name}.png`, import.meta.url));
      await page.locator("canvas").screenshot({ path: out, omitBackground: true });
      process.stdout.write(`rendered ${sprite.name}\n`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
