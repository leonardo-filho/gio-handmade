import type { Metadata } from "next";
import { Questrial, Archivo, Pinyon_Script } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// EB Garamond — todas as variantes do manual oficial Gio Handmade
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
    <html lang="pt-br">
      <body className={`${ebGaramond.variable} ${questrial.variable} ${archivo.variable} ${pinyonScript.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
