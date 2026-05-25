import type { Metadata } from "next";
import CatalogNav from "@/components/catalogo/CatalogNav";
import WhatsAppFloat from "@/components/catalogo/WhatsAppFloat";
import SmoothScroll from "@/components/SmoothScroll";
import Cover from "@/components/catalogo/Cover";
import IndexSection from "@/components/catalogo/Index";
import Manifesto from "@/components/catalogo/Manifesto";
import Process from "@/components/catalogo/Process";
import CatalogIntro from "@/components/catalogo/CatalogIntro";
import Products from "@/components/catalogo/Products";
import Prices from "@/components/catalogo/Prices";
import Care from "@/components/catalogo/Care";
import Contact from "@/components/catalogo/Contact";

export const metadata: Metadata = {
  title: "Gio Handmade · Catálogo 2026",
  description:
    "Catálogo premium 2026 da Gio Handmade. Tops, conjuntos, vestidos e acessórios feitos à mão em Belém do Pará.",
};

export default function CatalogoPage() {
  return (
    <main className="bg-[#EDE7D9] text-[#130209] pt-12 md:pt-14">
      <SmoothScroll />
      <CatalogNav />
      <Cover />
      <IndexSection />
      <Manifesto />
      <Process />
      <CatalogIntro />
      <Products />
      <Prices />
      <Care />
      <Contact />
      <WhatsAppFloat />
    </main>
  );
}
