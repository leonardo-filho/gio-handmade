"use client";

import { useState, useSyncExternalStore } from "react";
import type { Produto } from "@/data/produtos";
import { formatarFaixa, TABELA_MEDIDAS } from "@/data/medidas";
import { CUIDADOS } from "@/data/conteudo-loja";
import { useCart, type CartItem, type OpcaoPeca } from "@/components/cart/CartProvider";
import { WHATSAPP } from "@/components/home/textos";
import { ORIGEM } from "@/lib/frete";
import { ehDeVestir } from "@/lib/v2/look";
import { salvarRascunho, useMedidasCliente } from "@/lib/v2/medidasCliente";
import { medidasDoRascunho, tamanhoDoRascunho, type Rascunho } from "@/lib/v2/medidasRascunho";
import { precosDe } from "@/components/v3/loja/precos";
import Trilha from "@/components/v3/loja/Trilha";
import Sanfona from "@/components/v3/produto/Sanfona";
import { IconeWhatsApp } from "@/components/v3/estrutura/Icones";
import { BOTAO_CONTORNO, BOTAO_PRINCIPAL } from "@/components/v3/estrutura/estilo";
import Provador from "../provador/Provador";
import MonteOLook from "./MonteOLook";

type Props = {
  produto: Produto;
  categoria: { nome: string; slug: string };
  look: Produto[];
};

// Origem do site para o link da peça na mensagem do WhatsApp (vazia no
// servidor e na hidratação; logo depois, completa).
const semAssinatura = () => () => {};
const lerOrigem = () => window.location.origin;
const origemServidor = () => "";

const FEMININOS = new Set(["Saia", "Regata", "Chocker", "Choker"]);
const artigo = (nome: string) => (FEMININOS.has(nome.split(" ")[0]) ? "na" : "no");

/** A linha da sacola de uma peça, com as medidas do provador quando cabem. */
function itemDaSacola(p: Produto, opcao: OpcaoPeca, r: Rascunho): CartItem {
  const base: CartItem = { id: p.id, nome: p.nome, preco: p.preco, foto: p.foto, categoria: p.categoria, opcao };
  if (opcao !== "sob-medida" || !ehDeVestir(p)) return base;
  if (r.porVideo) return { ...base, medidasPorVideo: true };
  const medidas = medidasDoRascunho(r);
  if (Object.keys(medidas).length === 0) return base;
  return { ...base, medidas, tamanhoReferencia: tamanhoDoRascunho(r)?.tamanho };
}

