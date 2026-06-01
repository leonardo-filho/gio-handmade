import Hero from "@/components/Hero";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BrilhoTropical from "@/components/BrilhoTropical";
import CollectionHighlights from "@/components/CollectionHighlights";
import ProcessSection from "@/components/ProcessSection";
import ProductGrid from "@/components/ProductGrid";
import AboutSection from "@/components/AboutSection";
import SmoothScroll from "@/components/SmoothScroll";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <SmoothScroll />
      <Header />
      <Hero />
      <BrilhoTropical />
      <CollectionHighlights />
      <ProcessSection />
      <ProductGrid />
      <AboutSection />
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
