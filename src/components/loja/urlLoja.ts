// Estado da vitrine na URL: a URL é a fonte da verdade.
//
//   ?produto=<id>  peça aberta no modal (link de story e da bio)
//   ?ver=<slug>    filtro da barra de categorias
//   #<id> e #<slug> são os links antigos: valem na chegada e viram parâmetro.
//
// Abrir a peça pelo card cria uma entrada no histórico (pushState), então o
// voltar do celular fecha o modal em vez de sair da loja. Fechar pelo X, Esc ou
// fundo volta essa entrada; se a peça veio por link direto, não há para onde
// voltar e o parâmetro sai com replaceState. Os outros parâmetros (utm etc.)
// ficam sempre como estavam.
//
// Os componentes leem a URL com useSyncExternalStore: o snapshot do servidor é
// fixo (""), então o HTML do servidor é sempre a vista "Todas" sem modal, e a
// vista da URL entra logo depois da hidratação, sem divergência.
//
// Navegação do Next (<Link>, router.push): o Next grava a URL no commit, sem
// popstate nem hashchange. Por isso a Vitrine monta <SeguirNavegacao /> (que
// chama avisarUrl() quando a busca muda) e, enquanto a URL do navegador ainda
// é de outra página (o render da navegação acontece antes do commit), o
// snapshot é o da loja sem parâmetros, e não o da página de onde a pessoa veio.

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { produtoPorId, slugsDeVista } from "./vistas";

export type UrlLoja = {
  /** Peça aberta (id válido) ou null. */
  produto: string | null;
  /** Slug da vista (válido) ou null para "Todas". */
  ver: string | null;
};

const EVENTO = "loja:url";
const CHAVE_PECA = "lojaProduto";
const CHAVE_DOC = "lojaDoc";

// Identifica esta carga da página: depois de recarregar, a entrada marcada
// pertence a outro documento e o voltar sairia da página, então o fechar usa
// replaceState.
const DOC = Math.random().toString(36).slice(2);

// Entre o history.back() e o popstate, um segundo fechar (Esc duas vezes, ou o
// "Adicionar" que fecha sozinho) voltaria mais uma entrada e sairia da loja.
let voltando = false;
let timerVoltando: ReturnType<typeof setTimeout> | undefined;

