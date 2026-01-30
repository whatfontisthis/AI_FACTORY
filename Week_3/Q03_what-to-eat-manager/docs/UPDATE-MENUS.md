# Menu Update Guide

## What Changed

✅ **Increased menus**: From **10** to **24** menus  
✅ **Real images**: Replaced relative paths (`/images/...`) with **Unsplash image URLs**

---

## New Menus Added

### 한식 (Korean) - 7 menus
- 삼겹살, 된장찌개, 냉면, 비빔밥, 김치찌개, 불고기, 닭갈비

### 중식 (Chinese) - 5 menus  
- 마라탕, 짜장면, 탕수육, 양꼬치, 마파두부

### 일식 (Japanese) - 5 menus
- 초밥, 라멘, 우동, 돈까스, 회

### 양식 (Western) - 6 menus
- 파스타, 치킨, 샐러드, 피자, 스테이크, 햄버거

### 분식 (Snacks) - 3 menus
- 떡볶이, 순대, 김밥

**Total: 24 menus** (previously 10)

---

## Image URLs

All menus now use **Unsplash image URLs** instead of local paths:
- ✅ High-quality food photos
- ✅ No need to download/store images locally
- ✅ Images load directly from Unsplash CDN

Example:
```javascript
// Before:
image_url: "/images/malatang.jpg"

// After:
image_url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop&q=80"
```

---

## How to Update Firebase

### Option 1: Run Seed Script Again (Recommended)

The seed script will **overwrite** existing menus with the new data:

```bash
npm run seed
```

This will:
- Replace all 10 old menus with 24 new menus
- Update image URLs to Unsplash links
- Keep the same document IDs (`menu_1`, `menu_2`, etc.) for the first 10, then add new ones

### Option 2: Delete Old Data First

If you want a clean start:

1. Go to Firebase Console → Firestore Database
2. Click on the `menus` collection
3. Delete all existing documents (or the entire collection)
4. Run `npm run seed` to add fresh data

---

## Next.js Configuration

Updated `next.config.ts` to allow Unsplash images:

```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "images.unsplash.com",
      pathname: "/**",
    },
  ],
}
```

This tells Next.js Image component that it's safe to load images from Unsplash.

---

## Testing

After updating:

1. **Restart dev server** (if running):
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Clear browser cache** (optional):
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

3. **Test the app**:
   - Go to http://localhost:3000
   - Click "추천받기" multiple times
   - You should see different menus with actual food images

---

## Notes

- **Unsplash images are free** to use under Unsplash License
- Images are loaded on-demand (not stored in your project)
- If an image fails to load, the app shows a fallback with the menu name
- You can always replace Unsplash URLs with your own image URLs later

---

## Customizing Images

If you want to use your own images:

1. Upload images to a hosting service (Firebase Storage, Cloudinary, etc.)
2. Get the public URL
3. Update `scripts/seed-firestore.ts` with your URLs
4. Run `npm run seed` again

Or manually update in Firebase Console:
- Firebase Console → Firestore → `menus` collection
- Click on a menu document
- Edit the `image_url` field
- Save
