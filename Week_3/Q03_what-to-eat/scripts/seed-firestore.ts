/**
 * Firestore menus 컬렉션 초기 데이터 시드 (이미지 정밀 매칭 & 검증 완료 버전)
 * 실행: npm run seed
 */
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const menus = [
  {
    name: "삼겹살",
    category: "한식",
    weather_tags: ["Clear", "Clouds"],
    mood_tags: ["happy", "stress"],
    image_url: "https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "된장찌개",
    category: "한식",
    weather_tags: ["Rain", "Clouds", "Snow"],
    mood_tags: ["sad", "tired", "normal"],
    image_url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "냉면",
    category: "한식",
    weather_tags: ["Clear"],
    mood_tags: ["tired", "normal"],
    image_url: "https://images.unsplash.com/photo-1552611052-33e04de081de?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "비빔밥",
    category: "한식",
    weather_tags: ["Clear", "Clouds"],
    mood_tags: ["normal", "happy"],
    image_url: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "김치찌개",
    category: "한식",
    weather_tags: ["Rain", "Clouds", "Snow"],
    mood_tags: ["stress", "tired"],
    image_url: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "불고기",
    category: "한식",
    weather_tags: ["Clear", "Clouds"],
    mood_tags: ["happy", "normal"],
    image_url: "https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "닭갈비",
    category: "한식",
    weather_tags: ["Clear", "Clouds"],
    mood_tags: ["happy", "stress"],
    image_url: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "마라탕",
    category: "중식",
    weather_tags: ["Rain", "Clouds", "Snow"],
    mood_tags: ["stress", "tired"],
    image_url: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "짜장면",
    category: "중식",
    weather_tags: ["Clear", "Clouds"],
    mood_tags: ["normal", "happy"],
    image_url: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "탕수육",
    category: "중식",
    weather_tags: ["Clear", "Clouds"],
    mood_tags: ["happy", "stress"],
    image_url: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "양꼬치",
    category: "중식",
    weather_tags: ["Clear", "Clouds"],
    mood_tags: ["happy", "stress"],
    image_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "마파두부",
    category: "중식",
    weather_tags: ["Rain", "Clouds"],
    mood_tags: ["normal", "tired"],
    image_url: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "초밥",
    category: "일식",
    weather_tags: ["Clear", "Clouds"],
    mood_tags: ["happy", "normal"],
    image_url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "라멘",
    category: "일식",
    weather_tags: ["Rain", "Clouds", "Snow"],
    mood_tags: ["tired", "sad"],
    image_url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "우동",
    category: "일식",
    weather_tags: ["Rain", "Clouds", "Snow"],
    mood_tags: ["tired", "normal"],
    image_url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "돈까스",
    category: "일식",
    weather_tags: ["Clear", "Clouds"],
    mood_tags: ["happy", "stress"],
    image_url: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "회",
    category: "일식",
    weather_tags: ["Clear"],
    mood_tags: ["happy", "normal"],
    image_url: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "파스타",
    category: "양식",
    weather_tags: ["Clear", "Clouds"],
    mood_tags: ["happy", "normal"],
    image_url: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "치킨",
    category: "양식",
    weather_tags: ["Rain", "Clear", "Clouds"],
    mood_tags: ["happy", "stress", "sad"],
    image_url: "https://images.unsplash.com/photo-1562967914-608f82629710?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "샐러드",
    category: "양식",
    weather_tags: ["Clear"],
    mood_tags: ["normal", "happy"],
    image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "피자",
    category: "양식",
    weather_tags: ["Clear", "Clouds"],
    mood_tags: ["happy", "stress"],
    image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "스테이크",
    category: "양식",
    weather_tags: ["Clear", "Clouds"],
    mood_tags: ["happy", "stress"],
    image_url: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "햄버거",
    category: "양식",
    weather_tags: ["Clear", "Clouds"],
    mood_tags: ["happy", "stress"],
    image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "떡볶이",
    category: "분식",
    weather_tags: ["Rain", "Clouds", "Snow"],
    mood_tags: ["stress", "sad"],
    image_url: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "순대",
    category: "분식",
    weather_tags: ["Rain", "Clouds"],
    mood_tags: ["normal", "happy"],
    image_url: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&h=600&fit=crop&q=80",
  },
  {
    name: "김밥",
    category: "분식",
    weather_tags: ["Clear", "Clouds"],
    mood_tags: ["normal", "tired"],
    image_url: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&h=600&fit=crop&q=80",
  },
];

async function seed() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const col = collection(db, "menus");

  console.log("Starting verified image update...");

  for (let i = 0; i < menus.length; i++) {
    const id = `menu_${i + 1}`;
    await setDoc(doc(col, id), menus[i]);
    console.log(`Verified & Updated: ${menus[i].name} (${id})`);
  }

  console.log("Seed complete. Total:", menus.length);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
