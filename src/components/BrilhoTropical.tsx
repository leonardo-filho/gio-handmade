"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Reveal, StaggerGroup, StaggerItem } from "./Reveal";

const WA = "559192982017";
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// Tamanho total planejado da coleção-cápsula (para o teaser "novas peças em breve")
const COLECAO_TOTAL = 4;

// Bandeirinha do Brasil estilizada, repetida em marca d'água no fundo
const FLAG =
  "data:image/svg+xml," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='64' height='46' viewBox='0 0 64 46'><rect width='64' height='46' rx='3' fill='#2f7a45'/><polygon points='32,6 58,23 32,40 6,23' fill='#e8cf4d'/><circle cx='32' cy='23' r='9' fill='#1d3f87'/></svg>"
  );

type Foto = { src: string; alt: string; objectPosition?: string };

type Peca = {
  id: string;
  nome: string;
  tagline: string;
  descricao: string;
  precoPix: string; // valor à vista no Pix
  precoCartao: string; // valor cheio no cartão
  parcelas: string; // melhor parcela sem juros
  producao: string; // prazo de produção da peça
  pagamentos: string[];
  fotos: Foto[]; // a primeira é a foto principal (capa do card)
};

const pecas: Peca[] = [
  {
    id: "top-hexa-e-luxo",
    nome: "Top Hexa é Luxo",
    tagline: "Para torcer com muito estilo e brilho",
    descricao:
      "Feito à mão com miçangas e cristais, esse top é para quem quer torcer com muito estilo e brilho! Confeccionado sob medida, ele reproduz as cores e o formato da bandeira do Brasil. A corrente pode ser dourada ou prata, ficando ao seu critério! Acompanha pulseira combinando.",
    precoPix: "490",
    precoCartao: "549",
    parcelas: "3x de R$ 183 sem juros",
    producao: "até 3 dias úteis para produção",
    pagamentos: [
      "R$ 490 à vista no Pix",
      "R$ 549 em até 3x de R$ 183 sem juros",
      "Ou até 12x com juros pelo Link de Pagamento",
    ],
    fotos: [
      { src: "/colecao/top-hexa-frente-v4.jpg", alt: "Top Hexa é Luxo — vista de frente" },
      { src: "/colecao/top-hexa-bandeira.jpg", alt: "Top Hexa é Luxo — editorial com a bandeira do Brasil" },
      { src: "/colecao/top-hexa-costas.jpg", alt: "Top Hexa é Luxo — detalhe da corrente nas costas" },
    ],
  },
  {
    id: "top-aguas-brasileiras",
    nome: "Top Águas Brasileiras",
    tagline: "Um mergulho de estilo inspirado nas águas do Brasil",
    descricao:
      "Feito à mão com um mix de formatos de miçangas e cristais em tons de azul turquesa, azul royal e detalhes dourados, este top é uma obra de arte que você usa no corpo. Acompanha pingente da bandeira do Brasil que pode ser removido depois — use na Copa e reaproveite! Feito sob medida, a corrente pode ser dourada ou prata, e acompanha pulseira combinando.",
    precoPix: "650",
    precoCartao: "729",
    parcelas: "3x de R$ 243 sem juros",
    producao: "até 4 dias úteis para produção",
    pagamentos: [
      "R$ 650 à vista no Pix",
      "R$ 729 em até 3x de R$ 243 sem juros",
      "Ou até 12x com juros via Link de Pagamento",
    ],
    fotos: [
      { src: "/colecao/top-aguas-frente.jpg", alt: "Top Águas Brasileiras — vista de frente", objectPosition: "60% center" },
      { src: "/colecao/top-aguas-detalhe.jpg", alt: "Top Águas Brasileiras — detalhe das miçangas e do pingente", objectPosition: "70% center" },
      { src: "/colecao/top-aguas-lateral.jpg", alt: "Top Águas Brasileiras — vista lateral", objectPosition: "35% center" },
      { src: "/colecao/top-aguas-costas.jpg", alt: "Top Águas Brasileiras — detalhe da corrente nas costas", objectPosition: "55% center" },
    ],
  },
  {
    id: "top-floresce-brasil",
    nome: "Top Floresce, Brasil!",
    tagline: "Onde a elegância encontra a paixão pelo Brasil",
    descricao:
      "Um top que é pura arte, estruturado em correntes entrelaçadas com pedrarias caídas nas cores da bandeira, criando um efeito cheio de movimento. Possui chocker integrada no pescoço para um look completo e sofisticado. Feito sob medida, a corrente pode ser dourada ou prata, e acompanha pulseira combinando.",
    precoPix: "570",
    precoCartao: "639",
    parcelas: "3x de R$ 213 sem juros",
    producao: "até 4 dias úteis para produção",
    pagamentos: [
      "R$ 570 à vista no Pix",
      "R$ 639 em até 3x de R$ 213 sem juros",
      "Ou até 12x com juros via Link de Pagamento",
    ],
    fotos: [
      { src: "/colecao/top-floresce-frente.jpg", alt: "Top Floresce, Brasil! — vista de frente", objectPosition: "60% center" },
      { src: "/colecao/top-floresce-detalhe.jpg", alt: "Top Floresce, Brasil! — editorial de costas", objectPosition: "35% center" },
      { src: "/colecao/top-floresce-lateral.jpg", alt: "Top Floresce, Brasil! — vista lateral", objectPosition: "35% center" },
      { src: "/colecao/top-floresce-costas.jpg", alt: "Top Floresce, Brasil! — detalhe das correntes nas costas" },
    ],
  },
  {
    id: "chocker-ouro-verde",
    nome: "Chocker Ouro Verde",
    tagline: "Delicada e sofisticada, em verde esmeralda",
    descricao:
      "Uma choker delicada e sofisticada, feita com cristais facetados em tons de verde esmeralda e um pingente do Brasil banhado a ouro. Perfeita para usar sozinha ou em sobreposição com outros colares.",
    precoPix: "70",
    precoCartao: "77",
    parcelas: "2x de R$ 38,50 sem juros",
    producao: "até 2 dias úteis para produção",
    pagamentos: [
      "R$ 70 à vista no Pix",
      "R$ 77 em até 2x de R$ 38,50 sem juros",
      "Ou até 12x com juros via Link de Pagamento",
    ],
    fotos: [
      { src: "/colecao/chocker-ouro-verde-01.jpg", alt: "Chocker Ouro Verde — detalhe dos cristais e pingente do Brasil" },
      { src: "/colecao/chocker-ouro-verde-02.jpg", alt: "Chocker Ouro Verde — segunda foto editorial" },
      { src: "/colecao/chocker-ouro-verde-03.jpg", alt: "Chocker Ouro Verde — terceira foto editorial" },
    ],
  },
];

