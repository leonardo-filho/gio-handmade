// Ponte entre a página e a cena 3D: um objeto mutável, sem estado do React.
// A página escreve a rolagem, o ponteiro e as medidas a cada quadro; a cena
// lê no próprio quadro e só desenha quando a página pede (pedir()).

export type Caixa = { x: number; y: number; w: number; h: number };

export type Ponte = {
  /** Progresso da rolagem na seção presa (0 a 1). */
  p: number;
  /** Ponteiro na tela, de -1 a 1 (y para cima), e se está sobre o palco. */
  ponteiro: { x: number; y: number; ativo: boolean };
  /** Inclinação do celular, de -1 a 1. */
  inclinacao: { x: number; y: number };
  /** Giro extra que a pessoa deu arrastando (radianos). */
  arraste: number;
  /** Onde fica a moldura da peça, em px do canvas. */
  moldura: Caixa;
  /** Tamanho do canvas em px. */
  tela: { w: number; h: number };
  /** Quando a abertura (a foto que se desfaz em miçangas) começou, ou -1. */
  introInicio: number;
  /** Celular ou tela pequena: menos detalhe por miçanga. */
  compacto: boolean;
  /** O hero está na tela (fora dela, a cena não pede quadros). */
  visivel: boolean;
  /**
   * Último gesto da pessoa (rolagem, mouse, dedo), em ms de performance.now().
   * Sem gesto por alguns segundos, a deriva das miçangas soltas assenta e a
   * cena para de desenhar.
   */
  ultimoGesto: number;
  /** Pede um quadro à cena (a cena preenche ao montar). */
  pedir: () => void;
};

export function criarPonte(): Ponte {
  return {
    p: 0,
    ponteiro: { x: 0, y: 0, ativo: false },
    inclinacao: { x: 0, y: 0 },
    arraste: 0,
    moldura: { x: 0, y: 0, w: 1, h: 1 },
    tela: { w: 1, h: 1 },
    introInicio: -1,
    compacto: false,
    visivel: true,
    ultimoGesto: 0,
    pedir: () => {},
  };
}

/** A cena se liga à ponte: pedir() passa a desenhar um quadro. */
export function ligarPedido(ponte: Ponte, pedir: () => void) {
  ponte.pedir = pedir;
  return () => {
    if (ponte.pedir === pedir) ponte.pedir = () => {};
  };
}

/** Tamanho da foto do manequim (public/colecao/top-maya.jpg). */
export const FOTO_MANEQUIM = { src: "/colecao/top-maya.jpg", w: 1215, h: 1600 };

/** Ponto de foco da foto na moldura (object-position), em fração. */
export const FOCO_MANEQUIM = { x: 0.5, y: 0.58 };
