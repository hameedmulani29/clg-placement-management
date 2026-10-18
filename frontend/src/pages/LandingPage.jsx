import React from 'react';
import { Link } from 'react-router-dom';
import { Cloud, ShieldCheck, CheckCircle2, Award, Users, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <nav style={{ height: '70px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 800, fontSize: '1.3rem', color: '#0f172a' }}>
          <div style={{ backgroundColor: '#4f46e5', color: '#fff', padding: '0.4rem', borderRadius: '8px', display: 'flex' }}>
            <Cloud size={20} />
          </div>
          <span>PlaceCloud</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/about" style={{ color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>About Architecture</Link>
          <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
          <Link to="/register-student" className="btn btn-primary btn-sm">Student Registration</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '5rem 2rem', textAlign: 'center', maxWidth: '950px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#eef2ff', color: '#4f46e5', padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.5rem' }}>
          <Cloud size={16} /> Cloud-Based Campus Recruitment Platform
        </div>
        <h1 style={{ fontSize: '3.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '1.25rem' }}>
          Accelerating Campus Placements with <span style={{ color: '#4f46e5' }}>Cloud Intelligence</span>
        </h1>
        <p style={{ fontSize: '1.15rem', color: '#64748b', lineHeight: 1.6, maxWidth: '720px', margin: '0 auto 2.5rem' }}>
          A centralized, secure cloud portal connecting students, college placement officers (TPO), and tier-1 recruiters. Powered by real-time automated eligibility checks, AWS S3 resume vaults, and live recruitment analytics.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/login" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
            Launch Portal <ArrowRight size={18} />
          </Link>
          <Link to="/about" className="btn btn-secondary" style={{ padding: '0.8rem 1.75rem', fontSize: '1rem' }}>
            System Architecture & Specs
          </Link>
        </div>
      </section>

      {/* Feature Pillars */}
      <section style={{ backgroundColor: '#f8fafc', padding: '4rem 2rem', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>Engineered for Enterprise Academic Recruitment</h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.5rem' }}>Robust, reliable, and compliant with modern accreditation standards</p>
          </div>

          <div className="grid-cols-4">
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <CheckCircle2 size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Automated Eligibility Engine</h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Real-time algorithmic matching against CGPA, departments, graduation year, and active backlogs with zero manual TPO intervention.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Amazon S3 Resume Vault</h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Candidate resumes are stored in private cloud buckets with SSE-256 encryption and accessed via secure, time-limited 15-minute presigned URLs.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Users size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Three-Tier RBAC</h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Dedicated, isolated interfaces for Students, College Placement Officers (Admins), and Corporate Recruiters with JWT authorization.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Award size={24} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Reports & Accreditation</h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Live placement percentage metrics, department distribution charts, and one-click NAAC/NBA compliance CSV exports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
        <div>PlaceCloud © 2026 - Cloud-Based College Placement Management System</div>
        <div style={{ marginTop: '0.35rem' }}>Built with React, Node.js, Express, MongoDB Atlas, and Amazon Web Services (AWS)</div>
      </footer>
    </div>
  );
};

export default LandingPage;
