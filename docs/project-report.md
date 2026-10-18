# PROJECT REPORT

## CLOUD-BASED COLLEGE PLACEMENT MANAGEMENT SYSTEM (PlaceCloud)

---

### CHAPTER 1: TITLE PAGE & METADATA
- **Project Title**: Cloud-Based College Placement Management System
- **Domain**: Cloud Computing, Full-Stack Web Engineering, Database Systems
- **Platform Architecture**: 3-Tier Cloud Architecture (Client SPA, Containerized REST API, Cloud Database & Object Storage)
- **Primary Cloud Providers**: Amazon Web Services (AWS) & MongoDB Atlas Cloud
- **Core Technology Stack**: React.js, Node.js, Express.js, MongoDB Atlas, AWS S3, Recharts, Jest, Bcrypt, JWT

---

### CHAPTER 2: ABSTRACT
Campus placements represent a critical milestone in higher educational institutions. Traditional placement processes rely heavily on disjointed spreadsheets, manual email chains, and localized paperwork, causing significant operational bottlenecks, data redundancy, and accidental exposure of student personal identifiable information (PII). 

This project presents **PlaceCloud**, an enterprise-grade, cloud-based college placement management system designed to streamline and automate the entire campus recruitment lifecycle. Built on a decoupled three-tier cloud architecture, the system provides tailored role-based portals for **Students**, **College Placement Officers (Admins)**, and **Corporate Recruiters**. Core features include a real-time automated eligibility evaluation engine, zero-public-exposure private resume storage on **Amazon Web Services (AWS) S3** powered by ephemeral 15-minute presigned URLs, multi-round interview scheduling, and live interactive data analytics with one-click NAAC/NBA accreditation CSV reporting.

---

### CHAPTER 3: INTRODUCTION
Higher education institutions face significant challenges coordinating campus placement drives across multiple engineering and science departments. With thousands of student records, dynamic eligibility criteria varying across recruiting partners, and strict accreditation requirements, manual placement management systems are inefficient and prone to severe errors.

The Cloud-Based College Placement Management System leverages the core tenants of cloud computing—scalability, centralized data management, fault tolerance, and ephemeral access security—to provide an integrated web platform. By offloading computational logic to a containerized Node.js application tier and leveraging managed cloud data services (MongoDB Atlas and Amazon S3), the platform eliminates institutional infrastructure overhead while maintaining strict security boundaries.

---

### CHAPTER 4: PROBLEM STATEMENT
The existing conventional campus placement workflow suffers from several critical vulnerabilities:
1. **Manual Eligibility Errors**: Placement cells manually filter spreadsheets to find eligible candidates, frequently miscalculating standing backlogs or department eligibility.
2. **Security & Privacy Risks**: Student resumes containing personal phone numbers, addresses, and academic records are shared over insecure email or unauthenticated shared drives.
3. **Lack of Transparency**: Students have no visibility into their multi-stage recruitment status (Applied, Shortlisted, Interview Scheduled, Selected).
4. **Accreditation Difficulties**: Preparing mandatory departmental placement reports for institutional audits (such as NAAC, NBA, and NIRF) requires weeks of manual reconciliation.

---

### CHAPTER 5: OBJECTIVES
1. Develop a high-availability, responsive cloud web application connecting students, placement officers, and recruiters.
2. Implement a real-time **Automated Eligibility Engine** that mathematically evaluates student CGPA, department, graduation year, and active backlogs against drive thresholds.
3. Guarantee student PII protection by storing resumes in private Amazon S3 buckets accessed solely via time-limited (15-min) presigned URLs.
4. Provide a multi-stage application pipeline preventing duplicate applications through compound unique database indexing.
5. Offer live interactive dashboards with Recharts displaying departmental placement distributions and single-click CSV report exports.

---

### CHAPTER 6: EXISTING SYSTEM VS. PROPOSED SYSTEM

| Feature | Existing Conventional System | Proposed PlaceCloud System |
|---|---|---|
| **Data Storage** | Local Excel spreadsheets & paper files | Managed MongoDB Atlas Replica Set |
| **Eligibility Checking** | Manual human verification | Real-time algorithmic evaluation engine |
| **Resume Security** | Public email attachments / shared links | Private AWS S3 with 15-min presigned URLs |
| **Application Tracking** | Word of mouth / notice board | Real-time stage progression dashboard |
| **Audit Trail** | None | Comprehensive `audit_logs` collection |
| **Accreditation Reports** | Weeks of manual reconciliation | 1-Click instantaneous CSV report generation |

---

### CHAPTER 7: SCOPE OF THE PROJECT
- **In-Scope**: Student registration, academic profile management, company partner onboarding, placement drive configuration, automatic eligibility calculation, single-click application submission, duplicate prevention, multi-round interview scheduling, job offer declaration, in-app notification alerts, department-wise analytics, and AWS S3 resume handling.
- **Out-of-Scope**: Integrated video call streaming engine (delegated to standard enterprise tools like Google Meet and Microsoft Teams via secure meeting URLs).

