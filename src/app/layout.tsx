import type { Metadata } from "next";
import { EB_Garamond, Questrial, Archivo, Pinyon_Script } from "next/font/google";
import "./globals.css";

const ebGaramond = EB_Garamond({
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const questrial = Questrial({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const archivo = Archivo({
  weight: ["400", "500", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const pinyonScript = Pinyon_Script({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gio Handmade",
  description: "Tops, conjuntos e vestidos feitos à mão com pedrarias e cristais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={`${ebGaramond.variable} ${questrial.variable} ${archivo.variable} ${pinyonScript.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
