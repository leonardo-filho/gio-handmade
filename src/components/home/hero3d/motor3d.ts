// Motor da cena 3D: as miçangas, a peça, a câmera e a luz do estúdio.
//
// Tudo imperativo e fora do React (o componente Cena só liga as pontas): a
// cada quadro pedido, lê a ponte (rolagem, ponteiro, arraste, medidas) e
// escreve a posição de cada miçanga direto na matriz da instância.
//
// Quem chega fica com a peça montada (a foto vira miçangas nos mesmos pontos
// e a peça vira um pouco de lado). A rolagem solta as miçangas e depois as
// costura de volta, uma a uma. Parada, a cena não desenha.

import * as THREE from "three";
import { TIPOS, type Micangas } from "./micangas";
import { FOCO_MANEQUIM, type Ponte } from "./ponte";
import { TRECHO, VOO, clamp01, costura, dispersao, entraSai, faixa, suave } from "./roteiro";

export const FOV = 30;
export const DISTANCIA = 10;
const ALTURA_VISTA = 2 * DISTANCIA * Math.tan(((FOV / 2) * Math.PI) / 180);

/** Tecido do sutiã, atrás das miçangas no mergulho. */
const TECIDO = new THREE.Color("#2b1a12");

/** Miçanga pousada um pouco maior que o raio medido, para a peça fechar. */
const ESCALA_POUSADA = 1.14;

/**
 * Abertura (s): a foto some, a peça ganha relevo e vira um pouco de lado,
 * para mostrar que é de verdade em 3D. Depois fica parada até a pessoa rolar.
 */
const FIM_ABERTURA = 3.4;
/** Quanto a peça montada fica virada na abertura (radianos). */
const GIRO_REPOUSO = -0.3;

/**
 * A dispersão usa a mesma conta de tempo de antes (atraso de cada miçanga,
 * de 0,2 a 2 s, e 2,2 s de voo), só que conduzida pela rolagem: o trecho
 * "solta" inteiro equivale a este tempo.
 */
const TEMPO_SOLTA = 4.4;

/**
 * Sem gesto da pessoa por este tempo (ms), a deriva das miçangas soltas
 * assenta devagar e a cena para de desenhar (bateria e calor do celular).
 */
const PARADA_MS = 4000;

const VOLTA = Math.PI * 2;
/** Ângulo levado para -pi a pi (o giro solto do cristal não acumula voltas). */
const meiaVolta = (a: number) => a - VOLTA * Math.round(a / VOLTA);

/**
 * O que a cena pede depois de um quadro: nada (tudo parado), o próximo
 * quadro já (algo se mexe) ou um quadro daqui a pouco (só a deriva lenta das
 * miçangas soltas, a 30 quadros por segundo).
 */
export type RitmoQuadro = "parado" | "animando" | "deriva";

// ------------------------------------------------------------------ recursos

