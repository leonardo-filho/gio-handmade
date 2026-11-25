"use client";

import { useCart } from "./cart/CartProvider";
import { WA_ORCAMENTO } from "./home/textos";
import { useGavetas } from "./v3/estrutura/Gavetas";
import { IconeWhatsApp } from "./v3/estrutura/Icones";
import { FOCO } from "./v3/estrutura/estilo";

// WhatsApp flutuante (spec v3): verde, 48 px, a 16 px do canto, sempre na
// tela. É a única sombra do site. Some com a sacola ou o menu abertos.
//
// O verde #1A8F45 deixa o ícone branco em 4,2:1 e o botão em 3,4:1 sobre o
// creme (o verde do WhatsApp, #25D366, dava 2:1).
//
// Para esconder no celular (página de produto, onde ele cobriria o preço e o
// COMPRAR), qualquer um dos dois:
//   <WhatsAppButton ocultarNoCelular />
//   ou o atributo data-sem-whatsapp num ancestral (no <main> da página ou no
//   <body>). Do md para cima ele continua aparecendo.
export default function WhatsAppButton({ ocultarNoCelular = false }: { ocultarNoCelular?: boolean }) {
  const { isOpen: sacolaAberta } = useCart();
  const { aberta: gavetaAberta } = useGavetas();
  const escondido = sacolaAberta || gavetaAberta;

  return (
    <a
      href={WA_ORCAMENTO}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a Gio no WhatsApp"
      data-whatsapp-flutuante=""
      className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#1A8F45] text-white shadow-[0_4px_14px_rgba(19,2,9,0.25)] transition-opacity duration-200 hover:opacity-70 motion-reduce:transition-none max-md:[[data-sem-whatsapp]_&]:hidden ${FOCO} ${
        ocultarNoCelular ? "max-md:hidden" : ""
      } ${escondido ? "invisible opacity-0" : "visible opacity-100"}`}
    >
      <IconeWhatsApp className="h-6 w-6" />
    </a>
  );
}
