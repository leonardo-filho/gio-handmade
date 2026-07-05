import { Reveal, StaggerGroup, StaggerItem } from "./Reveal";
import ProdutoCard from "./loja/ProdutoCard";
import LojaNav from "./loja/LojaNav";
import { produtos, categoriasOrdem, colecaoSolaris, secaoVitrine, secaoId } from "@/data/produtos";

export default function Vitrine() {
  // Seções que realmente têm peças (para a navegação rápida).
  const navItems = [
    ...(colecaoSolaris.length > 0 ? [{ id: secaoId["Coleção Solaris"], label: "Solaris" }] : []),
    ...categoriasOrdem
      .filter((cat) => produtos.some((p) => secaoVitrine(p) === cat))
      .map((cat) => ({ id: secaoId[cat], label: cat })),
  ];

  return (
    <section className="bg-white pb-20 md:pb-24">
      <LojaNav items={navItems} />

      <div className="mx-auto max-w-6xl px-4 pt-14 md:pt-16">
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
          {/* Coleção Solaris — nova coleção de verão, já disponível */}
          {colecaoSolaris.length > 0 && (
            <div id={secaoId["Coleção Solaris"]} className="scroll-mt-[150px]">
              <Reveal className="mb-8 flex items-center gap-3">
                <h2 className="shrink-0 font-[family-name:var(--font-serif)] text-2xl text-[#1B4965] md:text-3xl">
                  Coleção Solaris
                </h2>
                <span className="shrink-0 rounded-full bg-[#b8902a]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#b8902a]">
                  nova coleção
                </span>
                <span className="h-px flex-1 bg-[#1B4965]/15" />
              </Reveal>

              <StaggerGroup className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
                {colecaoSolaris.map((produto) => (
                  <StaggerItem key={produto.id} className="h-full">
                    <ProdutoCard produto={produto} />
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </div>
          )}

          {categoriasOrdem.map((cat) => {
            const itens = produtos.filter((p) => secaoVitrine(p) === cat);
            if (itens.length === 0) return null;
            return (
              <div key={cat} id={secaoId[cat]} className="scroll-mt-[150px]">
                <Reveal className="mb-8 flex items-center gap-4">
                  <h2 className="shrink-0 font-[family-name:var(--font-serif)] text-2xl text-[#1B4965] md:text-3xl">
                    {cat}
                  </h2>
                  <span className="h-px flex-1 bg-[#1B4965]/15" />
                </Reveal>

                <StaggerGroup className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
                  {itens.map((produto) => (
                    <StaggerItem key={produto.id} className="h-full">
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
