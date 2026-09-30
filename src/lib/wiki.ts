import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import GithubSlugger from "github-slugger";

const CONTENT_DIR = path.join(process.cwd(), "content");

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

export type Heading = { id: string; text: string; level: 2 | 3 };

export type WikiPage = {
  slug: string;
  frontmatter: Frontmatter;
  body: string;
  headings: Heading[];
};

export const PORTAL_SLUG = "portada";

export function getAllSlugs(): string[] {
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

// Every article except the portal itself, alphabetical by title.
export function getArticleIndex(): { slug: string; title: string; description?: string }[] {
  return getAllSlugs()
    .filter((slug) => slug !== PORTAL_SLUG)
    .map((slug) => {
      const { title, description } = getPage(slug)!.frontmatter;
      return { slug, title, description };
    })
    .sort((a, b) => a.title.localeCompare(b.title, "es"));
}

export function getPage(slug: string): WikiPage | null {
  const file = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  return {
    slug,
    frontmatter: data as Frontmatter,
    body: content,
    headings: extractHeadings(content),
  };
}

// Mirrors rehype-slug (both use github-slugger) so TOC links match heading ids.
function extractHeadings(markdown: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (line.startsWith("```")) inFence = !inFence;
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    const text = m[2].replace(/[*_`]/g, "");
    headings.push({ id: slugger.slug(text), text, level: m[1].length as 2 | 3 });
  }
  return headings;
}
