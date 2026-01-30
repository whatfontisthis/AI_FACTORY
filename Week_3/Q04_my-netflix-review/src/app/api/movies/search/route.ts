import { NextRequest, NextResponse } from "next/server";
import { searchMovies } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");
  const page = parseInt(searchParams.get("page") || "1");

  if (!query) {
    return NextResponse.json(
      { error: "검색어를 입력해주세요." },
      { status: 400 }
    );
  }

  try {
    const data = await searchMovies(query, page);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "영화 검색에 실패했습니다." },
      { status: 500 }
    );
  }
}
