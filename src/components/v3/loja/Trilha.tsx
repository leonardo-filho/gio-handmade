// Breadcrumb ("Início · Loja", "Loja · Tops"), em 12 px muted. Cada link tem
// 44 px de área de toque sem mudar a altura da linha (margem negativa).
import Link from "next/link";

export type ItemTrilha = { rotulo: string; href?: string };

export default function Trilha({ itens, className = "" }: { itens: ItemTrilha[]; className?: string }) {
  return (
    <nav aria-label="Você está em" className={`text-[12px] leading-4 text-brand-muted ${className}`}>
      <ol className="flex flex-wrap items-center">
        {itens.map((item, i) => (
          <li key={item.rotulo} className="flex items-center">
            {i > 0 && (
              <span aria-hidden className="px-1.5">
                ·
              </span>
            )}
            {item.href ? (
              <Link
                href={item.href}
                className="-my-3.5 inline-flex min-h-11 items-center transition-opacity duration-200 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-[#b8902a] motion-reduce:transition-none"
              >
                {item.rotulo}
              </Link>
            ) : (
              <span aria-current="page">{item.rotulo}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
