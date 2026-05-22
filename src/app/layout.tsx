import type { Metadata } from "next";
import { Cormorant_Garamond, Lato } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const lato = Lato({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
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
      <body className={`${cormorant.variable} ${lato.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