// Coluna de compra da versão 2: trilha, nome, preço no cartão com parcelas e
// o pix, a escolha entre sob medida e pronta entrega e, no sob medida das
// peças de vestir, o provador. COMPRAR leva a peça com as medidas para a
// sacola. Depois, a descrição, o look e as sanfonas.
export default function Compra({ produto, categoria, look }: Props) {
  const { add, open } = useCart();
  const rascunho = useMedidasCliente();
  const [opcao, setOpcao] = useState<OpcaoPeca>("sob-medida");
  const origem = useSyncExternalStore(semAssinatura, lerOrigem, origemServidor);
  const precos = precosDe(produto);
  const pronta = opcao === "pronta-entrega";
  const vestir = ehDeVestir(produto);
  const comProvador = vestir && !pronta;
  const tamanho = produto.tamanho?.trim();

  const opcoes: { id: OpcaoPeca; rotulo: string }[] = [{ id: "sob-medida", rotulo: "Sob medida" }];
  if (produto.prontaEntrega) {
    opcoes.push({ id: "pronta-entrega", rotulo: tamanho ? `Pronta entrega · ${tamanho}` : "Pronta entrega" });
  }

  const quem = `${artigo(produto.nome)} ${produto.nome}`;
  const mensagem = pronta
    ? `Oi, Gio! Tenho interesse ${quem}, pronta entrega${tamanho ? ` tam. ${tamanho}` : ""}. Ainda está disponível?`
    : `Oi, Gio! Tenho interesse ${quem} (sob medida).`;
  const link = origem ? ` ${origem}/loja/${produto.id}` : "";
  const whatsapp = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem + link)}`;

  function comprar() {
    add(itemDaSacola(produto, opcao, rascunho));
    open();
  }

  function adicionarLook(pecas: Produto[]) {
    for (const p of pecas) add(itemDaSacola(p, p.id === produto.id ? opcao : "sob-medida", rascunho));
    open();
  }

  const levaMedidas = rascunho.porVideo || Object.keys(medidasDoRascunho(rascunho)).length > 0;
  const tituloLook = categoria.slug === "conjuntos" || categoria.slug === "vestidos" ? "Complete o look" : "Monte o look";

  return (
    <div className="text-[#1B4965]">
      <Trilha
        itens={[
          { rotulo: "Loja", href: "/loja" },
          { rotulo: categoria.nome, href: `/loja?ver=${categoria.slug}` },
        ]}
      />
      <h1 className="mt-1 font-[family-name:var(--font-serif)] text-[26px] leading-8 lg:text-[30px] lg:leading-9">{produto.nome}</h1>

      <div className="mt-2 flex items-baseline justify-between gap-4">
        <p className="nums-preco font-[family-name:var(--font-serif)] text-[20px] font-medium leading-6">{precos.cartao}</p>
        <p className="text-[12px] leading-4">{precos.parcelas}</p>
      </div>
      {precos.pix && <p className="mt-1 text-[12px] leading-4 text-brand-muted">ou {precos.pix} no pix</p>}

      <hr className="my-4 border-[#1B4965]/15" />

      {opcoes.length > 1 && (
        <fieldset>
          <legend className="text-[10px] uppercase leading-3 tracking-[0.14em]">Escolha</legend>
          <div className="mt-1 flex flex-wrap gap-x-2">
            {opcoes.map((o) => (
              <label key={o.id} className="relative inline-flex h-11 cursor-pointer items-center">
                <input
                  type="radio"
                  name="opcao"
                  value={o.id}
                  checked={opcao === o.id}
                  onChange={() => setOpcao(o.id)}
                  className="peer sr-only"
                />
                <span className="inline-flex h-9 items-center rounded border border-[#1B4965]/40 px-3 text-[11px] uppercase tracking-[0.12em] hover:opacity-70 motion-safe:transition-opacity motion-safe:duration-200 peer-checked:border-[#1B4965] peer-checked:bg-[#C8E1E4] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#b8902a]">
                  {o.rotulo}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <p aria-live="polite" className="mt-1 text-[12px] leading-4">
        {pronta ? (
          <span className="text-brand-gold-text">Pronta para envio.</span>
        ) : (
          produto.producao && (
            <span className="text-brand-muted">
              {opcoes.length > 1 ? "Feito à mão" : "Sob medida, feito à mão"} em {produto.producao}.
            </span>
          )
        )}
      </p>

      {comProvador && (
        <div className="mt-5 rounded-[4px] border border-[#1B4965]/15 p-3 pb-1 md:p-4 md:pb-2">
          <Provador valor={rascunho} aoMudar={salvarRascunho} />
        </div>
      )}

      <button type="button" onClick={comprar} className={`mt-4 ${BOTAO_PRINCIPAL}`}>
        Comprar
      </button>
      <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={`mt-2 w-full gap-2 ${BOTAO_CONTORNO}`}>
        <IconeWhatsApp className="h-4 w-4 shrink-0" />
        {pronta ? "Confirmar pronta entrega" : "Tirar dúvida no WhatsApp"}
      </a>
      {!pronta && <p className="mt-3 text-[12px] leading-4 text-brand-muted">Sob medida: sinal de 50% para começar a peça.</p>}

      <p className="mt-5 text-[14px] leading-[22px]">{produto.detalhes}</p>

      {look.length > 0 && (
        <MonteOLook peca={produto} sugestoes={look} titulo={tituloLook} levaMedidas={levaMedidas} aoAdicionar={adicionarLook} />
      )}

      <div className={`border-t border-[#1B4965]/15 ${look.length > 0 ? "mt-8" : "mt-6"}`}>
        {vestir && pronta && (
          <Sanfona titulo="Tabela de medidas">
            <TabelaSimples />
          </Sanfona>
        )}
        <Sanfona titulo="Cuidados">
          <p>{CUIDADOS}</p>
        </Sanfona>
        <Sanfona titulo="Como funciona a encomenda">
          <ul className="list-disc space-y-1.5 pl-4 marker:text-[#1B4965]/40">
            <li>A confecção começa com o sinal de 50% do valor. O sinal não é reembolsável em caso de desistência.</li>
            <li>Você informa as medidas no provador ou, se preferir, manda por vídeo depois do pedido.</li>
            <li>O prazo de confecção conta a partir do sinal.</li>
            <li>
              O saldo vence em até 72 horas após a data combinada para envio ou retirada. Depois disso, a peça é
              colocada à venda.
            </li>
            <li>Dá para personalizar a peça, inclusive as cores, pelo WhatsApp.</li>
          </ul>
        </Sanfona>
        <Sanfona titulo="Pagamento">
          <ul className="space-y-1.5">
            <li>Pix: o menor valor, sem acréscimos.</li>
            <li>{precos.vezes > 1 ? `Cartão: em até ${precos.vezes}x sem juros.` : "Cartão: à vista."}</li>
            <li>Sob medida: o sinal de 50% agora e o restante antes do envio, ou tudo de uma vez.</li>
          </ul>
        </Sanfona>
        <Sanfona titulo="Envio">
          <ul className="space-y-1.5">
            {produto.prontaEntrega && <li>Pronta entrega: peça já finalizada, com envio imediato.</li>}
            <li>
              O frete é calculado na finalização, pelo CEP. Enviamos de {ORIGEM.cidade}/{ORIGEM.uf}, e o valor final é
              confirmado no WhatsApp.
            </li>
          </ul>
        </Sanfona>
      </div>
    </div>
  );
}

// Tabela parada (pronta entrega): só a referência, sem campos.
function TabelaSimples() {
  return (
    <table className="w-full table-fixed border-collapse text-[13px] text-[#1B4965]">
      <caption className="sr-only">Tabela de medidas em centímetros</caption>
      <thead>
        <tr className="text-[10px] uppercase tracking-[0.12em] text-brand-muted">
          <th scope="col" className="h-8 w-[58px] text-left font-normal">
            Tam.
          </th>
          <th scope="col" className="font-normal">Busto</th>
          <th scope="col" className="font-normal">Cintura</th>
          <th scope="col" className="font-normal">Quadril</th>
        </tr>
      </thead>
      <tbody>
        {TABELA_MEDIDAS.map((l) => (
          <tr key={l.tamanho} className="border-t border-[#1B4965]/10">
            <th scope="row" className="h-8 text-left font-normal">
              {l.tamanho}
            </th>
            <td className="nums-preco text-center">{formatarFaixa(l.busto)}</td>
            <td className="nums-preco text-center">{formatarFaixa(l.cintura)}</td>
            <td className="nums-preco text-center">{formatarFaixa(l.quadril)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
