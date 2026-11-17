import type { Project } from "./types";

// Links, screenshots and logos are left empty on purpose — drop them in when ready.
export const projects: Project[] = [
  {
    slug: "book-reader",
    name: "Book Reader",
    platform: "mobile",
    pitch: "A PDF reader where your highlights and notes travel with the book.",
    summary:
      "Import any PDF, highlight what matters and write notes as you read. Share the whole thing, highlights and notes included, so the other person reads it the way you did. Select any word to see what it means.",
    features: [
      "Import any PDF",
      "Highlight and add notes",
      "Share a book with all your highlights and notes",
      "Select a word to see its meaning",
    ],
    stack: ["React Native"],
    links: [],
    screenshots: [],
  },
  {
    slug: "tutor",
    name: "Tutor",
    platform: "desktop",
    pitch: "Notes that quiz you back.",
    summary:
      "Keep your notes stacked in order. Tutor's AI writes questions from them on its own and pins them to your desktop as sticky notes, so you can answer right there without opening the app.",
    features: [
      "Create notes and keep them stacked in order",
      "AI writes questions from your notes",
      "Questions appear as sticky notes on your desktop",
      "Answer straight from the sticky note",
    ],
    // Ollama added from the project's source (local AI) — remove if you'd rather not list it.
    stack: ["Tauri", "React", "TypeScript", "SQLite", "Ollama"],
    links: [],
    screenshots: [],
  },
  {
    slug: "way-in-india",
    name: "Way in India",
    platform: "web",
    pitch: "India, one state at a time.",
    summary:
      "A guide to every state, split into topics: its roots, its culture and the local knowledge you only get from people who live there. When you're ready to go, it helps you plan the trip.",
    features: [
      "Every state, divided into topics",
      "The roots and culture behind each place",
      "Local knowledge, explained",
      "Trip planning for the place you just read about",
    ],
    stack: ["TypeScript", "Next.js", "NestJS", "Supabase"],
    links: [],
    screenshots: [],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
