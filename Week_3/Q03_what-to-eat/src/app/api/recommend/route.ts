import { NextRequest, NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Menu, WeatherTag, MoodTag } from "@/types";
import {
  filterTopScoreMenus,
  selectRandomMenu,
  generateReason,
  calculateScore,
} from "@/lib/recommendation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const weather = (searchParams.get("weather") ?? "Clear") as WeatherTag;
  const mood = (searchParams.get("mood") ?? "normal") as MoodTag;

  try {
    // Firebase 연결 확인
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      console.error("Firebase config missing:", {
        hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      });
      return NextResponse.json(
        { error: "Firebase configuration missing. Check environment variables." },
        { status: 500 }
      );
    }

    console.log("Fetching menus from Firestore...");
    console.log("Firebase config:", {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.substring(0, 10) + "...",
      hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    });
    
    const snapshot = await getDocs(collection(db, "menus"));
    console.log("Snapshot size:", snapshot.size);
    console.log("Snapshot empty:", snapshot.empty);
    
    const menus: Menu[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      weather_tags: doc.data().weather_tags ?? [],
      mood_tags: doc.data().mood_tags ?? [],
    })) as Menu[];

    if (menus.length === 0) {
      console.error("No menus found in database");
      return NextResponse.json(
        { 
          error: "No menus in database. Please check Firebase security rules and ensure seed script was run.",
          hint: "Firebase security rules should allow read access to /menus collection"
        },
        { status: 503 }
      );
    }

    const scoredMenus = menus.map((menu) => {
      const weather_match = menu.weather_tags.includes(weather);
      const mood_match = menu.mood_tags.includes(mood);
      const score = calculateScore(menu, weather, mood);
      const reason = generateReason(menu, weather, mood);
      return { menu, reason, score, weather_match, mood_match };
    });

    // Sort by score descending and take top 3
    const top3 = scoredMenus
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return NextResponse.json({
      items: top3,
    });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error("Firebase error:", errorMessage);
    
    // Firebase 권한 에러인지 확인
    if (errorMessage.includes("permission") || errorMessage.includes("PERMISSION_DENIED")) {
      return NextResponse.json(
        { 
          error: "Firebase permission denied. Please check Firestore security rules.",
          details: "Security rules should allow read access: allow read: if true;",
          hint: "Update rules at Firebase Console → Firestore Database → Rules"
        },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Recommendation failed", 
        details: errorMessage,
        hint: "Check Vercel logs for more details"
      },
      { status: 500 }
    );
  }
}
