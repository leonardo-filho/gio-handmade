"use client";

import { useState, useSyncExternalStore } from "react";
import type { Produto } from "@/data/produtos";
import { useCart } from "@/components/cart/CartProvider";
import { WHATSAPP } from "@/components/home/textos";
import { ORIGEM } from "@/lib/frete";
import { precosDe } from "../loja/precos";
import Trilha from "../loja/Trilha";
import { IconeWhatsApp } from "../estrutura/Icones";
import { BOTAO_CONTORNO, BOTAO_PRINCIPAL } from "../estrutura/estilo";
import Sanfona from "./Sanfona";

type Opcao = "sob-medida" | "pronta-entrega";

type Props = { produto: Produto; categoria: { nome: string; slug: string } };

// Origem do site para o link da peça na mensagem do WhatsApp. No servidor e
// na hidratação vem vazia (a mensagem sai sem link); logo depois, completa.
const semAssinatura = () => () => {};
const lerOrigem = () => window.location.origin;
const origemServidor = () => "";

// "no Top Maya", "na Saia Brisa".
const FEMININOS = new Set(["Saia", "Regata", "Chocker", "Choker"]);
const artigo = (nome: string) => (FEMININOS.has(nome.split(" ")[0]) ? "na" : "no");

// Coluna de compra, na ordem da spec: trilha, nome, preço com parcelas, pix,
// linha, TAMANHO (sob medida e, quando houver, pronta entrega), prazo que
// muda com a escolha, COMPRAR (abre a sacola), WhatsApp com mensagem pronta,
// a linha do sinal, a descrição e as três sanfonas fechadas.
export default function Compra({ produto, categoria }: Props) {
  const { add, open } = useCart();
  const [opcao, setOpcao] = useState<Opcao>("sob-medida");
  const origem = useSyncExternalStore(semAssinatura, lerOrigem, origemServidor);
  const precos = precosDe(produto);
  const pronta = opcao === "pronta-entrega";
  const tamanho = produto.tamanho?.trim();

  const opcoes: { id: Opcao; rotulo: string }[] = [{ id: "sob-medida", rotulo: "Sob medida" }];
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
    add({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      foto: produto.foto,
      categoria: produto.categoria,
      opcao,
    });
    open();
  }

  return (
    <div className="text-[#1B4965]">
      <Trilha
        itens={[
          { rotulo: "Loja", href: "/loja" },
          { rotulo: categoria.nome, href: `/loja?ver=${categoria.slug}` },
        ]}
      />
      <h1 className="mt-2 font-serif text-[24px] leading-[30px] lg:text-[28px] lg:leading-[34px]">{produto.nome}</h1>

      <div className="mt-3 flex items-baseline justify-between gap-4">
        <p className="nums-preco font-serif text-[20px] font-medium leading-6">{precos.cartao}</p>
        <p className="text-[12px] leading-4">{precos.parcelas}</p>
      </div>
      {precos.pix && <p className="mt-1 text-[12px] leading-4 text-brand-muted">ou {precos.pix} no pix</p>}

      <hr className="my-4 border-[#1B4965]/15" />

      <fieldset>
        <legend className="text-[10px] uppercase leading-3 tracking-[0.14em]">Tamanho</legend>
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

      <p aria-live="polite" className="mt-1 text-[12px] leading-4">
        {pronta ? (
          <span className="text-brand-gold-text">Pronta para envio.</span>
        ) : (
          produto.producao && <span className="text-brand-muted">Feito à mão em {produto.producao}.</span>
        )}
      </p>

      <button type="button" onClick={comprar} className={`mt-4 ${BOTAO_PRINCIPAL}`}>
        Comprar
      </button>
      <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={`mt-2 w-full gap-2 ${BOTAO_CONTORNO}`}>
        <IconeWhatsApp className="h-4 w-4 shrink-0" />
        {pronta ? "Confirmar pronta entrega" : "Tirar dúvida no WhatsApp"}
      </a>
      {!pronta && <p className="mt-3 text-[12px] leading-4 text-brand-muted">Sinal de 50% e medidas por vídeo.</p>}

      <p className="mt-5 text-[14px] leading-[22px]">{produto.detalhes}</p>

      <div className="mt-6 border-t border-[#1B4965]/15">
        <Sanfona titulo="Como funciona a encomenda">
          <ul className="list-disc space-y-1.5 pl-4 marker:text-[#1B4965]/40">
            <li>A confecção começa com o sinal de 50% do valor. O sinal não é reembolsável em caso de desistência.</li>
            <li>Depois do pedido, a Gio manda um vídeo para você tirar as medidas.</li>
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
            <li>
              {precos.vezes > 1
                ? `Cartão: em até ${precos.vezes}x sem juros, ou em até 12x com juros no link de pagamento.`
                : "Cartão: à vista, ou em até 12x com juros no link de pagamento."}
            </li>
          </ul>
        </Sanfona>
        <Sanfona titulo="Envio">
          <ul className="space-y-1.5">
            {produto.prontaEntrega && <li>Pronta entrega: peça já finalizada, com envio imediato.</li>}
            <li>
              O frete é calculado na sacola, pelo CEP. Enviamos de {ORIGEM.cidade}/{ORIGEM.uf}, e o valor final é
              confirmado no WhatsApp.
            </li>
          </ul>
        </Sanfona>
      </div>
    </div>
  );
}
