"use client";

import { useState } from "react";
import Link from "next/link";
import {
  linkWhatsapp,
  mensagemDoPedido,
  provedorAtual,
  type Pedido,
  type ResultadoPagamento,
  type Valores,
} from "@/lib/checkout";
import { formatBRL } from "@/lib/format";
import { IconeWhatsApp } from "@/components/v3/estrutura/Icones";
import { BOTAO_CONTORNO, BOTAO_PRINCIPAL, FOCO, HOVER, LINHA } from "@/components/v3/estrutura/estilo";

export type PedidoFeito = {
  pedido: Pedido;
  resultado: Exclude<ResultadoPagamento, { status: "erro" }>;
  valores: Valores;
  freteTexto: string | null;
  etapas: ("dados" | "entrega" | "medidas" | "pagamento" | "confirmacao")[];
};

// Última etapa: o código do pedido, o Pix (quando for o caso), o resumo e o
// botão que manda o pedido para a Gio no WhatsApp, com a mensagem pronta.
export default function Confirmacao({ feito }: { feito: PedidoFeito }) {
  const { pedido, resultado, valores } = feito;
  const [copiado, setCopiado] = useState(false);
  const pix = resultado.status === "pendente" ? resultado.pix?.copiaECola : undefined;
  const whatsapp = linkWhatsapp(mensagemDoPedido(pedido, resultado.codigo));
  const e = pedido.entrega;

  async function copiar() {
    if (!pix) return;
    try {
      await navigator.clipboard.writeText(pix);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <div className="mt-3">
      <p className="text-[14px] leading-[22px]">
        {resultado.status === "aprovado"
          ? `Pagamento de ${formatBRL(valores.agora)} aprovado.`
          : `Pix de ${formatBRL(valores.agora)} gerado.`}{" "}
        Agora mande o pedido para a Gio: ela confirma tudo com você por lá.
      </p>

      {pix && (
        <div className="mt-5 rounded-[4px] border border-[#1B4965]/40 p-4">
          <p className="text-[10px] uppercase leading-3 tracking-[0.14em]">Pix copia e cola</p>
          <p className="nums-preco mt-2 break-all text-[13px] leading-5 text-brand-muted">{pix}</p>
          <button type="button" onClick={copiar} className={`mt-2 flex min-h-11 items-center text-[12px] underline underline-offset-4 ${HOVER} ${FOCO}`}>
            {copiado ? "Código copiado" : "Copiar código"}
          </button>
        </div>
      )}

      <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={`mt-6 gap-2 py-3 text-center leading-5 ${BOTAO_PRINCIPAL}`}>
        <IconeWhatsApp className="h-4 w-4 shrink-0" />
        Enviar o pedido para a Gio no WhatsApp
      </a>
      {provedorAtual.demonstracao && (
        <p className="mt-3 flex items-center justify-center gap-2 text-[12px] text-brand-muted">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#b8902a]" />
          Modo demonstração: nenhum valor foi cobrado.
        </p>
      )}

      <dl className={`mt-8 space-y-4 border-t pt-5 text-[13px] leading-5 ${LINHA}`}>
        <div>
          <dt className="text-[10px] uppercase leading-3 tracking-[0.14em]">Peças</dt>
          <dd className="mt-2">
            <ul className="space-y-1">
              {pedido.itens.map((i) => (
                <li key={`${i.id}:${i.opcao}`}>
                  {i.qty > 1 ? `${i.qty}x ` : ""}
                  {i.nome} <span className="text-brand-muted">· {i.opcao === "pronta-entrega" ? "pronta entrega" : "sob medida"}</span>
                  {i.opcao === "sob-medida" && i.medidasPorVideo && <span className="text-brand-muted"> · medidas por vídeo</span>}
                  {i.opcao === "sob-medida" && !i.medidasPorVideo && i.medidas?.busto && (
                    <span className="nums-preco text-brand-muted">
                      {" "}
                      · {[i.medidas.busto, i.medidas.cintura, i.medidas.quadril].filter(Boolean).join(" / ")} cm
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase leading-3 tracking-[0.14em]">Entrega</dt>
          <dd className="mt-2">
            {e.rua}, {e.numero}
            {e.complemento ? `, ${e.complemento}` : ""}, {e.bairro}, {e.cidade}/{e.uf}, CEP {e.cep}
            {feito.freteTexto && <span className="block text-brand-muted">Frete estimado em {feito.freteTexto}.</span>}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase leading-3 tracking-[0.14em]">Pagamento</dt>
          <dd className="nums-preco mt-2">
            {pedido.forma === "pix" ? "Pix" : "Cartão"} · total de {formatBRL(valores.total)}
            {valores.agora < valores.total && (
              <span className="block text-brand-muted">
                {formatBRL(valores.agora)} agora e {formatBRL(valores.depois)} antes do envio
              </span>
            )}
          </dd>
        </div>
      </dl>

      <Link href="/loja" className={`mt-8 w-full ${BOTAO_CONTORNO}`}>
        Voltar à loja
      </Link>
    </div>
  );
}
