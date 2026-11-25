"use client";

// Hero da home, "Ponto a ponto": o Top Maya montado em 3D, miçanga por
// miçanga, enquanto a pessoa rola.
//
// Contrato com a home: export default, sem props. A seção começa no topo da
// página, por baixo do header fixo (o espaço dele já está dentro do layout),
// e termina no creme da marca, para emendar na seção seguinte.
//
// Como funciona:
// - O HTML do servidor já traz a abertura pronta: título, a foto da peça no
//   manequim dentro da moldura em arco e a costura dourada. É a primeira
//   pintura e o LCP. O que vem depois (frases, contador, preço e botões) já
//   está no HTML, escondido até a rolagem chegar.
// - No navegador, com WebGL e movimento liberado, a seção fica alta (cerca de
//   4 telas) com o palco preso, e a cena 3D (three + React Three Fiber) entra
//   por cima da foto depois que a página carrega. As miçangas nascem em cima
//   da foto, se soltam e voltam para o lugar uma a uma com a rolagem.
// - Sem WebGL, com movimento reduzido, com economia de dados ou sem
//   JavaScript, fica a versão estática (ver hero3d.module.css), sem rolagem
//   presa e sem baixar o three.
//
// A rolagem é lida a cada quadro numa ref (o Lenis já suaviza), sem render do
// React por quadro: os textos trocam por atributo e o CSS anima.

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { abrirPeca } from "@/components/loja/urlLoja";
import { produtoPorId } from "@/components/loja/vistas";
import { fotosDe } from "@/components/vitrine/dados";
import { guardarHeroi } from "@/components/vitrine/heroi";
import { formatBRLPreco } from "@/lib/format";
import { labelParcelamento, parcelamentoCartao } from "@/lib/parcelas";
import { rolarAte } from "@/lib/travaRolagem";
import { FOCO_MANEQUIM, FOTO_MANEQUIM, criarPonte, type Ponte } from "./ponte";
import { ligarPalco, type MotorPalco } from "./palco";
import { BLOCOS, P_FINAL, TOTAL_MICANGAS } from "./roteiro";
import s from "./hero3d.module.css";

const Cena = dynamic(() => import("./Cena"), { ssr: false, loading: () => null });

// ------------------------------------------------------------------ a peça

const PECA = produtoPorId.get("top-maya");
const FOTO_FINAL = PECA?.fotoHover ?? "/colecao/top-maya-2.jpg";
const NOME = PECA?.nome ?? "Top Maya";
// A primeira frase do texto da peça no catálogo ("Bordado à mão, com um mix
// de mais de 2.500 miçangas e pedrarias.").
const DETALHE = PECA?.detalhes.split(/(?<=\.)\s/)[0] ?? "Bordado à mão, com um mix de mais de 2.500 miçangas e pedrarias.";
const PARCELAS = PECA ? parcelamentoCartao(PECA) : null;
const URL_PECA = "/loja?produto=top-maya";
// Posição da foto do fim entre as fotos da peça: a folha abre nela.
const INDICE_FOTO_FINAL = PECA ? Math.max(0, fotosDe(PECA).indexOf(FOTO_FINAL)) : 0;

const atraso = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;
const milhar = new Intl.NumberFormat("pt-BR");

// ------------------------------------------------------------ modo (3D ou não)

type Modo = "3d" | "3d-compacto" | "estatico";

let modoGuardado: Modo | null = null;

function detectarModo(): Modo {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "estatico";
  // A camada 3D do CSS depende de :has(); sem ele, o CSS fica no estático e
  // a cena não teria onde aparecer (nem o three precisa baixar).
  if (typeof CSS === "undefined" || !CSS.supports?.("selector(:has(*))")) return "estatico";
  const conexao = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conexao?.saveData) return "estatico";
  try {
    const teste = document.createElement("canvas");
    const gl = teste.getContext("webgl2") ?? teste.getContext("webgl");
    if (!gl) return "estatico";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    return "estatico";
  }
  const pequeno = window.matchMedia("(max-width: 767.98px), (pointer: coarse)").matches;
  return pequeno ? "3d-compacto" : "3d";
}

function assinarModo(avisar: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mudou = () => {
    modoGuardado = null;
    avisar();
  };
  mq.addEventListener("change", mudou);
  return () => mq.removeEventListener("change", mudou);
}

const lerModo = () => (modoGuardado ??= detectarModo());
const modoDoServidor = (): Modo => "3d";

