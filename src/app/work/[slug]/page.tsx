import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/chrome/TopBar";
import { Sprite } from "@/components/minime/Sprite";
import { DeviceMock } from "@/components/work/DeviceMock";
import { Tilt } from "@/components/work/Tilt";
import { StretchTitle } from "@/components/journey/StretchTitle";
import { getProject, projects } from "@/content/projects";
import type { Project } from "@/content/types";

const PLATFORM = {
  web: { label: "Web app", links: ["Visit the site", "Source code"] },
  mobile: { label: "Mobile app", links: ["App Store", "Google Play"] },
  desktop: { label: "Desktop app", links: ["Download", "Source code"] },
} as const;

export function generateStaticParams(): { slug: string }[] {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: project.name, description: `${project.pitch} ${project.summary}` };
}

function nextProject(project: Project): Project {
  const index = projects.findIndex((p) => p.slug === project.slug);
  return projects[(index + 1) % projects.length];
}

function Links({ project }: { project: Project }) {
  if (project.links.length > 0) {
    return (
      <ul className="flex flex-wrap gap-3">
        {project.links.map((link) => (
          <li key={link.href}>
            <a href={link.href} target="_blank" rel="noreferrer" className="inline-block rounded-full bg-lamp px-6 py-3 font-bold text-ink">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul className="flex flex-wrap gap-3">
      {PLATFORM[project.platform].links.map((label) => (
        <li key={label} className="rounded-full border border-dashed border-line px-6 py-3 text-haze">
          {label} <span className="text-sm">(link coming soon)</span>
        </li>
      ))}
    </ul>
  );
}

function Screens({ project }: { project: Project }) {
  const frame = project.platform === "mobile" ? "aspect-[9/19]" : "aspect-[16/10]";
  const columns = project.platform === "mobile" ? "grid-cols-3" : "md:grid-cols-2";
  return (
    <div className={`grid gap-5 ${columns}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`grid place-items-center rounded-[22px] border-2 border-dashed border-line bg-dusk/40 p-6 text-center text-sm text-haze ${frame} ${project.platform !== "mobile" && i === 2 ? "md:col-span-2 md:aspect-[32/10]" : ""}`}
        >
          Screenshot coming soon
        </div>
      ))}
    </div>
  );
}

/** Shell that never depends on the URL, so navigation stays instant; the project streams in. */
export default function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  return (
    <>
      <TopBar home="/" />
      <Suspense fallback={<main className="min-h-screen px-[4vw] pt-40" aria-busy="true" />}>
        <ProjectContent params={params} />
      </Suspense>
    </>
  );
}

async function ProjectContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const next = nextProject(project);

  return (
    <main className="px-[4vw] pb-24 pt-32 md:pt-40">
      <Link href="/#chapter-desk" data-cursor="Back to the room" className="text-sm text-haze transition-colors hover:text-lamp">
        Back to the room
      </Link>

      <header className="mt-10 grid gap-10 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <p className="text-lamp">{PLATFORM[project.platform].label}</p>
          <StretchTitle id="project-title" className="mt-3 text-paper">
            {project.name}
          </StretchTitle>
          <p className="mt-8 max-w-2xl text-2xl leading-snug text-paper md:text-3xl">{project.pitch}</p>
        </div>
        <div className="hidden justify-end md:col-span-4 md:flex">
          <Sprite name="coding" className="w-48" priority />
        </div>
      </header>

      <Tilt className="mt-16 md:mt-24">
        <div className="grid place-items-center rounded-[36px] bg-dusk px-6 py-14 md:px-16 md:py-20">
          <DeviceMock slug={project.slug} className={project.platform === "mobile" ? "w-full max-w-[420px] text-[18px]" : "w-full max-w-[760px] text-[22px]"} />
        </div>
      </Tilt>

      <section className="mt-28 grid gap-12 md:grid-cols-12" aria-labelledby="what">
        <h2 id="what" className="type-display text-6xl text-paper [--wdth:68] md:col-span-4 md:text-7xl">
          What it does
        </h2>
        <div className="md:col-span-8">
          <p className="max-w-2xl text-xl leading-relaxed text-paper">{project.summary}</p>
          <ul className="mt-10 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {project.features.map((feature) => (
              <li key={feature} className="flex gap-4 border-t border-line pt-5 text-lg text-paper">
                <span aria-hidden className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-lamp" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-28 grid gap-12 md:grid-cols-12" aria-labelledby="built">
        <h2 id="built" className="type-display text-6xl text-paper [--wdth:68] md:col-span-4 md:text-7xl">
          Built with
        </h2>
        <ul className="flex flex-wrap content-start gap-3 md:col-span-8">
          {project.stack.map((tool, i) => (
            <li
              key={tool}
              className={`rounded-full px-5 py-2.5 text-lg font-bold text-ink shadow-[0_0_0_3px_var(--color-paper),0_10px_18px_rgb(3_4_12/0.45)] ${i % 2 ? "rotate-2 bg-lamp" : "-rotate-2 bg-paper"}`}
            >
              {tool}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-28" aria-labelledby="screens">
        <h2 id="screens" className="type-display text-6xl text-paper [--wdth:68] md:text-7xl">
          Screens
        </h2>
        <div className="mt-10">
          <Screens project={project} />
        </div>
        <div className="mt-10">
          <Links project={project} />
        </div>
      </section>

      <Link
        href={`/work/${next.slug}`}
        data-cursor="Next project"
        className="group mt-36 grid gap-8 rounded-[36px] border border-line p-8 transition-colors hover:border-lamp md:grid-cols-12 md:items-center md:p-12"
      >
        <span className="md:col-span-7">
          <span className="block text-haze">Next project</span>
          <span className="type-display mt-3 block text-[16vw] leading-[0.85] text-paper transition-colors [--wdth:62] group-hover:text-lamp md:text-[8vw]">
            {next.name}
          </span>
        </span>
        <span className="md:col-span-5">
          <DeviceMock slug={next.slug} className="mx-auto w-full max-w-[360px]" />
        </span>
      </Link>
    </main>
  );
}
