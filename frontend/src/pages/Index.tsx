// src/pages/Index.tsx

import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Categories } from "@/components/Categories";
// 1. Importamos tu componente de lista
import { PublicationList } from "@/components/PublicationList";
// 2. ¡Importamos el hook que hicimos!
import { usePublications } from "@/hooks/usePublications";
// 3. (Opcional pero recomendado) Importamos el Skeleton
import { Skeleton } from "@/components/ui/skeleton";
import SearchBar from "@/components/SearchBar";

const Index = () => {
    // 4. ¡AQUÍ ESTÁ LA MAGIA!
    // Llamamos al hook. Nos da los datos, el estado de carga y el error.
    const { publications, isLoading, error } = usePublications();

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
        <div className="min-h-screen bg-background">
            <Header userXP={2450} userLevel={12} />
            {/*<Hero />*/}
            {/*<Categories />*/}

            {/* 9. Ya no llamamos a <PublicationList /> directamente.
          Llamamos a nuestra función 'renderContent()' que tiene la lógica. */}
            {renderContent()}

            {/* Footer */}
            <footer className="bg-card border-t py-12">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <div className="flex items-center justify-center">
                            <img className="w-48 h-24 " src="/letrassinfondo.png" />
                        </div>
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
