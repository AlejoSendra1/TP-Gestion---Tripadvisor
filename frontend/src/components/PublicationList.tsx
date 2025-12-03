// src/components/PublicationList.tsx
import { ExperienceCard } from "./ExperienceCard";
import { Skeleton } from "@/components/ui/skeleton";
// 1. Importamos el tipo desde el hook
import { PublicationSummary } from "@/hooks/usePublications";

interface PublicationListProps {
  publications: PublicationSummary[];
  isLoading?: boolean;
  error?: Error | null;
}

export function PublicationList({ publications, isLoading, error }: PublicationListProps) {
      
  //Si 'isLoading' es true, mostramos Skeletons
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

  //Si hay error, lo mostramos
  if (error) {
      return (
          <div className="container mx-auto px-4 py-16 text-center">
              <p className="text-destructive text-lg">
                  ¡Oops! No pudimos cargar las experiencias. ({error.message})
              </p>
          </div>
      );
  }
  
  return (
      <section className="py-16">
        <div className="container mx-auto px-4">
            <div className="text-center mb-12">
                <h1 className="font-aileron text-3xl md:text-4xl font-bold mb-4">
                    Tenés estas opciones disponibles!
                </h1>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 3. ¡Aquí viene el siguiente problema! */}
            {publications.map((experience) => (
                // 4. Mapeamos los campos del DTO a lo que espera la Card
                <ExperienceCard
                    key={experience.id}
                    id={experience.id}
                    title={experience.title}
                    image={experience.mainImageUrl} // 'mainImageUrl' -> 'image'
                    location={`${experience.city}, ${experience.country}`} // Combinamos city y country
                    price={`$${experience.price}`} // Asumimos que es un número
                    category={experience.publicationType} // 'publicationType' -> 'category'
                    // ¡OJO! rating, reviewCount y xpReward no existen en el DTO
                    // Tendrás que modificar ExperienceCard para que sean opcionales
                />
            ))}
          </div>
        </div>
      </section>
  );
}