import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Liga/desliga o modo manutenção. Com true, qualquer página do site mostra
// /manutencao. Para reabrir o site, trocar para false e publicar.
const EM_MANUTENCAO = process.env.NODE_ENV === "production";

// Quem abrir o site com ?acesso=<CHAVE> ganha um cookie e passa a ver o site
// normal nesse navegador (para conferir os preços antes de reabrir).
// ?acesso=sair remove o cookie.
const CHAVE_ACESSO = "gio-ajustes";
const COOKIE = "gio_acesso";

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const acesso = searchParams.get("acesso");

  if (acesso === CHAVE_ACESSO || acesso === "sair") {
    const url = request.nextUrl.clone();
    url.searchParams.delete("acesso");
    const res = NextResponse.redirect(url);
    if (acesso === "sair") res.cookies.delete(COOKIE);
    else res.cookies.set(COOKIE, CHAVE_ACESSO, { maxAge: 60 * 60 * 24 * 30, path: "/" });
    return res;
  }

  const liberado = request.cookies.get(COOKIE)?.value === CHAVE_ACESSO;

  if (pathname === "/manutencao") {
    // Fora da manutenção, a página não fica acessível sozinha.
    return EM_MANUTENCAO ? NextResponse.next() : NextResponse.redirect(new URL("/", request.url));
  }

  if (EM_MANUTENCAO && !liberado) {
    return NextResponse.rewrite(new URL("/manutencao", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Só páginas: deixa de fora arquivos do Next e qualquer arquivo com extensão
  // (fotos, fontes, logo, favicon), senão a página de manutenção fica sem imagem.
  matcher: ["/((?!_next/|.*\\.[^/]+$).*)"],
};
