// hooks/usePersonalizedPrice.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { apiClient } from '@/lib/apiClient';


const fetchPersonalizedPrice = async (
  publicationId: string | undefined
): Promise<number> => {
  if (!publicationId) {
    throw new Error("Missing required parameters");
  }

  const { data } = await apiClient.get<number>(
    `/publications/${publicationId}/personalized-price`
  );

  return data;
};

export const usePersonalizedPrice = (
  publicationId: string | undefined,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["personalizedPrice", publicationId],
    queryFn: () => fetchPersonalizedPrice(publicationId),
    enabled: enabled && !!publicationId ,
  });
};