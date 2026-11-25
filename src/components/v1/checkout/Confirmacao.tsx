"use client";

import { useState } from "react";
import Link from "next/link";
import { calcularValores, cupomDoCodigo, linkWhatsapp, mensagemDoPedido, provedorAtual } from "@/lib/checkout";
import { formatBRLPreco } from "@/lib/format";
import { IconeWhatsApp } from "@/components/v3/estrutura/Icones";
import { BOTAO_CONTORNO, FOCO, HOVER, LINHA } from "@/components/v3/estrutura/estilo";
import { IconeCheck } from "../icones";
import { Resumo } from "./partes";
import { FRETE_GRATIS_ACIMA, type PedidoFeito } from "./regras";

// Etapa 5: o pedido feito. O código, o que foi pago (ou o Pix para pagar), o
// resumo e o botão principal, que manda o pedido pronto para a Gio no
// WhatsApp (com as medidas de cada peça). Fica na tela se a página recarregar.
export default function Confirmacao({ feito }: { feito: PedidoFeito }) {
  const { codigo, pedido, resultado } = feito;
  const [copiado, setCopiado] = useState(false);
  const cupom = cupomDoCodigo(pedido.cupom);
  const valores = calcularValores(pedido.itens, { forma: pedido.forma, modalidade: pedido.modalidade, frete: pedido.frete, cupom });
  const pix = resultado.status === "pendente" ? resultado.pix : undefined;
  const comSinal = pedido.modalidade === "sinal" && valores.temSobMedida;
  const pago = comSinal ? valores.agora : valores.total;
  const freteGratis = pedido.frete === 0 && calcularValores(pedido.itens, { forma: "pix", modalidade: "total", cupom }).total >= FRETE_GRATIS_ACIMA;
  const e = pedido.entrega;

  async function copiar() {
    if (!pix) return;
    try {
      await navigator.clipboard.writeText(pix.copiaECola);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1120px] px-4 pb-16 pt-8 md:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16 lg:pt-12">
      <div>
        <span aria-hidden className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1B4965] text-[#EDE7D9]">
          <IconeCheck className="h-5 w-5" />
        </span>
        <p className="mt-5 text-[11px] uppercase tracking-[0.16em] text-brand-muted">Etapa 5 de 5 · Confirmação</p>
        <h1 className="mt-1 font-[family-name:var(--font-serif)] text-[30px] leading-9 md:text-[36px] md:leading-[44px]">
          Pedido recebido
        </h1>
        <p className="mt-2 text-[14px] leading-[22px]">
          Código do pedido <span className="nums-preco font-[family-name:var(--font-serif)] text-[18px] font-medium">{codigo}</span>
        </p>

        {pix ? (
          <div className={`mt-6 rounded-[4px] border p-4 ${LINHA}`}>
            <p className="text-[14px] leading-5">
              Falta pagar o Pix de <span className="nums-preco font-[family-name:var(--font-serif)] text-[17px] font-medium">{formatBRLPreco(pago)}</span>.
            </p>
            <p className="mt-3 text-[10px] uppercase tracking-[0.14em]">Pix copia e cola</p>
            <div className="mt-1.5 flex gap-2">
              <code className="nums-preco flex h-11 min-w-0 flex-1 items-center overflow-hidden text-ellipsis whitespace-nowrap rounded-[4px] bg-[#1B4965]/[0.06] px-3 text-[13px]">
                {pix.copiaECola}
              </code>
              <button
                type="button"
                onClick={copiar}
                className={`flex h-11 shrink-0 items-center rounded-[4px] border border-[#1B4965] px-4 text-[12px] uppercase tracking-[0.14em] ${HOVER} ${FOCO}`}
              >
                {copiado ? "Copiado" : "Copiar"}
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-[14px] leading-[22px]">
            Pagamento de <span className="nums-preco font-[family-name:var(--font-serif)] text-[17px] font-medium">{formatBRLPreco(pago)}</span> aprovado
            {comSinal ? `. Faltam ${formatBRLPreco(valores.depois)} antes do envio.` : "."}
          </p>
        )}

        <a
          href={linkWhatsapp(mensagemDoPedido(pedido, codigo))}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-8 flex min-h-12 w-full items-center justify-center gap-2.5 rounded-[4px] bg-[#1B4965] px-4 text-[12px] uppercase tracking-[0.08em] text-[#EDE7D9] ${HOVER} ${FOCO}`}
        >
          <IconeWhatsApp className="h-4 w-4 shrink-0" />
          Enviar o pedido para a Gio no WhatsApp
        </a>
        <p className="mt-2 text-center text-[12px] leading-[18px] text-brand-muted">
          A mensagem já vai pronta, com as peças e as medidas.
        </p>

        <dl className={`mt-8 grid gap-4 border-t pt-6 text-[13px] leading-5 sm:grid-cols-2 ${LINHA}`}>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.14em] text-brand-muted">Entrega</dt>
            <dd className="mt-1">
              {e.rua}, {e.numero}
              {e.complemento ? `, ${e.complemento}` : ""}
              <br />
              {e.bairro}, {e.cidade}/{e.uf} · {e.cep}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.14em] text-brand-muted">Contato</dt>
            <dd className="mt-1 break-all">
              {pedido.cliente.nome}
              <br />
              {pedido.cliente.whatsapp} · {pedido.cliente.email}
            </dd>
          </div>
        </dl>

        <Link href="/loja" className={`mt-8 w-full sm:w-auto ${BOTAO_CONTORNO}`}>
          Voltar à loja
        </Link>
        {provedorAtual.demonstracao && (
          <p className="mt-6 text-[12px] leading-4 text-brand-muted">Modo demonstração: nenhum valor foi cobrado.</p>
        )}
      </div>

      <aside aria-label="Resumo do pedido" className={`mt-10 border-t pt-6 lg:mt-0 lg:border-t-0 lg:pt-0 ${LINHA}`}>
        <div className={`lg:sticky lg:top-6 lg:rounded-[4px] lg:border lg:bg-[#1B4965]/[0.03] lg:p-6 ${LINHA}`}>
          <h2 className="mb-2 text-[11px] uppercase tracking-[0.16em]">Resumo do pedido</h2>
          <Resumo
            itens={pedido.itens}
            valores={valores}
            forma={pedido.forma}
            freteConhecido
            freteGratis={freteGratis}
            cupom={pedido.cupom}
            comSinal={comSinal}
          />
        </div>
      </aside>
    </div>
  );
}
