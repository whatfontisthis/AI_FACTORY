"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ReviewData } from "@/types/review";
import { StarRating } from "./StarRating";
import { getPosterUrl } from "@/lib/tmdb";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface ReviewModalProps {
  review: ReviewData | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ReviewModal({
  review,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: ReviewModalProps) {
  if (!review) return null;

  const posterUrl = review.posterPath
    ? getPosterUrl(review.posterPath, "w342")
    : "/placeholder-poster.svg";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-[#1F1F1F] border-[#333333]">
        <DialogHeader>
          <DialogTitle className="sr-only">{review.title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="shrink-0 w-full md:w-40 aspect-[2/3] relative rounded-lg overflow-hidden bg-[#2A2A2A]">
            <Image
              src={posterUrl}
              alt={review.title}
              fill
              sizes="160px"
              className="object-cover"
              unoptimized={posterUrl.startsWith("/placeholder")}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-[#FFFFFF]">
              {review.title}
              {review.originalTitle && (
                <span className="text-[#A3A3A3] font-normal text-base ml-2">
                  ({review.originalTitle})
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <StarRating rating={review.rating} size="md" />
              <span className="text-[#FBBF24] font-medium">
                {review.rating.toFixed(1)}
              </span>
            </div>
            <dl className="mt-3 space-y-1 text-sm text-[#A3A3A3]">
              {review.releaseDate && (
                <div>
                  <dt className="inline font-medium text-[#FFFFFF]">개봉일: </dt>
                  <dd className="inline">{review.releaseDate}</dd>
                </div>
              )}
              {review.genres?.length > 0 && (
                <div>
                  <dt className="inline font-medium text-[#FFFFFF]">장르: </dt>
                  <dd className="inline">{review.genres.join(", ")}</dd>
                </div>
              )}
              <div>
                <dt className="inline font-medium text-[#FFFFFF]">시청일: </dt>
                <dd className="inline">
                  {format(new Date(review.watchedAt), "yyyy년 M월 d일", {
                    locale: ko,
                  })}
                </dd>
              </div>
            </dl>
            {review.description && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-[#FFFFFF] mb-1">
                  줄거리
                </h3>
                <p className="text-sm text-[#A3A3A3] line-clamp-4">
                  {review.description}
                </p>
              </div>
            )}
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-[#FFFFFF] mb-1">
                내 감상평
              </h3>
              <p className="text-sm text-[#A3A3A3] whitespace-pre-wrap">
                {review.userReview}
              </p>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="default" onClick={onEdit}>
                수정
              </Button>
              <Button variant="destructive" onClick={onDelete}>
                삭제
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
