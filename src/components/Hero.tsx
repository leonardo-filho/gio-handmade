"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export default function Hero() {
  const reduce = useReducedMotion();
  const base = reduce ? 0 : 1;

  return (
    <section className="relative min-h-dvh w-full overflow-hidden bg-[#EDE7D9]" id="inicio">
      <div className="relative z-10 flex min-h-dvh w-full flex-col items-center justify-center px-4 pb-8 pt-28 text-center text-[#1B4965] sm:px-6 md:px-8 md:pt-32">
        <motion.div
          className="flex flex-col items-center"
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
            className="h-16 w-auto md:h-24"
          />

          <motion.p
            className="mt-4 font-[family-name:var(--font-serif)] text-sm italic tracking-[0.25em] text-[#1B4965]/60 md:text-base"
            initial={{ opacity: 0, y: reduce ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 * base, ease: EASE_OUT_EXPO, delay: 0.4 * base }}
          >
            atemporal por natureza
          </motion.p>
        </motion.div>

        <motion.div
          className="relative mt-3 aspect-[1.55] w-full max-w-[min(920px,96vw)] md:mt-4 md:h-[44vh] md:max-h-[460px] md:w-auto md:max-w-none"
          initial={{ opacity: 0, y: reduce ? 0 : 18, scale: reduce ? 1 : 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.1 * base, ease: EASE_OUT_EXPO, delay: 0.5 * base }}
        >
          <Image
            src="/brilho-tropical.jpg"
            alt="Modelo usando peça bordada da coleção Solaris"
            fill
            priority
            sizes="(min-width: 768px) 715px, 96vw"
            className="object-contain"
          />
        </motion.div>

        <motion.h1
          className="mt-3 font-[family-name:var(--font-serif)] text-4xl font-medium leading-[1.02] text-[#1B4965] sm:text-5xl md:mt-4 md:text-6xl"
          initial={{ opacity: 0, y: reduce ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1 * base, ease: EASE_OUT_EXPO, delay: 0.7 * base }}
        >
          Peças feitas à mão,
          <br />
          <span className="italic text-[#1B4965]/80">ponto a ponto.</span>
        </motion.h1>

        <motion.div
          className="mt-5 flex w-full max-w-3xl flex-col justify-center gap-3 sm:flex-row md:mt-6"
          initial={{ opacity: 0, y: reduce ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 * base, ease: EASE_OUT_EXPO, delay: 1.05 * base }}
        >
          <Link
            href="#solaris"
            className="px-8 py-3 bg-[#1B4965] text-[#EDE7D9] uppercase tracking-widest text-xs font-bold transition-colors duration-300 hover:bg-[#130209]"
          >
            Coleção Solaris
          </Link>
          <Link
            href="/loja"
            className="px-8 py-3 border border-[#1B4965] text-[#1B4965] uppercase tracking-widest text-xs font-bold transition-colors duration-300 hover:bg-[#1B4965] hover:text-[#EDE7D9]"
          >
            Ver a Loja
          </Link>
          <Link
            href="https://wa.me/559192982017?text=Ol%C3%A1%2C%20gostaria%20de%20realizar%20um%20or%C3%A7amento."
            className="px-8 py-3 border border-[#1B4965]/45 text-[#1B4965] uppercase tracking-widest text-xs font-bold transition-colors duration-300 hover:border-[#1B4965] hover:bg-[#1B4965] hover:text-[#EDE7D9]"
          >
            Encomendar
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