function lerHash(hash: string) {
  const bruto = hash.replace(/^#/, "");
  if (!bruto) return "";
  try {
    return decodeURIComponent(bruto);
  } catch {
    return bruto;
  }
}

function interpretar(snapshot: string): UrlLoja {
  const i = snapshot.indexOf("#");
  const busca = new URLSearchParams(i < 0 ? snapshot : snapshot.slice(0, i));
  const hash = i < 0 ? "" : lerHash(snapshot.slice(i));

  const p = busca.get("produto");
  const v = busca.get("ver");
  const produto = p && produtoPorId.has(p) ? p : produtoPorId.has(hash) ? hash : null;
  const ver = v && slugsDeVista.has(v) ? v : slugsDeVista.has(hash) ? hash : null;
  return { produto, ver };
}

function assinar(aviso: () => void) {
  const aoNavegar = () => {
    voltando = false;
    aviso();
  };
  window.addEventListener("popstate", aoNavegar);
  window.addEventListener("hashchange", aviso);
  window.addEventListener(EVENTO, aviso);
  return () => {
    window.removeEventListener("popstate", aoNavegar);
    window.removeEventListener("hashchange", aviso);
    window.removeEventListener(EVENTO, aviso);
  };
}

const lerSnapshot = () => window.location.search + window.location.hash;
const snapshotServidor = () => "";

/** Peça aberta e filtro atuais, lidos da URL. */
export function useUrlLoja(): UrlLoja {
  const rota = usePathname();
  // Na navegação para a loja vinda de outra página (ex.: /#pronta-entrega), o
  // render roda com a URL antiga ainda no navegador: ela não vale para a loja.
  const lerDaRota = useCallback(
    () => (window.location.pathname === rota ? lerSnapshot() : ""),
    [rota]
  );
  const snapshot = useSyncExternalStore(assinar, lerDaRota, snapshotServidor);
  return useMemo(() => interpretar(snapshot), [snapshot]);
}

/** Faz quem lê a URL conferir de novo (depois de uma navegação do Next). */
export function avisarUrl() {
  window.dispatchEvent(new Event(EVENTO));
}

const assinarNada = () => () => {};

/** false no servidor e na hidratação; true depois (e em navegação no cliente). */
export function useHidratado() {
  return useSyncExternalStore(
    assinarNada,
    () => true,
    () => false
  );
}

// O history do Next (App Router) intercepta pushState/replaceState e copia o
// estado interno dele para a entrada nova; por isso o estado passado aqui leva
// só as chaves da loja, nunca o history.state inteiro.
function trocarUrl(modo: "push" | "replace", url: URL, estado: Record<string, string>) {
  const href = url.pathname + url.search + url.hash;
  if (modo === "push") window.history.pushState(estado, "", href);
  else window.history.replaceState(estado, "", href);
  avisarUrl();
}

function ehHashDaLoja(hash: string) {
  const h = lerHash(hash);
  return produtoPorId.has(h) || slugsDeVista.has(h);
}

/** Abre a peça (clique no card): nova entrada no histórico. */
export function abrirPeca(id: string) {
  if (!produtoPorId.has(id)) return;
  const url = new URL(window.location.href);
  url.searchParams.set("produto", id);
  if (ehHashDaLoja(url.hash)) url.hash = "";
  trocarUrl("push", url, { [CHAVE_PECA]: id, [CHAVE_DOC]: DOC });
}

/** Fecha a peça aberta (X, Esc, fundo, depois de adicionar ao carrinho). */
export function fecharPeca() {
  const url = new URL(window.location.href);
  const id = url.searchParams.get("produto");
  if (!id || voltando) return;

  const estado = window.history.state as Record<string, unknown> | null;
  if (estado?.[CHAVE_PECA] === id && estado?.[CHAVE_DOC] === DOC) {
    voltando = true;
    clearTimeout(timerVoltando);
    timerVoltando = setTimeout(() => {
      voltando = false;
    }, 1500);
    window.history.back();
    return;
  }

  url.searchParams.delete("produto");
  trocarUrl("replace", url, {});
}

/** Troca o filtro da vitrine (null = "Todas"). Não cria entrada no histórico. */
export function definirVer(slug: string | null) {
  const url = new URL(window.location.href);
  if (slug && slugsDeVista.has(slug)) url.searchParams.set("ver", slug);
  else url.searchParams.delete("ver");
  if (ehHashDaLoja(url.hash)) url.hash = "";
  // URL igual: só pede a releitura, para a vitrine nunca ficar presa numa
  // vista que a URL já não tem.
  if (url.href === window.location.href) return avisarUrl();
  trocarUrl("replace", url, {});
}

/**
 * Na chegada: transforma os links antigos (#<id>, #<slug>) em parâmetro e tira
 * valores que não existem mais (peça removida do catálogo, filtro errado).
 * Devolve o estado já normalizado.
 */
export function normalizarUrlChegada(): UrlLoja {
  const url = new URL(window.location.href);
  const hash = lerHash(url.hash);
  let mudou = false;

  if (produtoPorId.has(hash) || slugsDeVista.has(hash)) {
    if (produtoPorId.has(hash) && !url.searchParams.has("produto")) url.searchParams.set("produto", hash);
    if (slugsDeVista.has(hash) && !url.searchParams.has("ver")) url.searchParams.set("ver", hash);
    url.hash = "";
    mudou = true;
  }
  const p = url.searchParams.get("produto");
  if (p !== null && !produtoPorId.has(p)) {
    url.searchParams.delete("produto");
    mudou = true;
  }
  const v = url.searchParams.get("ver");
  if (v !== null && !slugsDeVista.has(v)) {
    url.searchParams.delete("ver");
    mudou = true;
  }

  if (mudou) trocarUrl("replace", url, {});
  return interpretar(lerSnapshot());
}