function criarRecursos(dados: Micangas, compacto: boolean) {
  // Poucos gomos: a miçanga tem de 3 a 8 px na tela quase o tempo todo (só o
  // mergulho chega perto). No celular, menos ainda.
  const esfera = compacto ? new THREE.SphereGeometry(1, 12, 8) : new THREE.SphereGeometry(1, 18, 12);
  // Cristal facetado (rondela): esfera achatada de poucos gomos com faces
  // planas; cada faceta pega a luz do estúdio.
  const cristal = compacto ? new THREE.SphereGeometry(1, 10, 6) : new THREE.SphereGeometry(1, 12, 8);
  cristal.scale(1, 0.74, 1);

  const perolaDourada = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.72,
    roughness: 0.26,
    clearcoat: 0.6,
    clearcoatRoughness: 0.18,
    iridescence: 0.3,
    iridescenceIOR: 1.35,
    envMapIntensity: 1.15,
  });
  const cristalAmbar = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.1,
    roughness: 0.05,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    ior: 1.75,
    specularIntensity: 1,
    flatShading: true,
    envMapIntensity: 1.55,
  });
  // O cristal deixa passar luz: um pouco da própria cor brilha por dentro.
  cristalAmbar.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <emissivemap_fragment>",
      "#include <emissivemap_fragment>\n#ifdef USE_COLOR\n\ttotalEmissiveRadiance += vColor.rgb * vColor.rgb * 0.42;\n#endif"
    );
  };
  cristalAmbar.customProgramCacheKey = () => "cristal-ambar";
  const perolaMarrom = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.38,
    roughness: 0.3,
    clearcoat: 0.9,
    clearcoatRoughness: 0.12,
    envMapIntensity: 1.1,
  });

  const contagem = [0, 0, 0];
  for (let i = 0; i < dados.n; i++) contagem[dados.tipo[i]]++;
  const geometrias = [esfera, cristal, esfera];
  const materiais = [perolaDourada, cristalAmbar, perolaMarrom];
  const malhas = Array.from({ length: TIPOS }, (_, t) => {
    const m = new THREE.InstancedMesh(geometrias[t], materiais[t], Math.max(1, contagem[t]));
    m.count = contagem[t];
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    // As instâncias saem do lugar a todo momento: a esfera de recorte da
    // malha não vale.
    m.frustumCulled = false;
    m.castShadow = true;
    return m;
  });

  // Cor de cada miçanga e o índice dela dentro da malha do tipo.
  const indice = new Uint16Array(dados.n);
  const proximo = [0, 0, 0];
  const cor = new THREE.Color();
  for (let i = 0; i < dados.n; i++) {
    const t = dados.tipo[i];
    const k = proximo[t]++;
    indice[i] = k;
    cor.setRGB(dados.cor[i * 3], dados.cor[i * 3 + 1], dados.cor[i * 3 + 2], THREE.SRGBColorSpace);
    malhas[t].setColorAt(k, cor);
  }
  for (const m of malhas) if (m.instanceColor) m.instanceColor.needsUpdate = true;

  return {
    malhas,
    indice,
    dispose() {
      esfera.dispose();
      cristal.dispose();
      for (const m of materiais) m.dispose();
      for (const m of malhas) m.dispose();
    },
  };
}

/** Estúdio montado aqui mesmo: painéis de luz em volta, nada baixado. */
function criarEstudio() {
  const cena = new THREE.Scene();
  cena.background = new THREE.Color("#4a4038");
  const plano = new THREE.PlaneGeometry(1, 1);
  const materiais: THREE.Material[] = [];
  const painel = (cor: string, forca: number, pos: [number, number, number], escala: [number, number]) => {
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(cor).multiplyScalar(forca),
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    materiais.push(mat);
    const m = new THREE.Mesh(plano, mat);
    m.position.set(...pos);
    m.scale.set(escala[0], escala[1], 1);
    m.lookAt(0, 0, 0);
    cena.add(m);
  };
  // Luz principal: caixa grande no alto, à esquerda e à frente.
  painel("#fff4e4", 7, [-4, 5, 6], [7, 5]);
  // Recorte à direita, fino e alto.
  painel("#ffffff", 4, [7, 0.5, 2.5], [1.6, 9]);
  // Contraluz quente por cima e atrás.
  painel("#ffd9a6", 3, [0, 7, -5], [9, 2.2]);
  // Rebatedor creme embaixo (o chão do estúdio).
  painel("#EDE7D9", 1.4, [0, -7, 3], [12, 5]);
  // Ponto de brilho pequeno à frente: o reflexo que acende as pérolas.
  painel("#ffffff", 14, [1.5, 2, 8], [0.9, 0.9]);
  return {
    cena,
    dispose() {
      plano.dispose();
      for (const m of materiais) m.dispose();
    },
  };
}

// --------------------------------------------------------------- aleatório

