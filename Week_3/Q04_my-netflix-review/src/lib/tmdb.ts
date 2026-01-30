import type { TMDBSearchResponse } from "@/types/movie";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export type { TMDBMovie } from "@/types/movie";

const GENRE_MAP: Record<number, string> = {
  28: "액션",
  12: "모험",
  16: "애니메이션",
  35: "코미디",
  80: "범죄",
  99: "다큐멘터리",
  18: "드라마",
  10751: "가족",
  14: "판타지",
  36: "역사",
  27: "공포",
  10402: "음악",
  9648: "미스터리",
  10749: "로맨스",
  878: "SF",
  10770: "TV 영화",
  53: "스릴러",
  10752: "전쟁",
  37: "서부",
};

export function getGenreNames(genreIds: number[]): string[] {
  return genreIds.map((id) => GENRE_MAP[id] ?? "").filter(Boolean);
}

export async function searchMovies(
  query: string,
  page = 1
): Promise<TMDBSearchResponse> {
  const response = await fetch(
    `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&language=ko-KR`,
    { next: { revalidate: 3600 } }
  );

  if (!response.ok) {
    throw new Error("TMDB API 요청 실패");
  }

  return response.json();
}

export async function getMovieDetails(movieId: number) {
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=ko-KR`,
    { next: { revalidate: 86400 } }
  );

  if (!response.ok) {
    throw new Error("영화 상세 정보 조회 실패");
  }

  return response.json();
}

export function getPosterUrl(
  posterPath: string | null | undefined,
  size: "w185" | "w342" | "w500" | "original" = "w342"
): string {
  if (!posterPath || !posterPath.trim()) return "/placeholder-poster.svg";
  return `${TMDB_IMAGE_BASE_URL}/${size}${posterPath}`;
}
