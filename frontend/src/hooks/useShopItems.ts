// Assuming this is in useReviews.ts or a new dedicated file

import { useQuery } from '@tanstack/react-query';
import { apiClient } from "@/lib/apiClient";
import { AxiosResponse } from 'axios';
import React from 'react'; // Needed for React.ElementType type

// --- NEW TYPE DEFINITIONS ---

// Define the structure of the data expected from the API
export type MyItemBenefitDTO = {
    title: string;
    price: number;
    // Assuming the backend sends a string name that maps to a Lucide icon
    iconName: string;
    description: string;
    isActive: boolean;
};

// --- NEW FETCHER FUNCTION ---
async function fetchMyItemBenefits(): Promise<MyItemBenefitDTO[]> {
    // The specific API endpoint
    const url = `/users/benefits/my-items`;

    // Assuming the response is a list of items directly
    const response: AxiosResponse<MyItemBenefitDTO[]> = await apiClient.get(url);

    return response.data;
}

// --- NEW CUSTOM HOOK ---

export function useMyItemBenefits() {
    return useQuery<MyItemBenefitDTO[]>({
        // Use a unique key for caching this data
        queryKey: ['myItemBenefits'],

        queryFn: fetchMyItemBenefits,

        // Optional: Cache data for a long time if it doesn't change often (e.g., 5 minutes)
        staleTime: 1000 * 60 * 5,
    });
}