"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Reveal } from "./Reveal";

// Estreia da coleção (Copa). "SAVE THE DATE 08/06/26"
const LAUNCH = new Date("2026-06-08T00:00:00-03:00");

const WA_LINK =
  "https://wa.me/559192982017?text=" +
  encodeURIComponent(
    "Olá! Quero ser avisada do lançamento da Coleção Brilho Tropical (edição Copa). Me avisa quando abrir a pré-venda!"
  );

// Bandeirinha do Brasil estilizada, repetida em marca d'água no fundo
const FLAG =
  "data:image/svg+xml," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='64' height='46' viewBox='0 0 64 46'><rect width='64' height='46' rx='3' fill='#2f7a45'/><polygon points='32,6 58,23 32,40 6,23' fill='#e8cf4d'/><circle cx='32' cy='23' r='9' fill='#1d3f87'/></svg>"
  );

function useDaysLeft(target: Date) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, launched: true };
  return { days: Math.ceil(diff / 86_400_000), launched: false };
}

export default function BrilhoTropical() {
  const countdown = useDaysLeft(LAUNCH);
  const launched = countdown?.launched ?? false;

  return (
    <section
      id="brilho-tropical"
      className="relative scroll-mt-24 overflow-hidden bg-[#EDE7D9] py-20 text-[#1B4965] md:py-28"
    >
      {/* Marca d'água de bandeirinhas */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `url("${FLAG}")`,
          backgroundSize: "92px auto",
          transform: "rotate(-12deg) scale(1.45)",
          transformOrigin: "center",
        }}
      />
      {/* Lavagem tropical verde/amarela vinda de baixo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#EDE7D9] via-[#EDE7D9]/85 to-[#c6d1a0]/55"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-1/2 h-64 w-[120%] -translate-x-1/2 bg-[#e6d488]/25 blur-[90px]"
      />

      <div className="relative mx-auto max-w-3xl px-4 text-center">
        <Reveal>
          <p className="font-[family-name:var(--font-serif)] text-xl italic text-[#1B4965]/70 md:text-2xl">
            {launched ? "já chegou…" : "vem aí…"}
          </p>

          <h2 className="mt-3 font-brand uppercase leading-[0.95] tracking-[0.04em] text-[#1B4965]">
            <span className="block text-7xl sm:text-8xl md:text-9xl">Brilho</span>
            <span className="block text-7xl sm:text-8xl md:text-9xl">Tropical</span>
          </h2>

          <p className="mx-auto mt-5 max-w-md font-[family-name:var(--font-serif)] text-lg italic leading-snug text-[#1B4965]/75 md:text-xl">
            uma coleção para quem nunca parou de sonhar com o hexa
          </p>

          {/* Conceito */}
          <div className="mx-auto mt-9 max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#1B4965]/55">
              O conceito
            </p>
            <p className="mt-3 text-base font-light leading-relaxed text-[#1B4965]/80 md:text-lg">
              Uma coleção que valoriza as cores, a cultura e a{" "}
              <span className="font-medium text-[#1B4965] underline decoration-[#2f7a45] decoration-2 underline-offset-4">
                identidade brasileira
              </span>
              . Muito <span className="font-medium text-[#2f7a45]">verde</span>,{" "}
              <span className="font-medium text-[#b8902a]">amarelo</span> e{" "}
              <span className="font-medium text-[#1d3f87]">azul</span>. Sobretudo,
              peças que representam o Brasil.
            </p>
          </div>

          {/* Save the date */}
          <div className="mt-12">
            <p className="font-[family-name:var(--font-serif)] text-sm uppercase tracking-[0.4em] text-[#1B4965]/80">
              Save the Date
            </p>
            <p className="mt-2 font-[family-name:var(--font-serif)] text-4xl font-medium tracking-[0.08em] text-[#1B4965] md:text-5xl">
              08 · 06 · 26
            </p>
            {!launched && countdown && (
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[#2f7a45]">
                {countdown.days === 1
                  ? "falta 1 dia para a estreia"
                  : `faltam ${countdown.days} dias para a estreia`}
              </p>
            )}
          </div>

          <div className="mt-10">
            <Link
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-sm bg-[#1B4965] px-9 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-[#EDE7D9] transition-colors duration-300 hover:bg-[#130209] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9]"
            >
              {launched ? "Ver a coleção" : "Quero ser avisada"}
            </Link>
          </div>

          <p className="mt-8 text-[11px] uppercase tracking-[0.25em] text-[#1B4965]/45">
            Edição limitada · feito à mão em Belém
          </p>
        </Reveal>
      </div>
    </section>
  );
}
