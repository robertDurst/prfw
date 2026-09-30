import type { InfoboxData } from "@/lib/wiki";

export function Infobox({ data }: { data: InfoboxData }) {
  return (
    <aside className="mb-4 w-full border border-wiki-border bg-wiki-subtle p-1 text-[0.85rem] leading-snug md:float-right md:mb-4 md:ml-6 md:w-[22em]">
      {data.title && (
        <div className="border-b border-wiki-border px-2 py-1 text-center text-base font-bold">
          {data.title}
        </div>
      )}
      {data.image && (
        <figure className="p-2 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.image.src} alt={data.image.caption ?? ""} className="mx-auto max-w-full" />
          {data.image.caption && (
            <figcaption className="mt-1 text-xs">{data.image.caption}</figcaption>
          )}
        </figure>
      )}
      <table className="w-full border-collapse">
        <tbody>
          {data.rows.map(([label, value]) => (
            <tr key={label} className="align-top">
              <th className="w-[40%] py-1 pr-2 pl-1 text-left font-bold">{label}</th>
              <td className="py-1">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </aside>
  );
}
