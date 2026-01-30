"use client";

import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RatingFilterProps {
  selectedRating: number | null;
  onChange: (rating: number | null) => void;
}

export function RatingFilter({ selectedRating, onChange }: RatingFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant={selectedRating === null ? "default" : "outline"}
        size="sm"
        onClick={() => onChange(null)}
        className={cn(
          selectedRating === null && "bg-[#E50914] hover:bg-[#F40612]"
        )}
      >
        전체
      </Button>
      {[5, 4, 3, 2, 1].map((rating) => (
        <Button
          key={rating}
          variant={selectedRating === rating ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(selectedRating === rating ? null : rating)}
          className={cn(
            "gap-1",
            selectedRating === rating && "bg-[#E50914] hover:bg-[#F40612]"
          )}
        >
          <Star className="size-3.5 fill-[#FBBF24] text-[#FBBF24]" />
          {rating}
        </Button>
      ))}
    </div>
  );
}
