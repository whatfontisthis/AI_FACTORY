# External Services Setup Guide

This guide will help you set up the external services required for CineLog.

---

## Table of Contents
1. [TMDB API Setup](#1-tmdb-api-setup)
2. [MongoDB Atlas Setup](#2-mongodb-atlas-setup)

---

## 1. TMDB API Setup

### What is TMDB?
TMDB (The Movie Database) is a free API that provides movie information, posters, and metadata. CineLog uses this API to search for movies and get movie details.

### Step-by-Step Guide

#### Step 1: Create a TMDB Account
1. Open your web browser
2. Go to: https://www.themoviedb.org
3. Click the **"Join"** button in the top right corner
4. Fill in the registration form:
   - **Username**: Choose a username
   - **Email**: Enter your email address
   - **Password**: Create a password
   - **Location**: Select your country
5. Click **"Sign Up"**
6. Check your email inbox for a verification email from TMDB
7. Click the verification link in the email
8. Sign in to TMDB with your new account

#### Step 2: Request an API Key
1. After signing in, click your **profile icon** (avatar) in the top right corner
2. Select **"Settings"** from the dropdown menu
3. In the left sidebar, click on **"API"**
4. Click the **"Apply"** button (or "Request an API Key" link)

#### Step 3: Fill in the API Key Application Form
You'll see a form with several fields. Fill them in as follows:

1. **API Key Type**: Select **"Developer"**
   - This is for personal/non-commercial use (free)

2. **Click the blue "Apply" button** under Developer type

3. **Fill in the required information**:
   - **Your Name**: Enter your full name
   - **Email Address**: Should be pre-filled with your account email
   - **Company Name (Optional)**: You can leave this blank or enter "Personal"
   - **Company Site (Optional)**: You can leave this blank
   - **Usage Type**: Select **"Personal / Non-Commercial"**
   - **App Name**: Enter **"CineLog"** (or any name you prefer)
   - **App URL**: Enter **"http://localhost:3000"** (for local development)
   - **App Description**: Enter a brief description, for example:
     ```
     A personal movie review archive application for tracking movies I've watched.
     ```

4. **Read the Terms of Use** and check the checkbox: **"I have read and agree to the API Terms of Use"**

5. **Click the "Submit" button**

#### Step 4: Copy Your API Key
1. After submitting, you should see a confirmation page
2. Your API Key will be displayed on this page
3. **Copy the API Key** - it will look something like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
4. **IMPORTANT**: Save this key somewhere safe! You'll need it for the next steps.

> **Note**: It may take a few minutes for your API key to become active. If you try to use it immediately and get an error, wait 5-10 minutes and try again.

#### Step 5: Verify Your API Key (Optional)
To make sure your API key works:
1. Open a new browser tab
2. Paste this URL into your browser, replacing `YOUR_API_KEY` with your actual key:
   ```
   https://api.themoviedb.org/3/movie/550?api_key=YOUR_API_KEY
   ```
3. If you see a JSON response with movie information (Fight Club), your API key is working!

---

## 2. MongoDB Atlas Setup

### What is MongoDB Atlas?
MongoDB Atlas is a cloud-hosted MongoDB database service. The free tier (M0 Sandbox) is perfect for personal projects like CineLog.

### Step-by-Step Guide

#### Step 1: Create a MongoDB Atlas Account
1. Open your web browser
2. Go to: https://www.mongodb.com/cloud/atlas
3. Click the **"Try Free"** button (or "Start Free")
4. You'll see two options:
   - **"Continue with Google"** (if you have a Google account)
   - **"Sign up with email"**
5. Choose your preferred sign-up method and complete the registration

#### Step 2: Create a Free Cluster
1. After signing in, you'll be taken to the **"Deploy a database"** page
2. Under **"Deployment"**, make sure **"MongoDB"** is selected
3. Click the **"Create"** button

4. **Select the free tier**:
   - Choose **"M0 Sandbox"** (this is the FREE tier)
   - You'll see it includes **512 MB storage**
   - Click **"Create"**

5. **Choose your cloud provider** (you can use defaults):
   - **Cloud Provider**: AWS (recommended, but Google or Azure work too)
   - **Region**: Choose a region close to you (e.g., "Seoul" if in Korea)
   - Click **"Create Cluster"**

6. **Wait for cluster creation**:
   - This will take 2-5 minutes
   - You'll see a "Creating your cluster" message
   - Wait until you see "Your cluster is ready"

#### Step 3: Create a Database User
1. In the left sidebar, under **"Security"**, click **"Database Access"**
2. Click the green **"Add New Database User"** button
3. Fill in the user information:
   - **Authentication Method**: Select **"Password"**
   - **Username**: Enter a username (e.g., `cinelog_admin`)
   - **Password**: Create a strong password
     - **IMPORTANT**: Save this password! You'll need it for the connection string
   - **Database User Privileges**: Keep the default **"Read and write to any database"**
4. Click the **"Add User"** button

#### Step 4: Allow Network Access
1. In the left sidebar, under **"Security"**, click **"Network Access"**
2. Click the green **"Add IP Address"** button
3. You have two options:

   **Option A: Allow All IPs (Easier for Development)**
   - Click the **"Allow Access from Anywhere"** button
   - This will add `0.0.0.0/0` (allows any IP address)
   - Click **"Confirm"**

   **Option B: Add Your Specific IP (More Secure)**
   - Your current IP should be auto-detected
   - Click **"Add Your Current IP Address"**
   - Click **"Confirm"**

   > **For local development, Option A is recommended** to avoid connection issues.

4. You should see your IP address in the list

#### Step 5: Get Your Connection String
1. In the left sidebar, click **"Database"**
2. Find your cluster (it's named something like "Cluster0")
3. Click the **"Connect"** button on your cluster
4. A connection dialog will appear. Select **"Drivers"** tab
5. Under **"Select your driver"**:
   - **Driver**: Node.js
   - **Version**: 6.0 or later (should be default)
6. Copy the **connection string** - it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. **Save this connection string** - you'll need to modify it

#### Step 6: Modify Your Connection String
The connection string you copied has placeholders that need to be replaced:

**Original:**
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**Replace the placeholders:**
1. `<username>` → Replace with your database username (e.g., `cinelog_admin`)
2. `<password>` → Replace with your database password (the one you created in Step 3)

**Example after replacement:**
```
mongodb+srv://cinelog_admin:MySecurePassword123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**Add the database name:**
Add `/cinelog` before `?retryWrites`:
```
mongodb+srv://cinelog_admin:MySecurePassword123@cluster0.xxxxx.mongodb.net/cinelog?retryWrites=true&w=majority
```

> **IMPORTANT**: This is your **MONGODB_URI**. Keep it secure and never share it publicly!

#### Step 7: Verify Your Connection (Optional)
To test if your connection string works:
1. In MongoDB Atlas, click **"Connect"** on your cluster
2. Select **"MongoDB Compass"** tab
3. Download MongoDB Compass (if you don't have it)
4. Paste your modified connection string
5. Click **"Connect"**
6. If connection is successful, you'll see your databases (initially empty)

---

## Summary: What You Need for CineLog

After completing both guides, you should have:

### 1. TMDB API Key
A string that looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

### 2. MongoDB Connection String (MONGODB_URI)
A string that looks like:
```
mongodb+srv://cinelog_admin:YourPassword@cluster0.xxxxx.mongodb.net/cinelog?retryWrites=true&w=majority
```

---

## Next Steps

Now that you have both credentials, you need to add them to your CineLog project:

1. Create a file named `.env.local` in your project root
2. Add the following lines:
   ```env
   TMDB_API_KEY=your_tmdb_api_key_here
   MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/cinelog?retryWrites=true&w=majority
   ```
3. Replace the placeholders with your actual values

---

## Troubleshooting

### TMDB Issues
**Problem**: API key returns "Invalid API key"
- **Solution**: Wait 5-10 minutes after applying for the key

**Problem**: API returns "404 Not Found"
- **Solution**: Make sure you're using the correct API endpoint: `https://api.themoviedb.org/3`

### MongoDB Issues
**Problem**: "Connection timeout"
- **Solution**: Check your Network Access settings and make sure your IP is allowed

**Problem**: "Authentication failed"
- **Solution**: Double-check your username and password in the connection string

**Problem**: Special characters in password cause issues
- **Solution**: URL-encode special characters:
  - `@` → `%40`
  - `:` → `%3A`
  - `/` → `%2F`
  - `?` → `%3F`
  - `#` → `%23`
  - `[` → `%5B`
  - `]` → `%5D`

  Example: If password is `pass@word`, use `pass%40word` in the connection string

---

## Need Help?

If you encounter issues not covered here:
- TMDB Support: https://www.themoviedb.org/talk
- MongoDB Support: https://www.mongodb.com/docs/atlas/support/

---

> **Last Updated**: 2026-01-29
