"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MovieCard } from "./MovieCard";
import type { TMDBMovie } from "@/types/movie";
import { cn } from "@/lib/utils";

interface MovieSearchProps {
  onSelect: (movie: TMDBMovie) => void;
}

export function MovieSearch({ onSelect }: MovieSearchProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setOpen(true);
    fetch(
      `/api/movies/search?query=${encodeURIComponent(debouncedQuery)}`
    )
      .then((res) => res.json())
      .then((data: { results?: TMDBMovie[] }) => {
        if (!cancelled && data.results) setResults(data.results.slice(0, 8));
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const handleSelect = useCallback(
    (movie: TMDBMovie) => {
      onSelect(movie);
      setQuery("");
      setResults([]);
      setOpen(false);
    },
    [onSelect]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#6B6B6B]" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="영화 제목 검색..."
          className="pl-9 bg-[#1F1F1F] border-[#333333]"
        />
      </div>
      {open && (
        <div
          className={cn(
            "absolute top-full left-0 right-0 mt-1 max-h-80 overflow-auto rounded-lg border border-[#333333] bg-[#1F1F1F] shadow-xl z-50"
          )}
        >
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-8 animate-spin text-[#6B6B6B]" />
            </div>
          ) : results.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#6B6B6B]">
              {debouncedQuery ? "검색 결과가 없습니다." : "제목을 입력하세요."}
            </p>
          ) : (
            <ul className="py-1">
              {results.map((movie) => (
                <li key={movie.id}>
                  <MovieCard
                    movie={movie}
                    onClick={() => handleSelect(movie)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
