// Trava de rolagem e isolamento do fundo para camadas sobrepostas (modal da
// peça, carrinho, menu do celular).
//
// Por que existe: o smooth-scroll do Lenis rola com window.scrollTo, que
// ignora overflow hidden no body. Sem parar o Lenis, a roda do mouse continua
// rolando a loja por trás do modal. E como mais de uma camada pode abrir ao
// mesmo tempo, as travas são contadas: a página só volta a rolar quando a
// última camada fecha (nunca fica presa).
//
// Uso típico num useEffect:
//   useEffect(() => {
//     const liberarRolagem = travarRolagem();
//     const liberarFundo = isolarFundo();
//     return () => { liberarFundo(); liberarRolagem(); };
//   }, []);

type LenisLike = {
  stop: () => void;
  start: () => void;
  scrollTo: (alvo: number, opcoes?: { immediate?: boolean; duration?: number; force?: boolean }) => void;
};

let lenisAtual: LenisLike | null = null;
let travas = 0;
let overflowAnterior = "";

// Chamado pelo SmoothScroll ao criar (e com null ao destruir) a instância do Lenis.
export function registrarLenis(lenis: LenisLike | null) {
  lenisAtual = lenis;
  if (lenis && travas > 0) lenis.stop();
}

// Rola a página até a posição y (px do topo do documento). Passa pelo Lenis
// quando ele está ativo (scroll nativo em paralelo briga com o smooth-scroll);
// sem Lenis (movimento reduzido), usa o scroll nativo.
export function rolarAte(y: number, imediato = false) {
  if (typeof window === "undefined") return;
  const topo = Math.max(0, Math.round(y));
  if (lenisAtual) {
    lenisAtual.scrollTo(topo, imediato ? { immediate: true, force: true } : { duration: 0.9, force: true });
    return;
  }
  window.scrollTo({ top: topo, behavior: imediato ? "auto" : "smooth" });
}

// Trava a rolagem da página. Devolve a função que libera esta trava
// (chamar mais de uma vez não tem efeito).
export function travarRolagem(): () => void {
  if (typeof document === "undefined") return () => {};
  if (travas === 0) {
    overflowAnterior = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    lenisAtual?.stop();
  }
  travas += 1;

  let liberada = false;
  return () => {
    if (liberada) return;
    liberada = true;
    travas = Math.max(0, travas - 1);
    if (travas === 0) {
      document.documentElement.style.overflow = overflowAnterior;
      lenisAtual?.start();
    }
  };
}

let isolamentos = 0;

// Deixa o conteúdo da página (<main>) inerte enquanto uma camada está aberta:
// o Tab e o leitor de tela ficam só dentro da camada. As camadas (modal por
// portal no body, carrinho e aviso do carrinho no layout) ficam fora do <main>.
export function isolarFundo(): () => void {
  if (typeof document === "undefined") return () => {};
  const main = document.querySelector("main");
  if (isolamentos === 0) main?.setAttribute("inert", "");
  isolamentos += 1;

  let liberado = false;
  return () => {
    if (liberado) return;
    liberado = true;
    isolamentos = Math.max(0, isolamentos - 1);
    if (isolamentos === 0) document.querySelector("main")?.removeAttribute("inert");
  };
}

// Prende o Tab dentro do elemento (armadilha de foco de diálogo). Usar no
// onKeyDown do painel: if (e.key === "Tab") prenderTab(e, painelRef.current).
export function prenderTab(e: { key: string; shiftKey: boolean; preventDefault: () => void }, painel: HTMLElement | null) {
  if (e.key !== "Tab" || !painel) return;
  const focaveis = Array.from(
    painel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => el.offsetParent !== null || el === document.activeElement);
  if (focaveis.length === 0) {
    e.preventDefault();
    return;
  }
  const primeiro = focaveis[0];
  const ultimo = focaveis[focaveis.length - 1];
  const ativo = document.activeElement as HTMLElement | null;
  if (e.shiftKey && (ativo === primeiro || !painel.contains(ativo))) {
    e.preventDefault();
    ultimo.focus();
  } else if (!e.shiftKey && (ativo === ultimo || !painel.contains(ativo))) {
    e.preventDefault();
    primeiro.focus();
  }
}
