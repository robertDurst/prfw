// Fails the build on content mistakes that would otherwise be silent or cryptic.
// Run with `npm run check` (also runs automatically before `npm run build`).
import fs from "node:fs";
import path from "node:path";
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { getAllSlugs, getArticleSlugs, getPage, PORTAL_SLUG } from "../src/lib/wiki.ts";

const KNOWN_KEYS = new Set(["title", "description", "hatnote", "infobox", "categories"]);
const articles = new Set(getArticleSlugs());
const errors: string[] = [];
const warnings: string[] = [];

const inPublic = (src: string) => fs.existsSync(path.join(process.cwd(), "public", src));

for (const slug of getAllSlugs()) {
  const file = `content/${slug}.mdx`;

  let page;
  try {
    page = getPage(slug); // throws on missing title / malformed infobox
  } catch (e) {
    errors.push((e as Error).message);
    continue;
  }
  if (!page) continue;
  const { frontmatter: fm, body } = page;

  for (const key of Object.keys(fm)) {
    if (!KNOWN_KEYS.has(key)) warnings.push(`${file}: unknown frontmatter key "${key}"`);
  }
  if (slug !== PORTAL_SLUG && !fm.description) {
    warnings.push(`${file}: no description (shown in the portal list)`);
  }
  const empty = fm.infobox?.rows.filter(([, value]) => !value.trim()).length ?? 0;
  if (empty) warnings.push(`${file}: ${empty} empty infobox value(s)`);

  // Internal links must point at a real article.
  for (const [, target] of body.matchAll(/(?:\]\(|href=")\/wiki\/([^)"#?\s]+)/g)) {
    if (!articles.has(target)) errors.push(`${file}: link to /wiki/${target}, but that page doesn't exist`);
  }

  // Images referenced from the infobox or body must exist in public/.
  const images = [
    ...(fm.infobox?.image ? [fm.infobox.image.src] : []),
    ...[...body.matchAll(/!\[[^\]]*\]\((\/[^)\s]+)/g)].map((m) => m[1]),
  ];
  for (const src of images) {
    if (src.startsWith("/") && !inPublic(src)) errors.push(`${file}: image ${src} not found in public/`);
  }

  // Compiling surfaces MDX syntax errors (stray { or <) with the file name attached.
  try {
    await compile(body, { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] });
  } catch (e) {
    errors.push(`${file}: ${(e as Error).message}`);
  }
}

for (const w of warnings) console.warn(`warning  ${w}`);
for (const e of errors) console.error(`error    ${e}`);
console.log(`Checked ${getAllSlugs().length} pages: ${errors.length} error(s), ${warnings.length} warning(s)`);
if (errors.length) process.exit(1);
