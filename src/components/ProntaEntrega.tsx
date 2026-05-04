import Image from "next/image";
import Link from "next/link";

type Produto = {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  parcelamento?: string;
  tamanho?: string;
  src: string;
  mensagem?: string; // mensagem personalizada no WhatsApp; se omitida, usa o padrão
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
    descricao: "Veste do 36 ao 40 — regulável no top e na saia. Disponível para envio imediato.",
    preco: 1000,
    parcelamento: "até 3x sem juros",
    tamanho: "36–40",
    src: "/conjunto-pronta.jpeg",
    mensagem: "Olá! Vi o Conjunto Cristal & Correntes no site e tenho interesse. Ainda está disponível?",
  },
  // Adicione mais peças aqui
];

export default function ProntaEntrega() {
  if (produtos.length === 0) return null;

  return (
    <section id="pronta-entrega" className="py-20 bg-stone-50">
      <div className="max-w-6xl mx-auto px-4">

        <div className="text-center mb-12">
          <span className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
            Disponível agora
          </span>
          <h2 className="mt-2 text-3xl md:text-4xl font-serif text-gray-900">
            Pronta Entrega
          </h2>
          <p className="mt-3 text-sm text-gray-500 font-light max-w-md mx-auto">
            Peças únicas já finalizadas, prontas para envio imediato.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {produtos.map((produto) => (
            <Link
              key={produto.id}
              href={waLink(produto)}
              className="group w-full sm:w-[calc(50%-12px)] md:w-[220px]"
            >
              {/* Foto */}
              <div className="relative w-full aspect-[3/4] bg-stone-200 overflow-hidden mb-3">
                <Image
                  src={produto.src}
                  alt={produto.nome}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                {produto.tamanho && (
                  <span className="absolute top-2 left-2 bg-white/90 text-gray-700 text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                    {produto.tamanho}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="text-center">
                <h3 className="font-serif text-base text-gray-900 group-hover:underline underline-offset-4 decoration-1">
                  {produto.nome}
                </h3>
                <p className="text-xs text-gray-500 mt-1 mb-2 leading-relaxed">{produto.descricao}</p>
                <p className="text-sm font-bold text-gray-900">
                  R$ {produto.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                {produto.parcelamento && (
                  <p className="text-xs text-gray-400 mt-0.5">{produto.parcelamento}</p>
                )}
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
