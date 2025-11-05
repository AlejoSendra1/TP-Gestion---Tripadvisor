
import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { SearchFilters as SearchFiltersType } from "@/hooks/usePublications";
import { usePublications } from "@/hooks/usePublications";
import { PublicationList } from "@/components/PublicationList";
import { Footer } from "@/components/Footer";

const Index = () => {
    const [filters, setFilters] = useState<SearchFiltersType>({});
    const { publications, isLoading, error } = usePublications(filters);
    const handleFiltersChange = (newFilters: any) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            ...newFilters
        }));
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <Hero 
                onFiltersChange={handleFiltersChange}
            />
            <PublicationList 
                publications={publications} 
                isLoading={isLoading} 
                error={error} 
            />
            <Footer />
        </div>
    );
};

export default Index;
