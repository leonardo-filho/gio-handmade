import { formatBRLPreco } from "@/lib/format";
import { labelParcelamento, parcelamentoCartao } from "@/lib/parcelas";
import type { Produto } from "@/data/produtos";

// Preço do ateliê: o valor no cartão com as parcelas primeiro e o pix como
// alternativa, como no resto do site.
export default function Preco({
  produto,
  tamanho = "md",
  alinhar = "esquerda",
  className = "",
}: {
  produto: Produto;
  tamanho?: "md" | "lg";
  alinhar?: "esquerda" | "direita";
  className?: string;
}) {
  const parcelamento = parcelamentoCartao(produto);
  const direita = alinhar === "direita";
  return (
    <div className={`${direita ? "text-right" : ""} ${className}`}>
      <p className={`flex flex-wrap items-baseline gap-x-2 ${direita ? "justify-end" : ""}`}>
        <span
          className={`nums-preco font-[family-name:var(--font-serif)] font-medium leading-none text-[#1B4965] ${
            tamanho === "lg" ? "text-[26px]" : "text-[21px]"
          }`}
        >
          {formatBRLPreco(parcelamento.total)}
        </span>
        <span className="whitespace-nowrap text-[12px] text-[#1B4965]">{labelParcelamento(parcelamento)}</span>
      </p>
      <p className="mt-1 text-[12px] text-brand-muted">ou {formatBRLPreco(produto.preco)} no pix</p>
    </div>
  );
}
