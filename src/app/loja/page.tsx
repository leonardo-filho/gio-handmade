import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Card from "@/components/v3/Card";
import Categorias from "@/components/v3/loja/Categorias";
import HashAntigo from "@/components/v3/loja/HashAntigo";
import Ordenar from "@/components/v3/loja/Ordenar";
import Trilha from "@/components/v3/loja/Trilha";
import { lerOrdem, ordenar, vistaDaLoja } from "@/components/v3/loja/vistas";
import { produtoPorId, slugsDeVista } from "@/components/loja/vistas";

// /loja/a reexporta esta página com o metadata (link antigo do protótipo A),
// por isso o metadata é fixo e não muda com a vista.
export const metadata: Metadata = {
  title: "Loja · Gio Handmade",
  description:
    "Tops, conjuntos, saias, vestidos e headpieces bordados à mão, um a um, em Belém. Monte sua sacola e finalize pelo WhatsApp.",
};

type Busca = Promise<Record<string, string | string[] | undefined>>;

const primeiro = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

// Ids e slugs para o script dos links antigos com âncora (/loja#tops).
const IDS = [...produtoPorId.keys()];
const SLUGS = [...slugsDeVista];

// A loja: título da vista, ordem, linha de categorias e a grade corrida. A
// vista (?ver=) e a ordem (?ordem=) são lidas aqui no servidor, então quem
// chega por story já recebe a grade certa, sem troca depois da hidratação.
// O link antigo de peça (/loja?produto=<id>) vai para a página dela.
export default async function LojaPage({ searchParams }: { searchParams: Busca }) {
  const busca = await searchParams;

  const produto = primeiro(busca.produto);
  if (produto && produtoPorId.has(produto)) {
    const resto = new URLSearchParams();
    for (const [chave, valor] of Object.entries(busca)) {
      if (chave === "produto" || valor === undefined) continue;
      for (const v of Array.isArray(valor) ? valor : [valor]) resto.append(chave, v);
    }
    const q = resto.toString();
    redirect(`/loja/${encodeURIComponent(produto)}${q ? `?${q}` : ""}`);
  }

  const ver = primeiro(busca.ver);
  const vista = vistaDaLoja(ver && slugsDeVista.has(ver) ? ver : null);
  const ordem = lerOrdem(primeiro(busca.ordem));
  const itens = ordenar(vista.itens, ordem);

  return (
    <main className="min-h-screen overflow-x-clip bg-[#EDE7D9]">
      <a
        href="#pecas"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:flex focus:min-h-11 focus:items-center focus:rounded focus:bg-[#1B4965] focus:px-5 focus:text-[12px] focus:uppercase focus:tracking-[0.16em] focus:text-[#EDE7D9] focus:outline-2 focus:outline-offset-2 focus:outline-[#b8902a]"
      >
        Pular para as peças
      </a>
      <Header />
      <HashAntigo pecas={IDS} vistas={SLUGS} />
      <div className="px-4 pt-3 md:pt-5">
        <Trilha
          itens={
            vista.slug
              ? [
                  { rotulo: "Início", href: "/" },
                  { rotulo: "Loja", href: "/loja" },
                ]
              : [{ rotulo: "Início", href: "/" }, { rotulo: "Loja" }]
          }
        />
        <div className="mt-1 flex items-center justify-between gap-4">
          <h1 className="font-serif text-[26px] leading-8 text-[#1B4965] md:text-[30px] md:leading-9">
            {vista.titulo}
          </h1>
          <Ordenar ordem={ordem} ver={vista.slug} />
        </div>
      </div>
      <Categorias ativa={vista.slug} ordem={ordem} />

      <section id="pecas" className="scroll-mt-28 pb-14 pt-3 md:pb-20 md:pt-5">
        <h2 className="sr-only">Peças</h2>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-4 lg:gap-y-10">
          {itens.map((p, i) => (
            <li key={p.id}>
              <Card produto={p} prioridade={i < 4} />
            </li>
          ))}
        </ul>
      </section>
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
