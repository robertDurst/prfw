import type { Heading } from "@/lib/wiki";

export function TableOfContents({ headings }: { headings: Heading[] }) {
  if (headings.length < 3) return null;

  const items = headings.map((h, i) => {
    const before = headings.slice(0, i + 1);
    const h2 = before.filter((x) => x.level === 2).length;
    if (h.level === 2) return { ...h, num: `${h2}` };
    let lastH2 = i;
    while (headings[lastH2].level !== 2) lastH2--;
    return { ...h, num: `${h2}.${i - lastH2}` };
  });

  return (
    <nav
      aria-label="Contenido"
      className="mb-4 inline-block border border-wiki-border bg-wiki-subtle px-3 py-2 text-[0.85rem]"
    >
      <h2 className="mb-1 text-center text-base font-bold">Contenido</h2>
      <ul className="m-0 list-none p-0">
        {items.map((h) => (
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
