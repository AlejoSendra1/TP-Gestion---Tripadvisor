import { Header } from "@/components/Header";
import { Categories } from "@/components/Categories";
import { FeaturedExperiences } from "@/components/FeaturedExperiences";
import SearchBar from "@/components/SearchBar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Este Header ya no necesita props de búsqueda */}
      <Header userXP={2450} userLevel={12} />
      {/* Sección "Hero" con la barra de búsqueda principal */}
      <section className="py-20 text-center bg-gradient-hero">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-4">Encuentra tu próxima cancha</h1>
          <p className="text-lg text-white/80 mb-8">Busca por nombre y reserva en segundos.</p>
          <div className="max-w-2xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </section>
      <Categories />
      <FeaturedExperiences />
    </div>
  );
};

export default Index;
