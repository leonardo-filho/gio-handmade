// Proporção (largura / altura) de cada foto do catálogo, lida no servidor.
//
// A passarela do desktop mostra cada foto inteira, com a moldura no formato
// dela (as fotos vão de 0,56 a 0,85). Sabendo a proporção já no HTML do
// servidor, as molduras nascem no tamanho certo, sem pular quando a foto
// carrega. Só o cabeçalho do JPEG é lido (os primeiros 64 KB); uma foto que
// não for JPEG, ou que não abrir, fica sem medida e a tela usa 3:4.
//
// Este arquivo usa o sistema de arquivos: só pode ser importado pela página
// (componente de servidor), nunca por um componente "use client".

import { closeSync, openSync, readSync } from "node:fs";
import path from "node:path";
import { produtos } from "@/data/produtos";

export type Proporcoes = Record<string, number>;

const BYTES_CABECALHO = 64 * 1024;

function lerCabecalho(arquivo: string): Buffer | null {
  let fd: number | null = null;
  try {
    fd = openSync(arquivo, "r");
    const buf = Buffer.alloc(BYTES_CABECALHO);
    const lidos = readSync(fd, buf, 0, BYTES_CABECALHO, 0);
    return buf.subarray(0, lidos);
  } catch {
    return null;
  } finally {
    if (fd !== null) closeSync(fd);
  }
}

// Percorre os marcadores do JPEG até o SOF (início do quadro), que guarda
// altura e largura.
function medirJpeg(buf: Buffer): number | null {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) return null;
    const marcador = buf[i + 1];
    if (marcador === 0xff) {
      i += 1;
      continue;
    }
    if (marcador === 0x01 || (marcador >= 0xd0 && marcador <= 0xd9)) {
      i += 2;
      continue;
    }
    const tamanho = buf.readUInt16BE(i + 2);
    const ehSof = marcador >= 0xc0 && marcador <= 0xcf && marcador !== 0xc4 && marcador !== 0xc8 && marcador !== 0xcc;
    if (ehSof) {
      const altura = buf.readUInt16BE(i + 5);
      const largura = buf.readUInt16BE(i + 7);
      return altura > 0 && largura > 0 ? Math.round((largura / altura) * 1000) / 1000 : null;
    }
    i += 2 + tamanho;
  }
  return null;
}

let cache: Proporcoes | null = null;

export function lerProporcoes(): Proporcoes {
  if (cache) return cache;
  const pasta = path.join(process.cwd(), "public");
  const fotos = new Set<string>();
  for (const p of produtos) {
    for (const f of [p.foto, p.fotoHover, ...(p.fotosExtra ?? [])]) if (f) fotos.add(f);
  }
  const resultado: Proporcoes = {};
  for (const f of fotos) {
    const buf = lerCabecalho(path.join(pasta, f));
    const r = buf ? medirJpeg(buf) : null;
    if (r) resultado[f] = r;
  }
  cache = resultado;
  return resultado;
}
