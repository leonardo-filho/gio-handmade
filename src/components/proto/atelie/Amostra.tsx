import Image from "next/image";
import { AMOSTRAS } from "./dados";

// Amostra redonda do bordado no título de cada capítulo (mesmo desenho da
// lente: fio dourado, borda creme). Decorativa.
export default function Amostra({ slug, className = "" }: { slug: string; className?: string }) {
  const amostra = AMOSTRAS[slug];
  if (!amostra) return null;
  return (
    <span
      aria-hidden
      className={`relative block shrink-0 overflow-hidden rounded-full bg-[#130209] ${className}`}
      style={{ boxShadow: "0 0 0 1px rgba(184,144,42,0.9), 0 0 0 4px #EDE7D9, 0 0 0 5px rgba(27,73,101,0.2)" }}
    >
      <Image
        src={amostra.foto}
        alt=""
        fill
        sizes="160px"
        className="object-cover"
        style={{ objectPosition: amostra.foco, scale: "2.8", transformOrigin: amostra.foco }}
      />
    </span>
  );
}
