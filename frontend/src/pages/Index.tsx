import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Categories } from "@/components/Categories";
import { FeaturedExperiences } from "@/components/FeaturedExperiences";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header userXP={2450} userLevel={12} />
      <Hero />
      <Categories />
      <FeaturedExperiences />
      
      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-hero bg-clip-text text-transparent">
              QuestEscapes
            </h3>
            <p className="text-muted-foreground mb-4">
              Discover amazing places, share your experiences, and earn XP rewards
            </p>
            <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">About</a>
              <a href="#" className="hover:text-primary transition-colors">Help</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;