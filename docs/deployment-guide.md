# Cloud Deployment Guide: AWS & MongoDB Atlas

This guide provides step-by-step instructions for deploying the **Cloud-Based College Placement Management System (PlaceCloud)** to production cloud infrastructure using **AWS Amplify**, **AWS App Runner**, **Amazon S3**, and **MongoDB Atlas**.

---

## 1. Cloud Infrastructure Architecture

```mermaid
flowchart LR
    A["Client Browser"] -->|HTTPS (TLS 1.3)| B["AWS Amplify (React SPA)"]
    B -->|REST API over TLS (Bearer JWT)| C["AWS App Runner (Node.js API)"]
    C -->|Mongoose TLS SRV| D[("MongoDB Atlas (M0/M10)")]
    C -->|AWS SDK v3 PutObject / GetObject| E[("Amazon S3 (Private Bucket)")]
    C -.->|15-Minute Presigned URL| A
    A -.->|Download Resume Directly| E
```

---

## 2. Step 1: Provisioning MongoDB Atlas Cloud Database

### 2.1 Create Free Tier Cluster
1. Log in to [MongoDB Atlas Console](https://cloud.mongodb.com/).
2. Click **Create** to launch a new database cluster.
3. Select **M0 Free Cluster** (Shared Tier - 512MB storage, free forever).
4. Cloud Provider & Region: Choose **AWS** and the region nearest to your audience (e.g., `us-east-1` N. Virginia or `ap-south-1` Mumbai).
5. Cluster Name: `PlacementCluster` -> Click **Create Cluster**.

### 2.2 Create Database User (Least Privilege)
1. In the Atlas sidebar, navigate to **Security** → **Database Access**.
2. Click **Add New Database User**.
3. Authentication Method: **Password**.
4. Username: `placement_admin`
5. Password: Click **Autogenerate Secure Password** or set a strong passphrase (e.g. `AtlasSecurePass2026!`). Store this securely.
6. Database User Privileges: Select **Read and write to any database**.
7. Click **Add User**.

### 2.3 Configure Network Whitelist
1. In the Atlas sidebar, navigate to **Security** → **Network Access**.
2. Click **Add IP Address**.
3. Select **Allow Access from Anywhere** (`0.0.0.0/0`) since cloud compute instances (AWS App Runner) use dynamic egress IP addresses.
4. Click **Confirm**.

### 2.4 Obtain the Connection String
1. Go to **Database** → Click **Connect** on `PlacementCluster`.
2. Choose **Drivers** (Node.js, Version 5.5 or later).
3. Copy the SRV connection URI:
   ```text
   mongodb+srv://placement_admin:<password>@placementcluster.xxxxx.mongodb.net/placement_db?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your database user password.

---

## 3. Step 2: Provisioning Amazon S3 for Private Resume Storage

> [!IMPORTANT]
> Student resumes contain confidential PII. Resumes must NEVER be stored in public buckets.

### 3.1 Create Private S3 Bucket
1. Open the [AWS Management Console](https://console.aws.amazon.com/s3/).
2. Click **Create bucket**.
3. Bucket name: `college-placement-resumes-prod-XXXX` (bucket names must be globally unique).
4. AWS Region: Select your primary region (e.g., `us-east-1`).
5. **Block Public Access settings for this bucket**:
   - Check **Block *all* public access** (Keep this strictly ENABLED).
6. **Bucket Versioning**: Enabled (Recommended for document history).
7. **Default Encryption**:
   - Encryption type: **Server-side encryption with Amazon S3 managed keys (SSE-S3)**.
8. Click **Create bucket**.

### 3.2 Configure S3 CORS Configuration
To allow client browsers to view presigned URLs without CORS blockage:
1. Open your created bucket -> Go to the **Permissions** tab.
2. Scroll to **Cross-origin resource sharing (CORS)** -> Click **Edit**.
3. Paste the following configuration:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "HEAD"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```
4. Click **Save changes**.

---

## 4. Step 3: Configuring AWS IAM User & Least-Privilege Policy

### 4.1 Create Least-Privilege IAM Policy
1. Navigate to **IAM** → **Policies** → Click **Create policy**.
2. Select the **JSON** tab and enter:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PlacementResumeBucketAccess",
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject"
         ],
         "Resource": "arn:aws:s3:::college-placement-resumes-prod-XXXX/resumes/*"
       }
     ]
   }
   ```
3. Policy Name: `CollegePlacementS3AccessPolicy` -> Click **Create policy**.

### 4.2 Create IAM Service User & Access Keys
1. Go to **IAM** → **Users** → Click **Create user**.
2. Username: `placement-app-service`.
3. Do NOT grant AWS Management Console access.
4. Set Permissions: Choose **Attach policies directly** -> Select `CollegePlacementS3AccessPolicy`.
5. Finish creation, open the user, navigate to the **Security credentials** tab.
6. Click **Create access key** -> Select **Application running outside AWS** (or on container).
7. Save the **Access Key ID** and **Secret Access Key** securely.

---

## 5. Step 4: Backend Deployment to AWS App Runner

AWS App Runner provides fully managed, containerized compute with automatic HTTPS and zero infrastructure overhead.

### 5.1 Prepare Containerization
Create a `backend/Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
ENV NODE_ENV=production
CMD ["node", "src/server.js"]
```

### 5.2 Deploy via AWS App Runner Console
1. Navigate to [AWS App Runner](https://console.aws.amazon.com/apprunner/).
2. Click **Create service**.
3. Source: **Source code repository** (Connect your GitHub repo: branch `master`, folder `/backend`).
4. Build settings: **Configure all settings here**.
   - Runtime: `Node.js 20`
   - Build command: `npm install --production`
   - Start command: `node src/server.js`
   - Port: `5000`
5. Configure Environment Variables:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `MONGODB_URI` | `mongodb+srv://placement_admin:...@...mongodb.net/placement_db` |
   | `JWT_SECRET` | `<cryptographically_secure_random_string_64_chars>` |
   | `JWT_EXPIRES_IN` | `24h` |
   | `AWS_REGION` | `us-east-1` |
   | `AWS_ACCESS_KEY_ID` | `<your_iam_access_key>` |
   | `AWS_SECRET_ACCESS_KEY` | `<your_iam_secret_key>` |
   | `AWS_S3_BUCKET_NAME` | `college-placement-resumes-prod-XXXX` |
   | `FRONTEND_URL` | `https://main.xxxxxxxx.amplifyapp.com` |
