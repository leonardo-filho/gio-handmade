"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export default function Hero() {
  const reduce = useReducedMotion();
  const base = reduce ? 0 : 1;

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-[#EDE7D9]">
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto text-[#1B4965]">
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 * base, ease: EASE_OUT_EXPO, delay: 0.2 * base }}
        >
          <Image
            src="/logo-navy.png"
            alt="Gio Handmade"
            width={1200}
            height={856}
            priority
            className="w-auto h-28 md:h-40"
          />
        </motion.div>

        <motion.p
          className="font-[family-name:var(--font-serif)] italic text-sm md:text-base tracking-[0.25em] text-[#1B4965]/60 mb-6"
          initial={{ opacity: 0, y: reduce ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 * base, ease: EASE_OUT_EXPO, delay: 0.4 * base }}
        >
          atemporal por natureza
        </motion.p>

        <motion.h1
          className="font-[family-name:var(--font-serif)] text-4xl md:text-7xl font-medium leading-tight mb-6 text-[#1B4965]"
          initial={{ opacity: 0, y: reduce ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1 * base, ease: EASE_OUT_EXPO, delay: 0.55 * base }}
        >
          Peças feitas à mão,<br />
          <span className="italic text-[#1B4965]/80">ponto a ponto.</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto text-[#1B4965]/70 font-[family-name:var(--font-sans)]"
          initial={{ opacity: 0, y: reduce ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 * base, ease: EASE_OUT_EXPO, delay: 0.85 * base }}
        >
          Muito mais que acessórios...
          <br />
          cada peça é feita para vestir você e fazer você se sentir incrível.
        </motion.p>

        <motion.div
          className="flex flex-col md:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: reduce ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 * base, ease: EASE_OUT_EXPO, delay: 1.05 * base }}
        >
          <Link
            href="#categorias"
            className="px-8 py-3 bg-[#1B4965] text-[#EDE7D9] uppercase tracking-widest text-xs font-bold hover:bg-[#130209] transition-colors duration-300"
          >
            Ver Minhas Criações
          </Link>
          <Link
            href="https://wa.me/559192982017?text=Ol%C3%A1%2C%20gostaria%20de%20realizar%20um%20or%C3%A7amento."
            className="px-8 py-3 border border-[#1B4965] text-[#1B4965] uppercase tracking-widest text-xs font-bold hover:bg-[#1B4965] hover:text-[#EDE7D9] transition-colors duration-300"
          >
            Encomendar
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
