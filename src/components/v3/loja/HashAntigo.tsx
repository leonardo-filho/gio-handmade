"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Links antigos com âncora: /loja#tops vira /loja?ver=tops e /loja#<id> vai
// para a página da peça. Os outros parâmetros (utm etc.) seguem junto.
export default function HashAntigo({ pecas, vistas }: { pecas: string[]; vistas: string[] }) {
  const router = useRouter();

  useEffect(() => {
    let alvo = window.location.hash.replace(/^#/, "");
    if (!alvo) return;
    try {
      alvo = decodeURIComponent(alvo);
    } catch {
      /* hash malformado: segue como veio */
    }
    const url = new URL(window.location.href);
    url.hash = "";
    if (pecas.includes(alvo)) {
      router.replace(`/loja/${encodeURIComponent(alvo)}${url.search}`);
    } else if (vistas.includes(alvo) && !url.searchParams.has("ver")) {
      url.searchParams.set("ver", alvo);
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [pecas, vistas, router]);

  return null;
}
