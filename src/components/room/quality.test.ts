import { QUALITY_TIERS, fpsBounds, stepDown } from "./quality";

describe("room quality tiers", () => {
  it("are ordered from most to least expensive", () => {
    for (let i = 1; i < QUALITY_TIERS.length; i++) {
      expect(QUALITY_TIERS[i].dpr).toBeLessThan(QUALITY_TIERS[i - 1].dpr);
    }
  });

  it("keep one MSAA setting, so stepping down never rebuilds the effect chain", () => {
    expect(new Set(QUALITY_TIERS.map((tier) => tier.msaa)).size).toBe(1);
  });

  it("never ask for more than 1.5× pixels, the measured budget", () => {
    expect(Math.max(...QUALITY_TIERS.map((tier) => tier.dpr))).toBeLessThanOrEqual(1.5);
  });

  it("only step down, and stop at the last tier", () => {
    const last = QUALITY_TIERS.length - 1;
    expect(stepDown(0)).toBe(1);
    expect(stepDown(last)).toBe(last);
  });

  it("use a higher bar on high-refresh screens", () => {
    const [low60, high60] = fpsBounds(60);
    const [low120, high120] = fpsBounds(120);
    expect(low60).toBeLessThan(high60);
    expect(low120).toBeLessThan(high120);
    expect(low120).toBeGreaterThan(low60);
    expect(high60).toBeLessThan(60);
  });
});
