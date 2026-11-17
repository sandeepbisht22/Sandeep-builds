import type { SkillGroup } from "./types";

// Your list plus suggestions (marked "suggested") — delete anything that doesn't fit.
export const skillGroups: SkillGroup[] = [
  {
    id: "web",
    name: "Web",
    skills: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS", "HTML & CSS"], // suggested: TS, JS, Tailwind, HTML & CSS
  },
  {
    id: "backend",
    name: "Backend",
    skills: ["Node.js", "NestJS", "Express", "REST APIs", "MongoDB", "Mongoose", "SQLite", "PostgreSQL", "Supabase"], // suggested: Express, REST, MongoDB, PostgreSQL, Supabase
  },
  {
    id: "infra",
    name: "Infra & tools",
    skills: ["Docker", "Kubernetes", "Git", "GitHub Actions", "Linux", "Jest"], // suggested: Git, GitHub Actions, Linux, Jest
  },
  {
    id: "mobile",
    name: "Mobile",
    learning: true,
    skills: ["React Native", "Expo"], // suggested: Expo
  },
  {
    id: "desktop",
    name: "Desktop",
    learning: true,
    skills: ["Tauri", "Rust"], // suggested: Rust
  },
  {
    id: "ai",
    name: "AI",
    skills: ["Ollama", "LLM APIs"], // suggested
  },
];
