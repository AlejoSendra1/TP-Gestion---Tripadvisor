
import { useQuery } from "@tanstack/react-query";

interface PersonalizedPriceResponse {
  personalizedPrice: number;
  originalPrice: number;
}

const fetchPersonalizedPrice = async (
  publicationId: string | undefined,
  userEmail: string | undefined
): Promise<PersonalizedPriceResponse> => {
  if (!publicationId || !userEmail) {
    throw new Error("Missing required parameters");
  }

  const response = await fetch(
    `/api/publications/${publicationId}/personalized-price?userEmail=${encodeURIComponent(userEmail)}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch personalized price");
  }

  return response.json();
};

export const usePersonalizedPrice = (
  publicationId: string | undefined,
  userEmail: string | undefined,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["personalizedPrice", publicationId, userEmail],
    queryFn: () => fetchPersonalizedPrice(publicationId, userEmail),
    enabled: enabled && !!publicationId && !!userEmail,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};