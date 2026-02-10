import Hero from "@/components/Hero";
import CollectionHighlights from "@/components/CollectionHighlights"; // Agora são as Categorias
import ProcessSection from "@/components/ProcessSection"; // <--- Novo import
import ProductGrid from "@/components/ProductGrid";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <ProcessSection /> {/* Explica como comprar antes de mostrar os produtos */}
      <CollectionHighlights />
      <ProductGrid />
    </main>
  );
}