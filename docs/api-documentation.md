# REST API Specification & Endpoints Contract

All endpoints are prefixed with `/api/v1`. Authentication is passed via HTTP Header: `Authorization: Bearer <JWT_TOKEN>`.

---

## 1. Authentication Endpoints (`/api/v1/auth`)

| Method | Endpoint | Allowed Role | Request Body | Response (200/201) | Error Codes |
|---|---|---|---|---|---|
| `POST` | `/api/v1/auth/register-student` | Public | `{ email, password, firstName, lastName, collegeId, department, graduationYear, cgpa, activeBacklogs, phone }` | `{ success: true, token, user, profile }` | 400 (Validation), 409 (Email/ID exists) |
| `POST` | `/api/v1/auth/register-recruiter` | Public / Admin | `{ email, password, companyId, designation, phone }` | `{ success: true, token, user, profile }` | 400 (Invalid input), 404 (Company not found) |
| `POST` | `/api/v1/auth/login` | Public | `{ email, password }` | `{ success: true, token, user: { id, email, role, profile } }` | 400, 401 (Invalid credentials) |
| `GET` | `/api/v1/auth/me` | Any Authenticated | None | `{ success: true, user }` | 401 (Unauthorized) |

---

## 2. Student Profile Endpoints (`/api/v1/students`)

| Method | Endpoint | Allowed Role | Query / Body | Response | Error Codes |
|---|---|---|---|---|---|
| `GET` | `/api/v1/students/me` | Student | None | `{ success: true, profile }` | 401, 404 |
| `PUT` | `/api/v1/students/me` | Student | `{ phone, skills, certifications, projects, cgpa, activeBacklogs }` | `{ success: true, profile }` | 400, 401 |
| `GET` | `/api/v1/students` | Admin, Recruiter | `?page=1&limit=10&department=...&minCgpa=...&search=...` | `{ success: true, total, pages, data: [profiles] }` | 401, 403 |
| `GET` | `/api/v1/students/:id` | Admin, Recruiter, Self | None | `{ success: true, profile }` | 401, 403, 404 |
| `PUT` | `/api/v1/students/:id` | Admin | `{ department, graduationYear, cgpa, activeBacklogs, isActive }` | `{ success: true, profile }` | 401, 403, 404 |
| `DELETE` | `/api/v1/students/:id` | Admin | None | `{ success: true, message }` | 401, 403, 404 |

---

## 3. Company Endpoints (`/api/v1/companies`)

| Method | Endpoint | Allowed Role | Request Body | Response | Error Codes |
|---|---|---|---|---|---|
| `GET` | `/api/v1/companies` | Any Authenticated | `?search=...&industry=...` | `{ success: true, data: [companies] }` | 401 |
| `GET` | `/api/v1/companies/:id` | Any Authenticated | None | `{ success: true, company, activeDrives }` | 401, 404 |
| `POST` | `/api/v1/companies` | Admin | `{ name, website, industry, description, logoUrl, contactEmail, contactPhone, address }` | `{ success: true, company }` | 400, 401, 403, 409 |
| `PUT` | `/api/v1/companies/:id` | Admin, Authorized Recruiter | Updated company fields | `{ success: true, company }` | 401, 403, 404 |
| `DELETE` | `/api/v1/companies/:id` | Admin | None | `{ success: true, message }` | 401, 403, 404 |

---

## 4. Placement Drive Endpoints (`/api/v1/drives`)

| Method | Endpoint | Allowed Role | Body / Query | Response | Error Codes |
|---|---|---|---|---|---|
| `GET` | `/api/v1/drives` | Any Authenticated | `?status=...&search=...&page=1&limit=10` | `{ success: true, total, data: [drives] }` | 401 |
| `GET` | `/api/v1/drives/:id` | Any Authenticated | None (includes eligibility status if requested by student) | `{ success: true, drive, eligibility: { isEligible, reasons } }` | 401, 404 |
| `POST` | `/api/v1/drives` | Admin, Recruiter | `{ title, companyId, jobRole, jobDescription, salaryPackage, eligibilityCriteria, selectionRounds, applicationDeadline, driveDate }` | `{ success: true, drive }` | 400, 401, 403 |
| `PUT` | `/api/v1/drives/:id` | Admin, Recruiter (Owner) | Updated drive fields | `{ success: true, drive }` | 401, 403, 404 |
| `PATCH` | `/api/v1/drives/:id/status` | Admin | `{ status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' }` | `{ success: true, drive }` | 400, 401, 403 |
| `GET` | `/api/v1/drives/:id/eligible-students` | Admin, Recruiter | None | `{ success: true, eligibleStudents: [], ineligibleCount: number }` | 401, 403, 404 |

