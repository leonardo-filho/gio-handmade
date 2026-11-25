import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Produto } from "@/data/produtos";
import Foto from "@/components/v3/loja/Foto";
import { precosDe } from "@/components/v3/loja/precos";
import { focoDe } from "../lookbook/pranchas";

// Grade editorial da loja: proporções que se alternam, como as páginas de um
// lookbook, e pouquíssimo texto (o nome e o preço no cartão).
//   celular (2 colunas, ciclo de 7): uma foto larga 4:5, depois três pares
//     de 3:4 e 2:3 desencontrados.
//   computador (4 colunas, ciclo de 6): uma foto dupla em 4:3 que recorta o
//     bordado (o mesmo ponto da prancha "O bordado de perto"), ao lado de
//     duas fotos 3:4 e 2:3; na linha seguinte, a dupla troca de lado.

const CELULAR = [
  "col-span-2 aspect-[4/5]",
  "col-span-1 aspect-[3/4]",
  "col-span-1 aspect-[2/3]",
  "col-span-1 aspect-[2/3]",
  "col-span-1 aspect-[3/4]",
  "col-span-1 aspect-[3/4]",
  "col-span-1 aspect-[3/4]",
];

const COMPUTADOR = [
  "lg:col-span-2 lg:aspect-[4/3]",
  "lg:col-span-1 lg:aspect-[3/4]",
  "lg:col-span-1 lg:aspect-[2/3]",
  "lg:col-span-1 lg:aspect-[2/3]",
  "lg:col-span-1 lg:aspect-[3/4]",
  "lg:col-span-2 lg:aspect-[4/3]",
];

export default function GradeEditorial({ itens }: { itens: Produto[] }) {
  return (
    <ul className="grid grid-cols-2 items-start gap-x-2 gap-y-7 lg:grid-cols-4 lg:gap-x-4 lg:gap-y-12">
      {itens.map((p, i) => {
        const celular = CELULAR[i % 7];
        const computador = COMPUTADOR[i % 6];
        const larguraCelular = i % 7 === 0;
        const larguraPc = i % 6 === 0 || i % 6 === 5;
        return (
          <li key={p.id} className={`${celular.split(" ")[0]} ${computador.split(" ")[0]}`}>
            <Cartao
              produto={p}
              proporcao={`${celular.split(" ")[1]} ${computador.split(" ")[1]}`}
              larga={larguraPc}
              largaCelular={larguraCelular}
              sizes={`(min-width: 1024px) ${larguraPc ? "50vw" : "25vw"}, ${larguraCelular ? "100vw" : "50vw"}`}
              prioridade={i < 3}
            />
          </li>
        );
      })}
    </ul>
  );
}

function Cartao({
  produto,
  proporcao,
  larga,
  largaCelular,
  sizes,
  prioridade,
}: {
  produto: Produto;
  proporcao: string;
  larga: boolean;
  largaCelular: boolean;
  sizes: string;
  prioridade: boolean;
}) {
  const precos = precosDe(produto);
  const foco = focoDe(produto);
  // Na foto dupla do computador, o recorte vai para o bordado.
  const estilo = { "--foco": foco ? `${foco.x}% ${foco.y}%` : "50% 35%" } as CSSProperties;
  const posicao = larga ? "object-[50%_40%] lg:[object-position:var(--foco)]" : "object-[50%_40%]";

  return (
    <Link
      href={`/loja/${produto.id}`}
      className="group block text-[#1B4965] outline-offset-2 focus-visible:outline-2 focus-visible:outline-[#b8902a]"
    >
      <div style={estilo} className={`relative overflow-hidden bg-[#1B4965]/5 ${proporcao}`}>
        <Foto src={produto.foto} alt={produto.nome} fill sizes={sizes} prioridade={prioridade} className={`object-cover ${posicao}`} />
        {produto.fotoHover && (
          <Image
            src={produto.fotoHover}
            alt=""
            fill
            sizes={sizes}
            className="hidden object-cover object-[50%_40%] opacity-0 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:block"
          />
        )}
        {produto.prontaEntrega && (
          <span className="absolute bottom-2 left-2 rounded bg-[#EDE7D9] px-2 py-1 text-[10px] uppercase leading-3 tracking-[0.12em] text-brand-gold-text">
            Pronta entrega
          </span>
        )}
      </div>
      {/* Foto larga: nome e preço na mesma linha. Estreita: um embaixo do outro. */}
      <div
        className={`flex gap-x-3 px-2.5 pt-2 lg:px-0 ${largaCelular ? "flex-row items-baseline justify-between" : "flex-col"} ${
          larga ? "lg:flex-row lg:items-baseline lg:justify-between" : "lg:flex-col lg:items-start lg:justify-start"
        }`}
      >
        <h3 className="min-w-0 truncate text-[13px] leading-[18px]">{produto.nome}</h3>
        <p className="nums-preco shrink-0 font-serif text-[15px] font-medium leading-5">{precos.cartao}</p>
      </div>
    </Link>
  );
}
