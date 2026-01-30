"use client";

import Image from "next/image";
import type { ReviewData } from "@/types/review";
import { getPosterUrl } from "@/lib/tmdb";
import { StarRating } from "@/components/review/StarRating";
import { cn } from "@/lib/utils";

interface TopRankingProps {
  reviews: ReviewData[];
}

export function TopRanking({ reviews }: TopRankingProps) {
  const top = reviews
    .filter((r) => r.rating >= 4)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  if (top.length === 0) return null;

  return (
    <section className="w-full">
      <h2 className="text-lg font-semibold text-[#FFFFFF] mb-4 flex items-center gap-2">
        🏆 최고 평점
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
        {top.map((review) => {
          const posterUrl = review.posterPath
            ? getPosterUrl(review.posterPath, "w185")
            : "/placeholder-poster.svg";
          return (
            <div
              key={review.id}
              className={cn(
                "shrink-0 w-24 flex flex-col items-center gap-1",
                "rounded-lg overflow-hidden"
              )}
            >
              <div className="w-24 aspect-[2/3] relative rounded-lg overflow-hidden bg-[#2A2A2A] shadow-md">
                <Image
                  src={posterUrl}
                  alt={review.title}
                  fill
                  sizes="96px"
                  className="object-cover"
                  unoptimized={posterUrl.startsWith("/placeholder")}
                />
              </div>
              <p className="text-xs text-[#FFFFFF] font-medium truncate w-full text-center">
                {review.title}
              </p>
              <div className="flex items-center gap-0.5">
                <StarRating rating={review.rating} size="sm" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
