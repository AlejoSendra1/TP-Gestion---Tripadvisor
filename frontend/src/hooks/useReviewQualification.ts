import { useState } from 'react';
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
}

export function useReviewQualification(
  publicationId: string | undefined,
  currentUserEmail: string | undefined
): UseReviewQualificationReturn {
  const [qualifications, setQualifications] = useState<Record<string, { liked: boolean; disliked: boolean }>>({});
  const [isUpdating, setIsUpdating] = useState(false);

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
  };
}