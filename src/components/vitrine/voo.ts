// Adicionar ao carrinho com causa e efeito: uma cópia pequena da foto voa em
// arco até a sacola do header, a sacola dá um pulo e um anel dourado se abre
// em volta dela. A peça entra no carrinho no pouso, então o contador muda
// junto com o pulo e o aviso "no carrinho" aparece logo depois.
//
// O arco sai de dois movimentos com curvas diferentes: o horizontal desacelera
// e o vertical acelera. Tudo é transform e opacity (Web Animations API), fora
// do React, e some sozinho no fim. Com movimento reduzido, a peça entra na
// hora, sem voo.

import { CSS_EASE, movimentoReduzido, type Caixa } from "./movimento";

const DURACAO = 800;

/** A sacola visível do header (há uma para o celular e outra para o desktop). */
function sacolaVisivel() {
  const botoes = Array.from(document.querySelectorAll<HTMLElement>("header [data-cart-button]"));
  return botoes.find((b) => b.getBoundingClientRect().width > 0) ?? null;
}

export function voarParaSacola(de: Caixa | null, src: string | null, aoChegar: () => void, encaixe: "cover" | "contain" = "cover") {
  const sacola = sacolaVisivel();
  if (!de || !src || !sacola || movimentoReduzido()) {
    aoChegar();
    return;
  }
  const alvo = sacola.getBoundingClientRect();

  // Começa com no máximo 120 px de largura, centrada na foto de origem: uma
  // foto de 600 px voando inteira cobriria a tela.
  const largura = Math.min(de.width, 120);
  const altura = largura * (de.height / de.width);
  const x0 = de.left + (de.width - largura) / 2;
  const y0 = de.top + (de.height - altura) / 2;
  const dx = alvo.left + alvo.width / 2 - (x0 + largura / 2);
  const dy = alvo.top + alvo.height / 2 - (y0 + altura / 2);
  const escalaInicial = Math.min(1, de.width / largura);
  const escalaFinal = 30 / largura;

  const eixoX = document.createElement("div");
  const eixoY = document.createElement("div");
  const foto = document.createElement("div");
  const img = document.createElement("img");
  eixoX.setAttribute("aria-hidden", "true");
  eixoX.style.cssText = `position:fixed;left:${x0}px;top:${y0}px;width:${largura}px;height:${altura}px;z-index:130;pointer-events:none;will-change:transform`;
  eixoY.style.cssText = "width:100%;height:100%;will-change:transform";
  foto.style.cssText =
    "width:100%;height:100%;overflow:hidden;border-radius:6px;box-shadow:0 0 0 2px #EDE7D9,0 0 0 3.5px rgba(184,144,42,.9),0 22px 44px -10px rgba(19,2,9,.55);will-change:transform,opacity;background:#fff";
  img.src = src;
  img.alt = "";
  img.style.cssText = `width:100%;height:100%;object-fit:${encaixe};display:block`;
  foto.appendChild(img);
  eixoY.appendChild(foto);
  eixoX.appendChild(eixoY);
  document.body.appendChild(eixoX);

  eixoX.animate([{ transform: "translateX(0)" }, { transform: `translateX(${dx}px)` }], {
    duration: DURACAO,
    easing: "cubic-bezier(0.33, 0.5, 0.45, 1)",
    fill: "forwards",
  });
  eixoY.animate([{ transform: "translateY(0)" }, { transform: `translateY(${dy}px)` }], {
    duration: DURACAO,
    easing: "cubic-bezier(0.55, 0, 0.8, 0.45)",
    fill: "forwards",
  });
  // Easing por trecho (o da opção valeria para a animação inteira e
  // apressaria o sumiço): encolhe rápido, viaja inteira e só some no pouso.
  const voo = foto.animate(
    [
      { transform: `scale(${escalaInicial})`, opacity: 1, borderRadius: "6px", easing: CSS_EASE },
      { transform: "scale(0.74) rotate(-5deg)", opacity: 1, offset: 0.32, easing: "ease-in-out" },
      { transform: `scale(${escalaFinal * 1.5}) rotate(4deg)`, opacity: 1, borderRadius: "45%", offset: 0.86, easing: "ease-in" },
      { transform: `scale(${escalaFinal}) rotate(0deg)`, opacity: 0, borderRadius: "50%" },
    ],
    { duration: DURACAO, easing: "linear", fill: "forwards" }
  );

  let chegou = false;
  const pousar = () => {
    if (chegou) return;
    chegou = true;
    eixoX.remove();
    aoChegar();
    pular(sacola);
  };
  voo.onfinish = pousar;
  voo.oncancel = pousar;
  // Garantia: se a aba ficar em segundo plano, a peça entra mesmo assim.
  window.setTimeout(pousar, DURACAO + 400);
}

/** Pulo da sacola e anel dourado em volta dela. */
function pular(sacola: HTMLElement) {
  sacola.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.28) rotate(-6deg)", offset: 0.35 },
      { transform: "scale(0.94) rotate(3deg)", offset: 0.7 },
      { transform: "scale(1)" },
    ],
    { duration: 560, easing: "ease-out" }
  );
  const r = sacola.getBoundingClientRect();
  const anel = document.createElement("div");
  anel.setAttribute("aria-hidden", "true");
  const d = Math.max(r.width, r.height);
  anel.style.cssText = `position:fixed;left:${r.left + r.width / 2 - d / 2}px;top:${r.top + r.height / 2 - d / 2}px;width:${d}px;height:${d}px;border-radius:50%;border:1.5px solid #b8902a;z-index:130;pointer-events:none`;
  document.body.appendChild(anel);
  const onda = anel.animate(
    [
      { transform: "scale(0.6)", opacity: 0.9 },
      { transform: "scale(1.9)", opacity: 0 },
    ],
    { duration: 650, easing: CSS_EASE }
  );
  onda.onfinish = () => anel.remove();
  onda.oncancel = () => anel.remove();
}
