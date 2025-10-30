import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchFilters } from "@/components/SearchFilters";

const Index = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <SearchFilters />
            <Footer />
        </div>
    );
};

export default Index;
