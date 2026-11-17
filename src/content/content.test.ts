import { chapters, chapterIndex, getChapter } from "@/lib/chapters";
import { outfits } from "@/components/minime/outfits";
import { career } from "./career";
import { interests } from "./interests";
import { getProject, projects } from "./projects";
import { site } from "./site";
import { skillGroups } from "./skills";

describe("projects", () => {
  it("have unique, URL-safe slugs", () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("cover web, mobile and desktop", () => {
    expect(new Set(projects.map((p) => p.platform))).toEqual(new Set(["web", "mobile", "desktop"]));
  });

  it("each have a name, a pitch, a summary, features and a stack", () => {
    for (const project of projects) {
      expect(project.name.length).toBeGreaterThan(0);
      expect(project.pitch.length).toBeGreaterThan(0);
      expect(project.summary.length).toBeGreaterThan(project.pitch.length);
      expect(project.features.length).toBeGreaterThan(0);
      expect(project.stack.length).toBeGreaterThan(0);
    }
  });

  it("can be looked up by slug", () => {
    expect(getProject("tutor")?.name).toBe("Tutor");
    expect(getProject("missing")).toBeUndefined();
  });
});

describe("career", () => {
  it("runs in order from college to now", () => {
    expect(career.map((s) => s.id)).toEqual(["college", "quark", "dew"]);
    for (let i = 1; i < career.length; i++) expect(career[i].from).toBeGreaterThanOrEqual(career[i - 1].from);
    expect(career.at(-1)?.to).toBe("now");
  });
});

describe("chapters", () => {
  it("start in the room and end at the window", () => {
    expect(chapters[0].id).toBe("room");
    expect(chapters.at(-1)?.id).toBe("window");
  });

  it("dress mini-me in outfits that exist", () => {
    for (const chapter of chapters) expect(outfits[chapter.outfit]).toBeDefined();
  });

  it("can be looked up, and unknown ids fail loudly", () => {
    expect(getChapter("desk").title).toBe("Things I've built");
    expect(chapterIndex("kit")).toBe(3);
    expect(() => getChapter("attic" as never)).toThrow("Unknown chapter");
  });
});

describe("site and interests", () => {
  it("has a contact email and no empty social links", () => {
    expect(site.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
    for (const social of site.socials) expect(social.href).toMatch(/^https:\/\//);
  });

  it("keeps the number 7 for both sports", () => {
    expect(interests.football.number).toBe(7);
    expect(interests.cricket.number).toBe(7);
  });

  it("lists every skill once", () => {
    const all = skillGroups.flatMap((g) => g.skills);
    expect(new Set(all).size).toBe(all.length);
  });
});
