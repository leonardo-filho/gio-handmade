"use client";

import { motion } from "framer-motion";
import { EASE_ATELIER } from "./animacoes";
import { useReduzirMovimento } from "./useReduzirMovimento";

const PASSOS = [
  {
    numero: "01",
    titulo: "Escolha ou personalize",
    texto: "Monte seu carrinho ou chame no WhatsApp para ajustar cores, pingentes e detalhes.",
  },
  {
    numero: "02",
    titulo: "Medidas por vídeo",
    texto: "Depois do pedido, a Gio te manda um vídeo explicativo para você tirar as medidas.",
  },
  {
    numero: "03",
    titulo: "Confecção artesanal",
    texto:
      "A confecção começa com sinal de 50% (não reembolsável) e o saldo é pago antes do envio.",
  },
];

export default function GuiaAtelie() {
  const reduzir = useReduzirMovimento();

  return (
    <section
      aria-labelledby="guia-atelie-titulo"
      className="border-t border-[#1B4965]/12 bg-[#C8E1E4]/25 py-12 text-[#1B4965] md:py-16"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-2 border-b border-[#1B4965]/15 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-brand-gold-text">
              Ateliê Belém · PA
            </p>
            <h2
              id="guia-atelie-titulo"
              className="mt-1 font-[family-name:var(--font-serif)] text-2xl text-[#1B4965] md:text-3xl"
            >
              Do pedido à entrega, <em className="italic font-normal">feito para você</em>
            </h2>
          </div>
          <p className="text-xs text-brand-muted md:text-sm">
            Peças feitas à mão, sob medida ou à pronta entrega, com envio para todo o Brasil.
          </p>
        </div>

        <div className="mt-7 grid gap-6 md:grid-cols-3 md:gap-8">
          {PASSOS.map((passo, idx) => (
            <motion.div
              key={passo.numero}
              suppressHydrationWarning
              initial={reduzir ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "80px 0px 140px 0px" }}
              transition={{
                duration: reduzir ? 0 : 0.4,
                delay: reduzir ? 0 : idx * 0.08,
                ease: EASE_ATELIER,
              }}
              className="border-l border-[#b8902a]/45 pl-4"
            >
              <span className="text-[10px] font-bold tracking-[0.25em] text-brand-gold-text">
                {passo.numero}
              </span>
              <h3 className="mt-1 font-[family-name:var(--font-serif)] text-xl text-[#1B4965]">
                {passo.titulo}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-brand-muted">{passo.texto}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
