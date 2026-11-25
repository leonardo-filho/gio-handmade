import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import WhatsAppButton from "@/components/WhatsAppButton";
import { produtoPorId, vistaPorSlug } from "@/components/loja/vistas";
import LojaB, { type ChegadaB } from "@/components/proto/b/LojaB";

export const metadata: Metadata = {
  title: "Loja · Gio Handmade",
  description:
    "Peças bordadas à mão em Belém, sob medida ou à pronta entrega. Monte seu carrinho e finalize pelo WhatsApp.",
};

type Busca = Promise<Record<string, string | string[] | undefined>>;

const primeiro = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null;

function lerChegada(busca: Record<string, string | string[] | undefined>): ChegadaB {
  const p = primeiro(busca.produto);
  const v = primeiro(busca.ver);
  const produto = p && produtoPorId.has(p) ? p : null;
  const vista = vistaPorSlug(v);
  const ver = vista ? vista.slug : null;
  return { produto, ver };
}

export default async function LojaBPage({ searchParams }: { searchParams: Busca }) {
  const chegada = lerChegada(await searchParams);

  return (
    <main className="min-h-screen bg-[#EDE7D9]">
      <a
        href="#vitrine-b"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:flex focus:min-h-11 focus:items-center focus:rounded-sm focus:bg-[#1B4965] focus:px-5 focus:py-3 focus:text-xs focus:font-bold focus:uppercase focus:tracking-[0.18em] focus:text-[#EDE7D9] focus:outline-none focus:ring-2 focus:ring-[#b8902a] focus:ring-offset-2"
      >
        Pular para as peças
      </a>
      <SmoothScroll />
      <Header />
      <div className="pt-[var(--header-h-topo,102px)] md:pt-[var(--header-h-topo,109px)]">
        <LojaB chegada={chegada} />
      </div>
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
