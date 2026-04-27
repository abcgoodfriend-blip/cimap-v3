# 🚀 The Ultimate Step-by-Step Deployment Guide

This guide explains EXACTLY how to deploy the CIMAP platform from scratch. Follow these steps if you ever need to set up a new server or move the project.

---

## 🏗️ Phase 1: The Database (MongoDB Atlas)
1. **Create Account**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2. **Create Cluster**:
   - Choose **"M0 Free"** (Shared Tier).
   - Select the region closest to you (e.g., Mumbai or Singapore).
   - Click **"Create"**.
3. **Set Security**:
   - Go to **"Database Access"**: Create a user (e.g., `adani`) and set a password.
   - Go to **"Network Access"**: Click **"Add IP Address"** and select **"Allow Access from Anywhere"** (`0.0.0.0/0`). *This is critical for Render to connect!*
4. **Get Connection String**:
   - Click **"Connect"** on your Cluster.
   - Choose **"Drivers"** (Python).
   - Copy the `mongodb+srv://...` link. Replace `<password>` with your real password.

---

## 🛠️ Phase 2: The Backend (Render.com)
1. **New Service**: Click **"New +"** -> **"Web Service"**.
2. **Connect Git**: Select your GitHub repo `w1hi4/Adani-Dashboard`.
3. **Configure Settings**:
   - **Name**: `adani-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port 8001`
4. **Advanced -> Environment Variables**: Click **"Add Environment Variable"** for each of these:
   - `MONGO_URL` = (Your Atlas String)
   - `DB_NAME` = `cimap`
   - `JWT_SECRET` = (Any long random string)
   - `ADMIN_EMAIL` = `admin@adani-intel.com`
   - `ADMIN_PASSWORD` = `Admin@123`
   - `INGEST_API_KEY` = `4d270df919e95630e697c6fe62e74d79`
   - `FRONTEND_URL` = `https://wahiduddin.tech`
5. **Deploy**: Click **"Create Web Service"**.

---

## 🌐 Phase 3: The Frontend (Cloudflare Pages)
1. **Dashboard**: Go to **"Workers & Pages"** -> **"Create"** -> **"Pages"** -> **"Connect to Git"**.
2. **Settings**:
   - **Project Name**: `adani-dashboard`
   - **Production Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `yarn build`
   - **Output Directory**: `build`
3. **Environment Variables**: Add this during setup:
   - `REACT_APP_BACKEND_URL` = `https://your-backend-link-from-render.onrender.com`
4. **Deploy**: Click **"Save and Deploy"**.
5. **Custom Domain**: 
   - Go to the **"Custom Domains"** tab inside your project.
   - Click **"Set up a custom domain"**.
   - Type `wahiduddin.tech`.
   - Click **"Activate"**. (Cloudflare handles the DNS for you).

---

## 🔑 Your Login
- **URL**: [https://wahiduddin.tech](https://wahiduddin.tech)
- **User**: `admin@adani-intel.com`
- **Pass**: `Admin@123`

---

## 📡 Sending Data from Scrapers
Use this URL in your scraper scripts:
- **URL**: `https://adani-backend-h3ij.onrender.com/api/ingest`
- **Headers**: `{"x-api-key": "4d270df919e95630e697c6fe62e74d79"}`
