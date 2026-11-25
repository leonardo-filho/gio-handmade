// Card de peça (v3): grade da /loja, carrossel da home e "Veja também".
// Contrato: export default function Card({ produto, prioridade }: { produto: Produto; prioridade?: boolean }).
//
// Foto 3:4 com o selo "PRONTA ENTREGA" (o único selo) e, abaixo, três linhas:
// nome, preço no cartão e o pix. As parcelas ficam na página da peça. No
// desktop (mouse), a 2ª foto entra no hover. O card inteiro leva a /loja/<id>.
import Image from "next/image";
import Link from "next/link";
import type { Produto } from "@/data/produtos";
import Foto from "./loja/Foto";
import { precosDe } from "./loja/precos";

// Celular: 2 colunas (ou 2,25 no carrossel); tablet: 3; desktop: 4.
const SIZES = "(min-width: 1024px) 25vw, (min-width: 768px) 34vw, 50vw";

export default function Card({ produto, prioridade = false }: { produto: Produto; prioridade?: boolean }) {
  const precos = precosDe(produto);

  return (
    <Link
      href={`/loja/${produto.id}`}
      className="group block text-[#1B4965] outline-offset-2 focus-visible:outline-2 focus-visible:outline-[#b8902a]"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#1B4965]/5">
        <Foto
          src={produto.foto}
          alt={produto.nome}
          fill
          sizes={SIZES}
          prioridade={prioridade}
          className="object-cover object-[50%_40%]"
        />
        {/* 2ª foto: só existe para mouse (no toque fica display none e nem
            carrega). */}
        {produto.fotoHover && (
          <Image
            src={produto.fotoHover}
            alt=""
            fill
            sizes={SIZES}
            className="hidden object-cover object-[50%_40%] opacity-0 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:block"
          />
        )}
        {produto.prontaEntrega && (
          <span className="absolute bottom-2 left-2 rounded bg-[#EDE7D9] px-2 py-1 text-[10px] uppercase leading-3 tracking-[0.12em] text-brand-gold-text">
            Pronta entrega
          </span>
        )}
      </div>
      <div className="px-[10px] pt-2.5">
        <h3 className="truncate text-[13px] leading-[18px]">{produto.nome}</h3>
        <p className="nums-preco mt-1 font-serif text-[16px] font-medium leading-5">{precos.cartao}</p>
        {precos.pix && <p className="mt-0.5 text-[12px] leading-4 text-brand-muted">ou {precos.pix} no pix</p>}
      </div>
    </Link>
  );
}
