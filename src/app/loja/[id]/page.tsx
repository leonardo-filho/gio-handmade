import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Card from "@/components/v3/Card";
import { categoriaDe, relacionadas } from "@/components/v3/loja/vistas";
import Carrossel from "@/components/v3/home/Carrossel";
import Compra from "@/components/v3/produto/Compra";
import Galeria from "@/components/v3/produto/Galeria";
import { produtos } from "@/data/produtos";

type Params = Promise<{ id: string }>;

const produtoPorId = new Map(produtos.map((p) => [p.id, p]));

const fotosDe = (p: (typeof produtos)[number]) =>
  [p.foto, p.fotoHover, ...(p.fotosExtra ?? [])].filter((f): f is string => Boolean(f));

// As 52 pecas saem prontas no build. As pastas de prototipo (/loja/a, b,
// editorial, desfile, atelie) sao estaticas e tem prioridade sobre esta rota.
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

// Pagina da peca: galeria com a inovacao Mesa de Luz & Relevo 3D, coluna de
// compra com sob medida/pronta entrega, campos e tabela de medidas, cuidados e
// sanfonas de encomenda, pagamento e envio. No fim, "Veja tambem".
export default async function ProdutoPage({ params }: { params: Params }) {
  const { id } = await params;
  const produto = produtoPorId.get(id);
  if (!produto) notFound();

  const categoria = categoriaDe(produto);
  const outras = relacionadas(produto);

  return (
    <main className="min-h-screen overflow-x-clip bg-[#EDE7D9]">
      <Header />
      <div className="mx-auto max-w-[1440px] md:flex md:items-start md:gap-8 md:pr-8 lg:gap-12 xl:pr-[76px]">
        <Galeria
          produto={produto}
          fotos={fotosDe(produto)}
          nome={produto.nome}
          prontaEntrega={produto.prontaEntrega}
        />
        <div className="px-4 pb-4 pt-5 md:w-[340px] md:shrink-0 md:px-0 md:pt-6 lg:w-[400px] lg:pt-8 xl:w-[480px]">
          <Compra produto={produto} categoria={categoria} />
        </div>
      </div>

      {outras.length > 0 && (
        <section aria-labelledby="veja-tambem" className="pb-14 pt-12 lg:pb-20 lg:pt-16">
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
      <Footer />
      {/* A coluna ja tem o botao do WhatsApp. Abaixo de 1280 px o flutuante
          cairia sobre o COMPRAR, o preco ou as sanfonas da coluna, entao so
          aparece no xl, onde o xl:pr-[76px] deixa a coluna livre dele. */}
      <div className="hidden xl:block">
        <WhatsAppButton />
      </div>
    </main>
  );
}
