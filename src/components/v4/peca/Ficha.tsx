"use client";

import { useSyncExternalStore, type Ref } from "react";
import type { Produto } from "@/data/produtos";
import { WHATSAPP } from "@/components/home/textos";
import { CUIDADOS } from "@/data/conteudo-loja";
import { ORIGEM } from "@/lib/frete";
import { precosDe } from "@/components/v3/loja/precos";
import Trilha from "@/components/v3/loja/Trilha";
import Sanfona from "@/components/v3/produto/Sanfona";
import { IconeWhatsApp } from "@/components/v3/estrutura/Icones";
import { BOTAO_CONTORNO, BOTAO_PRINCIPAL } from "@/components/v3/estrutura/estilo";
import CamposMedidas from "../medidas/CamposMedidas";

export type Opcao = "sob-medida" | "pronta-entrega";

type Props = {
  produto: Produto;
  categoria: { nome: string; slug: string };
  numeral: string;
  roupa: boolean;
  opcao: Opcao;
  aoEscolher: (o: Opcao) => void;
  aoComprar: () => void;
  comprarRef: Ref<HTMLButtonElement>;
};

// Origem do site para o link da peça na mensagem do WhatsApp (vazia no servidor).
const semAssinatura = () => () => {};
const lerOrigem = () => window.location.origin;
const origemServidor = () => "";

const FEMININOS = new Set(["Saia", "Regata", "Chocker", "Choker"]);
const artigo = (nome: string) => (FEMININOS.has(nome.split(" ")[0]) ? "na" : "no");

// A ficha: a última prancha no celular e a coluna presa à direita no
// computador. Nome, preço no cartão e pix, a escolha entre sob medida e
// pronta entrega, as medidas (sob medida), COMPRAR, WhatsApp, a descrição e
// as sanfonas fechadas.
export default function Ficha({ produto, categoria, numeral, roupa, opcao, aoEscolher, aoComprar, comprarRef }: Props) {
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

  return (
    <div className="text-[#1B4965]">
      <p aria-hidden className="mb-3 flex items-baseline gap-3 lg:hidden">
        <span className="nums-preco w-6 font-serif text-[13px] tracking-[0.08em] text-brand-muted">{numeral}</span>
        <span className="font-serif text-[17px] italic leading-none">A ficha</span>
      </p>
      <Trilha
        itens={[
          { rotulo: "Loja", href: "/loja" },
          { rotulo: categoria.nome, href: `/loja?ver=${categoria.slug}` },
        ]}
      />
      <h1 className="mt-2 font-serif text-[26px] leading-[32px] lg:text-[30px] lg:leading-[36px]">{produto.nome}</h1>

      <div className="mt-3 flex items-baseline justify-between gap-4">
        <p className="nums-preco font-serif text-[22px] font-medium leading-7">{precos.cartao}</p>
        <p className="text-[12px] leading-4">{precos.parcelas}</p>
      </div>
      {precos.pix && <p className="mt-1 text-[12px] leading-4 text-brand-muted">ou {precos.pix} no pix</p>}

      <hr className="my-4 border-[#1B4965]/15" />

      <fieldset id="ficha-tamanho" className="scroll-mt-28">
        <legend className="text-[10px] uppercase leading-3 tracking-[0.14em]">Tamanho</legend>
        <div className="mt-1 flex flex-wrap gap-x-2">
          {opcoes.map((o) => (
            <label key={o.id} className="relative inline-flex h-11 cursor-pointer items-center">
              <input
                type="radio"
                name={`opcao-${produto.id}`}
                value={o.id}
                checked={opcao === o.id}
                onChange={() => aoEscolher(o.id)}
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

      {!pronta && roupa && (
        <div className="mt-5">
          <p className="mb-2 text-[10px] uppercase leading-3 tracking-[0.14em]">Suas medidas</p>
          <CamposMedidas id={produto.id} />
        </div>
      )}

      <button ref={comprarRef} type="button" onClick={aoComprar} className={`mt-4 ${BOTAO_PRINCIPAL}`}>
        Comprar
      </button>
      <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={`mt-2 w-full gap-2 ${BOTAO_CONTORNO}`}>
        <IconeWhatsApp className="h-4 w-4 shrink-0" />
        {pronta ? "Confirmar pronta entrega" : "Tirar dúvida no WhatsApp"}
      </a>
      {!pronta && <p className="mt-3 text-[12px] leading-4 text-brand-muted">Sob medida começa com sinal de 50%.</p>}

      <p className="mt-5 text-[14px] leading-[22px]">{produto.detalhes}</p>

      <div className="mt-6 border-t border-[#1B4965]/15">
        <Sanfona titulo="Cuidados">
          <p>{CUIDADOS}</p>
        </Sanfona>
        <Sanfona titulo="Como funciona a encomenda">
          <ul className="list-disc space-y-1.5 pl-4 marker:text-[#1B4965]/40">
            <li>A confecção começa com o sinal de 50% do valor. O sinal não é reembolsável em caso de desistência.</li>
            <li>Você informa as medidas na compra ou manda depois, por vídeo, com a ajuda da Gio.</li>
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
                ? `Cartão: em até ${precos.vezes}x sem juros.`
                : "Cartão: à vista."}
            </li>
            <li>Sob medida: você escolhe pagar o sinal de 50% agora ou o valor inteiro.</li>
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
