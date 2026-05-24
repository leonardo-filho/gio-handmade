"use client";

import Image from "next/image";
import { Reveal } from "../Reveal";
import CatalogFrame from "./CatalogFrame";

type Product = {
  code: string;
  category: string;
  name: string;
  description: string;
  materials: string;
  production: string;
  price: string;
  custom: string;
  image: string;
  imageObjectPos?: string;
};

const products: Product[] = [
  {
    code: "01",
    category: "TOP",
    name: "Top Beaded",
    description:
      "Top em camadas de missangas e pedrarias que descem do busto até a cintura formando uma cortina brilhante. Decote em V e amarração no pescoço. Combina com saia preta básica, jeans ou calça de alfaiataria pra quebrar o brilho.",
    materials: "Missangas, contas e pedrarias aplicadas à mão",
    production: "10 a 15 dias úteis",
    price: "R$ 550",
    custom: "Personalizável em cor, tamanho e tipo de pedraria.",
    image: "/tops.png",
  },
  {
    code: "02",
    category: "CONJUNTO",
    name: "Conjunto Cristais",
    description:
      "Top e saia totalmente cobertos de cristais e correntes prateadas, com gotas que se movem ao caminhar. A peça mais elaborada da coleção — pensada para noite, festa e ocasião grande. Brilha sem precisar de holofote.",
    materials: "Cristais facetados, correntes prateadas, pedrarias",
    production: "25 a 30 dias úteis",
    price: "R$ 1.000",
    custom: "Personalizável em cor, tamanho e densidade da pedraria.",
    image: "/conjuntos.png",
  },
  {
    code: "03",
    category: "SAIA",
    name: "Saia Conchas",
    description:
      "Saia curta em cristais e conchas naturais, com franjas longas que dançam com o corpo. Acompanha choker e detalhes no busto que fecham o look. Tem cara de praia, mas funciona em qualquer festa que pede algo diferente.",
    materials: "Cristais, conchas naturais, correntes",
    production: "15 a 20 dias úteis",
    price: "R$ 600",
    custom: "Personalizável em cor, comprimento e tipo de aplicação.",
    image: "/saias.png",
  },
  {
    code: "04",
    category: "TOP",
    name: "Top Cristais",
    description:
      "Top em correntes prateadas com pedrarias pretas e cristais em fileiras horizontais. Decote em V profundo, costas livres e ponta na cintura. Combina fácil com saia ou calça preta pra um look mais editorial.",
    materials: "Correntes prateadas, cristais facetados, pedrarias pretas",
    production: "10 a 15 dias úteis",
    price: "R$ 500",
    custom: "Personalizável em cor, tamanho e tipo de pedraria.",
    image: "/peca-preta-correntes.png",
  },
  {
    code: "05",
    category: "CONJUNTO",
    name: "Conjunto Pedrarias",
    description:
      "Conjunto de top e saia em correntes prateadas com pedrarias pretas e cristais formando padrão geométrico. A saia termina em desenho escamado que dá movimento ao caminhar. Peça de muito brilho — perfeita para festas, festivais e ensaios.",
    materials: "Correntes prateadas, pedrarias pretas, cristais",
    production: "7 dias úteis",
    price: "R$ 1.300",
    custom: "Personalizável em cor da pedraria, tamanho e densidade da malha.",
    image: "/conjunto-pronta.png",
  },
  {
    code: "06",
    category: "VESTIDO",
    name: "Vestido Cristais",
    description:
      "Vestido inteiro em correntes e cristais facetados, em tons de verde, vinho e preto. As fileiras descem em curvas pelo corpo, criando um drapeado natural que veste bem qualquer formato. Pensado pra ocasiões em que a peça é o look todo.",
    materials: "Cristais facetados, correntes prateadas",
    production: "25 a 30 dias úteis",
    price: "R$ 1.000",
    custom: "Personalizável em cor, comprimento e densidade da pedraria.",
    image: "/vestido.png",
  },
  {
    code: "07",
    category: "ACESSÓRIO",
    name: "Headpiece",
    description:
      "Tiara delicada em correntes finas, pedrarias pretas e cristais que caem na testa. Combina com qualquer peça da coleção e transforma um look básico em algo memorável. Ótima como primeira Gio Handmade.",
    materials: "Correntes finas, cristais, pedrarias",
    production: "5 a 7 dias úteis",
    price: "R$ 150",
    custom: "Personalizável em cor, formato e tipo de aplicação.",
    image: "/headpiece.png",
  },
];

