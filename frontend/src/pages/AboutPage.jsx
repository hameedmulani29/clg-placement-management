import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Server, Database, Cloud, ShieldAlert, Cpu } from 'lucide-react';

const AboutPage = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <Link to="/" className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#eef2ff', color: '#4f46e5', padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem' }}>
            <Cpu size={14} /> System Architecture Specification
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
            About the Cloud Placement Management System
          </h1>
          <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            The <strong>PlaceCloud</strong> platform is a full-stack, cloud-native educational application engineered to automate the collegiate training and placement lifecycle. It eliminates error-prone spreadsheets and manual eligibility vetting by migrating the entire workflow to modern cloud infrastructure.
          </p>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
            Cloud Computing Architecture (3-Tier Model)
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', padding: '1.25rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Cloud size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>1. Presentation Tier (Client SPA)</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  A responsive Single Page Application (SPA) built with React.js, Vite, and Recharts. Hosted in the cloud via AWS Amplify or Amazon S3 static website hosting fronted by Amazon CloudFront CDN.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', padding: '1.25rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Server size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>2. Application Tier (REST API Server)</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  Stateless Node.js & Express.js REST API server containerized and hosted on AWS App Runner. Enforces JWT authentication, Role-Based Access Control (RBAC), and powers the real-time Automated Eligibility Engine.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', padding: '1.25rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Database size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>3. Cloud Data & Storage Tier</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  <strong>MongoDB Atlas</strong> cloud database cluster with automated multi-zone replication, TLS 1.3 encryption, and automated backups for structured data. <strong>Amazon S3</strong> private bucket with SSE-256 encryption and 15-minute Presigned URLs for resume storage.
                </p>
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
            Resume Protection & Presigned URL Security
          </h2>
          <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderLeft: '4px solid #4f46e5', borderRadius: '0 8px 8px 0', marginBottom: '2rem' }}>
            <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.5 }}>
              Resumes contain sensitive student personally identifiable information (PII). Under no circumstances are resumes made public on S3. When an authorized recruiter or administrator requests to review a candidate's resume, the backend verifies authorization and generates a cryptographically signed Amazon S3 URL that expires automatically in <strong>15 minutes (900 seconds)</strong>.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
              Access Placement Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
