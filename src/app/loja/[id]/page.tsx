import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Card from "@/components/v3/Card";
import Carrossel from "@/components/v3/home/Carrossel";
import { categoriaDe, relacionadas } from "@/components/v3/loja/vistas";
import Historia from "@/components/v4/peca/Historia";
import { pranchasDe } from "@/components/v4/lookbook/pranchas";
import { produtos, secaoVitrine } from "@/data/produtos";

type Params = Promise<{ id: string }>;

const produtoPorId = new Map(produtos.map((p) => [p.id, p]));

export function generateStaticParams() {
  return produtos.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const produto = produtoPorId.get(id);
  if (!produto) return { title: "Peça não encontrada · Gio Handmade" };
  const titulo = `${produto.nome} · Gio Handmade`;
  return {
    title: titulo,
    description: produto.detalhes,
    alternates: { canonical: `/loja/${produto.id}` },
    openGraph: {
      title: titulo,
      description: produto.detalhes,
      type: "website",
      locale: "pt_BR",
      images: [{ url: produto.foto, alt: produto.nome }],
    },
  };
}

// Página da peça (versão 4, lookbook): a história em pranchas e a ficha, depois
// "Veja também". O atributo data-lookbook liga o encaixe da rolagem da página
// nas pranchas (globals.css).
export default async function ProdutoPage({ params }: { params: Params }) {
  const { id } = await params;
  const produto = produtoPorId.get(id);
  if (!produto) notFound();

  const categoria = categoriaDe(produto);
  const outras = relacionadas(produto);
  const roupa = secaoVitrine(produto) !== "Acessórios";

  return (
    <main data-lookbook="" className="min-h-screen overflow-x-clip bg-[#EDE7D9]">
      <Header />
      <Historia produto={produto} pranchas={pranchasDe(produto)} categoria={categoria} roupa={roupa} />

      {outras.length > 0 && (
        <section aria-labelledby="veja-tambem" className="pb-24 pt-12 lg:pb-20 lg:pt-20">
          <h2 id="veja-tambem" className="mb-4 text-center font-serif text-[20px] leading-7 text-[#1B4965]">
            Veja também
          </h2>
          <Carrossel rotulo={`Outras peças de ${categoria.nome}`}>
            {outras.map((p) => (
              <Card key={p.id} produto={p} />
            ))}
          </Carrossel>
        </section>
      )}
      {/* Sem o WhatsApp flutuante: a ficha já tem o botão do WhatsApp, e o
          flutuante cobriria a barra de compra (celular) e a ficha (computador). */}
      <Footer />
    </main>
  );
}
