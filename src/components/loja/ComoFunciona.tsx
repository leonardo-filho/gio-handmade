// Bloco curto com o passo a passo da encomenda, no modal da peça e (sem prazo,
// só medidas e pagamento) no fim do carrinho. Usa só o que
// a home já promete (ProcessSection.tsx): prazo de confecção, medidas por
// vídeo e sinal de 50%. Troca e devolução ficam de fora até a Gio definir.

export const TEXTO_MEDIDAS = "depois do pedido, a Gio te manda um vídeo para você tirar as medidas.";
export const TEXTO_PAGAMENTO =
  "a confecção começa com o sinal de 50%, que não é reembolsável; o saldo é pago antes do envio.";

type Item = { rotulo: string; texto: string };

export default function ComoFunciona({
  producao,
  prontaEntrega,
  className = "",
}: {
  producao?: string;
  prontaEntrega?: boolean;
  className?: string;
}) {
  const itens: Item[] = [];
  if (prontaEntrega) {
    itens.push({
      rotulo: "Pronta entrega",
      texto: "peça já finalizada, com envio imediato. Confira no WhatsApp o tamanho disponível.",
    });
    if (producao) itens.push({ rotulo: "Sob medida", texto: `confecção em ${producao}.` });
  } else if (producao) {
    itens.push({ rotulo: "Confecção", texto: `${producao}.` });
  }
  itens.push({ rotulo: "Medidas", texto: TEXTO_MEDIDAS });
  itens.push({ rotulo: "Pagamento", texto: TEXTO_PAGAMENTO });

  return (
    <div className={`border-t border-[#1B4965]/15 pt-4 ${className}`}>
      <h3 className="text-[10px] font-bold uppercase tracking-[0.24em] text-brand-muted">Como funciona</h3>
      <dl className="mt-2 space-y-1.5 text-[13px] leading-relaxed text-brand-muted">
        {itens.map((item) => (
          <div key={item.rotulo}>
            <dt className="inline font-semibold text-[#1B4965]">{item.rotulo}:</dt>{" "}
            <dd className="inline">{item.texto}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
