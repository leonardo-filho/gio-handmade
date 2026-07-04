import type { SolarisSlot } from "@/data/solaris";

function SunIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 72" className={className} fill="none" aria-hidden>
      <circle cx="36" cy="36" r="11" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <line x1="36" y1="5" x2="36" y2="16" />
        <line x1="36" y1="56" x2="36" y2="67" />
        <line x1="5" y1="36" x2="16" y2="36" />
        <line x1="56" y1="36" x2="67" y2="36" />
        <line x1="14" y1="14" x2="22" y2="22" />
        <line x1="50" y1="50" x2="58" y2="58" />
        <line x1="58" y1="14" x2="50" y2="22" />
        <line x1="22" y1="50" x2="14" y2="58" />
      </g>
    </svg>
  );
}

export default function SolarisSlotCard({ slot }: { slot: SolarisSlot }) {
  const n = String(slot.numero).padStart(2, "0");
  return (
    <div className="flex h-full w-full flex-col">
      <div className="relative flex aspect-[3/4] w-full flex-col items-center justify-center gap-3 overflow-hidden border border-dashed border-[#b8902a]/45 bg-gradient-to-b from-[#f7efdc] to-[#f2d79e]/45">
        <SunIcon className="h-9 w-9 text-[#b8902a]/70" />
        <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#b8902a]/80">
          Foto em breve
        </span>
      </div>

      <div className="mt-4 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#b8902a]">
          Solaris · {slot.tipo} Nº {n}
        </p>
        <h3 className="mt-2 font-[family-name:var(--font-serif)] text-xl text-[#1B4965]">
          {slot.tipo === "Top" ? "Novo Top" : "Novo Headpiece"}
        </h3>
        <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[#1B4965]/45">Em breve</p>
      </div>
    </div>
  );
}
