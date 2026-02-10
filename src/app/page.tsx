import Hero from "@/components/Hero";
import CollectionHighlights from "@/components/CollectionHighlights"; // <--- Importe
import ProductGrid from "@/components/ProductGrid";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <CollectionHighlights /> {/* <--- Adicione aqui */}
      <ProductGrid />
    </main>
  );
}