import AntiGravityHero from "@/components/AntiGravityHero";
import ProductCatalog from "@/components/ProductCatalog";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center w-full bg-white">
      
      {/* Hero Carousel Section */}
      <AntiGravityHero />
      
      {/* Scroll Transition Area */}
      <section className="w-full bg-white text-[#111111] flex flex-col items-center justify-center py-32 md:py-48 min-h-[50vh]">
        <div className="flex flex-col items-center text-center space-y-6">
          <h2 className="text-4xl md:text-6xl font-serif tracking-widest uppercase">THE NEW</h2>
          <p className="text-[10px] uppercase tracking-[0.3em] font-sans opacity-60 pt-4">Scroll Down</p>
          <div className="w-[1px] h-24 bg-[#111111] opacity-20 mt-8"></div>
        </div>
      </section>

      {/* Main Product Catalog */}
      <ProductCatalog />
      
      {/* Minimal Footer */}
      <footer className="w-full bg-heca-bg text-heca-primary border-t border-heca-primary/10 py-12 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center text-xs uppercase tracking-widest opacity-70">
        <div>&copy; {new Date().getFullYear()} HECA. All Rights Reserved.</div>
        <div className="space-x-8 mt-4 md:mt-0 font-medium">
          <a href="#" className="hover:opacity-100 transition-opacity">Instagram</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Contact</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Terms</a>
        </div>
      </footer>
      
    </main>
  );
}
