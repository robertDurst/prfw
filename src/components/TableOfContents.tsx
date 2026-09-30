import type { Heading } from "@/lib/wiki";

export function TableOfContents({ headings }: { headings: Heading[] }) {
  if (headings.length < 3) return null;

  return (
    <nav
      aria-label="Contenido"
      className="mb-4 inline-block border border-wiki-border bg-wiki-subtle px-3 py-2 text-wiki-sm"
    >
      <p className="mb-1 text-center text-base font-bold">Contenido</p>
      <ul className="m-0 list-none p-0">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "ml-4" : ""}>
            <a href={`#${h.id}`}>
              <span className="mr-1 text-wiki-text">{h.num}</span>
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