6. Health Check: Path: `/api/v1/health`, Interval: `10`, Timeout: `5`.
7. Click **Create & Deploy**.
8. Note the generated App Runner Service URL (e.g. `https://xyzabc.us-east-1.awsapprunner.com`).

---

## 6. Step 5: Frontend Deployment to AWS Amplify

### 6.1 Connect Repository & Build
1. Open [AWS Amplify Console](https://console.aws.amazon.com/amplify/).
2. Click **New app** → **Host web app**.
3. Select **GitHub** -> Authorize and select your repository.
4. Select branch: `master`.
5. Monorepo setting: Check **Connecting a monorepo** -> Enter `frontend`.
6. Amplify Build Settings (`amplify.yml`):
   ```yaml
   version: 1
   applications:
     - frontend:
         phases:
           preBuild:
             commands:
               - npm ci
           build:
             commands:
               - npm run build
         artifacts:
           baseDirectory: dist
           files:
             - '**/*'
         cache:
           paths:
             - node_modules/**/*
   ```
7. Configure Environment Variables:
   - `VITE_API_BASE_URL`: `https://xyzabc.us-east-1.awsapprunner.com`
8. Click **Save and deploy**.

### 6.2 Configure SPA URL Rewrites
To ensure React Router routes work on browser refresh:
1. In Amplify sidebar, navigate to **Rewrites and redirects**.
2. Click **Edit** and ensure a rule exists:
   - Source: `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>`
   - Target: `/index.html`
   - Status: `200 (Rewrite)`
3. Save changes.

---

## 7. Step 6: Post-Deployment Verification Checklist

1. [ ] Navigate to the AWS Amplify URL: Verify landing page loads over HTTPS.
2. [ ] Test `/api/v1/health` on App Runner: Confirm `status: "healthy"`.
3. [ ] Log in with seeded admin credentials: Confirm JWT is stored in `localStorage`.
4. [ ] Upload a test resume PDF as a student: Confirm S3 object is created in bucket `college-placement-resumes-prod-XXXX`.
5. [ ] Click "View S3 Link": Confirm presigned URL generates and opens document.
6. [ ] Apply for a drive: Verify duplicate check and eligibility engine enforcement.
7. [ ] Export placement report CSV from Admin dashboard: Confirm CSV downloads with headers.

---

## 8. Step 7: Cloud Resource Cleanup (Zero Cost Assurance)

When demonstrations or grading are concluded, tear down resources to prevent unwanted billing:
1. **AWS App Runner**: Click **Actions** → **Pause** (stops compute charges) or **Delete service**.
2. **Amazon S3**: Open bucket -> Click **Empty** (delete all objects) -> Click **Delete bucket**.
3. **AWS IAM**: Delete `placement-app-service` access keys and user.
4. **AWS Amplify**: Click **App actions** → **Delete app**.
5. **MongoDB Atlas**: If not needed, terminate the M0 cluster or leave it active (M0 tier is 100% free forever).
