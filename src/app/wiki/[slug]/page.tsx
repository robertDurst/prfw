import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Article } from "@/components/Article";
import { getArticleSlugs, getPage } from "@/lib/wiki";

// Only slugs from generateStaticParams exist; anything else 404s (including /wiki/portada).
export const dynamicParams = false;

export function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/wiki/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = getPage(slug);
  return page ? { title: `${page.frontmatter.title} - La Selección Wiki` } : {};
}

export default async function WikiPage({ params }: PageProps<"/wiki/[slug]">) {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) notFound();
  return <Article page={page} />;
}
