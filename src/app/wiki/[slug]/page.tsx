import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Article } from "@/components/Article";
import { getAllSlugs, getPage, PORTAL_SLUG } from "@/lib/wiki";

export function generateStaticParams() {
  return getAllSlugs()
    .filter((slug) => slug !== PORTAL_SLUG)
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/wiki/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = getPage(slug);
  return page ? { title: `${page.frontmatter.title} - La Selección Wiki` } : {};
}

export default async function WikiPage({ params }: PageProps<"/wiki/[slug]">) {
  const { slug } = await params;
  const page = slug === PORTAL_SLUG ? null : getPage(slug);
  if (!page) notFound();
  return <Article page={page} />;
}
