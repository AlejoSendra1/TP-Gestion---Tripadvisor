// src/components/PublicationList.tsx
import { ExperienceCard } from "./ExperienceCard";
// 1. Importamos el tipo desde el hook
import { PublicationSummary } from "@/hooks/usePublications";

type PublicationListProps = {
  // 2. Usamos el tipo correcto en las props
  publications: PublicationSummary[];
};

export function PublicationList({ publications }: PublicationListProps) {
  return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* ... tu título ... */}

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