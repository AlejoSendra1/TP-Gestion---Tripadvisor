import { useState, useEffect } from 'react';
import axios from 'axios';

interface ReviewQualificationDTO {
  publicationId: number;
  reviewerEmail: string;
  qualificatorEmail: string;
  feedbackType: 'USEFULL' | 'NOT_USEFULL' | 'NONE';
}

interface UseReviewQualificationReturn {
  qualifications: Record<string, { liked: boolean; disliked: boolean }>;
  handleLike: (reviewerEmail: string) => Promise<void>;
  handleDislike: (reviewerEmail: string) => Promise<void>;
  isUpdating: boolean;
  isLoadingInitial: boolean;
}

interface InitialQualificationResponse {
  reviewerEmail: string;
  feedbackType: 'USEFULL' | 'NOT_USEFULL' | 'NONE';
}  

export function useReviewQualification(
  publicationId: string | undefined,
  currentUserEmail: string | undefined
): UseReviewQualificationReturn {
  const [qualifications, setQualifications] = useState<Record<string, { liked: boolean; disliked: boolean }>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  // Helper function to transform API response into state format
  const transformQualifications = (data: InitialQualificationResponse[]) => {
    return data.reduce((acc, current) => {
      acc[current.reviewerEmail] = {
        liked: current.feedbackType === 'USEFULL',
        disliked: current.feedbackType === 'NOT_USEFULL',
      };
      return acc;
    }, {} as Record<string, { liked: boolean; disliked: boolean }>);
  };

  //Fetch initial qualifications 
  useEffect(() => {
    const fetchInitialQualifications = async () => {
      if (!currentUserEmail || !publicationId) {
        // If we don't have the required data, stop loading and return
        setQualifications({});
        setIsLoadingInitial(false);
        return;
      }

      setIsLoadingInitial(true);
      try {
        // NOTE: You will need to create a new API endpoint for fetching 
        // the current user's qualifications for a given publication.
        // I'm assuming an endpoint like '/reviews/qualification/publicationId/qualificatorEmail'
        const url = `/reviews/qualification/${publicationId}/${currentUserEmail}`;
        
        const response = await axios.get<InitialQualificationResponse[]>(url);
        
        // 3. Initialize state with fetched data
        const initialQualifications = transformQualifications(response.data);
        setQualifications(initialQualifications);

      } catch (err) {
        console.error('Error fetching initial qualifications:', err);
        // Handle error state if necessary
      } finally {
        setIsLoadingInitial(false);
      }
    };

    fetchInitialQualifications();
  }, [publicationId, currentUserEmail]);

  const updateQualification = async (reviewerEmail: string, feedbackType: 'USEFULL' | 'NOT_USEFULL' | 'NONE') => {
    if (!currentUserEmail || !publicationId) return;

    setIsUpdating(true);
    try {
      const dto: ReviewQualificationDTO = {
        publicationId: Number(publicationId),
        reviewerEmail,
        qualificatorEmail: currentUserEmail,
        feedbackType
      };

      const response = await axios.post<number>('/reviews/qualification', dto);
      console.log('Qualification count:', response.data);
    } catch (err) {
      console.error('Error updating qualification:', err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLike = async (reviewerEmail: string) => {
    if (!currentUserEmail) return;

    const currentQualification = qualifications[reviewerEmail];
    const isCurrentlyLiked = currentQualification?.liked;

    // Determine new qualification type
    const newFeedbackType = isCurrentlyLiked ? 'NONE' : 'USEFULL';

    // Optimistic update
    setQualifications(prev => ({
      ...prev,
      [reviewerEmail]: {
        liked: !isCurrentlyLiked,
        disliked: false
      }
    }));

    try {
      await updateQualification(reviewerEmail, newFeedbackType);
    } catch (err) {
      // Revert on error
      setQualifications(prev => ({
        ...prev,
        [reviewerEmail]: currentQualification || { liked: false, disliked: false }
      }));
    }
  };

  const handleDislike = async (reviewerEmail: string) => {
    if (!currentUserEmail) return;

    const currentQualification = qualifications[reviewerEmail];
    const isCurrentlyDisliked = currentQualification?.disliked;

    // Determine new qualification type
    const newFeedbackType = isCurrentlyDisliked ? 'NONE' : 'NOT_USEFULL';

    // Optimistic update
    setQualifications(prev => ({
      ...prev,
      [reviewerEmail]: {
        liked: false,
        disliked: !isCurrentlyDisliked
      }
    }));

    try {
      await updateQualification(reviewerEmail, newFeedbackType);
    } catch (err) {
      // Revert on error
      setQualifications(prev => ({
        ...prev,
        [reviewerEmail]: currentQualification || { liked: false, disliked: false }
      }));
    }
  };

  return {
    qualifications,
    handleLike,
    handleDislike,
    isUpdating,
    isLoadingInitial,
  };
}