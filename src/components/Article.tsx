import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import Link from "next/link";
import type { WikiPage } from "@/lib/wiki";
import { Infobox } from "./Infobox";
import { Hatnote } from "./Hatnote";
import { TableOfContents } from "./TableOfContents";

const components = {
  Hatnote,
  a: ({ href = "", ...props }: React.ComponentProps<"a">) =>
    href.startsWith("/") ? (
      <Link href={href} {...props} />
    ) : (
      <a href={href} {...props} />
    ),
};

export function Article({ page }: { page: WikiPage }) {
  const { frontmatter: fm } = page;
  return (
    <article>
      <h1 className="mb-2 border-b border-wiki-border pb-1 font-serif text-3xl leading-tight font-normal">
        {fm.title}
      </h1>
      {fm.hatnote && <Hatnote>{fm.hatnote}</Hatnote>}
      {fm.infobox && <Infobox data={fm.infobox} />}
      <TableOfContents headings={page.headings} />
      <div className="wiki-body">
        <MDXRemote
          source={page.body}
          components={components}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] } }}
        />
      </div>
      {fm.categories && fm.categories.length > 0 && (
        <div className="clear-both mt-8 border-t border-wiki-border pt-2 text-wiki-sm text-wiki-muted">
          <strong>Categorías:</strong> {fm.categories.join(" | ")}
        </div>
      )}
    </article>
  );
}
