#!/usr/bin/env node
// Sobe as 4 versões da loja lado a lado para a apresentação de sábado (28/11/2026).
//
// Rodar de dentro do clone, na branch apresentacao/base:
//
//   node scripts/apresentacao.mjs
//
// O que ele faz:
//   1. git fetch origin, para trazer a última versão das branches;
//   2. cria (ou reaproveita) a pasta ../gio-apresentacao/, ao lado do clone,
//      com um git worktree para cada branch apresentacao/v1 a apresentacao/v4;
//   3. roda npm ci em cada versão (pula a que já foi instalada com o mesmo
//      package-lock.json);
//   4. sobe o next dev de cada uma (v1 na 3001, v2 na 3002, v3 na 3003, v4 na
//      3004), com a saída de cada servidor marcada com o nome da versão;
//   5. espera as 4 responderem 200 e mostra os links e a página de comparação
//      (apresentacao.html, na raiz do clone).
// Ctrl+C encerra os 4 servidores.
//
// Só usa o que vem com o Node (22 ou mais novo) e funciona em Windows, Mac e Linux.
// Rode com --ajuda para ver as opções.

import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const VERSOES = [
  { n: 1, nome: "Vitrine", branch: "apresentacao/v1-claude-vitrine" },
  { n: 2, nome: "Provador", branch: "apresentacao/v2-claude-peca-em-foco" },
  { n: 3, nome: "Ateliê de Luz e Relevo", branch: "apresentacao/v3-argon" },
  { n: 4, nome: "Lookbook", branch: "apresentacao/v4-astra" },
];

const BRANCH_BASE = "apresentacao/base";
const PASTA_IRMA = "gio-apresentacao";
const PORTA_PADRAO = 3001;
// Páginas abertas uma vez antes de liberar, para o primeiro clique da Gio não esperar a compilação.
const PAGINAS_AQUECER = ["/loja", "/loja/top-maya"];
// Primeira compilação do next dev num computador lento pode passar de 2 minutos.
const LIMITE_SUBIDA_MS = 8 * 60 * 1000;
const MARCA_INSTALACAO = ".gio-apresentacao-instalado";

const NO_WINDOWS = process.platform === "win32";

// ---------------------------------------------------------------- saída na tela

const COM_COR = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
const pintar = (codigo, texto) => (COM_COR ? `\x1b[${codigo}m${texto}\x1b[0m` : texto);
const negrito = (t) => pintar("1", t);
const fraco = (t) => pintar("2", t);
const verde = (t) => pintar("32", t);
const amarelo = (t) => pintar("33", t);
const vermelho = (t) => pintar("31", t);
const CORES_VERSAO = ["36", "35", "33", "32"]; // ciano, magenta, amarelo, verde

const rotulo = (v) => `Versão ${v.n} (${v.nome})`;
const prefixo = (v) => pintar(CORES_VERSAO[v.n - 1], `[v${v.n} ${v.nome}]`);

function titulo(numero, texto) {
  console.log(`\n${negrito(`Passo ${numero} de 5: ${texto}`)}`);
}
const ok = (t) => console.log(`  ${verde("ok")}  ${t}`);
const info = (t) => console.log(`      ${t}`);
const aviso = (t) => console.log(`  ${amarelo("atenção")}  ${t}`);

function falhar(texto) {
  console.error(`\n${vermelho("Parei:")} ${texto}\n`);
  encerrarServidores();
  process.exit(1);
}

function segundos(ms) {
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")} s`;
}

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

function ajuda() {
  console.log(`
Sobe as 4 versões da loja da Gio lado a lado.

Uso:
  node scripts/apresentacao.mjs [opções]

Opções:
  --sem-instalar         não roda npm ci (usa o node_modules que já está em cada versão)
  --reinstalar           roda npm ci de novo mesmo se a versão já estiver instalada
  --porta-inicial 3201   usa as portas 3201 a 3204 em vez de 3001 a 3004
  --abrir                abre a página de comparação no navegador quando tudo subir
  --ajuda                mostra esta ajuda

Ctrl+C encerra os servidores.
`);
}

// ---------------------------------------------------------------- opções

