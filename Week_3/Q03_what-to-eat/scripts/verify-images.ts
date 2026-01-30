/**
 * 이미지 URL 유효성 검증 스크립트
 * 실행: npx tsx scripts/verify-images.ts
 */

const menus = [
  { name: "삼겹살", url: "https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=800&h=600&fit=crop&q=80" },
  { name: "된장찌개", url: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop&q=80" },
  { name: "냉면", url: "https://images.unsplash.com/photo-1552611052-33e04de081de?w=800&h=600&fit=crop&q=80" },
  { name: "비빔밥", url: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&h=600&fit=crop&q=80" },
  { name: "김치찌개", url: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&h=600&fit=crop&q=80" },
  { name: "불고기", url: "https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?w=800&h=600&fit=crop&q=80" },
  { name: "닭갈비", url: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop&q=80" },
  { name: "마라탕", url: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&h=600&fit=crop&q=80" },
  { name: "짜장면", url: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&h=600&fit=crop&q=80" },
  { name: "탕수육", url: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop&q=80" },
  { name: "양꼬치", url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=600&fit=crop&q=80" },
  { name: "마파두부", url: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=800&h=600&fit=crop&q=80" },
  { name: "초밥", url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&h=600&fit=crop&q=80" },
  { name: "라멘", url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop&q=80" },
  { name: "우동", url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop&q=80" },
  { name: "돈까스", url: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&h=600&fit=crop&q=80" },
  { name: "회", url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&h=600&fit=crop&q=80" },
  { name: "파스타", url: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=800&h=600&fit=crop&q=80" },
  { name: "치킨", url: "https://images.unsplash.com/photo-1562967914-608f82629710?w=800&h=600&fit=crop&q=80" },
  { name: "샐러드", url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop&q=80" },
  { name: "피자", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop&q=80" },
  { name: "스테이크", url: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&h=600&fit=crop&q=80" },
  { name: "햄버거", url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop&q=80" },
  { name: "떡볶이", url: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&h=600&fit=crop&q=80" },
  { name: "순대", url: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&h=600&fit=crop&q=80" },
  { name: "회", url: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&h=600&fit=crop&q=80" },
  { name: "김밥", url: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&h=600&fit=crop&q=80" },
];

async function verify() {
  console.log("Verifying 26 image URLs (GET mode)...");
  let failCount = 0;

  for (const menu of menus) {
    try {
      const res = await fetch(menu.url, { method: "GET" });
      const contentType = res.headers.get("content-type");
      if (res.status === 200 && contentType?.startsWith("image/")) {
        console.log(`✅ [200] ${menu.name} (${contentType})`);
      } else {
        console.error(`❌ [${res.status}] ${menu.name}: ${menu.url} (Type: ${contentType})`);
        failCount++;
      }
    } catch (e) {
      console.error(`❌ [ERROR] ${menu.name}: ${String(e)}`);
      failCount++;
    }
  }

  if (failCount === 0) {
    console.log("\n✨ All images are valid (200 OK)!");
  } else {
    console.log(`\n⚠️ Total ${failCount} images failed.`);
  }
}

verify();
