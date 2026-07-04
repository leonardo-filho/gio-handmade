"use client";

// Letreiro de anúncio no topo do site — divulga a coleção nova.
// O texto "roda" em loop contínuo (marquee). Em prefers-reduced-motion, fica estático e centralizado.

const MESSAGE = "Solaris · nova coleção de verão · feito à mão em Belém";

export default function AnnouncementBar() {
  // Repete a mensagem para preencher a largura e garantir loop sem emendas.
  const items = Array.from({ length: 8 });

  return (
    <div className="w-full overflow-hidden bg-[#1B4965] text-[#EDE7D9]">
      <div className="marquee flex w-max">
        {[0, 1].map((track) => (
          <div
            key={track}
            aria-hidden={track === 1}
            className="flex shrink-0 items-center"
          >
            {items.map((_, i) => (
              <span
                key={i}
                className="flex items-center whitespace-nowrap px-5 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] md:text-xs"
              >
                {MESSAGE}
                <span aria-hidden className="ml-5 text-[#C8E1E4]">
                  ✦
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
