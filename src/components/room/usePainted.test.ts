import { Texture } from "three";
import { paintOnce } from "./usePainted";

function counting(): { factory: () => Texture; calls: () => number } {
  let calls = 0;
  return {
    factory: () => {
      calls += 1;
      return new Texture();
    },
    calls: () => calls,
  };
}

describe("paintOnce", () => {
  it("paints a texture once and hands the same one to every caller", () => {
    const { factory, calls } = counting();
    const first = paintOnce(factory, "shared", true);
    const second = paintOnce(factory, "shared", true);
    expect(second).toBe(first);
    expect(calls()).toBe(1);
  });

  it("keeps separate textures for separate keys", () => {
    const { factory } = counting();
    expect(paintOnce(factory, "kit:madrid", true)).not.toBe(paintOnce(factory, "kit:chennai", true));
  });

  it("repaints once when the web fonts arrive, then stays cached", () => {
    const { factory, calls } = counting();
    const fallback = paintOnce(factory, "upgrade", false);
    expect(paintOnce(factory, "upgrade", false)).toBe(fallback);
    const withFonts = paintOnce(factory, "upgrade", true);
    expect(withFonts).not.toBe(fallback);
    expect(paintOnce(factory, "upgrade", true)).toBe(withFonts);
    expect(calls()).toBe(2);
  });

  it("never downgrades a font-ready texture", () => {
    const { factory, calls } = counting();
    const ready = paintOnce(factory, "no-downgrade", true);
    expect(paintOnce(factory, "no-downgrade", false)).toBe(ready);
    expect(calls()).toBe(1);
  });

  it("accepts the factory itself as the key", () => {
    const { factory, calls } = counting();
    expect(paintOnce(factory, factory, true)).toBe(paintOnce(factory, factory, true));
    expect(calls()).toBe(1);
  });
});
