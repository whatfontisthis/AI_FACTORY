"use client";

import Image from "next/image";
import type { ReviewData } from "@/types/review";
import { StarRating } from "./StarRating";
import { getPosterUrl } from "@/lib/tmdb";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  review: ReviewData;
  onClick: () => void;
}

export function ReviewCard({ review, onClick }: ReviewCardProps) {
  const posterUrl = review.posterPath
    ? getPosterUrl(review.posterPath, "w342")
    : "/placeholder-poster.svg";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "group text-left rounded-lg overflow-hidden shadow-lg",
        "transition-all duration-200 ease-out hover:scale-[1.03] hover:shadow-xl",
        "bg-[#1F1F1F] border border-[#333333] hover:border-[#525252]",
        "cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FBBF24] focus:ring-offset-2 focus:ring-offset-[#1F1F1F]"
      )}
    >
      <div className="aspect-[2/3] relative bg-[#2A2A2A]">
        <Image
          src={posterUrl}
          alt={review.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          className="object-cover"
          unoptimized={posterUrl.startsWith("/placeholder")}
        />
      </div>
      <div className="p-3">
        <h3 className="text-[#FFFFFF] font-semibold text-sm truncate">
          {review.title}
        </h3>
        <div className="flex items-center gap-1.5 mt-1">
          <StarRating rating={review.rating} size="sm" />
          <span className="text-[#FBBF24] text-sm font-medium">
            {review.rating.toFixed(1)}
          </span>
        </div>
        <div className="space-y-0.5 mt-1">
          <p className="text-[#6B6B6B] text-xs">
            개봉일: {review.releaseDate || "정보 없음"}
          </p>
          <p className="text-[#6B6B6B] text-xs">
            작성일: {format(new Date(review.createdAt), "yyyy.MM.dd", { locale: ko })}
          </p>
        </div>
      </div>
    </div>
  );
}