const opcoes = { semInstalar: false, reinstalar: false, abrir: false, portaInicial: PORTA_PADRAO };
{
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--sem-instalar") opcoes.semInstalar = true;
    else if (a === "--reinstalar") opcoes.reinstalar = true;
    else if (a === "--abrir") opcoes.abrir = true;
    else if (a === "--ajuda" || a === "--help" || a === "-h") {
      ajuda();
      process.exit(0);
    } else if (a === "--porta-inicial" || a.startsWith("--porta-inicial=")) {
      const valor = a.includes("=") ? a.slice(a.indexOf("=") + 1) : args[++i];
      const porta = Number(valor);
      if (!Number.isInteger(porta) || porta < 1024 || porta > 65530) {
        console.error(`A porta inicial precisa ser um número entre 1024 e 65530 (veio "${valor ?? ""}").`);
        process.exit(1);
      }
      opcoes.portaInicial = porta;
    } else {
      console.error(`Opção desconhecida: ${a}. Rode com --ajuda para ver as opções.`);
      process.exit(1);
    }
  }
  if (opcoes.semInstalar && opcoes.reinstalar) {
    console.error("Use --sem-instalar ou --reinstalar, não os dois juntos.");
    process.exit(1);
  }
}

const portaDe = (v) => opcoes.portaInicial + v.n - 1;
const urlDe = (v) => `http://localhost:${portaDe(v)}`;

// ---------------------------------------------------------------- comandos

