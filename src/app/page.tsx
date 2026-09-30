import Link from "next/link";
import { notFound } from "next/navigation";
import { Article } from "@/components/Article";
import { getArticleIndex, getPage, PORTAL_SLUG } from "@/lib/wiki";

export default function Home() {
  const page = getPage(PORTAL_SLUG);
  if (!page) notFound();
  const articles = getArticleIndex();

  return (
    <>
      <Article page={page} />
      <section className="wiki-body">
        <h2>Artículos</h2>
        <ul>
          {articles.map((a) => (
            <li key={a.slug}>
              <Link href={`/wiki/${a.slug}`}>{a.title}</Link>
              {a.description && <span className="text-wiki-muted"> — {a.description}</span>}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
