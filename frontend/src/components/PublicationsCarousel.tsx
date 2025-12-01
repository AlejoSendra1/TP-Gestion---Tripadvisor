// File: `frontend/src/components/PublicationsCarousel.tsx`
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ExperienceCard } from "@/components/ExperienceCard";
import { PublicationSummary } from "@/hooks/usePublications";

interface Props {
  fetchedPublications: PublicationSummary[];
  loadingPubs: boolean;
  pubsError: string | null;
}

const PublicationsCarousel: React.FC<Props> = ({ fetchedPublications, loadingPubs, pubsError }) => {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-orange-100">
            <Home className="h-5 w-5 text-orange-600" />
          </div>
          <CardTitle>Mis publicaciones</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {loadingPubs && (
          <div className="py-4">
            <div className="flex space-x-6 overflow-x-auto px-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="min-w-[300px] flex-shrink-0">
                  <Skeleton className="h-56 w-full rounded-xl" />
                  <div className="mt-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {pubsError && <div className="text-destructive text-center py-6">Error: {pubsError}</div>}

        {!loadingPubs && !pubsError && fetchedPublications.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-lg font-medium">Aún no tiene publicaciones</p>
          </div>
        ) : (
          !loadingPubs && !pubsError && (
            <div className="py-4">
              <div className="flex space-x-6 overflow-x-auto px-2">
                {fetchedPublications.map((pub) => (
                  <div key={pub.id} className="min-w-[300px] flex-shrink-0">
                    <ExperienceCard
                      id={pub.id}
                      title={pub.title}
                      image={pub.mainImageUrl}
                      location={`${pub.city}, ${pub.country}`}
                      price={`$${pub.price}`}
                      category={pub.publicationType}
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default PublicationsCarousel;
