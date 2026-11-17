import { chapters, getChapter } from "./chapters";
import { CURSOR_HOST, addressFor, chapterTarget, componentName, sameTarget, slugify, targetFromAttributes } from "./cursor";

const ORIGIN = "http://localhost:3210";

describe("slugify", () => {
  it("turns a title into a url path segment", () => {
    expect(slugify("Things I've built")).toBe("things-ive-built");
    expect(slugify("How I got here")).toBe("how-i-got-here");
    expect(slugify("  Out there! ")).toBe("out-there");
  });
});

describe("componentName", () => {
  it("turns words into a PascalCase component name", () => {
    expect(componentName("Book Reader")).toBe("BookReader");
    expect(componentName("Way in India")).toBe("WayInIndia");
    expect(componentName("tutor")).toBe("Tutor");
  });
});

describe("addressFor", () => {
  it("shows in-site links on the dev-server host", () => {
    expect(addressFor("/work/tutor", ORIGIN)).toEqual({ host: CURSOR_HOST, path: "/work/tutor" });
    expect(addressFor("/#chapter-desk", ORIGIN)).toEqual({ host: CURSOR_HOST, path: "/#chapter-desk" });
    expect(addressFor("#top", ORIGIN)).toEqual({ host: CURSOR_HOST, path: "/#top" });
  });

  it("shows mail links as mailto", () => {
    expect(addressFor("mailto:hi@example.com", ORIGIN)).toEqual({ host: "mailto:", path: "hi@example.com" });
  });

  it("keeps an unparseable href as an in-site path", () => {
    expect(addressFor("http://[broken", ORIGIN)).toEqual({ host: CURSOR_HOST, path: "http://[broken" });
  });

  it("shows other sites without the protocol", () => {
    expect(addressFor("https://github.com/someone?tab=repos", ORIGIN)).toEqual({ host: "github.com", path: "/someone?tab=repos" });
    expect(addressFor("https://www.linkedin.com", ORIGIN)).toEqual({ host: "www.linkedin.com", path: "" });
  });
});

describe("targetFromAttributes", () => {
  it("returns nothing without a tag", () => {
    expect(targetFromAttributes({ href: "/work/tutor" }, ORIGIN)).toBeNull();
  });

  it("uses the link's own address", () => {
    expect(targetFromAttributes({ tag: "Tutor", title: "Tutor", href: "/work/tutor" }, ORIGIN)).toEqual({
      tag: "Tutor",
      title: "Tutor",
      address: { host: CURSOR_HOST, path: "/work/tutor" },
      tip: true,
    });
  });

  it("prefers an explicit path and falls back to the tag for the title", () => {
    expect(targetFromAttributes({ tag: "Shoot", path: "/matchday?shoot" }, ORIGIN)).toEqual({
      tag: "Shoot",
      title: "Shoot",
      address: { host: CURSOR_HOST, path: "/matchday?shoot" },
      tip: true,
    });
  });

  it("lets an element turn the floating tooltip off", () => {
    expect(targetFromAttributes({ tag: "Tutor", href: "/work/tutor", tip: "none" }, ORIGIN)?.tip).toBe(false);
  });
});

describe("chapterTarget", () => {
  it("names the object and points at its section", () => {
    expect(chapterTarget(getChapter("desk"))).toEqual({
      tag: "Desk",
      title: "Things I've built",
      address: { host: CURSOR_HOST, path: "/things-ive-built" },
      tip: true,
    });
  });

  it("gives every chapter a distinct tag and path", () => {
    const targets = chapters.map(chapterTarget);
    expect(new Set(targets.map((t) => t.tag)).size).toBe(chapters.length);
    expect(new Set(targets.map((t) => t.address.path)).size).toBe(chapters.length);
    for (const target of targets) expect(target.tag).toMatch(/^[A-Z][A-Za-z]+$/);
  });
});

describe("sameTarget", () => {
  const desk = chapterTarget(getChapter("desk"));

  it("matches targets that draw the same cursor", () => {
    expect(sameTarget(desk, { ...desk, address: { ...desk.address } })).toBe(true);
    expect(sameTarget(null, null)).toBe(true);
  });

  it("tells different targets apart", () => {
    expect(sameTarget(desk, null)).toBe(false);
    expect(sameTarget(null, desk)).toBe(false);
    expect(sameTarget(desk, { ...desk, tag: "Shelf" })).toBe(false);
    expect(sameTarget(desk, { ...desk, tip: false })).toBe(false);
    expect(sameTarget(desk, { ...desk, address: { ...desk.address, path: "/elsewhere" } })).toBe(false);
  });
});
