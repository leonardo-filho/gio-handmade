"use client";

import { motion, useReducedMotion } from "framer-motion";
import CatalogFrame from "./CatalogFrame";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Cover() {
  const reduce = useReducedMotion();
  const base = reduce ? 0 : 1;

  return (
    <CatalogFrame page="MAI · 2026" tone="cream" full id="capa">
      <div className="max-w-7xl mx-auto w-full text-center">
        <motion.p
          initial={{ opacity: 0, y: reduce ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 * base, ease: EASE, delay: 0.1 * base }}
          className="text-[11px] md:text-sm tracking-[0.5em] uppercase font-[family-name:var(--font-display)] text-[#130209]/70"
        >
          Coleção · 2026
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: reduce ? 0 : 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3 * base, ease: EASE, delay: 0.25 * base }}
          className="mt-8 md:mt-14 font-[family-name:var(--font-display)] font-black uppercase leading-[0.85] tracking-[-0.04em] text-[#130209] text-[clamp(4.5rem,17vw,18rem)]"
        >
          GIO
          <br />
          HANDMADE
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: reduce ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 * base, ease: EASE, delay: 0.55 * base }}
          className="mt-10 md:mt-14 font-[family-name:var(--font-serif)] italic text-lg md:text-2xl text-[#130209]/75"
        >
          peças únicas, feitas à mão em Belém do Pará
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 * base, ease: EASE, delay: 0.9 * base }}
          className="mt-16 flex items-center justify-center gap-4 text-[10px] tracking-[0.42em] uppercase font-[family-name:var(--font-display)] text-[#130209]/55"
        >
          <span className="block w-12 h-px bg-[#130209]/40" />
          <span>Catálogo Premium</span>
          <span className="block w-12 h-px bg-[#130209]/40" />
        </motion.div>
      </div>
    </CatalogFrame>
  );
}
