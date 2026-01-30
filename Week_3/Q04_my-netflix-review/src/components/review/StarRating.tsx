"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}

const sizeMap = { sm: 16, md: 20, lg: 24 };

export function StarRating({ rating, onChange, size = "md" }: StarRatingProps) {
  const px = sizeMap[size];
  const isInteractive = !!onChange;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          disabled={!isInteractive}
          className={cn(
            "transition-colors",
            isInteractive && "cursor-pointer hover:opacity-80"
          )}
          onClick={() => onChange?.(value)}
          onKeyDown={(e) => {
            if (isInteractive && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              onChange?.(value);
            }
          }}
        >
          <Star
            size={px}
            className={cn(
              value <= rating ? "fill-[#FBBF24] text-[#FBBF24]" : "fill-[#4B5563] text-[#4B5563]"
            )}
          />
        </button>
      ))}
    </div>
  );
}
