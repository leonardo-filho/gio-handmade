import Link from "next/link";
import { Reveal, StaggerGroup, StaggerItem } from "./Reveal";
import SolarisPieceCard from "./solaris/SolarisPieceCard";
import { colecaoSolaris } from "@/data/produtos";

// Sol estilizado, repetido em marca d'água no fundo (tema de verão)
const SOL =
  "data:image/svg+xml," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'><circle cx='36' cy='36' r='11' fill='#c99a2e'/><g stroke='#c99a2e' stroke-width='3' stroke-linecap='round'><line x1='36' y1='5' x2='36' y2='16'/><line x1='36' y1='56' x2='36' y2='67'/><line x1='5' y1='36' x2='16' y2='36'/><line x1='56' y1='36' x2='67' y2='36'/><line x1='14' y1='14' x2='22' y2='22'/><line x1='50' y1='50' x2='58' y2='58'/><line x1='58' y1='14' x2='50' y2='22'/><line x1='22' y1='50' x2='14' y2='58'/></g></svg>"
  );

export default function Solaris() {
  return (
    <section
      id="solaris"
      className="relative scroll-mt-28 overflow-hidden bg-[#EDE7D9] py-24 text-[#1B4965] md:py-32"
    >
      {/* Marca d'água de sóis */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("${SOL}")`,
          backgroundSize: "96px auto",
          transform: "scale(1.2)",
          transformOrigin: "center",
        }}
      />
      {/* Lavagem quente de verão vinda de baixo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#EDE7D9] via-[#EDE7D9]/85 to-[#f2d79e]/60"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-1/2 h-64 w-[120%] -translate-x-1/2 bg-[#e6b422]/25 blur-[90px]"
      />

      <div className="relative mx-auto max-w-6xl px-4">
        {/* ---------- Header de identidade ---------- */}
        <Reveal className="mx-auto max-w-5xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#b8902a]">
            nova coleção
          </p>

          <h2 className="mt-4 font-joliet leading-[1.05] tracking-[-0.01em] text-[#1B4965] text-[clamp(2.75rem,11vw,6.5rem)]">
            Solaris
          </h2>

          <p className="mx-auto mt-5 max-w-md font-[family-name:var(--font-serif)] text-lg italic leading-snug text-[#1B4965]/70 md:text-xl">
            Banhada pela atmosfera do verão
          </p>

          <div className="mx-auto mt-7 h-px w-14 bg-[#b8902a]/60" />
        </Reveal>

        {/* ---------- Peças da coleção ---------- */}
        <StaggerGroup className="mx-auto mt-14 grid max-w-6xl grid-cols-2 justify-items-center gap-x-6 gap-y-10 sm:grid-cols-3 md:mt-20 lg:grid-cols-4">
          {colecaoSolaris.map((produto) => (
            <StaggerItem key={produto.id} className="w-full max-w-[300px]">
              <SolarisPieceCard produto={produto} />
            </StaggerItem>
          ))}
        </StaggerGroup>

        {/* ---------- Chamada para a loja ---------- */}
        <Reveal className="mt-16 flex flex-col items-center gap-5 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#1B4965]/50">
            5 tops + 2 headpieces · já disponível
          </p>
          <Link
            href="/loja"
            className="inline-flex items-center justify-center gap-2.5 rounded-sm bg-[#1B4965] px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#EDE7D9] transition-colors duration-300 hover:bg-[#130209] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9]"
          >
            Comprar a coleção
            <svg width="18" height="9" viewBox="0 0 22 10" fill="none" aria-hidden>
              <path d="M1 5H20M20 5L16 1M20 5L16 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
