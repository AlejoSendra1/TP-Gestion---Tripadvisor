import { useState, useEffect } from 'react';
import { Hero } from "@/components/Hero";
import { Categories } from "@/components/Categories";
import { PublicationList } from "@/components/PublicationList";
import { usePublications, SearchFilters as SearchFiltersType } from "@/hooks/usePublications";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchBar } from "@/components/SearchBar";


export const SearchFilters = () => {
    const [filters, setFilters] = useState<SearchFiltersType>({
        query: '',
    });

    const { publications, isLoading, error } = usePublications(filters);
    const handleTitleSearch = (query: string) => {
        setFilters(prev => ({ ...prev, query }));
    };

    // 5. Esta función decide qué mostrar basado en el estado del hook
    const renderContent = () => {
        
        // 6. Si 'isLoading' es true, mostramos Skeletons
        if (isLoading) {
            return (
                <div className="container mx-auto px-4 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Creamos un array "falso" de 6 items para los skeletons */}
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="flex flex-col space-y-3">
                                <Skeleton className="h-[225px] w-full rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[250px]" />
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // 7. Si el hook nos dio un error, lo mostramos
        if (error) {
            return (
                <div className="container mx-auto px-4 py-16 text-center">
                    <p className="text-destructive text-lg">
                        ¡Oops! No pudimos cargar las experiencias. ({error.message})
                    </p>
                </div>
            );
        }

        // 8. ¡AQUÍ SE CORRIGE TU ERROR!
        // Si no está cargando y no hay error, le pasamos los 'publications'
        // que vinieron del hook a tu componente.
        return <PublicationList publications={publications} />;
    };
    
    
    return (
        <section className="bg-card border-t py-12">
            {/* SearchBar para búsqueda por título */}
            <div className="container mx-auto px-4 py-6">
                <SearchBar onSearch={handleTitleSearch} />
            </div>
            <div className="min-h-screen bg-background">
                <Hero />
                <Categories />
                {renderContent()}
            </div>
        </section>
    );
};

export default SearchFilters;