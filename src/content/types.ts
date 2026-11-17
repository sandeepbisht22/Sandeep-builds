export type Platform = "web" | "mobile" | "desktop";

export interface ExternalLink {
  label: string;
  href: string;
  /** True while the real URL hasn't been provided yet. */
  placeholder?: boolean;
}

export interface Project {
  slug: string;
  name: string;
  platform: Platform;
  /** One line that says what it is. */
  pitch: string;
  /** Two or three sentences in plain words. */
  summary: string;
  features: string[];
  stack: string[];
  /** Live site, store listings, downloads, repo. Empty until provided. */
  links: ExternalLink[];
  /** Paths under /public. Empty until real screenshots arrive. */
  screenshots: string[];
  logo?: string;
}

export interface CareerStop {
  id: "college" | "quark" | "dew";
  from: number;
  to: number | "now";
  place: string;
  role: string;
  note: string;
}

export interface SkillGroup {
  id: string;
  name: string;
  /** Shown as "learning" on the site. */
  learning?: boolean;
  skills: string[];
}

export interface Book {
  title: string;
  author: string;
}

export interface Trek {
  name: string;
  /** e.g. "May 2024" */
  when?: string;
  /** e.g. "3,800 m" */
  altitude?: string;
}

export interface Interests {
  football: { club: string; player: string; number: number; position: string };
  cricket: { team: string; players: string[]; role: string; number: number };
  music: { artist: string; track: string; link?: string };
  anime: { title: string; native: string }[];
  books: { favourites: Book[]; favouriteWriter: string };
  travel: { base: string; region: string; treks: Trek[] };
}

export interface SiteInfo {
  name: string;
  firstName: string;
  lastName: string;
  role: string;
  company: string;
  city: string;
  timeZone: string;
  tagline: string;
  intro: string;
  email: string;
  socials: ExternalLink[];
}
