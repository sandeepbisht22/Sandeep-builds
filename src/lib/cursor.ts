import type { Chapter } from "./chapters";

/** What the URL bar of the browser-header tooltip reads. */
export interface CursorAddress {
  host: string;
  path: string;
}

/** What the custom cursor shows for the thing under the pointer. */
export interface CursorTarget {
  /** Component-style name shown in the cursor tag: "Desk" → <Desk />. */
  tag: string;
  /** Tab title in the browser-header tooltip. */
  title: string;
  address: CursorAddress;
  /** False when the element shows its own browser header (the project previews), so the floating one stays hidden. */
  tip: boolean;
}

/** The raw data-cursor* attributes (and href) of a DOM hover target. */
export interface CursorAttributes {
  tag?: string;
  title?: string;
  path?: string;
  tip?: string;
  href?: string | null;
}

/** Every in-site address reads as the dev server: the site's running joke. */
export const CURSOR_HOST = "localhost:3000";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function componentName(text: string): string {
  return text
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join("");
}

function siteAddress(path: string): CursorAddress {
  return { host: CURSOR_HOST, path };
}

/** What the URL bar shows for a link: in-site links on localhost:3000, other sites without the protocol. */
export function addressFor(href: string, origin: string): CursorAddress {
  if (href.startsWith("mailto:")) return { host: "mailto:", path: href.slice("mailto:".length) };
  let url: URL;
  try {
    url = new URL(href, origin);
  } catch {
    return siteAddress(href);
  }
  const path = `${url.pathname}${url.search}${url.hash}`;
  if (url.origin === new URL(origin).origin) return siteAddress(path);
  return { host: url.host, path: path === "/" ? "" : path };
}

/** Reads a DOM hover target. An explicit data-cursor-path wins over the link's href. */
export function targetFromAttributes(attrs: CursorAttributes, origin: string): CursorTarget | null {
  if (!attrs.tag) return null;
  let address = siteAddress("/");
  if (attrs.path !== undefined) address = siteAddress(attrs.path);
  else if (attrs.href) address = addressFor(attrs.href, origin);
  return { tag: attrs.tag, title: attrs.title ?? attrs.tag, address, tip: attrs.tip !== "none" };
}

/** A room object: its component name, its chapter's title, and that chapter's address. */
export function chapterTarget(chapter: Chapter): CursorTarget {
  const path = chapter.id === "room" ? "/" : `/${slugify(chapter.title)}`;
  return { tag: chapter.tag, title: chapter.title, address: siteAddress(path), tip: true };
}

/** Two targets that would draw the same cursor. */
export function sameTarget(a: CursorTarget | null, b: CursorTarget | null): boolean {
  if (a === null || b === null) return a === b;
  return a.tag === b.tag && a.title === b.title && a.tip === b.tip && a.address.host === b.address.host && a.address.path === b.address.path;
}