---

## 5. Application Endpoints (`/api/v1/applications`)

| Method | Endpoint | Allowed Role | Body / Query | Response | Error Codes |
|---|---|---|---|---|---|
| `POST` | `/api/v1/applications` | Student | `{ placementDriveId }` | `{ success: true, application }` | 400 (Not eligible), 409 (Already applied) |
| `GET` | `/api/v1/applications/my-applications` | Student | None | `{ success: true, data: [applications] }` | 401 |
| `GET` | `/api/v1/applications` | Admin, Recruiter | `?driveId=...&status=...&page=1&limit=20` | `{ success: true, total, data: [applications] }` | 401, 403 |
| `GET` | `/api/v1/applications/:id` | Admin, Recruiter, Application Owner | None | `{ success: true, application }` | 401, 403, 404 |
| `PATCH` | `/api/v1/applications/:id/status` | Admin, Recruiter | `{ status: 'shortlisted' | 'rejected' | 'interview_scheduled' | 'selected', notes, currentRound }` | `{ success: true, application }` | 400, 401, 403, 404 |

---

## 6. Interview & Result Endpoints (`/api/v1/interviews`, `/api/v1/results`)

| Method | Endpoint | Allowed Role | Body | Response | Error Codes |
|---|---|---|---|---|---|
| `POST` | `/api/v1/interviews` | Admin, Recruiter | `{ applicationId, roundNumber, roundName, scheduledDate, locationOrMeetingLink, instructions }` | `{ success: true, interview }` | 400, 401, 403 |
| `GET` | `/api/v1/interviews/my-schedule` | Student | None | `{ success: true, data: [interviews] }` | 401 |
| `PATCH` | `/api/v1/interviews/:id` | Admin, Recruiter | `{ status, interviewerFeedback }` | `{ success: true, interview }` | 401, 403, 404 |
| `POST` | `/api/v1/results` | Admin, Recruiter | `{ placementDriveId, studentId, companyId, offeredSalary, offerLetterUrl }` | `{ success: true, result }` | 400, 401, 403 |
| `GET` | `/api/v1/results` | Any Authenticated | `?driveId=...&studentId=...` | `{ success: true, data: [results] }` | 401 |

---

## 7. Resume & S3 Endpoints (`/api/v1/resumes`)

| Method | Endpoint | Allowed Role | Parameters / Body | Response | Error Codes |
|---|---|---|---|---|---|
| `POST` | `/api/v1/resumes/upload` | Student | `multipart/form-data` with `resume` file (PDF/DOCX, max 5MB) | `{ success: true, s3Key, originalName, updatedAt }` | 400 (Bad file type/size), 401 |
| `GET` | `/api/v1/resumes/download/:studentId` | Admin, Recruiter, Student (Self) | Path param `studentId` | `{ success: true, downloadUrl: "<presigned_s3_url>" }` | 401, 403, 404 |

---

## 8. Analytics & Reports Endpoints (`/api/v1/analytics`, `/api/v1/reports`)

| Method | Endpoint | Allowed Role | Description |
|---|---|---|---|
| `GET` | `/api/v1/analytics/admin-summary` | Admin | Total students, drives, companies, applications, selected count, placement % |
| `GET` | `/api/v1/analytics/department-wise` | Admin | Department breakdown: registered vs placed, average package |
| `GET` | `/api/v1/analytics/company-wise` | Admin, Recruiter | Recruited count and salary distribution per company |
| `GET` | `/api/v1/analytics/recruiter-summary` | Recruiter | Company-specific metrics: applications, shortlisted, interviewed, hired |
| `GET` | `/api/v1/reports/export-csv` | Admin | Streams CSV export of placement records with department/company filters |
