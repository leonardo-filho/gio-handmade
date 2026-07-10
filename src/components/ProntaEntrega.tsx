import Image from "next/image";
import Link from "next/link";
import { Reveal, StaggerGroup, StaggerItem } from "./Reveal";
import { formatBRLPreco } from "@/lib/format";
import { labelParcelamento, parcelamentoCartao } from "@/lib/parcelas";

type Produto = {
  id: number;
  nome: string;
  descricao: string;
  preco: number; // valor à vista no PIX
  precoCartao?: number;
  maxParcelas?: number;
  tamanho?: string;
  src: string;
  mensagem?: string;
};

const WA = "559192982017";

function waLink(produto: Produto) {
  const texto = produto.mensagem
    ?? `Olá, gostaria de comprar o "${produto.nome}" da pronta entrega. Vi no site e tenho interesse!`;
  return `https://wa.me/${WA}?text=${encodeURIComponent(texto)}`;
}

const produtos: Produto[] = [
  {
    id: 1,
    nome: "Conjunto Cristal & Correntes",
    descricao: "Veste do 36 ao 40, regulável no top e na saia. Disponível para envio imediato.",
    preco: 1000,
    tamanho: "36 a 40",
    src: "/conjunto-pronta.png",
    mensagem: "Olá! Vi o Conjunto Cristal & Correntes no site e tenho interesse. Ainda está disponível?",
  },
];

export default function ProntaEntrega() {
  if (produtos.length === 0) return null;

  return (
    <section id="pronta-entrega" className="py-20 bg-[#EDE7D9]">
      <div className="max-w-6xl mx-auto px-4">

        <Reveal className="text-center mb-12">
          <span className="text-[10px] font-bold tracking-[0.3em] text-[#1B4965]/60 uppercase">
            Disponível agora
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-[family-name:var(--font-serif)] text-[#1B4965]">
            Pronta Entrega
          </h2>
          <div className="mt-4 mx-auto w-12 h-px bg-[#1B4965]/30" />
          <p className="mt-4 text-sm text-[#1B4965]/70 font-light max-w-md mx-auto">
            Peças únicas já finalizadas, prontas para envio imediato.
          </p>
        </Reveal>

        <StaggerGroup className="flex flex-wrap justify-center gap-6">
          {produtos.map((produto) => (
            <StaggerItem key={produto.id} className="w-full sm:w-[calc(50%-12px)] md:w-[260px]">
            <Link
              href={waLink(produto)}
              className="group block"
            >
              <div className="relative w-full aspect-[3/4] bg-white overflow-hidden mb-3">
                <Image
                  src={produto.src}
                  alt={produto.nome}
                  fill
                  sizes="(min-width: 768px) 260px, (min-width: 640px) 50vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-[#1B4965]/0 group-hover:bg-[#1B4965]/10 transition-colors duration-500" />
                {produto.tamanho && (
                  <span className="absolute top-2 left-2 bg-[#EDE7D9] text-[#1B4965] text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                    {produto.tamanho}
                  </span>
                )}
              </div>

              <div className="text-center">
                <h3 className="font-[family-name:var(--font-serif)] text-lg text-[#1B4965] group-hover:underline underline-offset-4 decoration-1">
                  {produto.nome}
                </h3>
                <p className="text-xs text-[#1B4965]/60 mt-1 mb-2 leading-relaxed">{produto.descricao}</p>
                <p className="text-sm font-bold text-[#1B4965]">
                  {formatBRLPreco(parcelamentoCartao(produto).total)}{" "}
                  <span className="font-normal text-[#1B4965]/60">
                    {labelParcelamento(parcelamentoCartao(produto))}
                  </span>
                </p>
                <p className="text-xs text-[#1B4965]/50 mt-0.5">
                  ou {formatBRLPreco(produto.preco)} no pix
                </p>
              </div>
            </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>

      </div>
    </section>
  );
}
