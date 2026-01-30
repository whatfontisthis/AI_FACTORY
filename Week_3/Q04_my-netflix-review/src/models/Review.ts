import mongoose, { Schema, Document, models } from "mongoose";

export interface IReview extends Document {
  movieId: string;
  title: string;
  originalTitle: string;
  posterPath: string;
  description: string;
  releaseDate: string;
  genres: string[];
  userReview: string;
  rating: number;
  watchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    movieId: { type: String, required: true },
    title: { type: String, required: true },
    originalTitle: { type: String, default: "" },
    posterPath: { type: String, default: "" },
    description: { type: String, default: "" },
    releaseDate: { type: String, default: "" },
    genres: [{ type: String }],
    userReview: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    watchedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

ReviewSchema.index({ rating: -1 });
ReviewSchema.index({ title: "text" });
ReviewSchema.index({ watchedAt: -1 });

export default models.Review || mongoose.model<IReview>("Review", ReviewSchema);