---

### CHAPTER 8: FUNCTIONAL REQUIREMENTS
1. **User Authentication & RBAC**: Secure JWT-based authentication with bcrypt password hashing (10 salt rounds) and role-guarded routes (`student`, `admin`, `recruiter`).
2. **Student Profile Module**: Maintenance of CGPA, active backlogs, technical skills, certifications, projects, and S3 resume uploads.
3. **Drive Management**: Creation of placement drives with configurable eligibility rules, packages, selection rounds, and deadlines.
4. **Eligibility Engine**: Algorithmic comparison returning boolean status and detailed feedback reasons for ineligibility.
5. **Application Pipeline**: Stage-by-stage status updating (`applied` → `shortlisted` → `interview_scheduled` → `selected` → `rejected`).
6. **Reporting & Analytics**: Calculation of true institutional placement percentage `(Unique Placed / Total Students) * 100` and streaming CSV generation.

---

### CHAPTER 9: NON-FUNCTIONAL REQUIREMENTS
- **Security**: Zero plain text credentials; encrypted S3 objects; HTTP security headers via `helmet`; API rate limiting.
- **Availability**: High availability guaranteed by MongoDB Atlas multi-AZ automated replica sets and containerized API instances.
- **Performance**: Sub-100ms API response times for indexed queries; client-side bundle under 250kB gzipped.
- **Maintainability**: Decoupled MVC architecture with centralized error handling and automated unit/integration test coverage.

---

### CHAPTER 10: HARDWARE & SOFTWARE REQUIREMENTS
- **Development Hardware**: Modern multi-core CPU (x86_64 or ARM64), 8GB RAM, 10GB disk space.
- **Client Software**: Modern HTML5 browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).
- **Backend Runtime**: Node.js v20+ with npm.
- **Cloud Database**: MongoDB Atlas (v7.0+ compatible).
- **Cloud Storage**: Amazon Web Services (AWS) S3 bucket.

---

### CHAPTER 11: CLOUD COMPUTING CONCEPTS IMPLEMENTED
1. **Software as a Service (SaaS)**: A fully turnkey web application accessible from any internet-connected device.
2. **Platform as a Service (PaaS)**: AWS App Runner and AWS Amplify abstracting virtual machine provisioning and OS patching.
3. **Cloud Object Storage**: S3 storing unstructured binary objects (resumes) independently of relational/document databases.
4. **Ephemeral Access Delegation**: AWS S3 Presigned URLs granting temporary, cryptographically signed read permissions without exposing AWS root credentials.
5. **Database as a Service (DBaaS)**: MongoDB Atlas automated clustering, automated patching, and continuous backups.

---

### CHAPTER 12: SYSTEM ARCHITECTURE & DATA FLOW
*(Detailed Mermaid architecture diagrams included in docs/architecture.md)*

---

### CHAPTER 13: DATABASE DESIGN & ER DIAGRAM
The schema enforces referential integrity across 10 collections: `users`, `student_profiles`, `companies`, `recruiter_profiles`, `placement_drives`, `applications`, `interview_schedules`, `placement_results`, `notifications`, and `audit_logs`.
Compound Unique Index: `{ placementDriveId: 1, studentId: 1 }` prevents duplicate submissions.

---

### CHAPTER 14: IMPLEMENTATION & SECURITY DETAILS
- **Password Protection**: Passwords salted and hashed with `bcryptjs` before persisting.
- **Rate Limiting**: `express-rate-limit` prevents brute force password guessing attacks.
- **CORS Whitelist**: Strict cross-origin policy allowing only verified frontend origins.
- **File Upload Security**: Multer in-memory storage rejecting non-PDF/DOCX extensions and files exceeding 5MB.

---

### CHAPTER 15: TESTING & VERIFICATION
The project incorporates 40 automated integration test cases executed across 5 Jest test suites:
- `auth.test.js`: 8 tests (Registration, hashing, JWT, duplicate checks)
- `student.test.js`: 9 tests (Profile CRUD, RBAC cross-access prevention)
- `drive_application.test.js`: 8 tests (Drive creation, eligibility checks, duplicate prevention)
- `analytics_interview.test.js`: 8 tests (Interview scheduling, offer declaration, analytics pipelines, CSV export)
- `resume.test.js`: 7 tests (S3 upload buffer, presigned URL generation, unauthorized resume access blocks)
**Result**: 100% test pass rate (40/40 passed).

---

### CHAPTER 16: CONCLUSION & FUTURE SCOPE
PlaceCloud successfully addresses the structural deficiencies of collegiate placement workflows by combining modern web technologies with cloud-native infrastructure.

**Future Enhancements**:
1. AI-powered resume parser extracting candidate skills automatically using LLMs.
2. WhatsApp and SMS webhook integration for instantaneous interview reminder notifications.
3. Machine learning recommendation engine suggesting placement drives based on student GitHub profiles.
