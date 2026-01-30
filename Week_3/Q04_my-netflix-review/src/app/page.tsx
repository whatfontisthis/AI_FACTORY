"use client";

import { useCallback, useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { TopRanking } from "@/components/dashboard/TopRanking";
import { SearchBar } from "@/components/filter/SearchBar";
import { RatingFilter } from "@/components/filter/RatingFilter";
import { ReviewGrid } from "@/components/review/ReviewGrid";
import { ReviewModal } from "@/components/review/ReviewModal";
import { ReviewForm } from "@/components/review/ReviewForm";
import type { ReviewData } from "@/types/review";
import { toast } from "sonner";

export default function Home() {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [topReviews, setTopReviews] = useState<ReviewData[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewData | null>(null);
  const [editingReview, setEditingReview] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    const params = new URLSearchParams();
    if (selectedRating != null) params.set("rating", String(selectedRating));
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    params.set("sort", "watchedAt");
    params.set("order", "desc");
    try {
      const res = await fetch(`/api/reviews?${params.toString()}`);
      if (!res.ok) throw new Error("리뷰 목록을 불러오지 못했습니다.");
      const data = await res.json();
      setReviews(data.reviews ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [selectedRating, searchQuery]);

  const fetchTopRanking = useCallback(async () => {
    try {
      const res = await fetch(
        "/api/reviews?sort=rating&order=desc&limit=20"
      );
      if (!res.ok) return;
      const data = await res.json();
      setTopReviews(data.reviews ?? []);
    } catch {
      setTopReviews([]);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    fetchTopRanking();
  }, [fetchTopRanking]);

  const handleNewReview = () => {
    setEditingReview(null);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    fetchReviews();
    fetchTopRanking();
  };

  const handleCardClick = (review: ReviewData) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const handleModalEdit = () => {
    if (!selectedReview) return;
    setIsModalOpen(false);
    setEditingReview(selectedReview);
    setIsFormOpen(true);
  };

  const handleModalDelete = async () => {
    if (!selectedReview) return;
    if (!confirm("이 리뷰를 삭제할까요?")) return;
    try {
      const res = await fetch(`/api/reviews/${selectedReview.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("삭제에 실패했습니다.");
      toast.success("리뷰가 삭제되었습니다.");
      setIsModalOpen(false);
      setSelectedReview(null);
      fetchReviews();
      fetchTopRanking();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingReview(null);
  };

  return (
    <div className="min-h-screen bg-[#141414]">
      <Header onNewReview={handleNewReview} />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <section className="mb-8">
          <TopRanking reviews={topReviews} />
        </section>
        <section className="mb-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div className="flex-1 min-w-0">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          <RatingFilter
            selectedRating={selectedRating}
            onChange={setSelectedRating}
          />
        </section>
        <section>
          {loading ? (
            <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] rounded-lg bg-[#1F1F1F] animate-pulse"
                />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16 text-[#6B6B6B]">
              <p className="text-lg">등록된 리뷰가 없습니다.</p>
              <p className="text-sm mt-2">
                &quot;새 리뷰 작성&quot;으로 첫 리뷰를 남겨보세요.
              </p>
            </div>
          ) : (
            <ReviewGrid reviews={reviews} onCardClick={handleCardClick} />
          )}
        </section>
      </main>

      <ReviewModal
        review={selectedReview}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedReview(null);
        }}
        onEdit={handleModalEdit}
        onDelete={handleModalDelete}
      />

      <ReviewForm
        review={editingReview}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSuccess}
      />
    </div>
  );
}
