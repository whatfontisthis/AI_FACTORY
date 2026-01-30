import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/firebase";
import { ReviewData } from "@/types/review";

const REVIEWS_COLLECTION = "reviews";

// Helper function to convert Firestore document to ReviewData
function convertToReviewData(
  id: string,
  data: FirebaseFirestore.DocumentData
): ReviewData {
  // Convert Firestore Timestamp to ISO string for watchedAt
  const watchedAt = data.watchedAt?.toDate
    ? data.watchedAt.toDate().toISOString()
    : data.watchedAt;

  return {
    id,
    movieId: data.movieId,
    title: data.title,
    originalTitle: data.originalTitle || "",
    posterPath: data.posterPath || "",
    description: data.description || "",
    releaseDate: data.releaseDate || "",
    genres: data.genres || [],
    userReview: data.userReview,
    rating: data.rating,
    watchedAt,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const docRef = db.collection(REVIEWS_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { error: "리뷰를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const review = convertToReviewData(id, docSnap.data()!);
    return NextResponse.json({ review });
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { error: "Failed to fetch review" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const docRef = db.collection(REVIEWS_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { error: "리뷰를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // Update with new data and timestamp
    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    await docRef.update(updateData);

    // Get updated document
    const updatedDocSnap = await docRef.get();
    const review = convertToReviewData(id, updatedDocSnap.data()!);

    return NextResponse.json({ review });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const docRef = db.collection(REVIEWS_COLLECTION).doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { error: "리뷰를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    await docRef.delete();

    return NextResponse.json({ message: "리뷰가 삭제되었습니다." });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
