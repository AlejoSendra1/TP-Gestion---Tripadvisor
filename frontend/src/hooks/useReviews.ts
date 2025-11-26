import { useQuery } from '@tanstack/react-query';
import { apiClient } from "@/lib/apiClient";
import { AxiosResponse } from 'axios';

// --- PARAMETERS for Pagination ---
type PageableInput = {
    page?: number;
    size?: number;
    sort?: string;
};

// DTO structure you expected for a single review
export type ReviewDTO = {
    username: string;
    userLastname: string;
    reviewerEmail: String
    rating: number;
    reviewContent: string;
    createdAt: string;
};

export type ReviewPageResponse = {
    content: ReviewDTO[];
    totalPages: number;
    number: number;
    size: number;
    totalElements: number;
    last: boolean;
    first: boolean;
};

export type ReviewHistoryRegister = {
    placeName: string;
    publicationId: number;
    rating: number;
    reviewContent: string;
    createdAt: string;
    qualification: number;
};

export type UserReviewHistory = {
    content: ReviewHistoryRegister[];
    totalPages: number;
    number: number;
    size: number;
    totalElements: number;
    last: boolean;
    first: boolean;
};

// Function to fetch reviews for a specific publication ID
async function fetchReviews(
    publicationId: string | undefined,
    pageable: PageableInput
): Promise<ReviewPageResponse> {

    if (!publicationId) {
        // Return a promise resolving to an empty page structure
        return Promise.resolve({
            content: [],
            totalPages: 0,
            number: 0,
            size: pageable.size || 10,
            totalElements: 0,
            last: true,
            first: true,
        });
    }

    // URL using the publicationId as a path variable
    const url = `/reviews/publication/${publicationId}`;

    const response: AxiosResponse<ReviewPageResponse> = await apiClient.get(url, {
        params: {
            // This spreads the page, size, and sort into the query string
            ...pageable
        }
    });

    return response.data;
}

export function useReviews(publicationId: string | undefined, pageable: PageableInput = {}) {
    return useQuery<ReviewPageResponse>({
        // UPDATE: The query key now includes 'pageable' to refetch when page/sort changes
        queryKey: ['reviews', publicationId, pageable],

        // UPDATE: Pass the pageable object to the fetcher function
        queryFn: () => fetchReviews(publicationId, pageable),

        // Only run the query if we have a valid ID
        enabled: !!publicationId,
    });
}


// Function to fetch reviews for a specific user
async function fetchUserReviews(
        pageable: PageableInput
    ): Promise<UserReviewHistory> {

    const url = `/reviews`;

    const response: AxiosResponse<UserReviewHistory> = await apiClient.get(url, {
        params: {
            // This spreads the page, size, and sort into the query string
            ...pageable
        }
    });


    console.log("received user reviews",response.data);
    return response.data;
}

export function useActualUserReviews(pageable: PageableInput = {}) {
    return useQuery<UserReviewHistory>({
        queryKey: ['actualUserReviews',pageable],

        queryFn: () => fetchUserReviews(pageable),

        keepPreviousData: true,
    });
}