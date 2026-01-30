# Firebase Setup Guide (Beginner)

A **step-by-step** guide to set up Firebase from scratch. Follow each step in order.

---

## What You Need

- A **Google account** (the one you use for Gmail)
- The **`.env.local`** file in this project’s root folder

---

## Step 1: Open Firebase Console

1. In your browser, go to:  
   **https://console.firebase.google.com**
2. **Sign in** with your Google account.
3. You should see the **Firebase Console** home screen.

---

## Step 2: Create a New Project

1. Click **“Create a project”** (or “Add project”).
2. Enter a **project name**, e.g. `today-menu` or `q3-menu`.
3. Click **“Continue”**.
4. On **Google Analytics**:
   - You can turn it on or off. For beginners, **“Don’t enable Google Analytics”** is fine.
5. Click **“Create project”**.
6. When you see “Your project is ready”, click **“Continue”**.

---

## Step 3: Create a Firestore Database

1. In the left sidebar, click **“Build”** → **“Firestore Database”**.
2. Click **“Create database”**.
3. **Security rules**:
   - Choose **“Start in test mode”**.  
     (This makes development easier. You can change rules later.)
4. Click **“Next”**.
5. **Location**:
   - Pick a region, e.g. **“asia-northeast3 (Seoul)”** or one near you.
6. Click **“Enable”**.
7. When you see the Firestore “Data” tab, the database is ready.

---

## Step 4: Add a Web App (Get Your Config)

1. Go back to **Project overview**:  
   Click the **project name** next to the home icon, or **“Project overview”** in the left menu.
2. In the project overview, click the **`</>`** (web) icon to **“Add Firebase to your web app”**.
3. Enter an **app nickname**, e.g. `today-menu-web`.
4. You can **leave “Firebase Hosting” unchecked** for now.
5. Click **“Register app”**.
6. You’ll see **“Add Firebase SDK”** with a code snippet.  
   It looks like this:

   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

7. **Keep this page open** — you’ll copy these values in the next step.

---

## Step 5: Put the Values in `.env.local`

1. Open your project folder (e.g. `c:\Users\user\Downloads\q3`).
2. Open the **`.env.local`** file in a text editor (Notepad, VS Code, Cursor, etc.).
3. Copy each value from Firebase into `.env.local` **exactly** as in this table:

   **Rules:**
   - **No quotes** around the values in `.env.local`.
   - **No spaces** after the `=` sign.
   - Replace any existing placeholder values.

   | Line in `.env.local` | Copy from Firebase config |
   |----------------------|---------------------------|
   | `NEXT_PUBLIC_FIREBASE_API_KEY=` | The value inside `apiKey: "..."` (without the quotes) |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=` | The value inside `authDomain: "..."` |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID=` | The value inside `projectId: "..."` |
   | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=` | The value inside `storageBucket: "..."` |
   | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=` | The value inside `messagingSenderId: "..."` |
   | `NEXT_PUBLIC_FIREBASE_APP_ID=` | The value inside `appId: "..."` |

4. **Example** (replace with your real values from Firebase):

   ```env
   # Firebase - paste the values from Firebase Console
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

   # OpenWeatherMap - your API key
   OPENWEATHER_API_KEY=your_openweathermap_api_key_here
   ```

5. **Save** the file.

---

## Step 6: Add Menu Data (Run the Seed Script)

The app needs menu data in Firestore. The project includes a **seed script** that adds 10 sample menus.

1. Open a **terminal** (Cursor/VS Code terminal, or Command Prompt/PowerShell).
2. Go to the project folder:
   ```bash
   cd c:\Users\user\Downloads\q3
   ```
3. Run:
   ```bash
   npm run seed
   ```
4. If it works, you’ll see something like:
   ```
   Added: 마라탕 (menu_1)
   Added: 삼겹살 (menu_2)
   ...
   Seed complete. Total: 10
   ```

**If you get an error:**

- **“NEXT_PUBLIC_FIREBASE_...”** or env-related → Double-check Step 5: all 6 Firebase values and `OPENWEATHER_API_KEY` in `.env.local`, then save and run `npm run seed` again.
- **“Permission denied”** / **“permission-denied”** → In Firebase Console → Firestore → Rules, make sure the database was created in **test mode** (Step 3). If not, switch to test mode and try again.

---

## Step 7: Test the App

1. Start the dev server:
   ```bash
   npm run dev
   ```
2. Open **http://localhost:3000** in your browser.
3. Select a mood, then click **“오늘 뭐 먹지? 추천받기”** (Get recommendation).
4. If a menu and reason appear, **Firebase is set up correctly**.

---

## Quick Checklist

- [ ] Signed in at console.firebase.google.com
- [ ] Created a new project
- [ ] Created Firestore database (test mode, choose a region)
- [ ] Added a web app and saw `firebaseConfig`
- [ ] Pasted all 6 Firebase values + OpenWeatherMap key into `.env.local` and saved
- [ ] Ran `npm run seed` successfully
- [ ] Ran `npm run dev` and got a recommendation on the page

---

## FAQ

**Where can I see my Firebase config again?**  
Firebase Console → Project overview → **Project settings** (gear icon) → **General** tab → under “Your apps”, click your web app. The `firebaseConfig` snippet is there.

**Is test mode safe?**  
Test mode allows read/write for a limited time. It’s fine for local development. Before going live, you must update Firestore security rules.

**Can I run the seed script more than once?**  
Yes. It overwrites the same documents, so you won’t get duplicate menus.

If you get stuck, say **which step number** you’re on and what you see (or the error message), and we can narrow it down.
