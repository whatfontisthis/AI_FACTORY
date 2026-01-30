# CineLog Deployment Guide

This guide will help you deploy your CineLog application to Vercel.

---

## Prerequisites

Before deploying, make sure you have:

1. **TMDB API Key** - Follow [SETUP_EXTERNAL_SERVICES.md](./SETUP_EXTERNAL_SERVICES.md) Section 1
2. **MongoDB Atlas Connection String** - Follow [SETUP_EXTERNAL_SERVICES.md](./SETUP_EXTERNAL_SERVICES.md) Section 2
3. **GitHub Account** - For Vercel deployment

---

## Step 1: Prepare Your Local Project

### 1.1 Configure Environment Variables

1. Create a `.env.local` file in your project root:
   ```bash
   # In the cinelog directory
   touch .env.local
   ```

2. Add your credentials:
   ```env
   TMDB_API_KEY=your_actual_tmdb_api_key_here
   MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/cinelog?retryWrites=true&w=majority
   ```

3. **Important**: Replace the placeholder values with your actual credentials.

### 1.2 Test Locally (Optional but Recommended)

Before deploying, test the application locally:

```bash
# In the cinelog directory
npm run dev
```

1. Open http://localhost:3000
2. Test the following:
   - [ ] Search for a movie
   - [ ] Create a new review
   - [ ] View review details
   - [ ] Edit a review
   - [ ] Delete a review
   - [ ] Filter by rating
   - [ ] Search reviews

3. Press `Ctrl+C` to stop the dev server when done.

---

## Step 2: Build for Production

Test the production build locally:

```bash
npm run build
npm start
```

- Visit http://localhost:3000
- Verify everything works correctly
- Press `Ctrl+C` to stop the server

> **Note**: If the build fails, check for errors and fix them before proceeding.

---

## Step 3: Push to GitHub

### 3.1 Create a GitHub Repository

1. Go to https://github.com
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Fill in the repository details:
   - **Repository name**: `cinelog` (or any name you prefer)
   - **Description**: Personal movie review archive
   - **Visibility**: **Private** (recommended for personal data)
5. **Do NOT** initialize with README (we already have one)
6. Click **"Create repository"**

### 3.2 Push Your Code

Open your terminal in the `cinelog` directory:

```bash
# Check if git is initialized
git status

# If not initialized, initialize git
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: CineLog movie review app"

# Rename branch to main (if needed)
git branch -M main

# Add GitHub remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/cinelog.git

# Push to GitHub
git push -u origin main
```

**Example** (if your GitHub username is `john123`):
```bash
git remote add origin https://github.com/john123/cinelog.git
git push -u origin main
```

---

## Step 4: Deploy to Vercel

### Option A: Deploy via Vercel Website (Recommended for Beginners)