/** Se a cena quebrar (WebGL perdido, arquivo que não chega), fica o estático. */
class Guarda extends Component<{ aoFalhar: () => void; children: ReactNode }, { erro: boolean }> {
  state = { erro: false };
  static getDerivedStateFromError() {
    return { erro: true };
  }
  componentDidCatch() {
    this.props.aoFalhar();
  }
  render() {
    return this.state.erro ? null : this.props.children;
  }
}

// ---------------------------------------------------------------- componente

export default function HeroPontoAPonto() {
  const modoAparelho = useSyncExternalStore(assinarModo, lerModo, modoDoServidor);
  const [falhou, setFalhou] = useState(false);
  const [montar, setMontar] = useState(false);
  const modo: Modo = falhou ? "estatico" : modoAparelho;
  const tres = modo !== "estatico";

  const [ponte] = useState<Ponte>(criarPonte);
  const raizRef = useRef<HTMLElement>(null);
  const palcoRef = useRef<HTMLDivElement>(null);
  const cenaRef = useRef<HTMLDivElement>(null);
  const cenaMioloRef = useRef<HTMLDivElement>(null);
  const molduraRef = useRef<HTMLDivElement>(null);
  const fotoFinalRef = useRef<HTMLDivElement>(null);
  const fotoFinalMioloRef = useRef<HTMLDivElement>(null);
  const contornoRef = useRef<SVGSVGElement>(null);
  const numeroRef = useRef<HTMLSpanElement>(null);
  const fioRef = useRef<HTMLSpanElement>(null);
  const motorRef = useRef<MotorPalco | null>(null);
  const idMascara = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  const aoFicarPronta = useCallback(() => motorRef.current?.pronta(), []);
  const aoFalhar = useCallback(() => setFalhou(true), []);

  // A cena entra depois que a página carregou (o LCP é a foto do HTML), ou
  // antes, se a pessoa já começou a rolar.
  useEffect(() => {
    if (!tres) return;
    let feito = false;
    let idle = 0;
    const iniciar = () => {
      if (feito) return;
      feito = true;
      setMontar(true);
    };
    const quandoOcioso = () => {
      const w = window as Window & { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number };
      if (w.requestIdleCallback) idle = w.requestIdleCallback(iniciar, { timeout: 1200 });
      else idle = window.setTimeout(iniciar, 250);
    };
    if (document.readyState === "complete") quandoOcioso();
    else window.addEventListener("load", quandoOcioso, { once: true });
    window.addEventListener("scroll", iniciar, { once: true, passive: true });
    window.addEventListener("pointerdown", iniciar, { once: true, passive: true });
    return () => {
      window.removeEventListener("load", quandoOcioso);
      window.removeEventListener("scroll", iniciar);
      window.removeEventListener("pointerdown", iniciar);
      const w = window as Window & { cancelIdleCallback?: (id: number) => void };
      w.cancelIdleCallback?.(idle);
      window.clearTimeout(idle);
    };
  }, [tres]);

  // O motor do palco: lê a rolagem, troca os textos, conta as miçangas e
  // passa tudo para a cena pela ponte (ver palco.ts).
  useEffect(() => {
    const raiz = raizRef.current;
    const palco = palcoRef.current;
    const moldura = molduraRef.current;
    if (!tres || !raiz || !palco || !moldura) return;
    const motor = ligarPalco(
      {
        raiz,
        palco,
        moldura,
        cena: cenaRef.current,
        cenaMiolo: cenaMioloRef.current,
        fotoFinal: fotoFinalRef.current,
        fotoFinalMiolo: fotoFinalMioloRef.current,
        contorno: contornoRef.current,
        numero: numeroRef.current,
        fio: fioRef.current,
      },
      ponte
    );
    motorRef.current = motor;
    return () => {
      motor.desligar();
      motorRef.current = null;
    };
  }, [tres, ponte]);

  // "Ver a peça" abre a folha ali mesmo, na home (a mesma da /loja): a foto
  // do fim cresce até ela e o voltar do celular fecha, sem sair da página.
  // O href continua valendo para abrir em outra aba e sem JavaScript.
  const aoVerPeca = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!PECA) return;
    e.preventDefault();
    const foto = fotoFinalRef.current;
    const img = foto?.querySelector("img");
    const r = foto?.getBoundingClientRect();
    if (img && r && r.width > 0 && r.height > 0) {
      guardarHeroi({
        id: PECA.id,
        indice: INDICE_FOTO_FINAL,
        caixa: { left: r.left, top: r.top, width: r.width, height: r.height },
        src: img.currentSrc || img.src,
      });
    }
    abrirPeca(PECA.id);
  }, []);

  // Quem chega aos botões do fim pelo teclado vai até eles.
  const aoFocarFinal = useCallback(() => {
    const motor = motorRef.current;
    const final = BLOCOS.find((b) => b.id === "final");
    if (!motor || !final || ponte.p >= final.de) return;
    rolarAte(motor.rolagemDoFim(P_FINAL), true);
  }, [ponte]);

  return (
    <section ref={raizRef} data-modo={tres ? "3d" : "estatico"} aria-labelledby="hero-titulo" className={s.raiz}>
      <noscript>
        <span className={s.semJs} />
      </noscript>
      <div ref={palcoRef} className={s.palco}>
        <div ref={cenaRef} className={s.cena} aria-hidden>
          <div ref={cenaMioloRef} className={s.cenaMiolo}>
            {tres && montar && (
              <Guarda aoFalhar={aoFalhar}>
                <Suspense fallback={null}>
                  <Cena ponte={ponte} compacto={modo === "3d-compacto"} aoFicarPronta={aoFicarPronta} />
                </Suspense>
              </Guarda>
            )}
          </div>
        </div>

        <div className={s.grade}>
          {/* Abertura */}
          <div className={`${s.bloco} ${s.abertura}`} data-bloco="abertura" data-estado="ativo">
            <div className={s.cima}>
              <p className={`${s.olho} ${s.surge}`} style={atraso(0)}>
                100% artesanal · Belém · PA
              </p>
              <h1 id="hero-titulo" className={s.titulo}>
                <span className={s.linha}>
                  <span style={atraso(60)}>Bordado à mão,</span>
                </span>
                <span className={s.linha}>
                  <span style={atraso(150)} className="italic">
                    um a um.
                  </span>
                </span>
              </h1>
            </div>
            <div className={s.so3d}>
              <div className={s.baixo} aria-hidden>
                <p className={`${s.dica} ${s.surge}`} style={atraso(420)}>
                  <span className={`${s.ponto} ${s.costurar} w-9 shrink-0 md:w-16`} style={atraso(520)} />
                  Role e veja a peça nascer
                </p>
              </div>
            </div>
          </div>

          {/* Costura: as miçangas voam para o lugar */}
          <div className={`${s.bloco} ${s.so3d}`} data-bloco="costura" data-estado="antes" aria-hidden>
            <div className={s.cima}>
              <p className={`${s.olho} ${s.surge}`}>Ponto a ponto</p>
              <p className={s.frase}>
                <span className={s.linha}>
                  <span style={atraso(40)}>Um trabalho de paciência,</span>
                </span>
                <span className={s.linha}>
                  <span style={atraso(120)} className="italic">
                    arte e dedicação.
                  </span>
                </span>
              </p>
            </div>
            <div className={s.baixo}>
              <div className={`${s.contador} ${s.surge}`} style={atraso(80)}>
                <span ref={numeroRef} className={s.numero}>
                  0
                </span>
                <span className="text-[12.5px] leading-tight text-brand-muted md:text-[14px]">
                  de {milhar.format(TOTAL_MICANGAS)}
                  <br />
                  miçangas e pedrarias
                </span>
              </div>
              <span ref={fioRef} className={`${s.ponto} ${s.surge} mt-3 w-full max-w-[280px]`} style={{ ...atraso(160), clipPath: "inset(0 100% 0 0)" }} />
            </div>
          </div>

          {/* A peça pronta, girando */}
          <div className={`${s.bloco} ${s.so3d}`} data-bloco="peca" data-estado="antes" aria-hidden>
            <div className={s.cima}>
              <p className={`${s.olho} ${s.surge}`}>A peça</p>
              <p className={s.nomePeca}>
                <span className={s.linha}>
                  <span style={atraso(40)}>{NOME}</span>
                </span>
              </p>
            </div>
            <div className={s.baixo}>
              <p className={`${s.texto} ${s.surge}`} style={atraso(120)}>
                {DETALHE}
              </p>
              <p className={`${s.dica} ${s.surge} mt-2.5`} style={atraso(220)}>
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#7d611c]" fill="none" stroke="currentColor" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 8 3 12l4 4M17 8l4 4-4 4M3 12h18" />
                </svg>
                <span className="[@media(hover:hover)]:hidden">Arraste para o lado para girar</span>
                <span className="hidden [@media(hover:hover)]:inline">Arraste para girar</span>
              </p>
            </div>
          </div>

          {/* Mergulho no bordado (a cena fica dentro do arco) */}
          <div className={`${s.bloco} ${s.so3d}`} data-bloco="mergulho" data-estado="antes" aria-hidden>
            <div className={s.cima}>
              <p className={`${s.olho} ${s.surge}`}>De perto</p>
              <p className={s.nomePeca}>
                <span className={s.linha}>
                  <span style={atraso(0)}>Uma a uma,</span>
                </span>
                <span className={s.linha}>
                  <span style={atraso(110)} className="italic">
                    à mão.
                  </span>
                </span>
              </p>
            </div>
          </div>

          {/* A peça de verdade */}
          <div className={s.bloco} data-bloco="final" data-estado="antes" onFocus={aoFocarFinal}>
            <div className={`${s.cima} ${s.nome}`}>
              <p className={`${s.olho} ${s.surge}`}>Tops · feito à mão</p>
              <h2 className={s.nomePeca}>
                <span className={s.linha}>
                  <span style={atraso(60)}>{NOME}</span>
                </span>
              </h2>
            </div>
            <div className={s.baixo}>
              {PARCELAS && PECA && (
                <div className={s.surge} style={atraso(140)}>
                  <p className={s.precoLinha}>
                    <span className={`${s.preco} nums-preco`}>{formatBRLPreco(PARCELAS.total)}</span>
                    <span className="text-[13px] text-brand-muted">{labelParcelamento(PARCELAS)}</span>
                  </p>
                  <p className="nums-preco mt-0.5 text-[13px] text-brand-gold-text">ou {formatBRLPreco(PECA.preco)} no pix</p>
                </div>
              )}
              <div className={`${s.botoes} ${s.surge}`} style={atraso(220)}>
                <Link href={URL_PECA} onClick={aoVerPeca} className={`${s.botao} ${s.botaoCheio}`}>
                  Ver a peça
                  <svg className={s.seta} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-5-5 5 5-5 5" />
                  </svg>
                </Link>
                <Link href="/loja" className={`${s.botao} ${s.botaoVazio}`}>
                  Ver a loja
                </Link>
              </div>
            </div>
          </div>

          {/* Moldura em arco: a foto do manequim (abertura), a foto real (fim)
              e a costura dourada em volta. A cena 3D se alinha a ela. */}
          <div className={s.arco}>
            <div ref={molduraRef} className={s.moldura}>
              {/* data-foto-peca e data-slide: a folha da peça (a mesma da
                  /loja) cresce desta foto e volta para ela ao fechar. */}
              <div className={s.janela} data-foto-peca={PECA?.id} data-indice={INDICE_FOTO_FINAL}>
                <div className={`${s.foto} ${s.fotoAbertura}`} data-slide>
                  <Image
                    data-principal
                    src={FOTO_MANEQUIM.src}
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 1024px) 44vw, 86vw"
                    className="object-cover"
                    style={{ objectPosition: `${FOCO_MANEQUIM.x * 100}% ${FOCO_MANEQUIM.y * 100}%` }}
                  />
                </div>
                <div ref={fotoFinalRef} className={`${s.foto} ${s.fotoFinal}`} data-slide>
                  <div ref={fotoFinalMioloRef} className={s.fotoMiolo}>
                    {/* Sem preload e com prioridade baixa: no 3D ela só aparece
                        no fim da rolagem e não disputa banda com a foto da
                        abertura (o LCP). */}
                    <Image
                      data-principal
                      src={FOTO_FINAL}
                      alt={`${NOME} vestido pela modelo: bordado à mão com miçangas e pedrarias`}
                      fill
                      loading="eager"
                      fetchPriority="low"
                      sizes="(min-width: 1024px) 44vw, 86vw"
                      className="object-cover"
                      style={{ objectPosition: "50% 30%" }}
                    />
                  </div>
                </div>
              </div>
              <svg ref={contornoRef} className={s.contorno} aria-hidden viewBox="0 0 318 418" preserveAspectRatio="none">
                <defs>
                  <mask id={idMascara} maskUnits="userSpaceOnUse">
                    <path data-mascara d="M 159 418 H 0 V 159 A 159 159 0 0 1 318 159 V 418 Z" stroke="#fff" strokeWidth={6} pathLength={1} strokeDasharray="1 1" strokeDashoffset={0} />
                  </mask>
                </defs>
                <path
                  d="M 159 418 H 0 V 159 A 159 159 0 0 1 318 159 V 418 Z"
                  stroke="#b8902a"
                  strokeWidth={1.5}
                  strokeDasharray="7 5"
                  mask={`url(#${idMascara})`}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
