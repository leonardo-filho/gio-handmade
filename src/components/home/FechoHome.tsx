"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { atraso } from "@/components/vitrine/movimento";
import Selo from "@/components/vitrine/Selo";
import { IconeWhatsApp } from "./Icones";
import { useParado } from "./parado";
import Revela from "./Revela";
import m from "./home.module.css";
import { INSTAGRAM, INSTAGRAM_ARROBA, PERSONALIZAR, WA_SEU_JEITO } from "./textos";

// Três peças que se abrem em leque quando o fecho chega (empilhadas, viram
// leque com a rolagem). Fotos de campanha sem marca de vídeo no canto.
const LEQUE = [
  { foto: "/foto3.jpeg", posicao: "50% 30%", lado: -1 },
  { foto: "/foto8.jpeg", posicao: "50% 35%", lado: 0 },
  { foto: "/foto5.jpeg", posicao: "50% 35%", lado: 1 },
] as const;

// Fecho da home: o convite para encomendar do seu jeito pelo WhatsApp (o
// mesmo texto e a mesma mensagem do fim da /loja) e o caminho para a loja.
export default function FechoHome() {
  const lequeRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: lequeRef, offset: ["start end", "center 55%"] });

  return (
    <section id="contato" aria-labelledby="fecho-titulo" className="relative overflow-hidden bg-[#EDE7D9] pb-20 pt-8 md:pb-28 md:pt-16">
      <div className="mx-auto max-w-[1380px] px-4 text-center md:px-6 lg:px-10 xl:px-14">
        <div ref={lequeRef} aria-hidden className="relative mx-auto h-[250px] w-full max-w-[420px] md:h-[360px] md:max-w-[640px]">
          {LEQUE.map((f, i) => (
            <Carta key={f.foto} progresso={scrollYProgress} lado={f.lado} ordem={i}>
              <Image src={f.foto} alt="" fill sizes="(min-width: 768px) 240px, 150px" className="object-cover" style={{ objectPosition: f.posicao }} />
            </Carta>
          ))}
          <div className="absolute left-1/2 top-[-18px] z-20 h-[76px] w-[76px] translate-x-[38px] md:top-[-26px] md:h-[104px] md:w-[104px] md:translate-x-[56px]">
            <Selo className="absolute inset-0" />
          </div>
        </div>

        <Revela className="mx-auto mt-12 max-w-3xl md:mt-16">
          <p className={`text-[10px] font-bold uppercase tracking-[0.26em] text-brand-gold-text md:text-[11px] ${m.surge}`}>
            Encomendas e personalização
          </p>
          <h2
            id="fecho-titulo"
            className="mt-3 font-[family-name:var(--font-serif)] text-[54px] leading-[0.95] tracking-[-0.015em] text-[#1B4965] min-[400px]:text-[58px] md:text-[104px] xl:text-[120px]"
          >
            <span className={`${m.linha} ${m.linhaJunta}`}>
              <span className={m.sobe} style={atraso(60)}>
                Quer do
              </span>
            </span>{" "}
            <span className={`${m.linha} ${m.linhaJunta}`}>
              <span className={`${m.sobe} italic`} style={atraso(140)}>
                seu jeito?
              </span>
            </span>
          </h2>
          <p className={`mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-brand-muted md:mt-7 md:text-[18px] ${m.surge}`} style={atraso(240)}>
            {PERSONALIZAR}
          </p>
          <div className={`mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center md:mt-10 ${m.surge}`} style={atraso(340)}>
            <a
              href={WA_SEU_JEITO}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full bg-[#1B4965] px-8 text-[11px] font-bold uppercase tracking-[0.2em] text-[#EDE7D9] shadow-[0_14px_30px_-16px_rgba(27,73,101,0.8)] transition-[background-color,transform] duration-300 hover:bg-[#130209] active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9]"
            >
              <IconeWhatsApp className="h-5 w-5" />
              Falar com a Gio
            </a>
            <Link
              href="/loja"
              className="group inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full border border-[#1B4965] px-8 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1B4965] transition-[background-color,color,transform] duration-300 hover:bg-[#1B4965] hover:text-[#EDE7D9] active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9]"
            >
              Ver a loja
              <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-5-5 5 5-5 5" />
              </svg>
            </Link>
          </div>
          <p className={`mt-7 text-[13px] text-brand-muted ${m.surge}`} style={atraso(420)}>
            No Instagram:{" "}
            <a
              href={INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-sm font-[family-name:var(--font-serif)] text-[17px] italic text-[#1B4965] underline decoration-[#b8902a] decoration-1 underline-offset-4 transition-colors hover:text-[#130209] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965]"
            >
              {INSTAGRAM_ARROBA}
            </a>
          </p>
        </Revela>
      </div>
    </section>
  );
}

function Carta({
  children,
  progresso,
  lado,
  ordem,
}: {
  children: React.ReactNode;
  progresso: MotionValue<number>;
  lado: -1 | 0 | 1;
  ordem: number;
}) {
  const parado = useParado();
  const aberto = (v: number) => (parado() ? 1 : Math.min(1, Math.max(0, v)));
  const x = useTransform(progresso, (v) => `${(lado * 66 * aberto(v)).toFixed(2)}%`);
  const y = useTransform(progresso, (v) => `${(lado === 0 ? -6 * aberto(v) : 6 * aberto(v)).toFixed(2)}%`);
  const rotate = useTransform(progresso, (v) => lado * 11 * aberto(v) + (lado === 0 ? 0 : lado * 1.5));
  return (
    <motion.div
      style={{ x, y, rotate, zIndex: lado === 0 ? 3 : 2 - ordem / 10 }}
      className="absolute bottom-0 left-1/2 -ml-[75px] h-[200px] w-[150px] overflow-hidden rounded-[4px] bg-[#e3dccb] shadow-[0_24px_50px_-24px_rgba(19,2,9,0.55)] ring-[5px] ring-[#EDE7D9] md:-ml-[120px] md:h-[320px] md:w-[240px] md:ring-[7px]"
    >
      {children}
    </motion.div>
  );
}