1. Go to https://vercel.com
2. Click **"Sign Up"** or **"Log In"**
3. **Sign up with GitHub** (recommended)
4. Authorize Vercel to access your GitHub account
5. After logging in, click **"Add New..."** → **"Project"**
6. Import your `cinelog` repository from GitHub
7. Configure the project:
   - **Framework Preset**: Next.js (should be auto-detected)
   - **Root Directory**: `.` (leave as default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

### 4.1 Add Environment Variables

In the Vercel project settings, add environment variables:

1. Scroll down to **"Environment Variables"**
2. Click **"Add New"** and add:

   | Name | Value |
   |------|-------|
   | `TMDB_API_KEY` | Your TMDB API key |
   | `MONGODB_URI` | Your MongoDB connection string |

3. Click **"Add"** for each variable
4. Select **"All** environments for each variable (Production, Preview, Development)

### 4.2 Deploy

1. Click the **"Deploy"** button
2. Wait for deployment to complete (usually 1-3 minutes)
3. You'll see a success message with your live URL

**Your app is now live!** 🎉

---

## Option B: Deploy via Vercel CLI (Advanced)

If you prefer using the command line:

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: cinelog
# - Directory: . (current directory)
# - Override settings? No

# Add environment variables
vercel env add TMDB_API_KEY
# Paste your API key when prompted
# Select All environments

vercel env add MONGODB_URI
# Paste your connection string when prompted
# Select All environments

# Deploy to production
vercel --prod
```

---

## Step 5: Post-Deployment Checklist

After deployment, verify your application:

### 5.1 Test Your Live Site

1. Visit your Vercel URL (e.g., `https://cinelog.vercel.app`)
2. Test all features:
   - [ ] Homepage loads correctly
   - [ ] Movie search works
   - [ ] Create a review
   - [ ] View review details
   - [ ] Edit a review
   - [ ] Delete a review
   - [ ] Rating filter works
   - [ ] Search functionality works
   - [ ] Images load correctly

### 5.2 Check Vercel Dashboard

1. Go to your Vercel project dashboard
2. Check the **"Deployments"** tab:
   - Ensure the build was successful
   - No errors in the build logs
3. Check the **"Functions"** tab:
   - API routes should be listed
   - Check for any runtime errors

### 5.3 Verify MongoDB Data

1. Go to MongoDB Atlas: https://cloud.mongodb.com
2. Click on your cluster
3. Click **"Browse Collections"**
4. You should see a `cinelog` database with a `reviews` collection
5. Any reviews you created should appear here

---

## Troubleshooting

### Build Fails

**Problem**: Build fails on Vercel

**Solutions**:
1. Check the build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Try building locally first: `npm run build`
4. Check for TypeScript errors

### Environment Variables Not Working

**Problem**: API calls fail with authentication errors

**Solutions**:
1. Verify environment variables are set in Vercel dashboard
2. Make sure you selected "All" environments
3. Redeploy after adding environment variables
4. Check variable names match exactly (case-sensitive)

### MongoDB Connection Timeout

**Problem**: Database connection times out

**Solutions**:
1. Verify `MONGODB_URI` is correct
2. Check MongoDB Atlas Network Access:
   - Go to Security > Network Access
   - Ensure `0.0.0.0/0` is allowed (or specific IPs)
3. Check MongoDB Atlas Database Access:
   - Verify username and password are correct
4. If password has special characters, URL-encode them (see SETUP_EXTERNAL_SERVICES.md)

### Images Not Loading

**Problem**: Movie posters don't display

**Solutions**:
1. Verify `TMDB_API_KEY` is correct
2. Check next.config.ts has TMDB image domain
3. Clear browser cache and refresh
4. Check browser console for errors

### 504 Gateway Timeout

**Problem**: API requests timeout

**Solutions**:
1. Check MongoDB Atlas cluster status
2. Verify the cluster is not paused (free tier clusters pause after inactivity)
3. Cold start may take 30-60 seconds on first request

---

## Updating Your Application

After making changes to your code:

1. **Test locally**:
   ```bash
   npm run dev
   ```

2. **Build and test production build**:
   ```bash
   npm run build
   npm start
   ```

3. **Commit and push to GitHub**:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```

4. **Vercel will auto-deploy** on every push to the main branch

---

## Custom Domain (Optional)

### Setting Up a Custom Domain

1. Go to Vercel project dashboard
2. Click **"Settings"** → **"Domains"**
3. Enter your domain name (e.g., `movies.yourname.com`)
4. Follow the DNS instructions provided by Vercel

### For Free Subdomain

If you don't have a domain:
- Your Vercel URL is: `https://your-project-name.vercel.app`
- You can customize the project name in Vercel settings

---

## Monitoring and Analytics

### Vercel Analytics

1. Go to Vercel project dashboard
2. Click **"Analytics"** tab
3. Enable Web Vitals Analytics

### MongoDB Atlas Monitoring

1. Go to MongoDB Atlas: https://cloud.mongodb.com
2. Click on your cluster
3. View metrics under **"Metrics"** tab:
   - CPU usage
   - Memory usage
   - Network I/O
   - Connections

---

## Security Best Practices

### 1. Never Commit `.env.local`

Your `.gitignore` should include `.env.local`:
```gitignore
.env.local
```

### 2. Use Environment Variables

Always use environment variables for sensitive data:
- API keys
- Database connection strings
- Passwords

### 3. Keep Dependencies Updated

Regularly update dependencies:
```bash
npm audit
npm audit fix
npm update
```

### 4. MongoDB Security

- Use strong password for database user
- Don't share your connection string
- Limit network access if possible (use specific IPs instead of 0.0.0.0/0)

---

## Cost Summary

### Free Tier Usage

| Service | Free Tier | Cost |
|---------|-----------|------|
| **Vercel** | Hobby Plan | **FREE** |
| - Deployments | Unlimited | - |
| - Bandwidth | 100GB/month | - |
| - Build minutes | 6000/month | - |
| **MongoDB Atlas** | M0 Sandbox | **FREE** |
| - Storage | 512MB | - |
| - RAM | Shared | - |
| **TMDB API** | API Key | **FREE** |
| - Requests | Limited but generous | - |

### Total Monthly Cost: **$0**

---

## Need Help?

- **Vercel Documentation**: https://vercel.com/docs
- **MongoDB Atlas Documentation**: https://www.mongodb.com/docs/atlas/
- **Next.js Documentation**: https://nextjs.org/docs
- **GitHub Issues**: If you encounter bugs, check the project issues

---

> **Last Updated**: 2026-01-29
> **Document Version**: 1.0.0
