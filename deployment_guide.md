# CIMAP v3 Deployment Guide

This guide explains how to push your code to **GitHub** and host the system on **Render** (Backend) and **Cloudflare Pages** (Frontend).

---

## 1. Step 1: Push Code to GitHub

Open your terminal in the `e:\ADANI-DASHBOARD\cimap-v3` folder and run these commands:

```powershell
# 1. Initialize Git
git init

# 2. Add all files
git add .

# 3. Commit the changes
git commit -m "Initial commit of CIMAP v3"

# 4. Create a new empty repository on GitHub named "adani-cimap-v3"
# 5. Link your local folder to GitHub (Replace YOUR_USERNAME with your GitHub name)
git remote add origin https://github.com/YOUR_USERNAME/adani-cimap-v3.git
git branch -M main

# 6. Push the code
git push -u origin main
```

---

## 2. Step 2: Host Backend on Render

1.  **Go to Render**: [dashboard.render.com](https://dashboard.render.com).
2.  **New Web Service**: Click **New +** > **Web Service**.
3.  **Connect Repo**: Select your `adani-cimap-v3` repository.
4.  **Settings**:
    *   **Name**: `adani-backend`
    *   **Root Directory**: `backend`
    *   **Language**: `Python 3`
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `uvicorn server:app --host 0.0.0.0 --port 10000`
5.  **Environment Variables**: Click "Advanced" or "Environment" and add:
    *   `MONGO_URL`: (Copy from your local `backend/.env`)
    *   `DB_NAME`: `cimap-v3`
    *   `JWT_SECRET`: (Generate a random string or copy from .env)
    *   `INGEST_API_KEY`: `4d270df919e95630e697c6fe62e74d79`
    *   `GOOGLE_API_KEY`: (Your Gemini API Key)
    *   `CORS_ORIGINS`: `*`

---

## 3. Step 3: Host Frontend on Cloudflare Pages

1.  **Go to Cloudflare**: Go to **Workers & Pages** > **Pages** > **Connect to Git**.
2.  **Select Repo**: Select `adani-cimap-v3`.
3.  **Build Settings**:
    *   **Framework**: `Create React App`
    *   **Root Directory**: `frontend`
    *   **Build Command**: `yarn build`
    *   **Build Output**: `build`
4.  **Environment Variables**: Add these (Use the URL Render gives you):
    *   `REACT_APP_API_URL`: `https://your-backend-name.onrender.com/api`
    *   `REACT_APP_WS_URL`: `wss://your-backend-name.onrender.com/ws/dashboard`
    *   `REACT_APP_BACKEND_URL`: `https://your-backend-name.onrender.com`
5.  **Domain**: Under "Custom Domains", add `adani.wahiduddin.tech`.

---

## 4. Step 4: Final Database Check
Go to **MongoDB Atlas** > **Network Access** and click **"Add IP Address"**. Select **"Allow Access From Anywhere"** (0.0.0.0/0). This allows Render to talk to your database.
