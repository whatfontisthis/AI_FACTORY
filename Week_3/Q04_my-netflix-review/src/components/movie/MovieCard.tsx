"use client";

import Image from "next/image";
import type { TMDBMovie } from "@/types/movie";
import { getPosterUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";

interface MovieCardProps {
  movie: TMDBMovie;
  onClick: () => void;
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  const posterUrl = getPosterUrl(movie.poster_path, "w185");

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex gap-3 w-full text-left p-2 rounded-lg",
        "hover:bg-[#2A2A2A] transition-colors border border-transparent hover:border-[#525252]"
      )}
    >
      <div className="shrink-0 w-12 aspect-[2/3] relative rounded overflow-hidden bg-[#2A2A2A]">
        <Image
          src={posterUrl}
          alt={movie.title}
          fill
          sizes="48px"
          className="object-cover"
          unoptimized={posterUrl.startsWith("/placeholder")}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-[#FFFFFF] truncate">{movie.title}</p>
        {movie.release_date && (
          <p className="text-sm text-[#6B6B6B]">
            {movie.release_date.slice(0, 4)}
          </p>
        )}
      </div>
    </button>
  );
}
