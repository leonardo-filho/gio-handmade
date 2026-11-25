// Ponte entre a sacola da versão 2 e o núcleo do checkout (lib/checkout.ts,
// comum às versões, que não muda): as linhas da sacola levam as medidas do
// provador, e aqui elas entram nos itens do pedido.
//
// Medidas só valem para peça de vestir sob medida. Headpiece e choker sob
// medida não pedem busto e cintura (o núcleo pediria), então a regra daqui
// decide quem precisa delas antes de chamar medidasCompletas.

import { produtos } from "@/data/produtos";
import { itensDoCarrinho, medidasCompletas, type ItemPedido } from "@/lib/checkout";
import type { CartLine } from "@/components/cart/CartProvider";
import { ehDeVestir } from "./look";
import { resumoMedidas } from "./medidasRascunho";

const porId = new Map(produtos.map((p) => [p.id, p]));

/** Itens do pedido com os valores do catálogo e as medidas de cada linha. */
export function itensComMedidas(linhas: CartLine[]): ItemPedido[] {
  return itensDoCarrinho(linhas).map((item, i) => {
    const l = linhas[i];
    return { ...item, medidas: l.medidas, medidasPorVideo: l.medidasPorVideo, tamanhoReferencia: l.tamanhoReferencia };
  });
}

/** A peça pede medidas do corpo: sob medida e de vestir. */
export function precisaDeMedidas(item: { id: string; opcao: string; nome: string }): boolean {
  if (item.opcao !== "sob-medida") return false;
  const p = porId.get(item.id);
  return ehDeVestir(p ?? { categoria: "Tops", nome: item.nome });
}

/** Pronta para pagar: não pede medidas, ou já tem busto e cintura, ou vai por vídeo. */
export function medidasEmDia(item: ItemPedido): boolean {
  return !precisaDeMedidas(item) || medidasCompletas(item);
}

/** A linha curta de medidas da sacola e do resumo (vazia quando não se aplica). */
export function textoMedidas(item: Pick<ItemPedido, "id" | "opcao" | "nome" | "medidas" | "medidasPorVideo" | "tamanhoReferencia">): string {
  if (!precisaDeMedidas(item)) return "";
  if (item.medidasPorVideo) return "Medidas por vídeo";
  const resumo = resumoMedidas(item.medidas);
  if (!resumo) return "Medidas na finalização";
  return `Medidas ${resumo}${item.tamanhoReferencia ? ` · ref. ${item.tamanhoReferencia}` : ""}`;
}

export function rotuloOpcao(item: { id: string; opcao: string }): string {
  if (item.opcao !== "pronta-entrega") return "Sob medida";
  const t = porId.get(item.id)?.tamanho;
  return t ? `Pronta entrega · ${t}` : "Pronta entrega";
}
