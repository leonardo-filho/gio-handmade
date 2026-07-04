import Link from "next/link";
import { Reveal, StaggerGroup, StaggerItem } from "./Reveal";
import SolarisSlotCard from "./solaris/SolarisSlotCard";
import { solarisSlots, SOLARIS_WAITLIST } from "@/data/solaris";

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

        {/* ---------- Prévia da coleção (peças chegando) ---------- */}
        <StaggerGroup className="mx-auto mt-14 grid max-w-6xl grid-cols-2 justify-items-center gap-x-6 gap-y-10 sm:grid-cols-3 md:mt-20 lg:grid-cols-4">
          {solarisSlots.map((slot) => (
            <StaggerItem key={slot.id} className="w-full max-w-[300px]">
              <SolarisSlotCard slot={slot} />
            </StaggerItem>
          ))}
        </StaggerGroup>

        {/* ---------- Chamada para a lista de espera ---------- */}
        <Reveal className="mt-16 flex flex-col items-center gap-5 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#1B4965]/50">
            5 tops + 2 headpieces · chegando em breve
          </p>
          <a
            href={SOLARIS_WAITLIST}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 rounded-sm bg-[#1B4965] px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#EDE7D9] transition-colors duration-300 hover:bg-[#130209] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-4 w-4">
              <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.821 9.821 0 001.519 5.26l-.999 3.648 3.97-1.317zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
            Entrar na lista de espera
          </a>
          <Link
            href="/loja"
            className="inline-flex items-center gap-2 border-b border-[#1B4965] pb-1 text-xs font-bold uppercase tracking-[0.22em] text-[#1B4965] transition-colors hover:border-[#b8902a] hover:text-[#b8902a]"
          >
            Ver a loja completa
            <svg width="18" height="9" viewBox="0 0 22 10" fill="none" aria-hidden>
              <path d="M1 5H20M20 5L16 1M20 5L16 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
