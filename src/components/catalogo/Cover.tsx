"use client";

import { motion, useReducedMotion } from "framer-motion";
import CatalogFrame from "./CatalogFrame";
import BrandMark, { Sparkle } from "./BrandMark";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Cover() {
  const reduce = useReducedMotion();
  const base = reduce ? 0 : 1;

  return (
    <CatalogFrame page="MAI · 2026" tone="cream" full id="capa">
      <div className="max-w-7xl mx-auto w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1 * base, ease: EASE, delay: 0.05 * base }}
          className="flex justify-center"
        >
          <BrandMark
            tone="cream"
            priority
            width={420}
            height={420}
            className="w-[180px] md:w-[240px] h-auto"
            alt="Logo Gio Handmade"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: reduce ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 * base, ease: EASE, delay: 0.18 * base }}
          className="mt-2 text-[11px] md:text-sm tracking-[0.5em] uppercase font-[family-name:var(--font-display)] text-[#130209]/70"
        >
          Coleção · 2026
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: reduce ? 0 : 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3 * base, ease: EASE, delay: 0.3 * base }}
          className="mt-5 md:mt-10 font-[family-name:var(--font-display)] font-black uppercase leading-[0.86] tracking-[-0.045em] text-[#130209] text-[clamp(2.9rem,12vw,11.5rem)] [text-wrap:balance]"
        >
          GIO
          <br />
          HANDMADE
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 * base, ease: EASE, delay: 0.5 * base }}
          className="mt-6 md:mt-8 font-brand text-[#1B4965] lowercase italic text-[clamp(1.7rem,4.6vw,3rem)] leading-[1] tracking-[-0.01em]"
        >
          atemporal por natureza
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 * base, ease: EASE, delay: 0.65 * base }}
          className="mt-7 flex items-center justify-center gap-3 text-[#1B4965]"
        >
          <span className="block w-10 h-px bg-[#1B4965]/35" />
          <Sparkle className="text-[#1B4965]/80" size={14} />
          <span className="block w-10 h-px bg-[#1B4965]/35" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: reduce ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 * base, ease: EASE, delay: 0.75 * base }}
          className="mt-6 md:mt-8 font-[family-name:var(--font-serif)] italic text-base md:text-2xl text-[#130209]/75 px-4"
        >
          peças únicas, feitas à mão em Belém do Pará
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 * base, ease: EASE, delay: 0.85 * base }}
          className="mt-14 flex flex-col items-center gap-5"
        >
          <a
            href="https://wa.me/559192982017?text=Ol%C3%A1%2C%20vi%20o%20cat%C3%A1logo%20e%20quero%20encomendar%20uma%20pe%C3%A7a."
            className="inline-flex items-center gap-3 bg-[#130209] text-[#EDE7D9] px-7 py-3.5 text-[11px] tracking-[0.32em] uppercase font-[family-name:var(--font-display)] font-bold hover:bg-[#1B4965] transition-colors"
          >
            Reservar minha peça
            <svg width="22" height="10" viewBox="0 0 22 10" fill="none">
              <path d="M1 5H20M20 5L16 1M20 5L16 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </a>
          <span className="text-[10px] tracking-[0.42em] uppercase font-[family-name:var(--font-display)] text-[#130209]/55">
            Vagas limitadas · Produção sob encomenda
          </span>
        </motion.div>
      </div>
    </CatalogFrame>
  );
}
