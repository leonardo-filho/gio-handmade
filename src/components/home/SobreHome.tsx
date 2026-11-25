"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { atraso } from "@/components/vitrine/movimento";
import { useParado } from "./parado";
import Revela from "./Revela";
import m from "./home.module.css";
import { SOBRE } from "./textos";

// Quem faz: a Giovanna, com a foto dela, a frase dela em letra grande (as
// palavras se acendem uma a uma enquanto a página rola) e a assinatura que
// se escreve sozinha.
export default function SobreHome() {
  const fotoRef = useRef<HTMLDivElement>(null);
  const parado = useParado();
  const { scrollYProgress } = useScroll({ target: fotoRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, (v) => (parado() ? "0%" : `${((v - 0.5) * 12).toFixed(2)}%`));

  return (
    <section id="sobre" aria-labelledby="sobre-titulo" className="relative overflow-hidden bg-[#EDE7D9] pb-20 pt-16 md:pb-24 md:pt-24">
      <div className="mx-auto max-w-[1380px] px-4 md:px-6 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-7 lg:px-10 xl:px-14">
        <Revela className="lg:col-span-6 lg:col-start-7 lg:row-start-1">
          <p className={`text-[10px] font-bold uppercase tracking-[0.26em] text-brand-gold-text md:text-[11px] ${m.surge}`}>Quem faz</p>
          <h2
            id="sobre-titulo"
            className="mt-3 font-[family-name:var(--font-serif)] text-[46px] leading-[0.98] tracking-[-0.015em] text-[#1B4965] min-[400px]:text-[50px] md:text-[76px] xl:text-[88px]"
          >
            <span className={m.linha}>
              <span className={m.sobe} style={atraso(60)}>
                Uma mulher,
              </span>
            </span>
            <span className={m.linha}>
              <span className={`${m.sobe} italic`} style={atraso(140)}>
                múltiplas criações.
              </span>
            </span>
          </h2>
        </Revela>

        <div className="relative mt-10 md:max-w-[480px] lg:col-span-5 lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:mt-0 lg:max-w-none">
          <Revela>
            <div ref={fotoRef} className={`relative aspect-[4/5] overflow-hidden rounded-[3px] bg-[#C8E1E4] lg:aspect-[3/4] ${m.cortina}`}>
              <div className={`absolute inset-0 ${m.respira}`}>
                <motion.div style={{ y }} className="absolute -inset-y-[7%] inset-x-0">
                  <Image
                    src="/eu.jpeg"
                    alt="Giovanna Alves, artesã da Gio Handmade"
                    fill
                    sizes="(min-width: 1024px) 38vw, 100vw"
                    className="object-cover"
                    style={{ objectPosition: "50% 30%" }}
                  />
                </motion.div>
              </div>
            </div>
          </Revela>
          <Anel className="absolute -bottom-10 right-3 h-[104px] w-[104px] md:h-[136px] md:w-[136px] lg:-right-12" />
        </div>

        <div className="mt-16 lg:col-span-6 lg:col-start-7 lg:row-start-2 lg:mt-20">
          <Citacao texto={SOBRE.citacao} />
          <Revela className="mt-8 max-w-xl space-y-4 text-[15px] leading-relaxed text-brand-muted md:mt-10 md:text-[17px]">
            <p className={m.surge}>{SOBRE.ola}</p>
            <p className={m.surge} style={atraso(80)}>
              {SOBRE.feito}
            </p>
            <p className={m.surge} style={atraso(160)}>
              {SOBRE.encomenda}
            </p>
          </Revela>
          <Revela className="mt-8 md:mt-10">
            <p
              className={`whitespace-nowrap font-[family-name:var(--font-script)] text-[44px] leading-none text-[#1B4965] md:text-[56px] ${m.assina}`}
              style={atraso(200)}
            >
              Giovanna Alves
            </p>
            <ul className={`mt-7 flex flex-wrap gap-2 ${m.surge}`} style={atraso(320)}>
              {SOBRE.selos.map((s, i) => (
                <li
                  key={s}
                  className={`rounded-full px-4 py-2 text-[10.5px] font-bold uppercase tracking-[0.18em] ${
                    i === SOBRE.selos.length - 1 ? "bg-[#1B4965] text-[#EDE7D9]" : "border border-[#1B4965]/30 text-[#1B4965]"
                  }`}
                >
                  {s}
                </li>
              ))}
            </ul>
          </Revela>
        </div>
      </div>
    </section>
  );
}

// A frase em letra grande: cada palavra começa apagada e se acende quando a
// linha de leitura (no meio da tela) passa por ela.
function Citacao({ texto }: { texto: string }) {
  const ref = useRef<HTMLQuoteElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 88%", "end 52%"] });
  const palavras = texto.split(" ");
  return (
    <blockquote ref={ref} className="relative">
      <span
        aria-hidden
        className="absolute -left-1 -top-9 font-[family-name:var(--font-serif)] text-[96px] leading-none text-[#b8902a]/45 md:-left-4 md:-top-14 md:text-[140px]"
      >
        “
      </span>
      <p className="relative font-[family-name:var(--font-serif)] text-[32px] italic leading-[1.12] tracking-[-0.01em] text-[#1B4965] min-[400px]:text-[34px] md:text-[48px] xl:text-[54px]">
        <span className="sr-only">{texto}</span>
        <span aria-hidden>
          {palavras.map((p, i) => (
            <Palavra key={i} progresso={scrollYProgress} inicio={i / palavras.length} fim={(i + 1) / palavras.length}>
              {p}
            </Palavra>
          ))}
        </span>
      </p>
    </blockquote>
  );
}

function Palavra({
  children,
  progresso,
  inicio,
  fim,
}: {
  children: string;
  progresso: MotionValue<number>;
  inicio: number;
  fim: number;
}) {
  const parado = useParado();
  const opacidade = useTransform(progresso, (v) => {
    if (parado()) return 1;
    const t = Math.min(1, Math.max(0, (v - inicio) / (fim - inicio)));
    return 0.16 + t * 0.84;
  });
  return (
    <>
      <motion.span style={{ opacity: opacidade }}>{children}</motion.span>{" "}
    </>
  );
}

// Anel de linha (como o selo da /loja): o nome dela e a cidade em volta de
// um botão de bordado, girando só quando a página rola.
function Anel({ className = "" }: { className?: string }) {
  const parado = useParado();
  const { scrollY } = useScroll();
  const giro = useTransform(scrollY, (v) => (parado() ? 0 : v * 0.07));
  return (
    <div aria-hidden className={`pointer-events-none select-none ${className}`}>
      <span className="absolute inset-0 rounded-full bg-[#EDE7D9] shadow-[0_18px_40px_-18px_rgba(19,2,9,0.45)]" />
      <motion.svg viewBox="0 0 100 100" style={{ rotate: giro }} className="absolute inset-0 h-full w-full">
        <defs>
          <path id="sobre-anel" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
        </defs>
        <text fill="#7d611c" fontSize="7.6" fontWeight="700" style={{ fontFamily: "var(--font-sans), sans-serif", textTransform: "uppercase" }}>
          <textPath href="#sobre-anel" textLength="236" lengthAdjust="spacing">
            Giovanna Alves · feito à mão · Belém ·
          </textPath>
        </text>
      </motion.svg>
      <span className="absolute inset-[30%] flex items-center justify-center rounded-full bg-[#1B4965] font-[family-name:var(--font-script)] text-[26px] leading-none text-[#EDE7D9] shadow-[0_0_0_1.5px_#b8902a,0_0_0_4px_#EDE7D9] md:text-[34px]">
        G
      </span>
    </div>
  );
}
