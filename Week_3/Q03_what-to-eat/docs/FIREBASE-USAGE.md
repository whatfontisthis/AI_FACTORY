# What Firebase is Used For in This Project

Firebase **Firestore** (the database part of Firebase) is used as a **simple database** to store menu information.

---

## In Simple Terms

Think of Firebase Firestore as a **cloud storage box** where we keep all the menu data:
- Menu names (마라탕, 삼겹살, 초밥, etc.)
- Categories (한식, 중식, 일식, etc.)
- Weather tags (which weather matches each menu)
- Mood tags (which mood matches each menu)
- Image URLs

---

## How It Works in This App

### 1. **Storing Menu Data** (One-time setup)
When you ran `npm run seed`, it saved 10 menu items into Firebase Firestore:
```
Firestore Database
└── menus (collection)
    ├── menu_1: { name: "마라탕", category: "중식", weather_tags: [...], ... }
    ├── menu_2: { name: "삼겹살", category: "한식", weather_tags: [...], ... }
    ├── menu_3: { name: "초밥", category: "일식", weather_tags: [...], ... }
    └── ... (10 menus total)
```

### 2. **Fetching Menus** (Every time you click "추천받기")
When you click the recommendation button:
1. The app calls `/api/recommend`
2. The API **reads all menus** from Firebase Firestore
3. It calculates scores based on weather + mood
4. It picks the best match and returns it

**Code location:** `src/app/api/recommend/route.ts` line 18:
```typescript
const snapshot = await getDocs(collection(db, "menus"));
// ↑ This reads all menus from Firebase
```

---

## Why Use Firebase Instead of a File?

| Option | Why Not Used | Why Firebase Instead |
|--------|--------------|----------------------|
| **Hardcoded array in code** | Hard to update, requires redeploy | Easy to update via Firebase Console |
| **JSON file** | No real-time updates, needs server restart | Can update menus without restarting |
| **Traditional SQL database** | Overkill for 10 menus, needs server setup | Simple NoSQL, no server needed |
| **Firebase Firestore** | ✅ **Perfect for this project** | Free tier, easy setup, cloud-hosted |

---

## What You Can Do With Firebase Console

You can **manually add/edit menus** without touching code:

1. Go to Firebase Console → Firestore Database
2. Click on the `menus` collection
3. Add a new document or edit existing ones
4. The app will automatically use the new data

**Example:** Want to add "피자"?
- Add a new document in Firebase Console
- Set `name: "피자"`, `category: "양식"`, `weather_tags: ["Clear"]`, etc.
- Next time you click "추천받기", 피자 might appear!

---

## Summary

**Firebase Firestore = Menu Database**

- **Stores:** 10 menu items with their tags
- **Reads:** Every time you get a recommendation
- **Updates:** Via Firebase Console (no code changes needed)
- **Why:** Simple, free, cloud-hosted, no server setup required

That's it! Firebase is just the database holding your menu data. 🍽️