function ProductCard({ product, index }: { product: Product; index: number }) {
  const reverse = index % 2 === 1;
  const totalPad = "py-24 md:py-32";

  return (
    <article
      id={`peca-${product.code}`}
      className={`relative bg-[#EDE7D9] text-[#130209] ${totalPad}`}
    >
      {/* page strip */}
      <div className="flex items-center justify-between px-6 md:px-14 text-[10px] md:text-[11px] tracking-[0.28em] uppercase font-[family-name:var(--font-display)] text-[#130209]/55 absolute top-6 md:top-8 left-0 right-0">
        <span>GIO HANDMADE · MODELO {product.code}/07</span>
        <span>{product.category}</span>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-14">
        <div className={`grid md:grid-cols-12 gap-12 md:gap-16 items-center ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}>
          {/* image */}
          <Reveal className="md:col-span-7">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#130209]/5">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(min-width: 768px) 55vw, 100vw"
                className="object-cover"
                style={{ objectPosition: product.imageObjectPos ?? "center" }}
              />
              {/* corner price tag */}
              <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 bg-[#EDE7D9]/95 backdrop-blur-sm border border-[#130209]/15">
                <span className="block w-1.5 h-1.5 rounded-full bg-[#1B4965]" />
                <span className="text-[9px] tracking-[0.4em] uppercase font-[family-name:var(--font-display)] text-[#130209]/75">
                  #{product.code} · {product.category}
                </span>
              </div>
            </div>
          </Reveal>

          {/* meta */}
          <div className="md:col-span-5">
            <Reveal>
              <p className="text-[11px] tracking-[0.42em] uppercase font-[family-name:var(--font-display)] text-[#130209]/55">
                {product.category} · {product.code}
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <h3 className="mt-3 font-[family-name:var(--font-display)] font-black uppercase leading-[0.86] tracking-[-0.035em] text-[#130209] text-[clamp(2.4rem,5vw,4.4rem)]">
                {product.name}
              </h3>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-6 font-[family-name:var(--font-serif)] text-[#130209]/80 text-[15px] leading-relaxed">
                {product.description}
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <dl className="mt-8 grid grid-cols-1 gap-3 text-[12px] font-[family-name:var(--font-display)] tracking-[0.16em] uppercase">
                <div className="flex items-start gap-3 border-t border-[#130209]/15 pt-3">
                  <dt className="w-28 shrink-0 text-[#130209]/55 text-[10px] tracking-[0.32em]">Materiais</dt>
                  <dd className="text-[#130209]/85 normal-case tracking-normal font-normal font-[family-name:var(--font-serif)] text-[14px]">
                    {product.materials}
                  </dd>
                </div>
                <div className="flex items-start gap-3 border-t border-[#130209]/15 pt-3">
                  <dt className="w-28 shrink-0 text-[#130209]/55 text-[10px] tracking-[0.32em]">Produção</dt>
                  <dd className="text-[#130209]/85 normal-case tracking-normal font-normal font-[family-name:var(--font-serif)] text-[14px]">
                    {product.production}
                  </dd>
                </div>
                <div className="flex items-start gap-3 border-t border-[#130209]/15 pt-3">
                  <dt className="w-28 shrink-0 text-[#130209]/55 text-[10px] tracking-[0.32em]">Personaliza</dt>
                  <dd className="text-[#130209]/85 normal-case tracking-normal font-normal font-[family-name:var(--font-serif)] text-[14px]">
                    {product.custom}
                  </dd>
                </div>
              </dl>
            </Reveal>

            <Reveal delay={0.26}>
              <div className="mt-8 flex items-end justify-between gap-6 border-t border-[#130209]/30 pt-6">
                <div>
                  <span className="block text-[10px] tracking-[0.4em] uppercase font-[family-name:var(--font-display)] text-[#130209]/55">
                    A partir de
                  </span>
                  <span className="block mt-1 font-[family-name:var(--font-display)] font-black text-[#130209] text-3xl md:text-4xl tracking-tight">
                    {product.price}
                  </span>
                </div>
                <a
                  href={`https://wa.me/559192982017?text=${encodeURIComponent(
                    `Oi Gio! Quero saber mais sobre a peça ${product.name} (#${product.code}).`,
                  )}`}
                  className="inline-flex items-center gap-3 px-5 py-3 bg-[#130209] text-[#EDE7D9] text-[10px] tracking-[0.32em] uppercase font-[family-name:var(--font-display)] hover:bg-[#1B4965] transition-colors"
                >
                  Encomendar
                  <svg width="18" height="9" viewBox="0 0 22 10" fill="none">
                    <path d="M1 5H20M20 5L16 1M20 5L16 9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                  </svg>
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Products() {
  return (
    <section id="produtos" className="bg-[#EDE7D9]">
      {products.map((p, i) => (
        <ProductCard key={p.code} product={p} index={i} />
      ))}
    </section>
  );
}
