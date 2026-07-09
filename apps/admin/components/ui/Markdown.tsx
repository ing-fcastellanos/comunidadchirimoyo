"use client";
/* Markdown.tsx — vista previa en vivo del cuerpo editorial (#140, D8). Copia
   (por diseño, ADR-0001 sin tooling de monorepo) de
   apps/sitio/components/ui/Markdown.tsx (ADR-0026: react-markdown + remark-gfm,
   SIN HTML crudo, sin rehype-raw ni dangerouslySetInnerHTML). Marcado
   "use client" (a diferencia del original, que es Server Component): aquí debe
   re-renderizar en vivo mientras el usuario escribe en el textarea del editor,
   lo que requiere que corra en el cliente. */
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

function esExterno(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

const componentes: Components = {
  h1: ({ children }) => (
    <h2 className="mt-8 font-serif text-[22px] font-semibold leading-tight text-forest-deep">
      {children}
    </h2>
  ),
  h2: ({ children }) => (
    <h2 className="mt-8 font-serif text-[22px] font-semibold leading-tight text-forest-deep">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 font-serif text-[18px] font-semibold leading-snug text-forest-deep">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mt-3 text-[16px] leading-relaxed text-ink/85">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-forest-deep">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="mt-3 list-disc space-y-1 pl-6 text-[16px] leading-relaxed text-ink/85 marker:text-mint-deep">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-3 list-decimal space-y-1 pl-6 text-[16px] leading-relaxed text-ink/85 marker:text-forest/70">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="mt-4 border-l-4 border-mint-deep/60 bg-mint-wash/40 py-1 pl-4 pr-3 text-[16px] italic leading-relaxed text-forest-deep">
      {children}
    </blockquote>
  ),
  a: ({ href, children }: ComponentPropsWithoutRef<"a"> & { children?: ReactNode }) => {
    const url = href ?? "#";
    if (esExterno(url)) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-forest underline decoration-mint-deep/50 underline-offset-2 transition-colors hover:text-forest-deep"
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        href={url}
        className="font-medium text-forest underline decoration-mint-deep/50 underline-offset-2 transition-colors hover:text-forest-deep"
      >
        {children}
      </Link>
    );
  },
  img: ({ src, alt }: ComponentPropsWithoutRef<"img">) => {
    if (!src || typeof src !== "string") return null;
    return (
      <span className="relative my-5 block aspect-[16/9] w-full overflow-hidden rounded-xl bg-mint-wash ring-1 ring-forest/10">
        <Image
          src={src}
          alt={alt ?? ""}
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
        />
      </span>
    );
  },
  code: ({ children }) => (
    <code className="rounded bg-paper px-1.5 py-0.5 font-mono text-[13px] text-forest-deep ring-1 ring-forest/10">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="mt-4 overflow-x-auto rounded-xl bg-pine-deep p-4 text-[13px] leading-relaxed text-paper">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-8 border-forest/15" />,
  table: ({ children }) => (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse text-[14px]">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-forest/20 px-3 py-2 text-left font-semibold text-forest-deep">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-forest/10 px-3 py-2 text-ink/85">{children}</td>
  ),
};

/** Renderiza markdown editorial con el estilo del proyecto. Sin HTML embebido
    (seguro por construcción, ADR-0026). */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={componentes}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
