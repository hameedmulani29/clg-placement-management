# Comprehensive Viva Voce Questions & Answers

This document contains 25 in-depth technical questions and answers designed to prepare candidates for university project vivas, external examiner evaluations, and technical defenses.

---

### Q1: What is the high-level architecture of your project?
**Answer**:
Our application uses a decoupled **3-Tier Cloud Architecture**:
1. **Presentation Tier**: A responsive React.js (v18) Single Page Application (SPA) built with Vite and Recharts, hosted statically in the cloud via AWS Amplify or Amazon S3 with CloudFront CDN.
2. **Application Tier**: A stateless Node.js & Express.js REST API server containerized with Docker and hosted on AWS App Runner. It enforces JWT authentication, RBAC authorization, rate limiting, and runs the real-time Automated Eligibility Engine.
3. **Data & Storage Tier**: 
   - **MongoDB Atlas**: Managed multi-AZ replica set cloud database storing relational and document records with TLS 1.3 encryption.
   - **Amazon S3**: Private object storage bucket configured with Server-Side Encryption (SSE-S3 / AES-256) storing student resumes, accessed strictly via 15-minute presigned URLs.

---

### Q2: Why did you choose Amazon S3 instead of storing resumes directly inside MongoDB or on the web server disk?
**Answer**:
1. **Database Bloat**: Storing large binary files (PDFs/DOCX up to 5MB) inside MongoDB using BSON or GridFS causes severe database cache churn and degrades indexing performance for structured queries.
2. **Stateless Web Server**: Cloud containers on AWS App Runner are ephemeral; any files saved to local disk would disappear whenever the container scales or restarts.
3. **Dedicated Object Storage**: Amazon S3 is specifically designed for 99.999999999% (11 9's) data durability, highly cost-efficient storage, and provides built-in server-side encryption without taxing application RAM.

---

### Q3: What is an Amazon S3 Presigned URL and how does it protect student privacy?
**Answer**:
An S3 Presigned URL is a time-limited, cryptographically signed URL generated using the AWS SDK using AWS IAM credentials. 
Instead of making the S3 bucket public (which is a severe security vulnerability that leaks student phone numbers and addresses), our bucket has **Block Public Access** permanently enabled. When an authorized recruiter or administrator requests a resume, our backend verifies permissions and mints an ephemeral URL that is valid for strictly **15 minutes (900 seconds)**. After 15 minutes, the cryptographic signature expires and the link becomes invalid, preventing unauthorized links from being forwarded or scraped.

---

### Q4: How does your system prevent duplicate applications for the same placement drive?
**Answer**:
Duplicate prevention is enforced at two distinct levels:
1. **Application-Level Check**: Before creating an application record, the controller queries `Application.findOne({ placementDriveId, studentId })`. If an existing application exists, the server returns an HTTP 409 Conflict error.
2. **Database-Level Compound Unique Index**: We defined a compound unique index in Mongoose on the `Application` schema:
   ```javascript
   applicationSchema.index({ placementDriveId: 1, studentId: 1 }, { unique: true });
   ```
   Even if two concurrent requests bypass the server check simultaneously, MongoDB's storage engine enforces uniqueness at the database level and throws a duplicate key error (code 11000), which our centralized error middleware translates into a clean user notification.

---

### Q5: How does the Automated Eligibility Engine work?
**Answer**:
The eligibility engine (`eligibilityService.js`) evaluates four primary academic parameters:
1. **CGPA Check**: Compares `studentProfile.cgpa >= placementDrive.eligibilityCriteria.minCgpa`.
2. **Department Filter**: Verifies `placementDrive.eligibilityCriteria.allowedDepartments.includes(studentProfile.department)`.
3. **Graduation Year**: Matches `studentProfile.graduationYear === placementDrive.eligibilityCriteria.graduationYear`.
4. **Active Backlogs**: Verifies `studentProfile.activeBacklogs <= placementDrive.eligibilityCriteria.maxBacklogs`.
5. **Deadline Verification**: Ensures `currentDate <= applicationDeadline`.

If any criterion fails, the engine appends a descriptive human-readable reason to an array and flags `isEligible: false`. Crucially, this check is executed in real-time on the backend when an application is posted, ensuring users cannot bypass frontend UI controls.

---

### Q6: How do you calculate the "Placement Percentage" accurately?
**Answer**:
In many basic systems, placement percentage is erroneously calculated by dividing total applications by total students, resulting in misleading figures over 100% when students receive multiple offers.
In PlaceCloud, the calculation is mathematically accurate:
$$\text{Placement Rate} = \left(\frac{\text{Unique Students with Selected Status}}{\text{Total Registered Student Population}}\right) \times 100$$
Using MongoDB aggregation:
```javascript
const distinctSelected = await Application.distinct('studentId', { status: 'selected' });
const placementRate = (distinctSelected.length / totalStudents) * 100;
```

---

### Q7: Explain your authentication and password security implementation.
**Answer**:
1. **Hashing**: Passwords are never stored in plain text. We use `bcryptjs` with 10 salt rounds inside a Mongoose `pre('save')` hook.
2. **JWT Tokens**: Upon successful login, the server issues a JSON Web Token signed with HMAC-SHA256 containing `{ id, email, role }` and an expiration time of 24 hours.
3. **Payload Sanitization**: The `User` schema configures `password: { select: false }` and overrides `.toJSON()` to guarantee password hashes are never leaked in API responses.
4. **Rate Limiting**: `express-rate-limit` throttles brute force login attempts to 50 requests per 15 minutes per IP address.

---

### Q8: What is Role-Based Access Control (RBAC) and how is it implemented?
**Answer**:
RBAC restricts API endpoints based on the caller's verified role (`student`, `admin`, `recruiter`).
In our Express backend, we built modular middleware:
- `authenticateToken`: Validates the Bearer JWT and attaches `req.user` to the request.
- `authorizeRoles(...roles)`: Verifies if `roles.includes(req.user.role)`. If not, it halts the request with an HTTP 403 Forbidden status code.
For example, only `admin` can access `/api/v1/companies` (POST) and `/api/v1/reports/export-csv`, while only `student` can call `/api/v1/applications` (POST).

---

### Q9: Can a student view another student's profile or resume?
**Answer**:
No. Security checks are enforced in both `studentController.js` and `resumeController.js`:
If `req.user.role === 'student'`, the backend checks:
```javascript
if (studentProfile.userId.toString() !== req.user._id.toString()) {
  return errorResponse(res, 403, 'Forbidden: You cannot access another student’s confidential records.');
}
```
Similarly, recruiters can only view resumes of students who have actively submitted an application to their specific company's drives.

---

### Q10: How does your frontend communicate with the backend in development and production?
**Answer**:
- **In Development**: Vite runs on port 5173 and uses a reverse proxy configuration in `vite.config.js` to route all `/api` and `/uploads` requests to the Express backend running on `http://localhost:5000`, completely avoiding CORS issues locally.
- **In Production**: The frontend is built into static assets (`dist/`) and configured with the cloud environment variable `VITE_API_BASE_URL` pointing to the AWS App Runner HTTPS URL. The Express server uses `cors()` with a whitelist allowing only the production frontend origin.

---

### Q11: How do you handle file uploads in Express?
**Answer**:
We use `multer` with `memoryStorage()`. When a student uploads a resume, Multer buffers the file in memory rather than saving it to local disk.
Before accepting the file, `fileFilter` verifies:
1. File extension must be `.pdf`, `.doc`, or `.docx`.
2. MIME type must match `application/pdf` or Microsoft Word MIME types.
3. File size is capped at 5MB (`limits: { fileSize: 5 * 1024 * 1024 }`).
The in-memory buffer is then streamed directly to Amazon S3 via `@aws-sdk/client-s3` using the `PutObjectCommand`.

---

### Q12: What happens if an AWS account or S3 bucket is unavailable during local development or evaluation?
**Answer**:
We designed an automatic **Graceful Fallback Storage Engine** in `s3Service.js`:
The service checks `isS3Configured`. If AWS credentials are not set in `.env`, the system automatically falls back to saving files inside a secure, sandboxed local directory `backend/uploads/resumes/`. It returns a local URL while preserving the exact same API contract. When deployed to AWS with credentials, it automatically transitions to true cloud S3 storage without changing any controller code.

---

### Q13: What testing methodologies did you implement?
**Answer**:
We implemented automated integration testing using **Jest** and **Supertest** targeting a dedicated test database (`placement_test_db`).
We wrote 40 automated test cases across 5 test suites covering:
1. User registration, bcrypt hashing, JWT issuance, and invalid credentials.
2. Profile updates and cross-student access blocking.
3. Automated eligibility verification on drives.
4. Duplicate application rejection.
5. Recruiter interview scheduling and offer publication.
6. Admin summary analytics and CSV export streaming.
7. S3 resume buffer uploads and presigned URL access authorization.
All 40 tests execute in sequence and pass with 100% success.

---

### Q14: How does your system export reports for NAAC / NBA accreditation?
**Answer**:
In `reportController.js`, the `exportPlacementReportCSV` endpoint queries the `PlacementResult` collection, populating student roll numbers, departments, CGPA, hiring companies, and offered CTCs.
The controller formats the data into compliant RFC 4180 CSV rows, escapes special characters, and streams the response with HTTP headers:
- `Content-Type: text/csv`
- `Content-Disposition: attachment; filename="Placement_Report_YYYY-MM-DD.csv"`
This allows placement officers to download full spreadsheets instantaneously for institutional audits.

---

### Q15: What cloud computing service models are demonstrated in this project?
**Answer**:
1. **SaaS (Software as a Service)**: End-users (students, recruiters, TPOs) access the full placement portal directly via a web browser without installing local software.
2. **PaaS (Platform as a Service)**: AWS App Runner executes our backend application container, and AWS Amplify hosts the frontend static bundle without requiring manual Linux server administration.
3. **DBaaS (Database as a Service)**: MongoDB Atlas manages our database cluster, providing automated patching, scaling, and backups.
4. **Cloud Storage**: Amazon S3 provides highly durable cloud object storage.

---

### Q16: How do you handle database errors and validation errors uniformly?
**Answer**:
We implemented a centralized error middleware (`errorHandler.js`):
- Mongoose `ValidationError`: Extracts all failing fields and returns an HTTP 400 Bad Request with an array of specific error messages.
- Mongoose `CastError`: Catches invalid MongoDB ObjectIds and returns an HTTP 400.
- MongoDB code `11000` (Duplicate Key): Identifies the duplicated field (e.g. Email or Roll Number) and returns an HTTP 409 Conflict.
- Unhandled 500 errors: Logs the error internally and returns a sanitized JSON message, concealing stack traces in production.

---

### Q17: What is the purpose of the `AuditLog` collection?
**Answer**:
In college placement systems, changes to student CGPAs, application statuses, and drive creation must be accountable. The `AuditLog` model tracks:
`{ action, performedBy, targetEntity, targetEntityId, changes, ipAddress, createdAt }`.
Whenever an administrator modifies a student's academic record or a recruiter updates an offer, an audit record is permanently written to the database for administrative accountability.

---

### Q18: What are Mongoose Virtuals and did you use any?
**Answer**:
Mongoose virtuals are document properties that can be read and set but are not persisted to MongoDB. In `StudentProfile.js`, we defined a virtual `fullName`:
```javascript
studentProfileSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});
```
This avoids duplicating full names in the database while allowing frontend components to consume `fullName` cleanly.

---

### Q19: Why did you use Recharts on the frontend?
**Answer**:
Recharts is a declarative charting library built specifically for React on top of SVG and D3.js. It supports responsive containers (`<ResponsiveContainer>`), animated transitions, custom tooltips, and seamless state-driven updates without direct DOM manipulation, making it ideal for rendering live departmental placement distributions.

---

### Q20: How are in-app notifications generated?
**Answer**:
The system incorporates an automated notification engine. Whenever an event occurs (e.g., student applies to a drive, recruiter updates status to Shortlisted, interview is scheduled, or job offer is declared), the backend automatically inserts a document into the `Notification` collection linked to the student's `userId`. The frontend Navbar polls or fetches unread notifications and displays an alert badge with an unread counter.

---

### Q21: What is the significance of the `helmet` package in your backend?
**Answer**:
`helmet` is a security middleware that sets sensible HTTP response headers:
- `X-DNS-Prefetch-Control`
- `X-Frame-Options` (prevents clickjacking by disabling unauthorized iframes)
- `Strict-Transport-Security` (enforces HTTPS)
- `X-Content-Type-Options: nosniff` (prevents MIME type sniffing)

---

### Q22: What happens if a student has active backlogs?
**Answer**:
The student profile maintains an `activeBacklogs` integer field verified by the placement office. When a student views or applies for a placement drive, the eligibility engine compares `student.activeBacklogs <= drive.eligibilityCriteria.maxBacklogs`. If the drive specifies `maxBacklogs: 0` and the student has 1 or more, the application button is disabled, the badge flags `NOT ELIGIBLE`, and the exact backlog count is cited as the reason.

---

### Q23: How would your application scale under high traffic on placement day?
**Answer**:
1. **Stateless API Tier**: Because the backend does not store session state in memory (all auth is in JWTs), multiple App Runner container instances can run concurrently behind an AWS Application Load Balancer.
2. **Database Connection Pooling**: Mongoose maintains an active connection pool to MongoDB Atlas, reusing sockets efficiently.
3. **Database Indexing**: Critical lookup fields (`email`, `collegeId`, `placementDriveId`, `studentId`, `status`) have B-tree indexes, ensuring $O(\log N)$ query execution time.
4. **CDN Caching**: Static frontend assets are cached globally across CloudFront edge locations.

---

### Q24: How would you clean up cloud resources after project demonstration to incur zero charges?
**Answer**:
1. **AWS App Runner**: Pause or delete the service (halts all compute billing).
2. **Amazon S3**: Empty the bucket objects and delete the bucket.
3. **AWS IAM**: Deactivate the access keys.
4. **AWS Amplify**: Delete the web app.
5. **MongoDB Atlas**: Retain the M0 cluster (M0 is permanently free) or terminate it if no longer needed.

---

### Q25: What are the primary advantages and future enhancements of your system?
**Answer**:
- **Advantages**: Complete paperless workflow, instantaneous eligibility verification, ironclad PII resume protection via S3 presigned URLs, zero duplicate submissions, and real-time accreditation metrics.
- **Future Enhancements**:
  1. AI-powered resume parser extracting candidate skill tags automatically using LLMs.
  2. Direct WhatsApp/SMS push notifications via Twilio webhooks.
  3. Machine learning recommendation engine suggesting placement drives based on student GitHub repositories.
