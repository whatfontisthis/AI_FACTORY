"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MovieSearch } from "@/components/movie/MovieSearch";
import { StarRating } from "./StarRating";
import { getPosterUrl, getGenreNames } from "@/lib/tmdb";
import type { TMDBMovie } from "@/types/movie";
import type { ReviewData } from "@/types/review";
import { format } from "date-fns";

interface ReviewFormProps {
  movie?: TMDBMovie | null;
  review?: ReviewData | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function ReviewForm({
  movie: initialMovie,
  review,
  isOpen,
  onClose,
  onSubmit,
}: ReviewFormProps) {
  const isEdit = !!review;
  const [movie, setMovie] = useState<TMDBMovie | null>(initialMovie ?? null);
  const [rating, setRating] = useState(review?.rating ?? 3);
  const [watchedAt, setWatchedAt] = useState(
    review?.watchedAt
      ? format(new Date(review.watchedAt), "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd")
  );
  const [userReview, setUserReview] = useState(review?.userReview ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setMovie(initialMovie ?? null);
      setRating(review?.rating ?? 3);
      setWatchedAt(
        review?.watchedAt
          ? format(new Date(review.watchedAt), "yyyy-MM-dd")
          : format(new Date(), "yyyy-MM-dd")
      );
      setUserReview(review?.userReview ?? "");
      setError("");
    }
  }, [isOpen, initialMovie, review]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isEdit && !movie) {
      setError("영화를 검색해 선택해주세요.");
      return;
    }
    if (!userReview.trim()) {
      setError("감상평을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit && review) {
        const res = await fetch(`/api/reviews/${review.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userReview: userReview.trim(),
            rating,
            watchedAt: new Date(watchedAt).toISOString(),
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "수정에 실패했습니다.");
        }
      } else if (movie) {
        const genres = getGenreNames(movie.genre_ids ?? []);
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            movieId: String(movie.id),
            title: movie.title,
            originalTitle: movie.original_title ?? "",
            posterPath: movie.poster_path ?? "",
            description: movie.overview ?? "",
            releaseDate: movie.release_date?.slice(0, 10) ?? "",
            genres,
            userReview: userReview.trim(),
            rating,
            watchedAt: new Date(watchedAt).toISOString(),
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "저장에 실패했습니다.");
        }
      }
      onSubmit();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg bg-[#1F1F1F] border-[#333333] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#FFFFFF]">
            {isEdit ? "리뷰 수정" : "새 리뷰 작성"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEdit && (
            <div>
              <Label className="text-[#A3A3A3]">영화 검색</Label>
              <div className="mt-1">
                <MovieSearch onSelect={setMovie} />
              </div>
              {movie && (
                <div className="mt-3 flex gap-3 p-3 rounded-lg bg-[#2A2A2A]">
                  <div className="shrink-0 w-16 aspect-[2/3] relative rounded overflow-hidden">
                    <Image
                      src={getPosterUrl(movie.poster_path, "w185")}
                      alt={movie.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                      unoptimized={!movie.poster_path}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#FFFFFF]">{movie.title}</p>
                    {movie.release_date && (
                      <p className="text-sm text-[#6B6B6B]">
                        {movie.release_date.slice(0, 4)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {isEdit && review && (
            <div className="flex gap-3 p-3 rounded-lg bg-[#2A2A2A]">
              <div className="shrink-0 w-16 aspect-[2/3] relative rounded overflow-hidden">
                <Image
                  src={
                    review.posterPath
                      ? getPosterUrl(review.posterPath, "w185")
                      : "/placeholder-poster.svg"
                  }
                  alt={review.title}
                  fill
                  sizes="64px"
                  className="object-cover"
                  unoptimized={!review.posterPath}
                />
              </div>
              <p className="font-semibold text-[#FFFFFF]">{review.title}</p>
            </div>
          )}
          <div>
            <Label className="text-[#A3A3A3]">별점</Label>
            <div className="mt-2">
              <StarRating rating={rating} onChange={setRating} size="lg" />
            </div>
          </div>
          <div>
            <Label htmlFor="watchedAt" className="text-[#A3A3A3]">
              시청일
            </Label>
            <Input
              id="watchedAt"
              type="date"
              value={watchedAt}
              onChange={(e) => setWatchedAt(e.target.value)}
              className="mt-1 bg-[#2A2A2A] border-[#333333] text-[#FFFFFF]"
            />
          </div>
          <div>
            <Label htmlFor="userReview" className="text-[#A3A3A3]">
              감상평
            </Label>
            <Textarea
              id="userReview"
              value={userReview}
              onChange={(e) => setUserReview(e.target.value)}
              placeholder="감상평을 입력하세요..."
              rows={4}
              className="mt-1 bg-[#2A2A2A] border-[#333333] text-[#FFFFFF] placeholder:text-[#6B6B6B]"
            />
          </div>
          {error && (
            <p className="text-sm text-[#EF4444]" role="alert">
              {error}
            </p>
          )}
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#E50914] hover:bg-[#F40612]"
            >
              {submitting ? "저장 중..." : "저장"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
