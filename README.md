# Cloud-Based College Placement Management System (PlaceCloud)

A comprehensive, cloud-native campus placement automation platform bridging students, college placement training & placement cells (TPO), and corporate recruiters.

---

## 🌟 Key Features

- **Role-Based Portals**: Tailored interfaces and RBAC security for **Students**, **College Placement Officers (Admin)**, and **Company Recruiters**.
- **Real-Time Automated Eligibility Engine**: Automatically checks students against drive parameters (CGPA, allowed branches, graduation passout year, active backlogs) and displays granular eligibility feedback.
- **One-Click Application Tracking**: Students apply to eligible drives, preventing duplicate submissions, and track stage progression (`Applied` → `Shortlisted` → `Interview Scheduled` → `Selected`).
- **Private Cloud Object Storage (Amazon S3)**: Resumes are stored privately in Amazon S3 (with fallback to local sandboxed storage in offline dev mode) and delivered via short-lived AWS presigned URLs (15-min expiry).
- **Placement Analytics & Reports**: Live interactive dashboards with Recharts displaying department-wise placement metrics, company hiring distributions, and one-click NAAC/NBA compliance CSV export.
- **Auditing & Notification Pipeline**: Instant in-app alerts on interview schedule updates, selection results, and administrative audit logging.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies & Cloud Services |
|---|---|
| **Client / Frontend** | React.js 18, Vite, React Router v6, Recharts, Lucide Icons, Responsive CSS3 |
| **Server / Backend** | Node.js 20+, Express.js 4.x, Multer, Helmet, Rate-Limit, Morgan |
| **Cloud Database** | MongoDB Atlas (Multi-AZ Replica Set, TLS encrypted) |
| **Cloud Storage** | Amazon Web Services (AWS) S3 (Private Bucket + Presigned URLs) |
| **Authentication** | JWT (JSON Web Tokens) + Bcrypt Password Hashing (Salt 10) |
| **Testing** | Jest, Supertest, Postman Collection |
| **Cloud Deployment** | AWS Amplify (Frontend) + AWS App Runner / Container (Backend) |

---

## 📁 Repository Directory Structure

```text
college-placement-management/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, AWS S3, and environment configs
│   │   ├── controllers/     # Request handlers (auth, student, drive, etc.)
│   │   ├── middleware/      # JWT auth, RBAC, error handling, rate limiting
│   │   ├── models/          # Mongoose database schemas & validation
│   │   ├── routes/          # Express route definitions (/api/v1/*)
│   │   ├── services/        # Eligibility engine, S3 service, analytics
│   │   ├── utils/           # Token generators, responses, CSV helpers
│   │   ├── app.js           # Express app pipeline & middleware setup
│   │   └── server.js        # Server listener and database connector
│   ├── tests/               # Automated unit & integration tests
│   ├── scripts/             # Database seed scripts with demo data
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI (Navbar, Sidebar, Modals, Cards)
│   │   ├── pages/           # Pages (Landing, Dashboards, Drives, Profiles, etc.)
│   │   ├── layouts/         # Role-based dashboard layouts
│   │   ├── services/        # Axios API client modules
│   │   ├── hooks/           # Custom React hooks (useAuth, useFetch)
│   │   ├── utils/           # Formatters, status helpers, date utils
│   │   ├── styles/          # Global CSS, variables, themes
│   │   ├── App.jsx          # Route declarations & auth guards
│   │   └── main.jsx         # React DOM mounting
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
├── docs/
│   ├── architecture.md      # Detailed cloud system architecture
│   ├── database-design.md   # Schemas, ER diagrams, indexes
│   ├── api-documentation.md # API endpoint specifications
│   └── deployment-guide.md  # Step-by-step AWS & Atlas deployment guide
├── .gitignore
└── README.md
```

---

## 🚀 Quickstart & Local Setup Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (Installed: `v24.13.0`)
- **npm**: v9.0.0 or higher
- **MongoDB**: MongoDB Atlas URI (or local MongoDB running on `mongodb://127.0.0.1:27017/placement_db`)
- **Git**: Installed for version control

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB Atlas connection string and JWT secret

# Seed database with realistic demonstration data (Admins, Recruiters, Students, Drives)
npm run seed

# Run in development mode
npm run dev
# Backend API will be active at http://localhost:5000
```

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
# Access the web application at http://localhost:5173
```
