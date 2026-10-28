# 🎓 Cloud-Based College Placement Management System (PlaceCloud)

[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%20%7C%20Recharts-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%2020%20%7C%20Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas%20%7C%20SQLite%20Fallback-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/cloud/atlas)
[![Hosting](https://img.shields.io/badge/Deployed%20On-Vercel%20%2B%20Render-black?logo=vercel&logoColor=white)](https://vercel.com)
[![UI](https://img.shields.io/badge/UI-Responsive%20%28Mobile%20%7C%20Tablet%20%7C%20Desktop%29-brightgreen)](#-key-system-features)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A modern, cloud-native campus placement automation platform bridging **Students**, **College Training & Placement Officers (TPO / Admins)**, and **Corporate Recruiters**. Built with an automated eligibility evaluation engine, real-time stage tracking, cloud document management, and interactive placement analytics.

---

## 📑 Table of Contents

- [🌟 Key System Features](#-key-system-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🚀 100% Free Cloud Hosting Guide (Vercel + Render + MongoDB Atlas)](#-100-free-cloud-hosting-guide-vercel--render--mongodb-atlas)
  - [Step 1: Set Up Free Cloud Database (MongoDB Atlas)](#step-1-set-up-free-cloud-database-mongodb-atlas)
  - [Step 2: Deploy Backend REST API on Render](#step-2-deploy-backend-rest-api-on-render)
  - [Step 3: Deploy Frontend Web App on Vercel](#step-3-deploy-frontend-web-app-on-vercel)
  - [Step 4: Final CORS Handshake & Connection](#step-4-final-cors-handshake--connection)
  - [Step 5: Post-Deployment Verification](#step-5-post-deployment-verification)
- [🔥 Firebase Google Authentication Setup (Step-by-Step Guide)](#-firebase-google-authentication-setup-step-by-step-guide)
  - [Step 1: Create a Free Firebase Project](#step-1-create-a-free-firebase-project)
  - [Step 2: Enable Google Authentication Provider](#step-2-enable-google-authentication-provider)
  - [Step 3: Register a Web Application & Copy Config Keys](#step-3-register-a-web-application--copy-config-keys)
  - [Step 4: Configure Authorized Domains in Firebase](#step-4-configure-authorized-domains-in-firebase)
  - [Step 5: (Optional) Set Up Firebase Admin SDK Credentials](#step-5-optional-set-up-firebase-admin-sdk-credentials)
  - [Step 6: Configure Environment Variables](#step-6-configure-environment-variables)
  - [Step 7: Verification & Testing](#step-7-verification--testing)
  - [Troubleshooting Firebase Common Errors](#troubleshooting-firebase-common-errors)
- [⚡ Free-Tier Optimizations & Troubleshooting](#-free-tier-optimizations--troubleshooting)
- [🔑 Demo Test Accounts & Roles](#-demo-test-accounts--roles)
- [💻 Local Development & One-Command Quickstart](#-local-development--one-command-quickstart)
- [📁 Repository Directory Structure](#-repository-directory-structure)
- [📡 API Endpoints Reference](#-api-endpoints-reference)

---

## 🌟 Key System Features

- **Role-Based Access Control (RBAC)**: Dedicated, responsive portals with distinct permission boundaries for **Students**, **TPO Admins**, and **Company Recruiters**.
- **Fully Responsive Cross-Device UI**: Seamless adaptive interface engineered for mobile (320px–480px), tablet (640px–1024px), and desktop screens with mobile drawer navigation, momentum horizontal table scrolling, reflowing stat grids, and zero layout overflow.
- **Firebase Google Authentication**: One-click Google Sign-In with automated user profile provisioning, token verification, and seamless session caching alongside traditional JWT credential auth.
- **Automated Eligibility Engine**: Instant validation of student credentials against drive parameters (minimum CGPA, permitted engineering branches, graduation passing batch, active backlogs).
- **End-to-End Application Tracking**: One-click student applications, duplicate prevention, and stage lifecycle management (`Applied` → `Shortlisted` → `Interview Scheduled` → `Selected` / `Rejected`).
- **Cloud Resume Pipeline**: Support for private Amazon S3 storage with 15-minute expiring presigned URLs (with zero-configuration local sandbox fallback).
- **Placement Analytics & Reports**: Live interactive visual charts (Recharts) detailing department-wise hiring, top recruiting companies, package distributions, and one-click NAAC/NBA compliance CSV report exports.
- **Auditing & Notification Pipeline**: Instant in-app alerts on interview schedule updates, application status changes, and administrator audit logging.

---

## 🏗️ System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER (HTTPS)                          │
└───────────────────▲───────────────────────────────▲────────────────────┘
                    │                               │
        HTML / CSS / JS Assets           REST API Calls (Bearer JWT)
                    │                               │
┌───────────────────┴───────────────┐   ┌───────────┴────────────────────┐
│      VERCEL CLOUD EDGE            │   │      RENDER WEB SERVICE        │
│   (React 18 + Vite SPA Client)    │   │  (Node.js 20 + Express Engine) │
│                                   │   │                                │
│   • Global CDN Distribution       │   │   • JWT Auth & RBAC Guard      │
│   • SPA Route Rewrites            │   │   • Eligibility Rule Engine    │
│   • Static Asset Optimization     │   │   • Centralized Error Handler  │
└───────────────────────────────────┘   └───────────┬────────────────────┘
                                                    │
                                  ┌─────────────────┴──────────────────┐
                                  │                                    │
                                  ▼                                    ▼
                     ┌──────────────────────────┐         ┌──────────────────────────┐
                     │   MONGODB ATLAS (M0)     │         │   AWS S3 / LOCAL STORAGE │
                     │  (Persistent Cloud Data) │         │ (Resumes & Presigned URLs)│
                     │                          │         │                          │
                     │  • Users & Profiles      │         │  • Private PDF Bucket    │
                     │  • Placement Drives      │         │  • SSE-S3 Encryption     │
                     │  • Applications & Status │         │  • 15-Min Expiring Links │
                     └──────────────────────────┘         └──────────────────────────┘
```

---

## 🚀 100% Free Cloud Hosting Guide (Vercel + Render + MongoDB Atlas)

This framework enables you to host the entire full-stack system on **100% free tiers** with **zero hosting cost** and **no credit card required**.

| Component | Platform | Free Tier Benefits |
|---|---|---|
| **Database** | **MongoDB Atlas** | M0 Shared Cluster (512 MB storage, free forever) |
| **Backend API** | **Render** | Free Web Service (512 MB RAM, free HTTPS, automated CI/CD) |
| **Frontend App**| **Vercel** | Free Hobby Tier (Fast global Edge CDN, automatic Git deployments) |

---

### Step 1: Set Up Free Cloud Database (MongoDB Atlas)

Because Render's free tier uses ephemeral containers, SQLite files reset when the server sleeps. MongoDB Atlas provides persistent, reliable cloud storage.

1. **Sign Up**: Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. **Create Cluster**:
   - Click **Create Deployment**.
   - Choose the **M0 Free (Shared)** tier.
   - Select cloud provider **AWS** and the region closest to you (e.g., `ap-south-1` Mumbai or `us-east-1` N. Virginia).
   - Name your cluster (e.g., `placecloud-cluster`) and click **Create**.
3. **Configure Database User**:
   - Go to **Security** → **Database Access** → **Add New Database User**.
   - Authentication Method: **Password**.
   - Username: `placecloud_admin`
   - Password: Click *Autogenerate Secure Password* or type a secure password (avoid special characters like `@`, `:`, `/` or URL-encode them).
   - Privileges: Select **Read and write to any database**.
   - Click **Add User**.
4. **Configure IP Whitelist (Network Access)**:
   - Go to **Security** → **Network Access** → **Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`).
   - *(Note: This is required because free cloud services like Render dynamically rotate outbound IP addresses).*
   - Click **Confirm**.
5. **Copy Connection String**:
   - In the sidebar, click **Deployment** → **Database** → Click **Connect**.
   - Select **Drivers** (Node.js).
   - Copy the SRV connection URI:
     ```text
     mongodb+srv://placecloud_admin:<password>@placecloud-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Add your database name `/placecloud` right before the `?`:
     ```text
     mongodb+srv://placecloud_admin:<password>@placecloud-cluster.xxxxx.mongodb.net/placecloud?retryWrites=true&w=majority
     ```

---

### Step 2: Deploy Backend REST API on Render

1. **Push your code to GitHub**: Make sure your project repository is uploaded to GitHub.
2. **Log in to Render**: Visit [render.com](https://render.com) and sign in using your GitHub account.
3. **Create a New Web Service**:
   - In the Render Dashboard, click **New +** → **Web Service**.
   - Select **Build and deploy from a Git repository** and connect your repository.
4. **Configure Web Service Settings**:
   | Field | Value | Notes |
   |---|---|---|
   | **Name** | `placecloud-backend` | Unique name for your backend API |
   | **Region** | Closest to your MongoDB region | e.g. Frankfurt, Singapore, or Oregon |
   | **Branch** | `main` or `master` | Target Git deployment branch |
   | **Root Directory** | `backend` | **CRITICAL**: Tells Render your backend folder |
   | **Runtime** | `Node` | Node.js runtime |
   | **Build Command** | `npm install` | Installs backend dependencies |
   | **Start Command** | `npm start` | Runs `node src/server.js` |
   | **Instance Type** | `Free` | 512 MB RAM / 0.1 CPU ($0/month) |

5. **Set Environment Variables on Render**:
   Scroll down to the **Environment Variables** section and add the following keys:

   | Key | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production security & logging mode |
   | `PORT` | `5000` | Port for the Express server |
   | `MONGODB_URI` | `mongodb+srv://placecloud_admin:...` | Your MongoDB Atlas connection URI from Step 1 |
   | `JWT_SECRET` | Generate a unique random value | Required signing secret; never reuse an example value |
   | `JWT_EXPIRES_IN` | `24h` | Token expiration window |
   | `FRONTEND_URL` | `http://localhost:5173` | *(Temporary placeholder; we will update this in Step 4 with your Vercel URL)* |

   *(Optional AWS S3 credentials can also be added here if you are using private AWS S3 bucket storage; otherwise, the built-in fallback will be active).*

6. **Deploy Service**:
   - Click **Create Web Service**.
   - Render will build and deploy your Node.js application.
   - Once the deployment log displays `PlaceCloud REST API Server Running on port 5000`, copy your assigned Render URL (e.g., `https://placecloud-backend.onrender.com`).
7. **Verify Backend Health**:
   Open a new browser tab and visit:
   ```text
   https://placecloud-backend.onrender.com/api/v1/health
   ```
   You should see:
   ```json
   {
     "status": "healthy",
     "database": "connected",
     "service": "College Placement Management API",
     "environment": "production"
   }
   ```

---

### Step 3: Deploy Frontend Web App on Vercel

1. **Log in to Vercel**: Visit [vercel.com](https://vercel.com) and sign in with GitHub.
2. **Add New Project**:
   - In your dashboard, click **Add New...** → **Project**.
   - Find your repository and click **Import**.
3. **Configure Project Settings**:
   - **Framework Preset**: Select `Vite`.
   - **Root Directory**: Click **Edit** and set to `frontend` (**CRITICAL**).
   - **Build and Output Settings**:
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`
4. **Configure Environment Variables**:
   Under the **Environment Variables** section, add:

   | Key | Value | Note |
   |---|---|---|
   | `VITE_API_BASE_URL` | `https://placecloud-backend.onrender.com` | **Use your live Render URL from Step 2. Do NOT add trailing slash, and do NOT add `/api/v1`**. |

5. **SPA Routing Configuration (`vercel.json`)**:
   This repository includes `frontend/vercel.json` with single-page app rewrite rules:
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
   *This ensures that reloading routes like `/student/drives` or `/admin/analytics` in the browser will never return a 404 error.*

6. **Deploy Project**:
   - Click **Deploy**.
   - Vercel will bundle and deploy the client within ~45 seconds.
   - Copy your live Vercel domain URL (e.g., `https://placecloud-frontend.vercel.app`).

---

### Step 4: Final CORS Handshake & Connection

Now that your frontend has a live public URL, allow it in your backend's CORS whitelist to permit authenticated requests:

1. Go back to your [Render Dashboard](https://dashboard.render.com).
2. Select your `placecloud-backend` service.
3. Click **Environment** in the left sidebar.
4. Locate `FRONTEND_URL` and update its value to your Vercel deployment URL:
   ```text
   FRONTEND_URL=https://placecloud-frontend.vercel.app
   ```
   *(Ensure there is no trailing slash).*
5. Click **Save Changes**. Render will automatically trigger a rolling restart of your backend service.

---

### Step 5: Post-Deployment Verification

1. **Database Initialization / Seeding**:
   - PlaceCloud automatically seeds default enterprise data if your MongoDB Atlas cluster is fresh on first startup!
   - Alternatively, you can seed manually from your local terminal with your Atlas URI configured:
     ```bash
     npm run setup:mongo
     ```
2. **Open Your Live Application**: Navigate to your Vercel frontend URL (`https://placecloud-frontend.vercel.app`).
3. **Log in**: Test signing in with any of the demo accounts listed below.
4. **Smoke Test Features**:
   - Apply for a drive as a Student.
   - Schedule an interview round as a Recruiter.
   - View analytics and export NAAC/NBA placement CSV as an Admin.

---

## 🔥 Firebase Google Authentication Setup (Step-by-Step Guide)

PlaceCloud features native **Firebase Google Authentication** for seamless, passwordless login and fast-track student onboarding.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        GOOGLE SIGN-IN FLOW                             │
└────────────────────────────────────────────────────────────────────────┘
  [Client Browser]
        │
        ▼ 1. Click "Continue with Google"
  [Firebase Auth Popup] ──▶ User selects Google account
        │
        ▼ 2. Obtains verified Firebase ID Token (JWT)
  [PlaceCloud Client]
        │
        ▼ 3. POST /api/v1/auth/google  { idToken }
  [PlaceCloud Backend]
        │
        ▼ 4. Verifies token with Firebase Admin SDK / Google OAuth2
        │    • Existing user: loads profile & issues PlaceCloud JWT session
        │    • New user: automatically provisions Student / Recruiter profile
        ▼
  [Client Workspace] ──▶ Redirected to Dashboard (Student, Recruiter, Admin)
```

Follow this step-by-step procedure to connect your Firebase project:

---

### Step 1: Create a Free Firebase Project

1. Open the [Firebase Console](https://console.firebase.google.com/) and log in with your Google account.
2. Click **Create a project** (or **Add project**).
3. Enter your project name (e.g. `placecloud-placement-auth` or `placecloud`).
4. (Optional) You can disable Google Analytics to speed up setup, then click **Create project**.
5. Wait for Firebase to finish provisioning, then click **Continue**.

---

### Step 2: Enable Google Authentication Provider

1. In the Firebase Console left navigation sidebar, expand **Build** and select **Authentication**.
2. Click **Get started**.
3. Under the **Sign-in method** tab, locate **Google** in the "Additional providers" list and click it.
4. Toggle the **Enable** switch to **ON**.
5. Under **Project support email**, select your email address from the dropdown.
6. Click **Save**.

---

### Step 3: Register a Web Application & Copy Config Keys

1. In the top-left sidebar, click the **Settings gear icon (⚙️)** next to "Project Overview", then choose **Project settings**.
2. In the **General** tab, scroll down to the **Your apps** card.
3. Click the **Web icon (`</>`)** to add a web application.
4. App nickname: `placecloud-frontend`.
5. Leave "Also set up Firebase Hosting for this app" **unchecked** (we deploy on Vercel), then click **Register app**.
6. Firebase will show your JavaScript SDK configuration snippet containing your keys:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyB...",
     authDomain: "placecloud-xxx.firebaseapp.com",
     projectId: "placecloud-xxx",
     storageBucket: "placecloud-xxx.appspot.com",
     messagingSenderId: "123456789...",
     appId: "1:123456789:web:abcdef..."
   };
   ```
   *(Keep this tab open; you will paste these keys into your frontend configuration).*

---

### Step 4: Configure Authorized Domains in Firebase

For Google OAuth popups to succeed, the domain where your web app runs must be in Firebase's allowed list:

1. In Firebase Console, navigate to **Build** → **Authentication** → **Settings** tab.
2. Click **Authorized domains** in the sub-menu.
3. Verify that `localhost` is already present (default).
4. If you deployed your frontend to Vercel, click **Add domain**:
   - Enter your Vercel subdomain (e.g. `placecloud-frontend.vercel.app`).
   - Click **Add**.
   *(Note: Do not include `https://` or trailing slashes, just the hostname).*

---

### Step 5: (Optional) Set Up Firebase Admin SDK Credentials

The PlaceCloud backend uses the **Firebase Admin SDK** for cryptographic token verification. If omitted, the backend automatically uses Google's public OAuth2 token verification endpoint as a fallback. For maximum production security:

1. In Firebase Console, navigate to **Project settings (⚙️)** → **Service accounts** tab.
2. Ensure **Node.js** is selected.
3. Click **Generate new private key** → Click **Generate key**.
4. A JSON file will download to your computer (e.g. `placecloud-xxx-firebase-adminsdk-xxx.json`).
5. Place this file inside your `backend/` directory (e.g. `backend/firebaseServiceAccount.json`).
   *(Ensure this file is kept private and listed in `.gitignore`).*

---

### Step 6: Configure Environment Variables

#### 1. Frontend Configuration (`frontend/.env`)
Open `frontend/.env` (or copy from `frontend/.env.example`) and fill in the values from Step 3:

```env
# API Gateway URL (empty for Vite local proxy, or your Render backend URL)
VITE_API_BASE_URL=

# Firebase Client Web App Config
VITE_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=placecloud-xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=placecloud-xxx
VITE_FIREBASE_STORAGE_BUCKET=placecloud-xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

#### 2. Backend Configuration (`backend/.env`)
Open `backend/.env` and specify your Firebase Project ID:

```env
# Firebase Backend Admin
FIREBASE_PROJECT_ID=placecloud-xxx

# Optional Firebase Web API key for Identity Toolkit verification fallback
FIREBASE_API_KEY=

# Optional: Path to service account JSON (or inline JSON string in production)
FIREBASE_SERVICE_ACCOUNT_KEY=./firebaseServiceAccount.json
```

#### 3. Cloud Deployment (Vercel & Render)
- **On Vercel**: Go to **Project Settings** → **Environment Variables** → Add all `VITE_FIREBASE_*` variables.
- **On Render**: Go to **Environment** → Add `FIREBASE_PROJECT_ID`. Configure `FIREBASE_SERVICE_ACCOUNT_KEY` when using a service account, or `FIREBASE_API_KEY` if the Identity Toolkit verification fallback is needed.

---

### Step 7: Verification & Testing

1. **Launch the stack locally**:
   ```bash
   npm run dev
   ```
2. **Test Google Sign-In**:
   - Open your browser at `http://localhost:5173/login`.
   - Choose **Student**, **Recruiter**, or **TPO Officer**.
   - Click **Continue with Google**.
   - In the Google popup, choose your Google account.
   - Existing accounts use the role saved in the database. A new Google identity signing in to the Student portal creates an account without fabricated student or academic details, then displays a blocking profile-completion modal over the dashboard. Google supplies the student's name and verified email; the student enters their roll number, department, graduation year, current GPA, active backlogs, Indian mobile number, and college.
   - Recruiter and TPO Officer accounts must already be provisioned by an administrator. Selecting those portals never creates a privileged account.
3. **Test Student Registration**:
   - Open `http://localhost:5173/register-student`.
   - Complete the form and submit. Registration returns to the login page with the email prefilled; enter the password and sign in explicitly.
   - The Google registration option also returns to login after creating a new student account. Existing Google accounts should use the login page.
4. **Test Existing Account Matching**:
   - If an account already exists with the same verified email, Google sign-in links it if it is not already linked and uses its existing database role.
5. **Test role/session isolation**:
   - Sign in as different users in independently opened browser tabs, refresh each tab, and log out of one. Each tab's backend token and Firebase session are scoped to that tab.

The backend JWT, user, and profile are kept in `sessionStorage` so refreshes restore the current tab without making another tab's API requests use its identity. Firebase Google Auth also uses session persistence. New Google sign-ins can self-register only as students; recruiter and admin (TPO Officer) access comes from database records provisioned by an authorized operator.

---

### Troubleshooting Firebase Common Errors

| Error Code / Message | Cause | Solution |
|---|---|---|
| `auth/unauthorized-domain` | The current domain is not in Firebase's authorized list. | Go to Firebase Console → Authentication → Settings → Authorized Domains → Add your domain (e.g. `localhost` or `your-app.vercel.app`). |
| `auth/popup-closed-by-user` | The user closed the popup before completing the sign-in. | User cancelled; simply click the button again and complete the Google prompt. |
| `auth/cancelled-popup-request` | Another popup request was triggered before the previous one finished. | Wait a moment or refresh the page before clicking the Google button again. |
| `auth/configuration-not-found` | Google provider is not enabled in Firebase. | Go to Firebase Console → Authentication → Sign-in method → Enable "Google" provider. |
| Popup blocked | Browser security settings blocked popup window. | Look for the popup blocker icon in your browser address bar and choose "Always allow popups for this site". |

---

## ⚡ Free-Tier Optimizations & Troubleshooting

### 1. Render Free Tier "Cold Start" (Spin-Down Delay)
- **Behavior**: On Render's free tier, web services spin down after **15 minutes of inactivity**. When a new visitor arrives, it takes **30–50 seconds** to wake up.
- **Solution (Keep-Alive Ping)**:
  1. Go to [cron-job.org](https://cron-job.org) or [UptimeRobot](https://uptimerobot.com) (both 100% free).
  2. Create an HTTP monitor that pings your health check endpoint every **10 to 14 minutes**:
     ```text
     https://placecloud-backend.onrender.com/api/v1/health
     ```
  3. This keeps your free Render service awake 24/7 without delays!

### 2. CORS Errors (`Blocked by CORS policy: Origin not allowed`)
- Verify that `FRONTEND_URL` on Render matches your Vercel URL exactly, including `https://`, and has **no trailing slash**:
  - ✅ Correct: `https://placecloud-frontend.vercel.app`
  - ❌ Incorrect: `https://placecloud-frontend.vercel.app/`

### 3. Vercel Returns `404 Not Found` on Page Refresh
- This happens in Single-Page Applications when refreshing URLs like `/admin/drives`.
- Ensure `frontend/vercel.json` exists in your repository with the rewrite configuration to `/index.html`.

### 4. API Requests Return `404` or `//api/v1`
- Verify that `VITE_API_BASE_URL` on Vercel is set to `https://your-backend.onrender.com` without `/api/v1` or trailing slashes, as the frontend client automatically constructs `/api/v1/*` paths.

### 5. MongoDB Connection Times Out on Render
- In MongoDB Atlas, verify **Network Access** has IP `0.0.0.0/0` added.
- If your password has special characters like `@` or `#`, encode them (e.g. `#` → `%23`), or generate a strictly alphanumeric password.

---

## 🔑 Demo Test Accounts & Roles

Once seeded, you can immediately test all three role-based portals on `/login`:

| Persona | Role | Email | Password | Primary Capabilities |
|---|---|---|---|---|
| **Student** | `student` | `arjun.sharma@college.edu` | `StudentPassword123!` | View eligible drives, apply, track status, view interview invitations |
| **Recruiter** | `recruiter` | `recruiter.google@google.com` | `RecruiterPassword123!` | Review applicants, update recruitment stages, schedule interviews |
| **TPO Admin** | `admin` | `admin@college.edu` | `AdminPassword123!` | System-wide analytics, manage drives, student directory, export CSV reports |

---

## 💻 Local Development & One-Command Quickstart

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Git**

### 2. Clone and Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/college-placement-management.git
cd college-placement-management

# Install dependencies for root, backend, and frontend
npm run install:all
```

### 3. Environment Variables Configuration

#### Backend Configuration (`backend/.env`):
```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas (or leave blank to use zero-config local SQLite fallback):
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/placecloud?retryWrites=true&w=majority

# Local SQLite fallback path (used automatically if MONGODB_URI is empty):
SQLITE_DB_PATH=./data/placement.db

# JWT Security
JWT_SECRET=<generate-a-unique-random-secret>
JWT_EXPIRES_IN=24h

# Firebase Google Authentication (Backend token verification)
FIREBASE_PROJECT_ID=your_firebase_project_id
# Optional Firebase Web API key for Identity Toolkit verification fallback
FIREBASE_API_KEY=
# Optional: Path to Firebase Service Account JSON or inline JSON string
FIREBASE_SERVICE_ACCOUNT_KEY=

# AWS S3 Cloud Storage (Optional - fallback to local storage if blank)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET_NAME=college-placement-resumes-dev

# Allowed Frontend URL
FRONTEND_URL=http://localhost:5173
```

#### Frontend Configuration (`frontend/.env`):
```env
# Leave empty in local dev to use Vite proxy (/api -> localhost:5000)
VITE_API_BASE_URL=

# Firebase Google Authentication (Frontend Web App Config)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 4. Seed Database & Run Full Stack
```bash
# Seed initial demo data:
# For MongoDB Atlas:
npm run setup:mongo

# Or for local SQLite fallback:
npm run seed

# Start both Backend (:5000) & Frontend (:5173) concurrently:
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API Gateway**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **Health Check Endpoint**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

---

## 📁 Repository Directory Structure

```text
college-placement-management/
├── backend/
│   ├── data/                 # SQLite local database storage (fallback)
│   ├── scripts/
│   │   ├── seed.js           # SQLite relational demo seeder
│   │   └── setup-mongodb.js  # MongoDB Atlas initialization & seeder
│   ├── src/
│   │   ├── config/           # Database connectors, S3 config, mongoSeeder
│   │   ├── controllers/      # Route controllers (auth, student, drive, etc.)
│   │   ├── middleware/       # JWT auth, RBAC permissions, error handlers
│   │   ├── models/           # Dual models (SQLite queries & Mongoose schemas)
│   │   ├── routes/           # Express router endpoints (/api/v1/*)
│   │   ├── services/         # Automated eligibility engine, S3 resume service
│   │   ├── utils/            # Token signers, API formatters, CSV builders
│   │   ├── app.js            # Express middleware pipeline, CORS & Helmet
│   │   └── server.js         # HTTP server entry point & graceful shutdown
│   ├── uploads/              # Local storage fallback directory for resumes
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable components (Navbar, Sidebar, Modals)
│   │   ├── pages/            # Role-specific portal pages & landing page
│   │   ├── layouts/          # Dashboard layouts
│   │   ├── services/         # Axios API clients & interceptors
│   │   ├── hooks/            # useAuth, useFetch custom hooks
│   │   ├── styles/           # Global styles, variables, theme overrides
│   │   ├── App.jsx           # React router routes & RBAC protection
│   │   └── main.jsx          # React DOM entry point
│   ├── index.html
│   ├── vite.config.js        # Vite build & local API proxy configuration
│   ├── vercel.json           # Vercel SPA route rewrite configuration
│   ├── package.json
│   └── .env.example
├── docs/                     # Comprehensive architectural & viva guides
│   ├── architecture.md       # Cloud system design & data flow
│   ├── database-design.md    # ER diagrams, collections, schemas
│   ├── api-documentation.md  # Detailed REST API specification
│   ├── deployment-guide.md   # Enterprise AWS & cloud deployment guide
│   └── project-report.md     # Academic project report
├── package.json              # Monorepo root concurrency scripts
├── .gitignore
└── README.md
```

---

## 📡 API Endpoints Reference

All API routes are prefixed with `/api/v1`.

| Module | Method | Endpoint | Access Role | Description |
|---|---|---|---|---|
| **System** | `GET` | `/health` | Public | System uptime & database connection status |
| **Auth** | `POST` | `/auth/login` | Public | User authentication & JWT issuance |
| **Auth** | `POST` | `/auth/register-student` | Public | Student account registration |
| **Auth** | `POST` | `/auth/google` | Public | Firebase Google sign-in; creates and signs in new Student identities only |
| **Auth** | `POST` | `/auth/google/register-student` | Public | Explicit Student Google registration (no session issued) |
| **Auth** | `GET` | `/auth/me` | Authenticated | Fetch authenticated user profile |
| **Students** | `GET` | `/students/profile` | Student | Get current student profile |
| **Students** | `PUT` | `/students/profile` | Student | Update student academic & skill details |
| **Students** | `GET` | `/students` | Admin, Recruiter | Filter & search student directory |
| **Drives** | `GET` | `/drives` | Authenticated | List all active placement drives |
| **Drives** | `GET` | `/drives/:id` | Authenticated | Get detailed drive information |
| **Drives** | `POST` | `/drives` | Admin, Recruiter | Create a new campus placement drive |
| **Applications**| `POST` | `/applications` | Student | Apply to a drive (auto eligibility check) |
| **Applications**| `GET` | `/applications/my` | Student | View student's submitted applications |
| **Applications**| `PATCH`| `/applications/:id/status` | Admin, Recruiter | Transition applicant stage |
| **Interviews** | `POST` | `/interviews` | Admin, Recruiter | Schedule interview round & send notification |
| **Resumes** | `POST` | `/resumes/upload` | Student | Upload resume document (PDF/DOCX) |
| **Resumes** | `GET` | `/resumes/view/:studentId` | Authorized | Generate 15-min presigned URL to view resume |
| **Reports** | `GET` | `/reports/export-csv` | Admin | Download NAAC/NBA compliant CSV placement report |
| **Analytics** | `GET` | `/analytics/overview` | Admin | Comprehensive placement metrics & KPIs |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
