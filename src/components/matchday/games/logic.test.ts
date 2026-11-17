import { BALLS_PER_OVER, GOAL, LEFT_ALONE, PENALTY_SHOTS, diveX, judgeShot, judgeSwing, pickDive } from "./logic";

describe("penalty", () => {
  it("rules shots outside the frame as misses", () => {
    expect(judgeShot({ x: GOAL.width, y: 0.5 }, "centre")).toBe("miss");
    expect(judgeShot({ x: 0, y: GOAL.height + 0.2 }, "left")).toBe("miss");
    expect(judgeShot({ x: 0, y: -0.1 }, "left")).toBe("miss");
  });

  it("lets the keeper save shots he dives towards", () => {
    expect(judgeShot({ x: diveX("left"), y: 0.4 }, "left")).toBe("saved");
    expect(judgeShot({ x: 0, y: 0.5 }, "centre")).toBe("saved");
  });

  it("scores when the keeper goes the wrong way", () => {
    expect(judgeShot({ x: diveX("right"), y: 0.4 }, "left")).toBe("goal");
  });

  it("never lets the keeper reach the top corners", () => {
    const corner = { x: GOAL.width / 2 - 0.2, y: GOAL.height * 0.85 };
    expect(judgeShot(corner, "right")).toBe("goal");
    expect(judgeShot({ x: -corner.x, y: corner.y }, "left")).toBe("goal");
  });

  it("picks every dive given the right roll", () => {
    expect(pickDive(() => 0.1)).toBe("left");
    expect(pickDive(() => 0.5)).toBe("right");
    expect(pickDive(() => 0.95)).toBe("centre");
    expect(diveX("centre")).toBe(0);
  });
});

describe("cricket", () => {
  it("rewards timing", () => {
    expect(judgeSwing(0)).toMatchObject({ runs: 6, out: false });
    expect(judgeSwing(-0.06)).toMatchObject({ runs: 4 });
    expect(judgeSwing(0.12)).toMatchObject({ runs: 2 });
    expect(judgeSwing(-0.18)).toMatchObject({ runs: 1 });
  });

  it("bowls you when you miss or leave it", () => {
    expect(judgeSwing(0.4)).toMatchObject({ runs: 0, out: true });
    expect(LEFT_ALONE.out).toBe(true);
  });

  it("plays a five-shot shootout and a six-ball over", () => {
    expect(PENALTY_SHOTS).toBe(5);
    expect(BALLS_PER_OVER).toBe(6);
  });
});
