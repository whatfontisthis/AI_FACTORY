import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/firebase";
import { ReviewData, CreateReviewInput } from "@/types/review";

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rating = searchParams.get("rating");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build query
    let query = db.collection(REVIEWS_COLLECTION) as FirebaseFirestore.Query;

    // Apply filters
    if (rating) {
      query = query.where("rating", "==", parseInt(rating));
    }
    if (search) {
      // Note: Firestore doesn't support native text search
      // We'll filter client-side or use a search service
      query = query.where("title", ">=", search).where("title", "<=", search + "\uf8ff");
    }

    // Get all documents (Firestore doesn't have native skip/limit for pagination)
    const snapshot = await query.get();

    // Convert to array and apply sorting and pagination
    let reviews = snapshot.docs.map((doc) =>
      convertToReviewData(doc.id, doc.data())
    );

    // Sort
    reviews.sort((a, b) => {
      const aValue = a[sort as keyof ReviewData];
      const bValue = b[sort as keyof ReviewData];

      if (aValue instanceof Date && bValue instanceof Date) {
        return order === "asc"
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return order === "asc" ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return order === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

    const total = reviews.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedReviews = reviews.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      reviews: paginatedReviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch reviews", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (
      !body.movieId ||
      !body.title ||
      !body.userReview ||
      body.rating == null ||
      !body.watchedAt
    ) {
      return NextResponse.json(
        { error: "필수 항목을 모두 입력해주세요." },
        { status: 400 }
      );
    }

    // Validate rating range
    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: "별점은 1~5 사이여야 합니다." },
        { status: 400 }
      );
    }

    // Create review data
    const reviewData: CreateReviewInput = {
      movieId: body.movieId,
      title: body.title,
      originalTitle: body.originalTitle || "",
      posterPath: body.posterPath || "",
      description: body.description || "",
      releaseDate: body.releaseDate || "",
      genres: body.genres || [],
      userReview: body.userReview,
      rating: body.rating,
      watchedAt: new Date(body.watchedAt).toISOString(),
    };

    // Add timestamps
    const now = new Date();
    const docData = {
      ...reviewData,
      createdAt: now,
      updatedAt: now,
    };

    // Save to Firestore
    const docRef = await db.collection(REVIEWS_COLLECTION).add(docData);

    // Get the created document
    const docSnap = await docRef.get();
    const review = convertToReviewData(docRef.id, docSnap.data()!);

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
