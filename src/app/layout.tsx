import type { Metadata } from "next";
import { Questrial, Archivo } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/components/Providers";
import Sacola from "@/components/v4/sacola/Sacola";
import GavetaNavegacao from "@/components/v3/estrutura/GavetaNavegacao";

// EB Garamond: todas as variantes do manual oficial Gio Handmade.
// preload: false porque são 10 TTF (2,4 MB) e o preload baixava todos em toda
// página. Sem ele, o navegador baixa só as faces que a página usa de fato.
const ebGaramond = localFont({
  src: [
    { path: "../../public/brand/fonts/EBGaramond-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/brand/fonts/EBGaramond-Italic.ttf", weight: "400", style: "italic" },
    { path: "../../public/brand/fonts/EBGaramond-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/brand/fonts/EBGaramond-MediumItalic.ttf", weight: "500", style: "italic" },
    { path: "../../public/brand/fonts/EBGaramond-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../public/brand/fonts/EBGaramond-SemiBoldItalic.ttf", weight: "600", style: "italic" },
    { path: "../../public/brand/fonts/EBGaramond-Bold.ttf", weight: "700", style: "normal" },
    { path: "../../public/brand/fonts/EBGaramond-BoldItalic.ttf", weight: "700", style: "italic" },
    { path: "../../public/brand/fonts/EBGaramond-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "../../public/brand/fonts/EBGaramond-ExtraBoldItalic.ttf", weight: "800", style: "italic" },
  ],
  variable: "--font-serif",
  display: "swap",
  preload: false,
});

const questrial = Questrial({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Archivo fica só para o /catalogo e a /manutencao (o site v3 usa EB Garamond
// e Questrial). A Pinyon Script saiu: o único uso era o "quem faz" antigo.
const archivo = Archivo({
  weight: ["400", "500", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gio Handmade",
  description: "Tops, conjuntos e vestidos feitos à mão com pedrarias e cristais.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#EDE7D9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // data-scroll-behavior: o Next desliga o scroll suave do <html> durante a
    // troca de página (a página nova abre no topo na hora, sem rolar animado).
    <html lang="pt-br" data-scroll-behavior="smooth">
      <body className={`${ebGaramond.variable} ${questrial.variable} ${archivo.variable} antialiased`}>
        <Providers>
          {children}
          {/* Gavetas fora do <main>: abertas, o <main> fica inerte e elas não. */}
          <GavetaNavegacao />
          <Sacola />
        </Providers>
      </body>
    </html>
  );
}
