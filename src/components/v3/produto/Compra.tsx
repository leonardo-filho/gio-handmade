"use client";

import { useState, useSyncExternalStore } from "react";
import type { Produto } from "@/data/produtos";
import { CUIDADOS, SINAL } from "@/data/conteudo-loja";
import { sugerirTamanho, type Medidas } from "@/data/medidas";
import { useCart } from "@/components/cart/CartProvider";
import { WHATSAPP } from "@/components/home/textos";
import { ORIGEM } from "@/lib/frete";
import { resumoMedidasPeca, salvarMedidasPeca, useMapaMedidas } from "@/lib/pedido-v3";
import { precosDe } from "../loja/precos";
import Trilha from "../loja/Trilha";
import { IconeWhatsApp } from "../estrutura/Icones";
import { BOTAO_CONTORNO, BOTAO_PRINCIPAL, FOCO, HOVER, LINHA } from "../estrutura/estilo";
import Sanfona from "./Sanfona";
import TabelaMedidas, { SeletorMedidasSobMedida } from "./TabelaMedidas";

type Opcao = "sob-medida" | "pronta-entrega";

type Props = { produto: Produto; categoria: { nome: string; slug: string } };

const semAssinatura = () => () => {};
const lerOrigem = () => window.location.origin;
const origemServidor = () => "";

const FEMININOS = new Set(["Saia", "Regata", "Chocker", "Choker"]);
const artigo = (nome: string) => (FEMININOS.has(nome.split(" ")[0]) ? "na" : "no");

// Coluna de compra da pagina da peca (/loja/[id]):
// Mantem a primeira dobra limpa como na spec (cerca de 55 palavras visiveis):
// o bloco de medidas fica fechado por padrao ("Informar medidas agora, opcional"),
// porque as medidas tambem sao pedidas no checkout.
export default function Compra({ produto, categoria }: Props) {
  const { add, open } = useCart();
  const mapaMedidas = useMapaMedidas();
  const salvo = mapaMedidas[produto.id];

  const [opcao, setOpcao] = useState<Opcao>("sob-medida");
  const [medidasAberta, setMedidasAberta] = useState(false);
  const [medidasLocal, setMedidasLocal] = useState<Medidas>(() => salvo?.medidas ?? {});
  const [porVideoLocal, setPorVideoLocal] = useState<boolean>(() => salvo?.medidasPorVideo ?? false);
  const [refLocal, setRefLocal] = useState<string | undefined>(() => salvo?.tamanhoReferencia);

  const origem = useSyncExternalStore(semAssinatura, lerOrigem, origemServidor);
  const precos = precosDe(produto);
  const pronta = opcao === "pronta-entrega";
  const tamanho = produto.tamanho?.trim();

  const medidasAtuais = salvo?.medidas ?? medidasLocal;
  const porVideoAtual = salvo?.medidasPorVideo ?? porVideoLocal;
  const refAtual = salvo?.tamanhoReferencia ?? refLocal ?? sugerirTamanho(medidasAtuais)?.tamanho;
  const resumoSalvo = resumoMedidasPeca({
    medidas: medidasAtuais,
    tamanhoReferencia: refAtual,
    medidasPorVideo: porVideoAtual,
  });

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

  function aoMudarMedidas(novas: Medidas, ref?: string) {
    setMedidasLocal(novas);
    setRefLocal(ref);
    salvarMedidasPeca(produto.id, {
      medidas: novas,
      tamanhoReferencia: ref,
      medidasPorVideo: false,
    });
  }

  function aoMudarPorVideo(porVideo: boolean) {
    setPorVideoLocal(porVideo);
    salvarMedidasPeca(produto.id, {
      medidas: medidasAtuais,
      tamanhoReferencia: refAtual,
      medidasPorVideo: porVideo,
    });
  }

  function comprar() {
    if (opcao === "sob-medida") {
      const temAlgumaMedida = Boolean(medidasAtuais.busto || medidasAtuais.cintura || medidasAtuais.quadril);
      if (temAlgumaMedida || porVideoAtual) {
        salvarMedidasPeca(produto.id, {
          medidas: medidasAtuais,
          tamanhoReferencia: refAtual,
          medidasPorVideo: porVideoAtual,
        });
      }
    }
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

      {/* Bloco de medidas fechado por padrao para nao carregar a coluna antes do COMPRAR */}
      {!pronta && (
        <div className="mt-3">
          <button
            type="button"
            aria-expanded={medidasAberta}
            onClick={() => setMedidasAberta((a) => !a)}
            className={`flex min-h-11 w-full items-center justify-between rounded-[4px] border px-3 text-left text-[12px] text-[#1B4965] ${LINHA} ${HOVER} ${FOCO}`}
          >
            <span className="truncate">
              {resumoSalvo ? `Medidas: ${resumoSalvo}` : "Informar medidas agora (opcional)"}
            </span>
            <svg
              aria-hidden
              viewBox="0 0 12 12"
              className={`ml-2 h-3 w-3 shrink-0 transition-transform duration-200 motion-reduce:transition-none ${
                medidasAberta ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.2}
            >
              <path d="M2.5 4.5 6 8l3.5-3.5" />
            </svg>
          </button>

          {medidasAberta && (
            <div className="mt-2">
              <SeletorMedidasSobMedida
                medidas={medidasAtuais}
                medidasPorVideo={porVideoAtual}
                tamanhoReferencia={refAtual}
                aoMudarMedidas={aoMudarMedidas}
                aoMudarPorVideo={aoMudarPorVideo}
              />
            </div>
          )}
        </div>
      )}

      <button type="button" onClick={comprar} className={`mt-4 ${BOTAO_PRINCIPAL}`}>
        Comprar
      </button>
      <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={`mt-2 w-full gap-2 ${BOTAO_CONTORNO}`}>
        <IconeWhatsApp className="h-4 w-4 shrink-0" />
        {pronta ? "Confirmar pronta entrega" : "Tirar dúvida no WhatsApp"}
      </a>
      {!pronta && <p className="mt-3 text-[12px] leading-4 text-brand-muted">{SINAL}</p>}

      <p className="mt-5 text-[14px] leading-[22px]">{produto.detalhes}</p>

      <div className="mt-6 border-t border-[#1B4965]/15">
        <Sanfona titulo="Tabela de medidas (PP a GG)">
          <TabelaMedidas
            destaque={refAtual}
            aoEscolherLinha={(linha) => {
              const m: Medidas = {
                busto: Math.round((linha.busto.min + linha.busto.max) / 2),
                cintura: Math.round((linha.cintura.min + linha.cintura.max) / 2),
                quadril: Math.round((linha.quadril.min + linha.quadril.max) / 2),
              };
              setOpcao("sob-medida");
              setMedidasAberta(true);
              aoMudarPorVideo(false);
              aoMudarMedidas(m, linha.tamanho);
            }}
          />
        </Sanfona>
        <Sanfona titulo="Cuidados com a peça">
          <p>{CUIDADOS}</p>
        </Sanfona>
        <Sanfona titulo="Como funciona a encomenda">
          <ul className="list-disc space-y-1.5 pl-4 marker:text-[#1B4965]/40">
            <li>A confecção começa com o sinal de 50% do valor. O sinal não é reembolsável em caso de desistência.</li>
            <li>Depois do pedido, a Gio manda um vídeo para você tirar as medidas, se preferir não informar agora.</li>
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
              O frete é calculado na sacola e no checkout, pelo CEP. Enviamos de {ORIGEM.cidade}/{ORIGEM.uf}, e o
              valor final é confirmado no WhatsApp.
            </li>
          </ul>
        </Sanfona>
      </div>
    </div>
  );
}
