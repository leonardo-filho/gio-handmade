// Motor do palco (a parte da página, sem three): lê a rolagem a cada quadro,
// troca os textos por atributo, conta as miçangas, abre a foto do fim e passa
// o progresso, o ponteiro e o arraste para a cena pela ponte.
//
// Fica fora do componente de propósito: é tudo imperativo (escreve no DOM e
// na ponte), sem render do React por quadro.

import type { Ponte } from "./ponte";
import { BLOCOS, TOTAL_MICANGAS, TRECHO, costura, dispersao, faixa, pousadas, saida, suave } from "./roteiro";

export type ElementosPalco = {
  raiz: HTMLElement;
  palco: HTMLElement;
  moldura: HTMLElement;
  cena: HTMLElement | null;
  cenaMiolo: HTMLElement | null;
  fotoFinal: HTMLElement | null;
  fotoFinalMiolo: HTMLElement | null;
  contorno: SVGSVGElement | null;
  numero: HTMLElement | null;
  fio: HTMLElement | null;
};

const milhar = new Intl.NumberFormat("pt-BR");

export function ligarPalco(el: ElementosPalco, ponte: Ponte) {
  const { raiz, palco, moldura } = el;
  const blocos = BLOCOS.map((b) => ({ ...b, no: raiz.querySelector<HTMLElement>(`[data-bloco="${b.id}"]`) }));
  const estados = new Map<string, string>();
  let distancia = 1;
  let raf = 0;
  let visivel = true;
  let ultimoP = -1;
  let ultimoMovimento = 0;
  let ultimoQuadro = performance.now();
  let numeroAtual = -1;
  let vel = 0;
  let arrastando: { id: number; x: number; t: number } | null = null;
  let giravelAtual = false;
  let recorteAtual = -1;

  ponte.p = 0;
  ponte.arraste = 0;
  ponte.introInicio = -1;
  ponte.visivel = true;

  function acordar() {
    if (!raf && visivel) raf = requestAnimationFrame(quadro);
  }

  function medir() {
    const rp = palco.getBoundingClientRect();
    const rm = moldura.getBoundingClientRect();
    ponte.tela = { w: rp.width, h: rp.height };
    ponte.moldura = { x: rm.left - rp.left, y: rm.top - rp.top, w: rm.width, h: rm.height };
    distancia = Math.max(1, raiz.offsetHeight - palco.offsetHeight);
    // Costura em volta do arco, 9 px para fora da foto.
    const svg = el.contorno;
    if (svg) {
      const w = rm.width + 18;
      const h = rm.height + 18;
      const r = w / 2;
      const d = `M ${w / 2} ${h} H 0 V ${r} A ${r} ${r} 0 0 1 ${w} ${r} V ${h} Z`;
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svg.querySelectorAll("path").forEach((p) => p.setAttribute("d", d));
    }
    ultimoP = -1;
    recorteAtual = -1;
    acordar();
    ponte.pedir();
  }

  const estadoDe = (p: number, de: number, ate: number) => (p < de ? "antes" : p >= ate ? "depois" : "ativo");

  // Tudo o que depende do progresso (escrito só quando muda).
  function aplicar(p: number) {
    for (const b of blocos) {
      if (!b.no) continue;
      const e = estadoDe(p, b.de, b.ate);
      if (estados.get(b.id) !== e) {
        estados.set(b.id, e);
        b.no.dataset.estado = e;
      }
    }
    const c = costura(p);
    const n = Math.round(pousadas(c) * TOTAL_MICANGAS);
    if (n !== numeroAtual && el.numero) {
      numeroAtual = n;
      el.numero.textContent = milhar.format(n);
    }
    if (el.fio) el.fio.style.clipPath = `inset(0 ${((1 - c) * 100).toFixed(2)}% 0 0)`;

    // A cena some e a foto real abre como cortina, de baixo para cima.
    const sai = faixa(p, TRECHO.foto[0], TRECHO.foto[0] + 0.075);
    if (el.cenaMiolo) el.cenaMiolo.style.opacity = (1 - sai).toFixed(3);
    const abre = saida(faixa(p, TRECHO.foto[0] + 0.01, TRECHO.foto[1]));
    if (el.fotoFinal) el.fotoFinal.style.clipPath = `inset(${((1 - abre) * 100).toFixed(2)}% 0 0 0)`;
    if (el.fotoFinalMiolo) el.fotoFinalMiolo.style.transform = `scale(${(1.16 - 0.16 * abre).toFixed(4)})`;

    // Costura em volta da moldura: inteira em volta da peça montada; se
    // desfaz junto com ela quando a rolagem solta as miçangas, volta a ser
    // desenhada junto com a costura, some no mergulho e volta em volta da
    // foto do fim.
    const svg = el.contorno;
    if (svg) {
      let feito = ponte.introInicio < 0 ? 1 : Math.max(c, 1 - dispersao(p));
      feito = Math.max(feito, abre);
      const visto = Math.max(1 - faixa(p, 0.68, 0.75), abre);
      svg.querySelector("[data-mascara]")?.setAttribute("stroke-dashoffset", (1 - feito).toFixed(4));
      svg.style.opacity = visto.toFixed(3);
    }

    // No mergulho, a cena vai para dentro do arco: a moldura vira a lente
    // por onde se vê o bordado de perto (a foto do fim abre no mesmo lugar).
    if (el.cena) {
      const k = suave(faixa(p, TRECHO.mergulho[0], TRECHO.mergulho[0] + 0.045));
      if (k !== recorteAtual) {
        recorteAtual = k;
        if (k <= 0) el.cena.style.clipPath = "";
        else {
          const m = ponte.moldura;
          const T = ponte.tela;
          const r = (m.w / 2) * k;
          const q = 4 * k;
          el.cena.style.clipPath = `inset(${(m.y * k).toFixed(1)}px ${((T.w - m.x - m.w) * k).toFixed(1)}px ${((T.h - m.y - m.h) * k).toFixed(1)}px ${(m.x * k).toFixed(1)}px round ${r.toFixed(1)}px ${r.toFixed(1)}px ${q.toFixed(1)}px ${q.toFixed(1)}px)`;
        }
      }
    }

    const giravel = p >= TRECHO.giro[0] - 0.02 && p < TRECHO.mergulho[1];
    if (giravel !== giravelAtual) {
      giravelAtual = giravel;
      if (giravel) palco.dataset.giravel = "";
      else delete palco.dataset.giravel;
    }
  }

  function quadro(agora: number) {
    raf = 0;
    const dt = Math.min(0.05, (agora - ultimoQuadro) / 1000);
    ultimoQuadro = agora;
    const t = -raiz.getBoundingClientRect().top / distancia;
    const p = t < 0 ? 0 : t > 1 ? 1 : t;
    if (p !== ultimoP) {
      if (ultimoP >= 0) ponte.ultimoGesto = agora;
      ultimoMovimento = agora;
      ultimoP = p;
      ponte.p = p;
      aplicar(p);
      ponte.pedir();
    }
    // Giro solto depois do arraste, perdendo força.
    if (!arrastando && Math.abs(vel) > 0.0004) {
      ponte.arraste += vel * dt;
      vel *= Math.pow(0.9, dt * 60);
      ponte.pedir();
    }
    // Antes de a peça ficar pronta, o giro do arraste volta a zero.
    if (p < TRECHO.costura[1] - 0.02 && Math.abs(ponte.arraste) > 0.001 && !arrastando) {
      ponte.arraste *= Math.pow(0.9, dt * 60);
      ponte.pedir();
    }
    // O arraste só conta enquanto ainda volta a zero (antes da peça pronta);
    // depois disso ele fica parado onde a pessoa deixou.
    const voltando = p < TRECHO.costura[1] - 0.02 && Math.abs(ponte.arraste) > 0.001;
    const continuar = agora - ultimoMovimento < 500 || Math.abs(vel) > 0.0004 || !!arrastando || voltando;
    if (visivel && continuar) raf = requestAnimationFrame(quadro);
  }

  /** A cena desenhou o primeiro quadro. */
  function pronta() {
    el.cena?.setAttribute("data-pronta", "");
    // Com a página no topo, a foto se desfaz nas miçangas; com a rolagem já
    // andando, a cena só aparece no ponto em que está.
    ponte.introInicio = ponte.p < 0.03 ? performance.now() : performance.now() - 10000;
    raiz.dataset.intro = "";
    ultimoP = -1;
    acordar();
    ponte.pedir();
  }

  // Ponteiro (mouse) e dedo: as miçangas soltas abrem caminho; com a peça
  // pronta, o arraste horizontal gira.
  function posicao(x: number, y: number) {
    const r = palco.getBoundingClientRect();
    ponte.ponteiro.x = ((x - r.left) / r.width) * 2 - 1;
    ponte.ponteiro.y = -(((y - r.top) / r.height) * 2 - 1);
    ponte.ponteiro.ativo = true;
    ponte.ultimoGesto = performance.now();
    ponte.pedir();
  }
  const aoMover = (e: PointerEvent) => {
    if (e.pointerType === "mouse" || arrastando) posicao(e.clientX, e.clientY);
    if (arrastando && e.pointerId === arrastando.id) {
      const dx = e.clientX - arrastando.x;
      const passo = Math.max(1, e.timeStamp - arrastando.t);
      const giro = (dx / Math.max(320, palco.clientWidth)) * Math.PI * 1.4;
      ponte.arraste += giro;
      vel = vel * 0.6 + (giro / passo) * 1000 * 0.4;
      arrastando.x = e.clientX;
      arrastando.t = e.timeStamp;
      acordar();
    }
  };
  const aoApertar = (e: PointerEvent) => {
    if (e.button !== 0 || !giravelAtual) return;
    if ((e.target as Element | null)?.closest("a,button")) return;
    arrastando = { id: e.pointerId, x: e.clientX, t: e.timeStamp };
    vel = 0;
    palco.dataset.arrastando = "";
    try {
      palco.setPointerCapture(e.pointerId);
    } catch {
      // o ponteiro já foi solto
    }
    acordar();
  };
  const aoSoltar = (e: PointerEvent) => {
    if (arrastando && e.pointerId === arrastando.id) {
      arrastando = null;
      delete palco.dataset.arrastando;
      acordar();
    }
    if (e.pointerType !== "mouse") ponte.ponteiro.ativo = false;
  };
  const aoSair = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    ponte.ponteiro.ativo = false;
    ponte.pedir();
  };
  const aoTocar = (e: TouchEvent) => {
    const t = e.touches[0];
    if (t) posicao(t.clientX, t.clientY);
  };
  const aoTirarDedo = () => {
    ponte.ponteiro.ativo = false;
    ponte.pedir();
  };
  palco.addEventListener("pointermove", aoMover);
  palco.addEventListener("pointerdown", aoApertar);
  palco.addEventListener("pointerup", aoSoltar);
  palco.addEventListener("pointercancel", aoSoltar);
  palco.addEventListener("pointerleave", aoSair);
  palco.addEventListener("touchstart", aoTocar, { passive: true });
  palco.addEventListener("touchmove", aoTocar, { passive: true });
  palco.addEventListener("touchend", aoTirarDedo, { passive: true });

  // Inclinação do celular. O ouvinte vale em toda tela de toque: no Chrome
  // os eventos chegam sem pedir nada; no iPhone o Safari só manda depois de
  // uma permissão que a página não pede, então ali nada chega. O tremor da
  // mão (menos de 1 grau) não conta, e com a cena já escondida (foto do fim)
  // nada é pedido.
  let baseBeta: number | null = null;
  let gamaUsado = 0;
  let betaUsado = 0;
  const aoInclinar = (e: DeviceOrientationEvent) => {
    if (e.gamma == null || e.beta == null || !visivel || ponte.p >= TRECHO.foto[0]) return;
    baseBeta = baseBeta == null ? e.beta : baseBeta + (e.beta - baseBeta) * 0.02;
    const gama = e.gamma;
    const beta = e.beta - baseBeta;
    if (Math.abs(gama - gamaUsado) < 1 && Math.abs(beta - betaUsado) < 1) return;
    gamaUsado = gama;
    betaUsado = beta;
    ponte.inclinacao.x = Math.max(-1, Math.min(1, gama / 24));
    ponte.inclinacao.y = Math.max(-1, Math.min(1, beta / 18));
    ponte.pedir();
  };
  const usaInclinacao = "DeviceOrientationEvent" in window && window.matchMedia("(pointer: coarse)").matches;
  if (usaInclinacao) window.addEventListener("deviceorientation", aoInclinar);

  const observador = new IntersectionObserver(
    ([entrada]) => {
      visivel = entrada.isIntersecting;
      ponte.visivel = visivel;
      if (visivel) {
        acordar();
        ponte.pedir();
      }
    },
    { rootMargin: "80px 0px" }
  );
  observador.observe(raiz);
  const redimensionar = new ResizeObserver(medir);
  redimensionar.observe(palco);
  redimensionar.observe(moldura);
  redimensionar.observe(raiz);
  window.addEventListener("scroll", acordar, { passive: true });
  medir();

  return {
    pronta,
    /** Topo da página onde a rolagem mostra o fim (para o foco do teclado). */
    rolagemDoFim(fracao: number) {
      return raiz.getBoundingClientRect().top + window.scrollY + distancia * fracao;
    },
    desligar() {
      cancelAnimationFrame(raf);
      observador.disconnect();
      redimensionar.disconnect();
      window.removeEventListener("scroll", acordar);
      window.removeEventListener("deviceorientation", aoInclinar);
      palco.removeEventListener("pointermove", aoMover);
      palco.removeEventListener("pointerdown", aoApertar);
      palco.removeEventListener("pointerup", aoSoltar);
      palco.removeEventListener("pointercancel", aoSoltar);
      palco.removeEventListener("pointerleave", aoSair);
      palco.removeEventListener("touchstart", aoTocar);
      palco.removeEventListener("touchmove", aoTocar);
      palco.removeEventListener("touchend", aoTirarDedo);
      ponte.visivel = false;
      // Desfaz o que foi escrito direto no DOM: se a página cair para a
      // versão estática (cena que falhou, movimento reduzido ligado agora),
      // a foto do fim e a costura não podem ficar escondidas.
      for (const no of [el.cena, el.cenaMiolo, el.fotoFinal, el.fotoFinalMiolo, el.contorno, el.fio]) {
        no?.style.removeProperty("clip-path");
        no?.style.removeProperty("opacity");
        no?.style.removeProperty("transform");
      }
      el.contorno?.querySelector("[data-mascara]")?.setAttribute("stroke-dashoffset", "0");
      for (const b of blocos) b.no?.removeAttribute("data-estado");
      delete raiz.dataset.intro;
      delete palco.dataset.giravel;
      delete palco.dataset.arrastando;
    },
  };
}

export type MotorPalco = ReturnType<typeof ligarPalco>;
