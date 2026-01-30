"use client";

import type { ReviewData } from "@/types/review";
import { ReviewCard } from "./ReviewCard";

interface ReviewGridProps {
  reviews: ReviewData[];
  onCardClick: (review: ReviewData) => void;
}

export function ReviewGrid({ reviews, onCardClick }: ReviewGridProps) {
  return (
    <div
      className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      role="list"
    >
      {reviews.map((review) => (
        <div key={review.id} role="listitem">
          <ReviewCard
            review={review}
            onClick={() => onCardClick(review)}
          />
        </div>
      ))}
    </div>
  );
}