// No Windows, npm e git podem ser .cmd, que só rodam pelo shell. Com shell, o
// comando vai numa linha só, então os argumentos com espaço ganham aspas.
function aspasWindows(arg) {
  if (arg === "") return '""';
  return /[\s"&|<>^()%!,;]/.test(arg) ? `"${arg.replace(/"/g, '""')}"` : arg;
}

function montar(comando, args) {
  if (NO_WINDOWS) return { arquivo: [comando, ...args].map(aspasWindows).join(" "), args: [], shell: true };
  return { arquivo: comando, args, shell: false };
}

/** Roda e devolve a saída (para git rev-parse, worktree etc.). */
function rodar(comando, args, cwd) {
  const m = montar(comando, args);
  const r = spawnSync(m.arquivo, m.args, { cwd, shell: m.shell, encoding: "utf8", windowsHide: true });
  return {
    ok: r.status === 0,
    saida: (r.stdout || "").trim(),
    erro: ((r.stderr || "").trim() || r.error?.message || "").trim(),
  };
}

/** Roda mostrando tudo na tela e aceitando digitação (login do GitHub, por exemplo). */
function rodarNaTela(comando, args, cwd) {
  const m = montar(comando, args);
  const r = spawnSync(m.arquivo, m.args, { cwd, shell: m.shell, stdio: "inherit", windowsHide: true });
  return r.status === 0;
}

const git = (cwd, ...args) => rodar("git", args, cwd);

// Linha só com código de terminal (o next dev manda "mostrar cursor" ao sair) não vai para a tela.
const temTexto = (linha) => linha.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "").trim() !== "";

/** Repete cada linha do processo filho com o prefixo da versão. */
function repassar(fluxo, marca, destino) {
  let resto = "";
  fluxo.setEncoding("utf8");
  fluxo.on("data", (pedaco) => {
    const linhas = (resto + pedaco).split(/\r\n|\r|\n/);
    resto = linhas.pop() ?? "";
    for (const linha of linhas) if (temTexto(linha)) destino.write(`${marca} ${linha}\n`);
  });
  fluxo.on("end", () => {
    if (temTexto(resto)) destino.write(`${marca} ${resto}\n`);
  });
}

// ---------------------------------------------------------------- servidores

const servidores = []; // { v, pasta, filho, pronto, parando }
const vivo = (filho) => filho.exitCode === null && filho.signalCode === null;

function matar(filho, sinal = "SIGTERM") {
  if (!filho || !vivo(filho)) return;
  if (NO_WINDOWS) {
    // /T leva junto o next-server que o next dev abre por baixo.
    spawnSync("taskkill", ["/pid", String(filho.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
    return;
  }
  try {
    process.kill(-filho.pid, sinal); // grupo inteiro: next dev e o next-server filho
  } catch {
    try {
      filho.kill(sinal);
    } catch {
      /* já tinha saído */
    }
  }
}

let encerrando = false;
function encerrarServidores() {
  for (const s of servidores) matar(s.filho);
}

async function encerrarTudo(codigo) {
  if (encerrando) return;
  encerrando = true;
  if (servidores.length) console.log(`\n${negrito("Encerrando os servidores...")}`);
  encerrarServidores();
  const limite = Date.now() + 5000;
  while (Date.now() < limite && servidores.some((s) => vivo(s.filho))) await dormir(200);
  for (const s of servidores) matar(s.filho, "SIGKILL");
  if (servidores.length) console.log("Tudo encerrado.");
  process.exit(codigo);
}

process.on("SIGINT", () => encerrarTudo(0));
process.on("SIGTERM", () => encerrarTudo(0));
if (!NO_WINDOWS) process.on("SIGHUP", () => encerrarTudo(0));
process.on("exit", () => encerrarServidores());

function portaLivre(porta) {
  const testarEscuta = new Promise((resolve) => {
    const s = net.createServer();
    s.once("error", () => resolve(false));
    s.once("listening", () => s.close(() => resolve(true)));
    s.listen(porta);
  });
  const testarConexao = new Promise((resolve) => {
    const c = net.connect({ port: porta, host: "127.0.0.1" });
    c.setTimeout(800);
    c.once("connect", () => {
      c.destroy();
      resolve(false);
    });
    c.once("timeout", () => {
      c.destroy();
      resolve(true);
    });
    c.once("error", () => resolve(true));
  });
  return Promise.all([testarEscuta, testarConexao]).then(([a, b]) => a && b);
}

async function responde(url, timeoutMs) {
  try {
    const r = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(timeoutMs) });
    await r.arrayBuffer().catch(() => {});
    return String(r.status);
  } catch (e) {
    return e?.cause?.code || e?.name || "erro";
  }
}

async function esperar200(servidor) {
  const inicio = Date.now();
  let ultimo = "sem resposta";
  let repetidas = 0;
  while (Date.now() - inicio < LIMITE_SUBIDA_MS) {
    if (!vivo(servidor.filho)) {
      return { ok: false, motivo: "o servidor parou antes de responder (veja as linhas acima)" };
    }
    const anterior = ultimo;
    ultimo = await responde(`${urlDe(servidor.v)}/`, 150000);
    if (ultimo === "200") return { ok: true, ms: Date.now() - inicio };
    repetidas = ultimo === anterior ? repetidas + 1 : 1;
    // Página inicial em 404 com o servidor no ar: o cache do Next se perdeu (já
    // aconteceu num teste ao subir as 4 juntas). Quem chamou limpa e sobe de novo.
    if (ultimo === "404" && repetidas >= 3) return { ok: false, cacheQuebrado: true, motivo: "a página inicial respondeu 404" };
    if (ultimo.startsWith("5") && repetidas >= 3) {
      return { ok: false, motivo: `a página inicial deu erro ${ultimo} três vezes seguidas (veja as linhas acima)` };
    }
    await dormir(1500);
  }
  return { ok: false, motivo: `não respondeu 200 em ${segundos(LIMITE_SUBIDA_MS)} (última resposta: ${ultimo})` };
}

function subir(v, pasta) {
  // O mesmo que "npx next dev -p 300N", chamado direto pelo node: não depende do
  // shell e o Ctrl+C derruba o servidor junto, inclusive no Windows.
  const next = path.join(pasta, "node_modules", "next", "dist", "bin", "next");
  const filho = spawn(process.execPath, [next, "dev", "-p", String(portaDe(v))], {
    cwd: pasta,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1", PORT: String(portaDe(v)) },
    stdio: ["ignore", "pipe", "pipe"],
    detached: !NO_WINDOWS, // grupo próprio no Mac e no Linux, para encerrar o next-server junto
    windowsHide: true,
  });
  const servidor = { v, pasta, filho, pronto: false, parando: false };
  repassar(filho.stdout, prefixo(v), process.stdout);
  repassar(filho.stderr, prefixo(v), process.stderr);
  filho.on("exit", (codigo, sinal) => {
    if (encerrando || servidor.parando) return;
    const como = sinal ? `sinal ${sinal}` : `código ${codigo}`;
    console.log(`${prefixo(v)} ${vermelho(`o servidor parou (${como}).`)} As outras versões continuam no ar.`);
  });
  return servidor;
}

async function pararUm(servidor) {
  servidor.parando = true;
  matar(servidor.filho);
  const limite = Date.now() + 10000;
  while (Date.now() < limite && vivo(servidor.filho)) await dormir(200);
  matar(servidor.filho, "SIGKILL");
}

function limparCacheNext(pasta) {
  try {
    fs.rmSync(path.join(pasta, ".next"), { recursive: true, force: true, maxRetries: 5, retryDelay: 500 });
  } catch {
    /* se não der para apagar, a nova tentativa mostra o erro */
  }
}

/** Espera a versão responder 200; se o cache do Next se perdeu, limpa e sobe de novo uma vez. */
async function esperarVersao(indice) {
  let servidor = servidores[indice];
  let r = await esperar200(servidor);
  if (!r.ok && r.cacheQuebrado && !encerrando) {
    console.log(`${prefixo(servidor.v)} ${amarelo("a página inicial respondeu 404; limpando o cache do Next desta versão e subindo de novo")}`);
    await pararUm(servidor);
    limparCacheNext(servidor.pasta);
    servidor = subir(servidor.v, servidor.pasta);
    servidores[indice] = servidor;
    r = await esperar200(servidor);
    if (!r.ok && r.cacheQuebrado) r = { ok: false, motivo: "a página inicial continua em 404 mesmo com o cache limpo (veja as linhas acima)" };
  }
  return { servidor, r };
}

// ---------------------------------------------------------------- passos

function conferirFerramentas() {
  const [maior, menor] = process.versions.node.split(".").map(Number);
  if (maior < 20 || (maior === 20 && menor < 9)) {
    falhar(`Este computador tem o Node ${process.versions.node}. Instale o Node 22 ou mais novo (https://nodejs.org) e abra um terminal novo.`);
  }
  if (maior < 22) aviso(`Node ${process.versions.node}: funciona, mas o recomendado é o 22 ou mais novo.`);
  if (!rodar("git", ["--version"]).ok) {
    falhar("Não achei o git. Instale pelo https://git-scm.com e abra um terminal novo.");
  }
  if (!opcoes.semInstalar && !rodar("npm", ["--version"]).ok) {
    falhar("Não achei o npm. Ele vem junto com o Node: reinstale o Node 22 (https://nodejs.org) e abra um terminal novo.");
  }
}

function acharRaiz() {
  const pastaScript = path.dirname(fileURLToPath(import.meta.url));
  const r = git(pastaScript, "rev-parse", "--show-toplevel");
  if (!r.ok) falhar(`Este script precisa estar dentro do clone do repositório (rodei em ${pastaScript}).`);
  return path.resolve(r.saida);
}

const mesmoCaminho = (a, b) => {
  const norm = (p) => (NO_WINDOWS ? path.resolve(p).toLowerCase() : path.resolve(p));
  try {
    return norm(fs.realpathSync(a)) === norm(fs.realpathSync(b));
  } catch {
    return norm(a) === norm(b);
  }
};

function prepararPasta(raiz, pastaMae, v) {
  const destino = path.join(pastaMae, v.branch.replace(/^apresentacao\//, ""));
  const remota = `origin/${v.branch}`;
  const temRemota = git(raiz, "rev-parse", "--verify", "--quiet", `refs/remotes/${remota}`).ok;
  const temLocal = git(raiz, "rev-parse", "--verify", "--quiet", `refs/heads/${v.branch}`).ok;

  // Pasta vazia que sobrou de uma rodada interrompida: some e é criada de novo.
  if (fs.existsSync(destino) && fs.readdirSync(destino).length === 0) fs.rmdirSync(destino);

  if (fs.existsSync(destino)) {
    const dono = git(destino, "rev-parse", "--path-format=absolute", "--git-common-dir");
    const daqui = git(raiz, "rev-parse", "--path-format=absolute", "--git-common-dir");
    const outroRepo = dono.ok && daqui.ok && !mesmoCaminho(dono.saida, daqui.saida);
    if (!fs.existsSync(path.join(destino, ".git")) || outroRepo) {
      falhar(`A pasta ${destino} já existe, mas não é uma cópia deste repositório. Apague essa pasta e rode de novo.`);
    }
    const branch = git(destino, "rev-parse", "--abbrev-ref", "HEAD").saida;
    if (branch !== v.branch) {
      falhar(`A pasta ${destino} está na branch "${branch}", e não em ${v.branch}. Apague essa pasta e rode de novo.`);
    }
    if (temRemota) {
      const antes = git(destino, "rev-parse", "--short", "HEAD").saida;
      const atualizar = git(destino, "merge", "--ff-only", "--quiet", remota);
      const depois = git(destino, "rev-parse", "--short", "HEAD").saida;
      if (!atualizar.ok) {
        const mexida = git(destino, "status", "--porcelain", "--untracked-files=no").saida !== "";
        aviso(
          mexida
            ? `${rotulo(v)}: a pasta tem arquivos mexidos e não recebeu a última versão do GitHub. Sigo com o que está nela.`
            : `${rotulo(v)}: a branch mudou no GitHub de um jeito que não dá para só avançar. Para pegar a versão nova, apague a pasta ${destino} e rode de novo. Sigo com o que está nela.`,
        );
      } else if (antes !== depois) {
        ok(`${rotulo(v)}: atualizada com o GitHub (${antes} para ${depois})`);
      }
    }
    ok(`${rotulo(v)}: pasta reaproveitada ${fraco(destino)}`);
    return destino;
  }

  if (!temRemota && !temLocal) {
    falhar(`Não achei a branch ${v.branch} nem no GitHub nem neste computador. Confira se o Leo já fez o push das branches apresentacao/*.`);
  }
  const criar = temLocal
    ? git(raiz, "worktree", "add", destino, v.branch)
    : git(raiz, "worktree", "add", "--track", "-b", v.branch, destino, remota);
  if (!criar.ok) {
    if (/already (checked out|used by worktree)/i.test(criar.erro)) {
      falhar(`A branch ${v.branch} já está aberta em outra pasta deste computador. Rode o script num clone novo, como no docs/APRESENTACAO.md.\n${criar.erro}`);
    }
    falhar(`Não consegui criar a pasta da ${rotulo(v)}.\n${criar.erro}`);
  }
  if (temLocal && temRemota) git(destino, "merge", "--ff-only", "--quiet", remota);
  ok(`${rotulo(v)}: pasta criada ${fraco(destino)}`);
  return destino;
}

function hashArquivo(arquivo) {
  return createHash("sha1").update(fs.readFileSync(arquivo)).digest("hex");
}

async function instalar(v, pasta, ordem) {
  const temNext = fs.existsSync(path.join(pasta, "node_modules", "next", "package.json"));
  const marca = path.join(pasta, "node_modules", MARCA_INSTALACAO);
  const lock = path.join(pasta, "package-lock.json");

  if (opcoes.semInstalar) {
    if (!temNext) falhar(`A ${rotulo(v)} ainda não tem as dependências (falta node_modules). Rode de novo sem --sem-instalar.`);
    ok(`${rotulo(v)}: npm ci pulado (--sem-instalar)`);
    return;
  }
  let lida = "";
  try {
    lida = fs.readFileSync(marca, "utf8").trim();
  } catch {
    /* ainda não instalada por este script */
  }
  if (!opcoes.reinstalar && temNext && lida && lida === hashArquivo(lock)) {
    ok(`${rotulo(v)}: dependências já instaladas, npm ci pulado (use --reinstalar para forçar)`);
    return;
  }

  info(`${negrito(`[${ordem}/${VERSOES.length}]`)} ${rotulo(v)}: npm ci ${fraco("(na primeira vez leva alguns minutos)")}`);
  const inicio = Date.now();
  const relogio = setInterval(() => info(fraco(`${rotulo(v)}: ainda instalando, ${segundos(Date.now() - inicio)}`)), 20000);
  const m = montar("npm", ["ci", "--no-audit", "--no-fund", "--prefer-offline"]);
  const codigo = await new Promise((resolve) => {
    const filho = spawn(m.arquivo, m.args, { cwd: pasta, shell: m.shell, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
    repassar(filho.stdout, prefixo(v), process.stdout);
    repassar(filho.stderr, prefixo(v), process.stderr);
    filho.on("error", () => resolve(1));
    filho.on("exit", (c) => resolve(c ?? 1));
  });
  clearInterval(relogio);
  if (codigo !== 0) {
    falhar(`O npm ci falhou na ${rotulo(v)} (veja as linhas acima). Confira a internet e rode de novo. Se repetir, apague a pasta ${path.join(pasta, "node_modules")} e tente outra vez.`);
  }
  try {
    fs.writeFileSync(marca, hashArquivo(lock));
  } catch {
    /* sem a marca, a próxima rodada só instala de novo */
  }
  ok(`${rotulo(v)}: instalada em ${segundos(Date.now() - inicio)}`);
}

function abrirNoNavegador(endereco) {
  const [comando, args] = NO_WINDOWS
    ? ["rundll32", ["url.dll,FileProtocolHandler", endereco]]
    : process.platform === "darwin"
      ? ["open", [endereco]]
      : ["xdg-open", [endereco]];
  try {
    spawn(comando, args, { stdio: "ignore", detached: true, windowsHide: true }).unref();
  } catch {
    /* sem navegador automático: o link continua na tela */
  }
}

// ---------------------------------------------------------------- principal

async function principal() {
  console.log(negrito("\nGio Handmade: as 4 versões da loja para a apresentação de sábado"));
  conferirFerramentas();
  const raiz = acharRaiz();
  const branchAtual = git(raiz, "rev-parse", "--abbrev-ref", "HEAD").saida;
  if (branchAtual !== BRANCH_BASE) {
    aviso(`O clone está na branch "${branchAtual}". O esperado é ${BRANCH_BASE} (git switch ${BRANCH_BASE}). Sigo assim mesmo.`);
  }

  titulo(1, "trazer a última versão do GitHub (git fetch origin)");
  if (rodarNaTela("git", ["fetch", "origin", "--prune"], raiz)) ok("branches atualizadas");
  else aviso("Não consegui falar com o GitHub. Sigo com o que já está neste computador.");

  titulo(2, `preparar uma pasta para cada versão em ../${PASTA_IRMA}/`);
  const pastaMae = path.resolve(raiz, "..", PASTA_IRMA);
  fs.mkdirSync(pastaMae, { recursive: true });
  git(raiz, "worktree", "prune");
  const pastas = new Map();
  for (const v of VERSOES) pastas.set(v.n, prepararPasta(raiz, pastaMae, v));

  titulo(3, "instalar as dependências (npm ci)");
  let ordem = 0;
  for (const v of VERSOES) await instalar(v, pastas.get(v.n), ++ordem);

  titulo(4, `subir os servidores nas portas ${opcoes.portaInicial} a ${opcoes.portaInicial + VERSOES.length - 1}`);
  const ocupadas = [];
  for (const v of VERSOES) if (!(await portaLivre(portaDe(v)))) ocupadas.push(portaDe(v));
  if (ocupadas.length) {
    falhar(
      `A porta ${ocupadas.join(", ")} já está em uso. Feche a outra janela que está rodando o site ` +
        `(ou outro programa nessa porta) e rode de novo, ou escolha outras portas: ` +
        `node scripts/apresentacao.mjs --porta-inicial ${opcoes.portaInicial + 200}`,
    );
  }
  for (const v of VERSOES) {
    servidores.push(subir(v, pastas.get(v.n)));
    info(`${rotulo(v)}: subindo em ${urlDe(v)}`);
  }
  info(fraco("A primeira abertura compila o site e pode levar de 30 s a 2 min por versão."));

  const resultados = await Promise.all(
    servidores.map(async (_, indice) => {
      const { servidor: s, r } = await esperarVersao(indice);
      if (r.ok) {
        s.pronto = true;
        console.log(`${prefixo(s.v)} ${verde("respondeu 200")} em ${segundos(r.ms)}; preparando a loja e o Top Maya`);
        for (const pagina of PAGINAS_AQUECER) await responde(`${urlDe(s.v)}${pagina}`, 150000);
      } else {
        console.log(`${prefixo(s.v)} ${vermelho(r.motivo)}`);
      }
      return r;
    }),
  );

  titulo(5, "abrir no navegador");
  const pagina = path.join(raiz, "apresentacao.html");
  const linkPagina = pathToFileURL(pagina).href + (opcoes.portaInicial !== PORTA_PADRAO ? `?porta=${opcoes.portaInicial}` : "");
  const largura = Math.max(...VERSOES.map((v) => rotulo(v).length));
  console.log("");
  for (const s of servidores) {
    const estado = s.pronto ? verde("no ar") : vermelho("não subiu");
    console.log(`  ${rotulo(s.v).padEnd(largura)}  ${negrito(urlDe(s.v))}  ${estado}`);
  }
  console.log(`\n  Comparação lado a lado (abra no navegador):\n  ${negrito(linkPagina)}`);
  console.log(`  ${fraco(`arquivo: ${pagina}`)}`);

  const falhas = resultados.filter((r) => !r.ok).length;
  if (falhas === VERSOES.length) {
    console.log(`\n${vermelho("Nenhuma versão subiu.")} Veja as mensagens acima e o docs/APRESENTACAO.md (problemas comuns).`);
    await encerrarTudo(1);
    return;
  }
  if (falhas) console.log(`\n${amarelo(`${falhas} versão(ões) não subiu(ram).`)} As outras estão no ar. Veja as mensagens acima.`);
  else console.log(`\n${verde("Pronto: as 4 versões estão no ar.")}`);
  console.log(fraco("Deixe esta janela aberta durante a apresentação. Ctrl+C encerra tudo.\n"));

  if (opcoes.abrir) abrirNoNavegador(linkPagina);
}

principal().catch((erro) => {
  console.error(`\n${vermelho("Erro inesperado:")} ${erro?.stack || erro}`);
  encerrarTudo(1);
});
