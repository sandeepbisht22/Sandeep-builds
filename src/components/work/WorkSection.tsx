import { ChapterSection } from "@/components/journey/Chapter";
import { Sprite } from "@/components/minime/Sprite";
import { projects } from "@/content/projects";
import { skillGroups } from "@/content/skills";
import { DeviceMock } from "./DeviceMock";
import { ProjectIndex, type ProjectRow } from "./ProjectIndex";
import { SkillsPile } from "./SkillsPile";

const PLATFORM_LABEL = { web: "Web app", mobile: "Mobile app", desktop: "Desktop app" } as const;

/** The desk chapter: the apps, then the toolkit. */
export function WorkSection() {
  const rows: ProjectRow[] = projects.map((project) => ({
    slug: project.slug,
    name: project.name,
    platformLabel: PLATFORM_LABEL[project.platform],
    pitch: project.pitch,
    stack: project.stack.join(", "),
  }));

  return (
    <ChapterSection
      id="desk"
      title="Things I've built"
      lead="Apps for the web, for your phone and for your desktop. Open one to see how it works."
      aside={<Sprite name="coding" className="w-52" />}
    >
      <ProjectIndex rows={rows} previews={projects.map((p) => <DeviceMock key={p.slug} slug={p.slug} />)} />

      <div className="mt-28 grid gap-10 md:mt-36 md:grid-cols-12">
        <div className="md:col-span-4">
          <h3 className="type-display text-6xl text-paper [--wdth:86] md:text-7xl">Toolkit</h3>
          <p className="mt-4 max-w-sm text-haze">
            What I reach for, day to day. The ones marked learning are the ones I&apos;m getting good at right now.
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-haze">
            {skillGroups.map((group) => (
              <li key={group.id}>{group.name}</li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-8">
          <SkillsPile groups={skillGroups} />
        </div>
      </div>
    </ChapterSection>
  );
}