function sorteador(semente: number) {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ------------------------------------------------------------------- motor

type Disposicao = { w: number; h: number; mx: number; my: number; mw: number; mh: number; x: number; y: number; s: number };

export class MotorCena {
  readonly grupo = new THREE.Group();
  /** Luz principal do estúdio, a única que projeta sombra. */
  readonly luz = new THREE.DirectionalLight("#fff2df", 1.5);
  /** Fundo invisível atrás da peça: só mostra a sombra das miçangas. */
  readonly fundo: THREE.Mesh<THREE.PlaneGeometry, THREE.ShadowMaterial>;
  private readonly dados: Micangas;
  private readonly recursos: ReturnType<typeof criarRecursos>;
  private readonly deriva: Float32Array;
  private readonly extra: Float32Array;
  private readonly solta: Float32Array;
  private readonly tamSolta: Float32Array;
  private readonly inversa = new THREE.Matrix4();
  private readonly foco: THREE.Vector3;
  private readonly disp: Disposicao = { w: 0, h: 0, mx: 0, my: 0, mw: 0, mh: 0, x: 0, y: 0, s: 1 };
  private readonly sv = { x: 0, y: 0, forca: 0, ix: 0, iy: 0 };
  private readonly v = { foco: new THREE.Vector3(), olhar: new THREE.Vector3(), dir: new THREE.Vector3(), normal: new THREE.Vector3() };
  private assentada = false;
  private avisou = false;
  /** Relógio da deriva (s): anda só enquanto a pessoa mexe na página. */
  private relogio = 0;
  /** Velocidade do relógio da deriva: 1 solta, 0 assentada. */
  private ritmo = 1;
  private agoraAntes = -1;
  private cAntes = -1;
  private soltaAntes = -1;
  private readonly giroAntes = { x: NaN, y: NaN };
  private espera = 0;

  constructor(dados: Micangas, compacto: boolean) {
    this.dados = dados;
    this.recursos = criarRecursos(dados, compacto);
    for (const m of this.recursos.malhas) this.grupo.add(m);

    // Sombra suave das miçangas num fundo creme atrás da peça, como numa
    // foto de estúdio (sombra borrada, VSM).
    this.luz.castShadow = true;
    // Mapa pequeno e borrão largo: as manchas de cada miçanga se juntam
    // numa silhueta lisa (com mapa grande, aparecia a trama das fileiras).
    this.luz.shadow.mapSize.set(512, 512);
    this.luz.shadow.radius = 7;
    this.luz.shadow.blurSamples = compacto ? 12 : 16;
    this.luz.shadow.bias = -0.0005;
    this.fundo = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.ShadowMaterial({ color: new THREE.Color("#4a3322"), opacity: 0.2, depthWrite: false })
    );
    this.fundo.receiveShadow = true;

    // Valores fixos por miçanga: ritmo da deriva, atraso da abertura, giro do
    // cristal. A posição solta depende do tamanho da tela (ver dispor).
    const n = dados.n;
    const sorte = sorteador(2500);
    this.deriva = new Float32Array(n * 6);
    this.extra = new Float32Array(n * 4);
    this.solta = new Float32Array(n * 3);
    this.tamSolta = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      for (let k = 0; k < 3; k++) {
        this.deriva[i * 6 + k] = (0.12 + sorte() * 0.3) * Math.PI * 2;
        this.deriva[i * 6 + 3 + k] = sorte() * Math.PI * 2;
      }
      // Atraso na dispersão (em segundos de TEMPO_SOLTA): a peça se desfaz
      // de baixo para cima, na ordem inversa da costura.
      this.extra[i * 4] = 0.2 + (1 - i / n) * 1.5 + sorte() * 0.3;
      this.extra[i * 4 + 1] = 0.45 + sorte() * 0.55; // altura do arco do voo
      this.extra[i * 4 + 2] = sorte() * Math.PI * 2; // ângulo do cristal
      this.extra[i * 4 + 3] = (sorte() - 0.5) * 2.4; // giro do cristal (rad/s)
    }

    // Foco do mergulho: o alto do bojo esquerdo, onde pérolas e cristais se
    // alternam em fileiras.
    const fx = -0.13;
    const fy = 0.24;
    let sx = 0;
    let sy = 0;
    let sz = 0;
    let c = 0;
    for (let i = 0; i < n; i++) {
      const dx = dados.alvo[i * 3] - fx;
      const dy = dados.alvo[i * 3 + 1] - fy;
      if (dx * dx + dy * dy < 0.0036) {
        sx += dados.alvo[i * 3];
        sy += dados.alvo[i * 3 + 1];
        sz += dados.alvo[i * 3 + 2];
        c++;
      }
    }
    this.foco = c ? new THREE.Vector3(sx / c, sy / c, sz / c + 0.01) : new THREE.Vector3(fx, fy, 0.3);
  }

  /** Estúdio de luz (reflexos das pérolas e dos cristais). Devolve a limpeza. */
  ligarEstudio(gl: THREE.WebGLRenderer, cena: THREE.Scene) {
    const pmrem = new THREE.PMREMGenerator(gl);
    const estudio = criarEstudio();
    const alvo = pmrem.fromScene(estudio.cena, 0.03);
    cena.environment = alvo.texture;
    estudio.dispose();
    return () => {
      if (cena.environment === alvo.texture) cena.environment = null;
      alvo.dispose();
      pmrem.dispose();
    };
  }

  /** Pede um quadro daqui a pouco: a deriva sozinha anda a 30 quadros por segundo. */
  depois(pedir: () => void) {
    if (this.espera) return;
    this.espera = window.setTimeout(() => {
      this.espera = 0;
      pedir();
    }, 20);
  }

  dispose() {
    window.clearTimeout(this.espera);
    this.espera = 0;
    this.recursos.dispose();
    this.fundo.geometry.dispose();
    this.fundo.material.dispose();
    this.luz.dispose();
  }

  // Onde a peça fica: a mesma posição e o mesmo tamanho da foto do manequim
  // na moldura (object-fit: cover), para as miçangas nascerem em cima da
  // foto. As miçangas soltas se espalham pela tela inteira.
  private dispor(ponte: Ponte, W: number, H: number) {
    const d = this.disp;
    const m = ponte.moldura;
    if (d.w === W && d.h === H && d.mx === m.x && d.my === m.y && d.mw === m.w && d.mh === m.h) return false;
    const dados = this.dados;
    d.w = W;
    d.h = H;
    d.mx = m.x;
    d.my = m.y;
    d.mw = m.w;
    d.mh = m.h;
    const porPx = ALTURA_VISTA / H;
    const esc = Math.max(m.w / dados.fotoW, m.h / dados.fotoH);
    const ox = m.x + (m.w - dados.fotoW * esc) * FOCO_MANEQUIM.x;
    const oy = m.y + (m.h - dados.fotoH * esc) * FOCO_MANEQUIM.y;
    const cx = ox + dados.cx * dados.fotoW * esc;
    const cy = oy + dados.cy * dados.fotoH * esc;
    d.x = (cx - W / 2) * porPx;
    d.y = -(cy - H / 2) * porPx;
    d.s = ((dados.fotoW * esc) / dados.k) * porPx;

    // Fundo da sombra logo atrás da peça e a luz no alto, à esquerda e à
    // frente; a câmera da sombra cobre só a peça (mais nitidez por pixel).
    this.fundo.position.set(d.x, d.y, -0.75 * d.s);
    this.fundo.scale.set(2.8 * d.s, 2.6 * d.s, 1);
    this.luz.position.set(d.x - 1.7, d.y + 2.7, 8);
    this.luz.target.position.set(d.x, d.y, 0);
    this.luz.target.updateMatrixWorld();
    const cs = this.luz.shadow.camera;
    const r = 1.6 * d.s;
    cs.left = -r;
    cs.right = r;
    cs.top = r;
    cs.bottom = -r;
    // Só a fatia de profundidade da peça projeta sombra: as miçangas soltas
    // perto da câmera ficam antes do plano near e não sujam o fundo com
    // manchas. O far vai bem além do fundo (que é oblíquo à luz): com ele
    // perto, a borda do volume da sombra aparecia como uma linha no fundo.
    const ateAlvo = this.luz.position.distanceTo(this.luz.target.position);
    cs.near = ateAlvo - 0.8 * d.s;
    cs.far = ateAlvo + 3 * d.s;
    cs.updateProjectionMatrix();
    this.luz.shadow.needsUpdate = true;

    // Miçangas soltas, em coordenadas do mundo (não giram com a peça):
    // poucas perto da câmera, mais no meio e a maioria no fundo, sumindo na
    // névoa creme. A tela fica arejada e, na costura, elas vêm da
    // profundidade até o lugar.
    const larguraVista = ALTURA_VISTA * (W / H);
    const sorte = sorteador(17);
    const solta = this.solta;
    const tam = this.tamSolta;
    for (let i = 0; i < dados.n; i++) {
      const faixaZ = sorte();
      let z: number;
      if (faixaZ < 0.08) {
        z = 1.3 + sorte() * 2.4;
        tam[i] = 1.5 + sorte() * 0.8;
      } else if (faixaZ < 0.26) {
        z = -8 + sorte() * 7;
        tam[i] = 1.25;
      } else {
        z = -30 + sorte() * 22;
        tam[i] = 1.15;
      }
      const abre = (DISTANCIA - z) / DISTANCIA;
      solta[i * 3] = (sorte() * 2 - 1) * larguraVista * 0.6 * abre;
      solta[i * 3 + 1] = (sorte() * 2 - 1) * ALTURA_VISTA * 0.58 * abre;
      solta[i * 3 + 2] = z;
    }
    this.assentada = false;
    return true;
  }

  /**
   * Um quadro. Devolve o que a cena pede em seguida: o próximo quadro já,
   * um quadro daqui a pouco (só a deriva) ou nada.
   */
  quadro(gl: THREE.WebGLRenderer, cam: THREE.PerspectiveCamera, W: number, H: number, ponte: Ponte): RitmoQuadro {
    const g = this.grupo;
    const dispos = this.dispor(ponte, W, H);
    const d = this.disp;
    const agoraMs = performance.now();
    const agora = agoraMs / 1000;
    const dt = this.agoraAntes < 0 ? 0 : Math.min(0.1, agora - this.agoraAntes);
    this.agoraAntes = agora;
    const p = ponte.p;
    const c = costura(p);
    const solta = dispersao(p);
    let animando = false;

    // Ponteiro e inclinação, assentando devagar.
    const sv = this.sv;
    const alvoForca = ponte.ponteiro.ativo ? 1 : 0;
    sv.x += (ponte.ponteiro.x - sv.x) * 0.12;
    sv.y += (ponte.ponteiro.y - sv.y) * 0.12;
    sv.forca += (alvoForca - sv.forca) * 0.06;
    sv.ix += (ponte.inclinacao.x - sv.ix) * 0.08;
    sv.iy += (ponte.inclinacao.y - sv.iy) * 0.08;
    if (
      Math.abs(ponte.ponteiro.x - sv.x) > 0.002 ||
      Math.abs(ponte.ponteiro.y - sv.y) > 0.002 ||
      Math.abs(alvoForca - sv.forca) > 0.01 ||
      Math.abs(ponte.inclinacao.x - sv.ix) > 0.002 ||
      Math.abs(ponte.inclinacao.y - sv.iy) > 0.002
    ) {
      animando = true;
    }

    // Relógio da deriva: anda com a pessoa mexendo e, sem gesto por alguns
    // segundos, desacelera até parar (as miçangas soltas assentam).
    const parada = agoraMs - ponte.ultimoGesto > PARADA_MS;
    this.ritmo += ((parada ? 0 : 1) - this.ritmo) * Math.min(1, dt * (parada ? 2.2 : 5));
    if (parada && this.ritmo < 0.004) this.ritmo = 0;
    this.relogio += dt * this.ritmo;

    // Abertura: a foto dá lugar às miçangas nos mesmos pontos; a peça ganha
    // relevo e vira um pouco de lado. A rolagem é que solta as miçangas.
    const intro = ponte.introInicio < 0 ? 0 : (agoraMs - ponte.introInicio) / 1000;
    const introAndando = ponte.introInicio >= 0 && intro < FIM_ABERTURA;
    const relevo = ponte.introInicio < 0 ? 0 : suave(clamp01((intro - 0.4) / 1.2));
    const repouso = (ponte.introInicio < 0 ? 0 : suave(clamp01((intro - 0.9) / 2.4))) * (1 - suave(solta));

    // A peça: posição e tamanho da foto, giro pela rolagem e pelo arraste.
    const giro = entraSai(faixa(p, TRECHO.giro[0], TRECHO.giro[1]));
    const mergulho = entraSai(faixa(p, TRECHO.mergulho[0], TRECHO.mergulho[1]));
    g.position.set(d.x, d.y, 0);
    g.scale.setScalar(d.s);
    g.rotation.set(
      0.07 * giro - 0.05 * mergulho - sv.iy * 0.06 + 0.05 * repouso,
      -0.34 * entraSai(c) + 1.08 * giro + 0.32 * mergulho + ponte.arraste + GIRO_REPOUSO * repouso,
      0
    );
    g.updateMatrixWorld();
    this.inversa.copy(g.matrixWorld).invert();
    const girou = g.rotation.x !== this.giroAntes.x || g.rotation.y !== this.giroAntes.y;
    this.giroAntes.x = g.rotation.x;
    this.giroAntes.y = g.rotation.y;

    // Câmera: parallax leve pelo ponteiro e, no fim, o mergulho no bordado.
    const solto = 1 - mergulho;
    const px = (sv.x * 0.22 + sv.ix * 0.32) * solto;
    const py = (sv.y * 0.14 + sv.iy * 0.2) * solto;
    if (mergulho > 0) {
      const { foco, olhar, dir, normal } = this.v;
      foco.copy(this.foco).applyMatrix4(g.matrixWorld);
      dir.set(px, py, DISTANCIA).sub(foco);
      const d0 = dir.length();
      dir.divideScalar(d0);
      normal.set(-0.3 + 0.45 * mergulho, 0.22, 1).normalize().applyQuaternion(g.quaternion);
      dir.lerp(normal, suave(mergulho)).normalize();
      const d1 = 0.6 * d.s;
      const dist = d0 * Math.pow(d1 / d0, mergulho);
      cam.position.copy(foco).addScaledVector(dir, dist);
      olhar.set(0, 0, 0).lerp(foco, suave(clamp01(mergulho * 1.7)));
      cam.lookAt(olhar);
    } else {
      cam.position.set(px, py, DISTANCIA);
      cam.lookAt(0, 0, 0);
    }

    // No mergulho a cena fica dentro do arco (a página recorta o canvas) e o
    // fundo vira o tecido marrom da peça: miçangas bordadas, de perto.
    // O tecido escurece na segunda metade do recorte (que vai de 0 a 0,045),
    // quando a cena já está quase do tamanho do arco.
    const tecido = suave(faixa(p, TRECHO.mergulho[0] + 0.022, TRECHO.mergulho[0] + 0.05));
    gl.setClearColor(TECIDO, tecido);

    // As miçangas: reescritas quando a rolagem muda, na abertura e enquanto
    // há miçanga solta (a deriva).
    const mudou = c !== this.cAntes || solta !== this.soltaAntes;
    if (mudou) {
      this.cAntes = c;
      this.soltaAntes = solta;
      this.assentada = false;
    }
    const mexe = solta > 0 && c < 1;
    if (mexe || introAndando || !this.assentada) {
      this.escreverMicangas(c, solta, relevo);
      this.assentada = !mexe && !introAndando;
    }

    // Sombra: o mapa (com o desfoque) só é refeito quando a peça muda. A
    // deriva sozinha não conta, porque as miçangas soltas não projetam
    // sombra no fundo.
    gl.shadowMap.autoUpdate = false;
    if (dispos || girou || mudou || introAndando) gl.shadowMap.needsUpdate = true;

    if (animando || introAndando) return "animando";
    if (mexe && this.ritmo > 0) return "deriva";
    return "parado";
  }

  /** Só na primeira vez: avisa que o primeiro quadro foi desenhado. */
  primeiroQuadro() {
    if (this.avisou) return false;
    this.avisou = true;
    return true;
  }

  private escreverMicangas(c: number, solta: number, relevo: number) {
    const d = this.disp;
    const sv = this.sv;
    const t = this.relogio;
    const { alvo, raio, tipo, n } = this.dados;
    const { deriva, extra } = this;
    const { malhas, indice } = this.recursos;
    const arrays = malhas.map((m) => m.instanceMatrix.array as Float32Array);

    // Ponteiro no plano z = 0 do mundo; cada miçanga solta é comparada pela
    // posição em que aparece na tela (a perspectiva encolhe as do fundo).
    const larguraVista = ALTURA_VISTA * (d.w / d.h);
    const pxw = (sv.x * larguraVista) / 2;
    const pyw = (sv.y * ALTURA_VISTA) / 2;
    const raioToque = ALTURA_VISTA * 0.15;
    const raioToque2 = raioToque * raioToque;
    const empurra = ALTURA_VISTA * 0.06 * sv.forca;
    const inv = this.inversa.elements;
    const tam = this.tamSolta;
    const pos = this.solta;
    const tSolta = solta * TEMPO_SOLTA;

    for (let i = 0; i < n; i++) {
      const i3 = i * 3;
      const ax = alvo[i3];
      const ay = alvo[i3 + 1];
      const az = alvo[i3 + 2];
      const inicio = (i / n) * (1 - VOO);
      const e = entraSai(clamp01((c - inicio) / VOO));
      const sPousada = raio[i] * ESCALA_POUSADA;
      let x = ax;
      let y = ay;
      let z = az;
      let s = sPousada;
      // Quanto a miçanga está solta agora (o cristal só gira solto).
      let livre = 0;

      if (e < 1) {
        // Dispersão: a peça montada se solta de baixo para cima, na ordem
        // inversa da costura, conforme a rolagem anda.
        const ie = entraSai(clamp01((tSolta - extra[i * 4]) / 2.2));
        if (ie <= 0) {
          // Peça montada (abertura): o relevo cresce enquanto a foto some.
          z = az * relevo;
        } else {
          // Posição solta (no mundo): deriva lenta e o ponteiro abrindo
          // caminho. Depois vai para as coordenadas da peça.
          const i6 = i * 6;
          const wz0 = pos[i3 + 2];
          const perto = DISTANCIA / (DISTANCIA - wz0);
          const amp = 0.06 / perto;
          let wx = pos[i3] + Math.sin(t * deriva[i6] + deriva[i6 + 3]) * amp;
          let wy = pos[i3 + 1] + Math.sin(t * deriva[i6 + 1] + deriva[i6 + 4]) * amp;
          let wz = wz0 + Math.sin(t * deriva[i6 + 2] + deriva[i6 + 5]) * amp;
          if (empurra > 0) {
            const dx = wx * perto - pxw;
            const dy = wy * perto - pyw;
            const d2 = dx * dx + dy * dy;
            if (d2 < raioToque2) {
              const dd = Math.sqrt(d2) || 1e-4;
              const f = ((1 - dd / raioToque) ** 2 * empurra) / perto;
              wx += (dx / dd) * f;
              wy += (dy / dd) * f;
              wz += f * 0.8;
            }
          }
          let lx = inv[0] * wx + inv[4] * wy + inv[8] * wz + inv[12];
          let ly = inv[1] * wx + inv[5] * wy + inv[9] * wz + inv[13];
          let lz = inv[2] * wx + inv[6] * wy + inv[10] * wz + inv[14];
          const sSolta = raio[i] * tam[i];
          let ls = sSolta;
          if (ie < 1) {
            // Primeiro sai da peça na direção da câmera, depois vai embora.
            const u = 1 - ie;
            lx = u * u * ax + 2 * u * ie * ax + ie * ie * lx;
            ly = u * u * ay + 2 * u * ie * (ay + 0.04) + ie * ie * ly;
            lz = u * u * az * relevo + 2 * u * ie * (az + 0.45) + ie * ie * lz;
            ls = sPousada + (sSolta - sPousada) * ie;
          }
          if (e <= 0) {
            x = lx;
            y = ly;
            z = lz;
            s = ls;
          } else {
            // Voo em arco: sobe na direção da câmera e pousa de frente.
            const mx = (lx + ax) / 2;
            const my = (ly + ay) / 2 + extra[i * 4 + 1] * 0.15;
            const mz = (lz + az) / 2 + extra[i * 4 + 1];
            const u = 1 - e;
            x = u * u * lx + 2 * u * e * mx + e * e * ax;
            y = u * u * ly + 2 * u * e * my + e * e * ay;
            z = u * u * lz + 2 * u * e * mz + e * e * az;
            s = (ls + (sPousada - ls) * e) * (1 + 0.5 * Math.sin(Math.PI * e));
          }
          livre = ie * (1 - e);
        }
      }

      const k = tipo[i];
      const a = arrays[k];
      const o = indice[i] * 16;
      if (k === 1) {
        // Cristal: gira solto e para no ângulo dele ao pousar.
        const ang = extra[i * 4 + 2] + meiaVolta(extra[i * 4 + 3] * t) * livre;
        const ca = Math.cos(ang);
        const sa = Math.sin(ang);
        const cbx = Math.cos(ang * 0.7 + 1);
        const sbx = Math.sin(ang * 0.7 + 1);
        a[o] = ca * s;
        a[o + 1] = 0;
        a[o + 2] = -sa * s;
        a[o + 4] = sa * sbx * s;
        a[o + 5] = cbx * s;
        a[o + 6] = ca * sbx * s;
        a[o + 8] = sa * cbx * s;
        a[o + 9] = -sbx * s;
        a[o + 10] = ca * cbx * s;
      } else {
        a[o] = s;
        a[o + 1] = 0;
        a[o + 2] = 0;
        a[o + 4] = 0;
        a[o + 5] = s;
        a[o + 6] = 0;
        a[o + 8] = 0;
        a[o + 9] = 0;
        a[o + 10] = s;
      }
      a[o + 3] = 0;
      a[o + 7] = 0;
      a[o + 11] = 0;
      a[o + 12] = x;
      a[o + 13] = y;
      a[o + 14] = z;
      a[o + 15] = 1;
    }
    for (const m of malhas) m.instanceMatrix.needsUpdate = true;
  }
}
