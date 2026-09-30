import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";

const CONTENT_DIR = path.join(process.cwd(), "content");

export const PORTAL_SLUG = "portada";

export type InfoboxData = {
  title?: string;
  image?: { src: string; caption?: string };
  rows: [string, string][];
};

export type Frontmatter = {
  title: string;
  description?: string;
  hatnote?: string;
  infobox?: InfoboxData;
  categories?: string[];
};

export type Heading = { id: string; text: string; level: 2 | 3; num: string };

export type WikiPage = {
  slug: string;
  frontmatter: Frontmatter;
  body: string;
  headings: Heading[];
};

// Content only changes between deploys, so cache in production. In dev, re-read every time.
const cache = new Map<string, unknown>();
function memo<T>(key: string, fn: () => T): T {
  if (process.env.NODE_ENV !== "production") return fn();
  if (!cache.has(key)) cache.set(key, fn());
  return cache.get(key) as T;
}

export function getAllSlugs(): string[] {
  return memo("slugs", () =>
    fs
      .readdirSync(CONTENT_DIR)
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => f.replace(/\.mdx$/, "")),
  );
}

// Everything except the portal, which lives at "/" instead of /wiki/<slug>.
export function getArticleSlugs(): string[] {
  return getAllSlugs().filter((slug) => slug !== PORTAL_SLUG);
}

// Articles alphabetical by title, for the portal's list.
export function getArticleIndex(): { slug: string; title: string; description?: string }[] {
  return getArticleSlugs()
    .map((slug) => {
      const { title, description } = getPage(slug)!.frontmatter;
      return { slug, title, description };
    })
    .sort((a, b) => a.title.localeCompare(b.title, "es"));
}

// Returns null for unknown slugs; throws (naming the file) on invalid frontmatter.
export function getPage(slug: string): WikiPage | null {
  if (!getAllSlugs().includes(slug)) return null;
  return memo(`page:${slug}`, () => {
    const file = `${slug}.mdx`;
    const { data, content } = matter(fs.readFileSync(path.join(CONTENT_DIR, file), "utf8"));
    validateFrontmatter(file, data);
    return {
      slug,
      frontmatter: data as Frontmatter,
      body: content,
      headings: extractHeadings(content),
    };
  });
}

function fail(file: string, message: string): never {
  throw new Error(`content/${file}: ${message}`);
}

function validateFrontmatter(file: string, data: Record<string, unknown>) {
  if (typeof data.title !== "string" || !data.title.trim()) fail(file, "missing `title`");

  const infobox = data.infobox as { rows?: unknown } | null | undefined;
  if (infobox == null) return;
  const rows = infobox.rows;
  if (!Array.isArray(rows)) fail(file, "`infobox.rows` must be a list");

  const labels = new Set<string>();
  for (const row of rows) {
    if (!Array.isArray(row) || row.length !== 2 || row.some((v) => typeof v !== "string")) {
      fail(file, `invalid infobox row ${JSON.stringify(row)}, expected ["Label", "Value"]`);
    }
    if (labels.has(row[0])) fail(file, `duplicate infobox label "${row[0]}"`);
    labels.add(row[0]);
  }
}

// Mirrors rehype-slug (both use github-slugger) so TOC links match heading ids.
// Numbers are computed here so the TOC component stays a plain list.
function extractHeadings(markdown: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  let inFence = false;
  let h2 = 0;
  let h3 = 0;
  for (const line of markdown.split("\n")) {
    if (/^(```|~~~)/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    const text = m[2].replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[*_`]/g, "");
    // A "###" before any "##" is numbered as a top-level entry.
    const isH3 = m[1].length === 3 && h2 > 0;
    if (isH3) {
      h3++;
    } else {
      h2++;
      h3 = 0;
    }
    headings.push({
      id: slugger.slug(text),
      text,
      level: isH3 ? 3 : 2,
      num: isH3 ? `${h2}.${h3}` : `${h2}`,
    });
  }
  return headings;
}
