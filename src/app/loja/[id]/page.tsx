import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Card from "@/components/v3/Card";
import { categoriaDe, relacionadas } from "@/components/v3/loja/vistas";
import Carrossel from "@/components/v3/home/Carrossel";
import ColunaPresa from "@/components/v2/produto/ColunaPresa";
import Compra from "@/components/v2/produto/Compra";
import GaleriaPeca from "@/components/v2/produto/GaleriaPeca";
import { produtos } from "@/data/produtos";
import { sugerirLook } from "@/lib/v2/look";

type Params = Promise<{ id: string }>;

const produtoPorId = new Map(produtos.map((p) => [p.id, p]));

const fotosDe = (p: (typeof produtos)[number]) =>
  [p.foto, p.fotoHover, ...(p.fotosExtra ?? [])].filter((f): f is string => Boolean(f));

// As 52 peças saem prontas no build. As pastas de protótipo antigas (/loja/a,
// b, editorial, desfile, atelie) são estáticas e têm prioridade sobre esta rota.
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

// Página da peça, versão 2 (Provador). A peça em foco: no celular, fotos
// altas que trocam com o dedo; no computador, uma foto por tela, uma embaixo
// da outra, com a coluna de compra ao lado. Na coluna, o provador de medidas
// e o look. No fim, "Veja também".
export default async function ProdutoPage({ params }: { params: Params }) {
  const { id } = await params;
  const produto = produtoPorId.get(id);
  if (!produto) notFound();

  const categoria = categoriaDe(produto);
  const outras = relacionadas(produto);
  const look = sugerirLook(produto);

  return (
    <main className="min-h-screen overflow-x-clip bg-[#EDE7D9]">
      <Header />
      <div className="mx-auto max-w-[1440px] lg:grid lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-10 lg:pr-10 xl:grid-cols-[minmax(0,1fr)_460px] xl:gap-14 xl:pr-[72px]">
        <div className="min-w-0">
          <GaleriaPeca fotos={fotosDe(produto)} nome={produto.nome} prontaEntrega={produto.prontaEntrega} />
        </div>
        <ColunaPresa className="px-4 pb-6 pt-4 md:mx-auto md:max-w-[600px] md:px-8 lg:mx-0 lg:max-w-none lg:px-0 lg:pb-10 lg:pt-6">
          <Compra produto={produto} categoria={categoria} look={look} />
        </ColunaPresa>
      </div>

      {outras.length > 0 && (
        <section aria-labelledby="veja-tambem" className="pb-14 pt-10 lg:pb-20 lg:pt-12">
          <h2 id="veja-tambem" className="mb-4 text-center font-[family-name:var(--font-serif)] text-[20px] leading-7 text-[#1B4965]">
            Veja também
          </h2>
          <Carrossel rotulo={`Outras peças de ${categoria.nome}`}>
            {outras.map((p) => (
              <Card key={p.id} produto={p} />
            ))}
          </Carrossel>
        </section>
      )}
      <Footer />
      {/* No celular, a coluna já tem o botão do WhatsApp e o flutuante
          cobriria o preço e o provador; do md para cima ele segue. */}
      <WhatsAppButton ocultarNoCelular />
    </main>
  );
}
