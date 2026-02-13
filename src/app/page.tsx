import Hero from "@/components/Hero";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CollectionHighlights from "@/components/CollectionHighlights";
import ProcessSection from "@/components/ProcessSection";
import ProductGrid from "@/components/ProductGrid";
import AboutSection from "@/components/AboutSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <CollectionHighlights />
      <AboutSection />
      <ProcessSection />
      <ProductGrid />
      <Footer />
    </main>
  );
}