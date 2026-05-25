"use client";

import { Reveal } from "../Reveal";
import CatalogFrame from "./CatalogFrame";
import BrandMark, { Sparkle } from "./BrandMark";

export default function Contact() {
  return (
    <CatalogFrame page="07 · CONTATO" tone="ink" full id="contato">
      <div className="max-w-7xl mx-auto w-full text-center">
        <Reveal>
          <div className="flex justify-center">
            <BrandMark
              tone="ink"
              width={420}
              height={420}
              className="w-[160px] md:w-[210px] h-auto opacity-95"
              alt="Gio Handmade"
            />
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="mt-6 flex items-center justify-center gap-3 text-[#C8E1E4]">
            <span className="block w-10 h-px bg-[#C8E1E4]/40" />
            <Sparkle className="text-[#C8E1E4]/80" size={14} />
            <span className="block w-10 h-px bg-[#C8E1E4]/40" />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-8 text-[11px] tracking-[0.5em] uppercase font-[family-name:var(--font-display)] text-[#EDE7D9]/55">
            Entre em contato
          </p>
        </Reveal>

        <Reveal delay={0.16}>
          <h2 className="mt-6 font-[family-name:var(--font-display)] font-black uppercase leading-[0.85] tracking-[-0.045em] text-[#EDE7D9] text-[clamp(2.8rem,10vw,9rem)] [text-wrap:balance]">
            ENCOMENDE<br />SUA PEÇA.
          </h2>
        </Reveal>

        <Reveal delay={0.22}>
          <p className="mt-10 font-[family-name:var(--font-serif)] italic text-[#C8E1E4]/85 text-xl md:text-2xl max-w-2xl mx-auto leading-snug">
            Cada peça nasce pensada para você.
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="mt-10 flex flex-col items-center gap-4">
            <a
              href="https://wa.me/559192982017?text=Ol%C3%A1%2C%20vi%20o%20cat%C3%A1logo%20e%20quero%20encomendar%20uma%20pe%C3%A7a."
              className="inline-flex items-center justify-center min-h-[48px] gap-3 bg-[#C8E1E4] text-[#130209] px-8 py-4 text-[11px] tracking-[0.32em] uppercase font-[family-name:var(--font-display)] font-bold hover:bg-[#EDE7D9] transition-colors"
            >
              Encomende sua peça no WhatsApp
              <svg width="22" height="10" viewBox="0 0 22 10" fill="none">
                <path d="M1 5H20M20 5L16 1M20 5L16 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              </svg>
            </a>
            <span className="text-[10px] tracking-[0.4em] uppercase font-[family-name:var(--font-display)] text-[#EDE7D9]/50">
              Resposta em até 24h · Produção sob encomenda
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.38}>
          <div className="mt-14 grid sm:grid-cols-3 gap-px bg-[#EDE7D9]/15 border border-[#EDE7D9]/15 max-w-4xl mx-auto">
            <a
              href="https://instagram.com/gio.handmade__"
              className="bg-[#130209] p-7 hover:bg-[#0a0104] transition-colors text-left"
            >
              <span className="block text-[10px] tracking-[0.4em] uppercase font-[family-name:var(--font-display)] text-[#C8E1E4]/65">
                Instagram
              </span>
              <span className="mt-2 block font-[family-name:var(--font-display)] font-bold text-[#EDE7D9] text-lg md:text-xl tracking-tight">
                @gio.handmade__
              </span>
            </a>
            <a
              href="https://wa.me/559192982017"
              className="bg-[#130209] p-7 hover:bg-[#0a0104] transition-colors text-left"
            >
              <span className="block text-[10px] tracking-[0.4em] uppercase font-[family-name:var(--font-display)] text-[#C8E1E4]/65">
                WhatsApp
              </span>
              <span className="mt-2 block font-[family-name:var(--font-display)] font-bold text-[#EDE7D9] text-lg md:text-xl tracking-tight">
                (91) 9298-2017
              </span>
            </a>
            <div className="bg-[#130209] p-7 text-left">
              <span className="block text-[10px] tracking-[0.4em] uppercase font-[family-name:var(--font-display)] text-[#C8E1E4]/65">
                Atelier
              </span>
              <span className="mt-2 block font-[family-name:var(--font-display)] font-bold text-[#EDE7D9] text-lg md:text-xl tracking-tight">
                Belém · Pará · Brasil
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.46}>
          <div className="mt-16 flex items-center justify-center gap-4 text-[10px] tracking-[0.42em] uppercase font-[family-name:var(--font-display)] text-[#EDE7D9]/45">
            <span className="block w-12 h-px bg-[#EDE7D9]/30" />
            <span>Catálogo Mai · 2026</span>
            <span className="block w-12 h-px bg-[#EDE7D9]/30" />
          </div>
        </Reveal>
      </div>
    </CatalogFrame>
  );
}
