"use client";

import { Button } from "@/components/ui/button";
import { Film } from "lucide-react";

interface HeaderProps {
  onNewReview: () => void;
}

export function Header({ onNewReview }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#333333] bg-[#141414]/95 backdrop-blur">
      <div className="container mx-auto max-w-7xl flex h-14 items-center justify-between px-4">
        <a href="/" className="flex items-center gap-2 font-bold text-xl text-[#FFFFFF]">
          <Film className="size-7 text-[#E50914]" />
          씨네마로그
        </a>
        <Button
          onClick={onNewReview}
          className="bg-[#E50914] hover:bg-[#F40612] text-white"
        >
          새 리뷰 작성
        </Button>
      </div>
    </header>
  );
}
