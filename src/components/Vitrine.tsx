import Image from "next/image";
import { Reveal, StaggerGroup, StaggerItem } from "./Reveal";
import AddToCartButton from "./cart/AddToCartButton";
import SolarisSlotCard from "./solaris/SolarisSlotCard";
import { produtos, categoriasOrdem, type Produto } from "@/data/produtos";
import { solarisSlots, SOLARIS_WAITLIST } from "@/data/solaris";
import { formatBRL } from "@/lib/format";

function ProdutoCard({ produto }: { produto: Produto }) {
  return (
    <div className="group flex h-full flex-col">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-white">
        <Image
          src={produto.foto}
          alt={produto.nome}
          fill
          sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />
        {produto.prontaEntrega && (
          <span className="absolute left-2 top-2 bg-[#2f7a45] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
            Pronta entrega
          </span>
        )}
        {produto.tamanho && (
          <span className="absolute right-2 top-2 bg-[#EDE7D9] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1B4965]">
            {produto.tamanho}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col text-center">
        <h3 className="font-[family-name:var(--font-serif)] text-xl text-[#1B4965]">{produto.nome}</h3>
        <p className="mt-1 text-xs leading-relaxed text-[#1B4965]/60">{produto.descricao}</p>

        <div className="mt-3">
          {produto.aPartirDe && (
            <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-[#1B4965]/45">
              a partir de
            </span>
          )}
          <p className="font-[family-name:var(--font-serif)] text-lg font-medium tabular-nums text-[#1B4965]">
            {formatBRL(produto.preco)}
          </p>
          {produto.producao && (
            <p className="mt-0.5 text-[11px] text-[#1B4965]/50">{produto.producao} de produção</p>
          )}
        </div>

        <div className="mt-4 flex justify-center pt-1">
          <AddToCartButton
            item={{
              id: produto.id,
              nome: produto.nome,
              preco: produto.preco,
              foto: produto.foto,
              categoria: produto.categoria,
              aPartirDe: produto.aPartirDe,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function Vitrine() {
  return (
    <section className="bg-white py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        {/* Intro */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#1B4965]/60">
            a vitrine
          </span>
          <h1 className="mt-3 font-[family-name:var(--font-serif)] text-4xl text-[#1B4965] md:text-5xl">
            Todas as peças
          </h1>
          <div className="mx-auto mt-4 h-px w-14 bg-[#1B4965]/30" />
          <p className="mx-auto mt-5 max-w-md text-sm font-light leading-relaxed text-[#1B4965]/70">
            Monte seu carrinho, calcule o frete e finalize pelo WhatsApp. Peças feitas à mão,
            sob encomenda, enviamos para todo o Brasil a partir de Belém.
          </p>
        </Reveal>

        {/* Grupos por categoria */}
        <div className="mt-16 space-y-16 md:mt-20">
          {/* Coleção Solaris — nova coleção de verão, chegando em breve */}
          <div>
            <Reveal className="mb-8 flex items-center gap-3">
              <h2 className="shrink-0 font-[family-name:var(--font-serif)] text-2xl text-[#1B4965] md:text-3xl">
                Coleção Solaris
              </h2>
              <span className="shrink-0 rounded-full bg-[#b8902a]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#b8902a]">
                em breve
              </span>
              <span className="h-px flex-1 bg-[#1B4965]/15" />
            </Reveal>

            <StaggerGroup className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
              {solarisSlots.map((slot) => (
                <StaggerItem key={slot.id}>
                  <SolarisSlotCard slot={slot} />
                </StaggerItem>
              ))}
            </StaggerGroup>

            <div className="mt-8 text-center">
              <a
                href={SOLARIS_WAITLIST}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-[#1B4965] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1B4965] transition-colors hover:bg-[#1B4965] hover:text-[#EDE7D9]"
              >
                Entrar na lista de espera da Solaris
              </a>
            </div>
          </div>

          {categoriasOrdem.map((cat) => {
            const itens = produtos.filter((p) => p.categoria === cat);
            if (itens.length === 0) return null;
            return (
              <div key={cat}>
                <Reveal className="mb-8 flex items-center gap-4">
                  <h2 className="shrink-0 font-[family-name:var(--font-serif)] text-2xl text-[#1B4965] md:text-3xl">
                    {cat}
                  </h2>
                  <span className="h-px flex-1 bg-[#1B4965]/15" />
                </Reveal>

                <StaggerGroup className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
                  {itens.map((produto) => (
                    <StaggerItem key={produto.id}>
                      <ProdutoCard produto={produto} />
                    </StaggerItem>
                  ))}
                </StaggerGroup>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
