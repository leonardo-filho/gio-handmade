import Link from "next/link";
import Card from "@/components/v3/Card";
import { produtos } from "@/data/produtos";
import Carrossel from "./Carrossel";

const PRONTA_ENTREGA = produtos.filter((p) => p.prontaEntrega);

// "Pronta entrega": título centralizado que leva à vista da loja e o carrossel
// com o card da loja. Sem link extra e sem autoplay. Sem peça pronta, o bloco
// não aparece.
export default function ProntaEntrega() {
  if (PRONTA_ENTREGA.length === 0) return null;

  return (
    <section aria-labelledby="pronta-entrega-titulo" className="pt-10">
      <h2
        id="pronta-entrega-titulo"
        className="mb-4 text-center font-[family-name:var(--font-serif)] text-[22px] font-normal leading-[26px] text-[#1B4965]"
      >
        {/* O alvo de toque tem 44 px; a margem negativa mantém o espaço de
            40 px acima e 16 px abaixo do texto. */}
        <Link
          href="/loja?ver=pronta-entrega"
          className="-my-[9px] inline-block px-2 py-[9px] transition-opacity duration-200 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-[#b8902a] motion-reduce:transition-none"
        >
          Pronta entrega
        </Link>
      </h2>
      <Carrossel rotulo="Peças de pronta entrega">
        {PRONTA_ENTREGA.map((p) => (
          <Card key={p.id} produto={p} selo={false} />
        ))}
      </Carrossel>
    </section>
  );
}
