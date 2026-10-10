# System Architecture: Cloud-Based College Placement Management System

## 1. System Overview

The **Cloud-Based College Placement Management System** is an enterprise-grade academic platform designed to automate and streamline the campus recruitment lifecycle. It connects three primary stakeholders:
- **Students**: Manage profiles, upload resumes, verify job eligibility automatically, apply for placement drives, and track multi-round interview progress.
- **Placement Officers (Admin)**: Oversee student eligibility, onboard companies, schedule placement drives, track college-wide placement statistics, and export accreditation-ready reports (NBA/NAAC).
- **Recruiters**: Manage company job openings, filter eligible candidate pools, review authenticated student resumes, schedule selection rounds, and declare final hiring outcomes.

---

## 2. High-Level Cloud Architecture Diagram

```mermaid
flowchart TB
    subgraph ClientLayer ["Client Presentation Tier"]
        StudentDevice["Student Browser (Desktop/Mobile)"]
        AdminDevice["Placement Officer Portal"]
        RecruiterDevice["Recruiter Dashboard"]
    end

    subgraph CloudHosting ["AWS Cloud Infrastructure"]
        subgraph FrontendHosting ["AWS Amplify / CloudFront + S3"]
            ReactApp["Vite + React.js SPA\n(HTML5, CSS3, Recharts, Axios)"]
        end

        subgraph BackendHosting ["AWS App Runner / Containerized API"]
            ExpressAPI["Node.js & Express.js REST API Server\n- JWT Auth & RBAC Middleware\n- Eligibility Engine\n- Resume Presigned URL Service\n- Analytics & Report Service"]
        end

        subgraph StorageLayer ["Cloud Storage & Database Tier"]
            S3Bucket[("Amazon S3 Private Bucket\n- Resumes & Documents\n- AES-256 SSE\n- Block Public Access: ON")]
            MongoAtlas[("MongoDB Atlas Cloud\n- M0/M10 Replica Set Cluster\n- TLS 1.3 In-Flight Encryption\n- Automated Backups")]
        end

        subgraph SecurityLayer ["Security & Monitoring"]
            IAM["AWS IAM Role / Policy\n(Least-Privilege S3 Access)"]
            CloudWatch["Amazon CloudWatch\n(API Access & Error Logs)"]
        end
    end

    StudentDevice -->|HTTPS / TLS| ReactApp
    AdminDevice -->|HTTPS / TLS| ReactApp
    RecruiterDevice -->|HTTPS / TLS| ReactApp

    ReactApp -->|REST API over HTTPS (Bearer JWT)| ExpressAPI
    ExpressAPI -->|Mongoose over TLS (SRV)| MongoAtlas
    ExpressAPI -->|AWS SDK v3 (PutObject / GetObject)| S3Bucket
    ExpressAPI -.->|Generate 15-min Presigned URL| S3Bucket
    ReactApp -.->|Secure Direct View / Download via Presigned URL| S3Bucket

    ExpressAPI --> CloudWatch
    IAM -.-> ExpressAPI
```

---

## 3. Tier-by-Tier Architectural Breakdown

### 3.1 Client Tier (Frontend)
- **Technology**: React 18, Vite, React Router v6, Axios, Recharts, Lucide Icons, Modern responsive CSS.
- **Responsibilities**:
  - Client-side routing with role-guarded routes (`StudentRoute`, `AdminRoute`, `RecruiterRoute`).
  - State management for authenticated user sessions, auth tokens, and active profile data.
  - Interactive dashboards, charts, filtering, search, and dynamic forms with validation.
  - Handling resume upload to the backend and opening presigned S3 URLs in a secure sandboxed viewer.

### 3.2 Application Tier (Backend REST API)
- **Technology**: Node.js v20+, Express.js 4.x, `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, Mongoose 8.x, JWT (`jsonwebtoken`), `bcryptjs`, `cors`, `helmet`, `express-rate-limit`.
- **Responsibilities**:
  - Stateless RESTful endpoints following standard HTTP methods (`GET`, `POST`, `PUT`, `DELETE`).
  - Centralized authentication middleware verifying JWT signatures and role claims.
  - **Eligibility Evaluation Engine**: Real-time algorithmic comparison of student CGPA, department, graduation year, and active backlogs against drive criteria.
  - S3 Object lifecycle management: Uploading buffers to private S3 bucket and minting time-limited presigned URLs (15 minutes expiry) for authorized readers.
  - Role-Based Access Control (RBAC): Guaranteeing students only access their own profile/applications, recruiters access only their company's applicants, and admins access college-wide data.

### 3.3 Database & Cloud Storage Tier
- **MongoDB Atlas**:
  - Managed multi-zone replica set guaranteeing high availability and automated disaster recovery.
  - Data encryption at rest and in transit (TLS 1.2+).
  - High-performance indexing for rapid candidate searching and aggregation pipelines for analytics.
- **Amazon Web Services (AWS) S3**:
  - Dedicated private S3 bucket (`college-placement-resumes-prod`) with `Block Public Access` strictly enabled.
  - Server-Side Encryption with Amazon S3 managed keys (`SSE-S3` / AES-256).
  - Files are addressed via nonces/UUID keys to prevent path traversal and object enumeration attacks.

---

## 4. Security Architecture

1. **Authentication**:
   - Passwords salted and hashed with `bcryptjs` (work factor 10). Plain text passwords are never stored or logged.
   - Access tokens signed with HMAC-SHA256 containing `userId`, `role`, and expiration (e.g., 24h).
2. **Access Control (RBAC)**:
   - Every protected API route enforces `authenticateToken` followed by role verification (`requireRole(['admin', 'recruiter'])`).
3. **Resume Protection**:
   - Resumes are NEVER stored in public S3 buckets or public web directories.
   - When a recruiter or placement officer requests a resume, the backend checks authorization before generating an ephemeral S3 Presigned URL that expires in 900 seconds (15 minutes).
4. **Network & Perimeter Defense**:
   - `helmet` secures HTTP headers (HSTS, X-Content-Type-Options, Frameguard).
   - `cors` whitelist restricts API invocation strictly to verified client origins.
   - `express-rate-limit` prevents brute-force attempts on login and registration endpoints.
