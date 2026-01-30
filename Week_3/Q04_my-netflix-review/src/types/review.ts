export interface ReviewData {
  id: string;
  movieId: string;
  title: string;
  originalTitle: string;
  posterPath: string;
  description: string;
  releaseDate: string;
  genres: string[];
  userReview: string;
  rating: number;
  watchedAt: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReviewInput {
  movieId: string;
  title: string;
  originalTitle?: string;
  posterPath?: string;
  description?: string;
  releaseDate?: string;
  genres?: string[];
  userReview: string;
  rating: number;
  watchedAt: string;
}

export interface UpdateReviewInput {
  userReview?: string;
  rating?: number;
  watchedAt?: string;
}