function waLink(peca: Peca) {
  const texto = `Oi Gio! 🇧🇷 Quero encomendar o "${peca.nome}" da coleção Brilho Tropical. Vi no site!`;
  return `https://wa.me/${WA}?text=${encodeURIComponent(texto)}`;
}

/* ----------------------------- Modal da peça ----------------------------- */

function PecaModal({ peca, onClose }: { peca: Peca; onClose: () => void }) {
  const reduce = useReducedMotion();
  const [foto, setFoto] = useState(0);
  const total = peca.fotos.length;

  const prev = useCallback(() => setFoto((f) => (f - 1 + total) % total), [total]);
  const next = useCallback(() => setFoto((f) => (f + 1) % total), [total]);

  // Esc fecha · setas navegam · trava o scroll do fundo
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, prev, next]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={peca.nome}
      className="fixed inset-0 z-[70] flex items-stretch justify-center overflow-y-auto bg-[#130209]/65 p-0 backdrop-blur-sm md:items-center md:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.3, ease: EASE_OUT_EXPO }}
      onClick={onClose}
    >
      <motion.div
        className="relative my-auto flex w-full max-w-4xl flex-col overflow-hidden bg-[#EDE7D9] text-[#1B4965] shadow-2xl md:max-h-[90vh] md:flex-row md:rounded-sm"
        initial={{ opacity: 0, y: reduce ? 0 : 28, scale: reduce ? 1 : 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: reduce ? 0 : 28, scale: reduce ? 1 : 0.98 }}
        transition={{ duration: reduce ? 0 : 0.45, ease: EASE_OUT_EXPO }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fechar */}
        <button
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-[#EDE7D9]/90 text-[#1B4965] shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965]"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* ---------- Slider de fotos ---------- */}
        <div className="relative w-full shrink-0 bg-[#130209]/5 md:w-1/2">
          <div className="relative aspect-[3/4] w-full overflow-hidden md:aspect-auto md:h-full">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={foto}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.4, ease: EASE_OUT_EXPO }}
              >
                <Image
                  src={peca.fotos[foto].src}
                  alt={peca.fotos[foto].alt}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  quality={90}
                  className="object-cover"
                  style={{ objectPosition: peca.fotos[foto].objectPosition ?? "center" }}
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {total > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Foto anterior"
                  onClick={prev}
                  className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#EDE7D9]/85 text-[#1B4965] shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965]"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Próxima foto"
                  onClick={next}
                  className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#EDE7D9]/85 text-[#1B4965] shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965]"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                  {peca.fotos.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Ver foto ${i + 1}`}
                      aria-current={i === foto}
                      onClick={() => setFoto(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === foto ? "w-6 bg-[#EDE7D9]" : "w-1.5 bg-[#EDE7D9]/55 hover:bg-[#EDE7D9]/80"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ---------- Detalhes ---------- */}
        <div className="flex w-full flex-col overflow-y-auto px-6 py-7 md:w-1/2 md:px-9 md:py-9">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#2f7a45]">
            Brilho Tropical · Edição limitada
          </p>
          <h3 className="mt-3 font-[family-name:var(--font-serif)] text-3xl leading-tight text-[#1B4965] md:text-4xl">
            {peca.nome}
          </h3>
          <p className="mt-1 font-[family-name:var(--font-serif)] text-base italic text-[#1B4965]/70">
            {peca.tagline}
          </p>

          {/* Preço */}
          <div className="mt-6 border-t border-[#1B4965]/15 pt-5">
            <div className="flex items-baseline gap-2">
              <span className="font-[family-name:var(--font-serif)] text-4xl font-medium tabular-nums text-[#1B4965]">
                R$ {peca.precoPix}
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#2f7a45]">no Pix</span>
            </div>
            <p className="mt-1 text-sm text-[#1B4965]/65">
              ou R$ {peca.precoCartao} em até {peca.parcelas}
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-[#2f7a45]">
              {peca.producao}
            </p>
          </div>

          {/* Descrição */}
          <p className="mt-6 text-sm font-light leading-relaxed text-[#1B4965]/85">{peca.descricao}</p>

          {/* Meios de pagamento */}
          <div className="mt-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#1B4965]/55">
              Meios de pagamento
            </p>
            <ul className="mt-3 space-y-2">
              {peca.pagamentos.map((p, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[#1B4965]/85">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: ["#2f7a45", "#b8902a", "#1d3f87"][i % 3] }}
                  />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <a
            href={waLink(peca)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex items-center justify-center gap-2.5 rounded-sm bg-[#1B4965] px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#EDE7D9] transition-colors duration-300 hover:bg-[#130209] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7D9]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-4 w-4">
              <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.821 9.821 0 001.519 5.26l-.999 3.648 3.97-1.317zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
            Encomendar pelo WhatsApp
          </a>
          <p className="mt-3 text-center text-[11px] uppercase tracking-[0.22em] text-[#1B4965]/45">
            Sob medida · feito à mão
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------ Card da peça ----------------------------- */

function PecaCard({ peca, numero, onOpen }: { peca: Peca; numero: number; onOpen: () => void }) {
  const n = String(numero).padStart(2, "0");
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group block w-full text-left transition-transform duration-300 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4965] focus-visible:ring-offset-4 focus-visible:ring-offset-[#EDE7D9]"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-white">
        <Image
          src={peca.fotos[0].src}
          alt={peca.fotos[0].alt}
          fill
          sizes="(min-width: 768px) 360px, (min-width: 640px) 50vw, 100vw"
          quality={90}
          className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          style={{ objectPosition: peca.fotos[0].objectPosition ?? "center" }}
        />
        {/* Gradiente + 'ver detalhes' no hover */}
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-center bg-gradient-to-t from-[#130209]/55 to-transparent pb-5 pt-16 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#EDE7D9]">
            Ver detalhes
            <svg width="16" height="8" viewBox="0 0 22 10" fill="none" aria-hidden>
              <path d="M1 5H20M20 5L16 1M20 5L16 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </span>
        </div>
        {/* Moldura fina (luxo discreto) */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-3 z-10 border border-[#EDE7D9]/0 transition-colors duration-500 group-hover:border-[#EDE7D9]/70"
        />
      </div>

      <div className="mt-5 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#2f7a45]">
          Edição limitada · Nº {n}
        </p>
        <h3 className="mt-2 font-[family-name:var(--font-serif)] text-2xl text-[#1B4965] underline-offset-4 group-hover:underline">
          {peca.nome}
        </h3>
        <p className="mt-1 font-[family-name:var(--font-serif)] text-sm text-[#1B4965]/75">
          {peca.producao}
        </p>
        <p className="mt-2 font-[family-name:var(--font-serif)] text-lg text-[#1B4965]">
          <span className="font-medium tabular-nums">R$ {peca.precoPix}</span>{" "}
          <span className="text-sm not-italic text-[#2f7a45]">no Pix</span>
        </p>
        <p className="mt-0.5 text-xs text-[#1B4965]/55">
          ou R$ {peca.precoCartao} em até {peca.parcelas}
        </p>
      </div>
    </button>
  );
}

/* -------------------------------- Seção ---------------------------------- */

export default function BrilhoTropical() {
  const [abertaId, setAbertaId] = useState<string | null>(null);
  const aberta = pecas.find((p) => p.id === abertaId) ?? null;
  const faltam = COLECAO_TOTAL - pecas.length;

  return (
    <section
      id="brilho-tropical"
      className="relative scroll-mt-28 overflow-hidden bg-[#EDE7D9] py-24 text-[#1B4965] md:py-32"
    >
      {/* Marca d'água de bandeirinhas */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
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

      <div className="relative mx-auto max-w-6xl px-4">
        {/* ---------- Header de identidade ---------- */}
        <Reveal className="mx-auto max-w-5xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#2f7a45]">
            a coleção · já chegou
          </p>

          <h2 className="mt-4 font-brand leading-[1.05] tracking-[-0.01em] text-[#1B4965] text-[clamp(2.75rem,11vw,6.5rem)]">
            Brilho Tropical
          </h2>

          <p className="mx-auto mt-5 max-w-md font-[family-name:var(--font-serif)] text-lg italic leading-snug text-[#1B4965]/70 md:text-xl">
            uma coleção para quem nunca parou de sonhar com o hexa
          </p>

          <div className="mx-auto mt-7 h-px w-14 bg-[#2f7a45]/60" />
        </Reveal>

        {/* ---------- Galeria editorial das peças ---------- */}
        <StaggerGroup className="mx-auto mt-14 grid max-w-6xl grid-cols-1 justify-items-center gap-x-8 gap-y-12 sm:grid-cols-2 md:mt-20 lg:grid-cols-4">
          {pecas.map((peca, i) => (
            <StaggerItem key={peca.id} className="w-full max-w-[340px]">
              <PecaCard peca={peca} numero={i + 1} onOpen={() => setAbertaId(peca.id)} />
            </StaggerItem>
          ))}
        </StaggerGroup>

        {/* ---------- Teaser das próximas peças ---------- */}
        {faltam > 0 && (
          <Reveal className="mt-16 text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#1B4965]/45">
              {faltam === 1 ? "Mais 1 peça da coleção chega em breve" : `Mais ${faltam} peças da coleção chegam em breve`}
            </p>
          </Reveal>
        )}
      </div>

      <AnimatePresence>
        {aberta && <PecaModal peca={aberta} onClose={() => setAbertaId(null)} />}
      </AnimatePresence>
    </section>
  );
}
