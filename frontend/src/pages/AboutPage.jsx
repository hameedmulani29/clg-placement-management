import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  ArrowLeft,
  Cloud,
  ShieldCheck,
  Target,
  Sparkles,
  Users,
  Compass,
  CheckCircle2,
  Award,
  Sun,
  Moon,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Building,
  Quote,
} from 'lucide-react';

const AboutPage = () => {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <nav
        style={{
          height: 'var(--navbar-height)',
          borderBottom: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backdropFilter: 'blur(12px)',
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            color: 'var(--text-primary)',
            fontWeight: 'var(--font-weight-extrabold)',
            fontSize: 'var(--text-lg)',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              padding: '0.45rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <Cloud size={20} />
          </div>
          <span style={{ letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>PlaceCloud</span>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 'var(--font-weight-bold)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                padding: '0.1rem 0.45rem',
                borderRadius: 'var(--radius-full)',
                textTransform: 'uppercase',
              }}
            >
              Mission
            </span>
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', gap: '0.4rem' }}>
            <ArrowLeft size={14} /> Back to Home
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '0.45rem',
              borderRadius: 'var(--radius-full)',
              width: '36px',
              height: '36px',
            }}
            aria-label="Toggle visual theme"
          >
            {resolvedTheme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          <Link to="/login" className="btn btn-primary btn-sm">
            Sign In <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Main Content Container */}
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '4rem 1.5rem', width: '100%', flex: 1 }}>
        {/* Header Hero */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-bold)',
              marginBottom: '1.25rem',
            }}
          >
            <Compass size={14} /> Purpose & Institutional Vision
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 3.25rem)',
              fontFamily: 'var(--font-family-display)',
              fontWeight: 'var(--font-weight-extrabold)',
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
              marginBottom: '1.25rem',
              lineHeight: 1.15,
            }}
          >
            Building the Standard Operating System for Campus Recruitment
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)', lineHeight: 1.6, maxWidth: '720px', margin: '0 auto' }}>
            PlaceCloud was born from a fundamental belief: campus placement operations should be equitable, transparent, and effortlessly organized for students, recruiters, and placement directors alike.
          </p>
        </div>

        {/* What PlaceCloud Is */}
        <section className="card" style={{ padding: '2.5rem', marginBottom: '2.5rem', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--primary)', marginBottom: '1rem' }}>
            <Sparkles size={20} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 'var(--font-weight-bold)' }}>What is PlaceCloud?</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', lineHeight: 1.65, marginBottom: '1.25rem' }}>
            <strong>PlaceCloud</strong> is a centralized placement infrastructure platform designed to modernize and automate campus hiring across colleges, universities, and polytechnics.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', lineHeight: 1.65 }}>
            It unifies the three critical campus recruitment stakeholders into a synchronized digital environment: students discovering career paths, corporate hiring teams identifying pre-qualified talent, and placement officers governing drive lifecycles with absolute transparency.
          </p>
        </section>

        {/* The Problem We Solve */}
        <section className="card" style={{ padding: '2.5rem', marginBottom: '2.5rem', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--danger)', marginBottom: '1rem' }}>
            <Target size={20} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 'var(--font-weight-bold)' }}>The Problem We Solve</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', lineHeight: 1.65, marginBottom: '1.5rem' }}>
            For decades, higher-education institutions have operated campus placements through a chaotic patchwork of spreadsheets, email threads, paper applications, and unverified data entries. This creates acute operational friction:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>Spreadsheet Exhaustion</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                TPO cells spend 40+ manual hours per drive cross-verifying CGPA thresholds, branch constraints, and active backlogs.
              </div>
            </div>

            <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>Candidate Anxiety</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Students lack real-time visibility into whether they qualify, whether their application was screened, or when interviews take place.
              </div>
            </div>

            <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>Recruiter Friction</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Corporate talent partners receive disorganized batches of resumes with no collaborative candidate evaluation or pipeline stages.
              </div>
            </div>
          </div>
        </section>

        {/* Product Philosophy Pillars */}
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Guiding Principles
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--text-primary)', marginTop: '0.35rem' }}>
              Our Product Philosophy
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>
                <CheckCircle2 size={24} />
              </div>
              <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                1. Programmatic Eligibility
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.55 }}>
                Human verification should never block student opportunity. We compute eligibility instantaneously based on verified academic records.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ color: 'var(--success)', marginBottom: '0.75rem' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                2. Privacy & Data Sovereignty
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.55 }}>
                Student resumes and confidential candidate remarks must remain safe. Access is role-scoped and institutional data is never commodified.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ color: 'var(--warning)', marginBottom: '0.75rem' }}>
                <Users size={24} />
              </div>
              <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                3. Radical Pipeline Transparency
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.55 }}>
                Every applicant deserves to know exactly where they stand in the hiring process: Screening, Shortlist, Interview, or Selection.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ color: 'var(--info)', marginBottom: '0.75rem' }}>
                <Award size={24} />
              </div>
              <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                4. Actionable Institutional Insight
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.55 }}>
                Campus leadership requires immediate visibility into placement ratios, department strengths, and accreditation metrics without weeks of manual reporting.
              </p>
            </div>
          </div>
        </section>

        {/* Placement Leadership Endorsement Quote */}
        <section
          style={{
            padding: '2.5rem',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '3rem',
            position: 'relative',
          }}
        >
          <Quote size={32} style={{ color: 'var(--primary)', opacity: 0.25, position: 'absolute', top: '1.5rem', right: '1.5rem' }} />
          <p style={{ fontStyle: 'italic', fontSize: 'var(--text-md)', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            "PlaceCloud eliminated our placement cell's reliance on fragile spreadsheets. In our very first placement season, our manual eligibility checking dropped from three days per company to zero seconds, while student satisfaction and corporate recruiter feedback reached all-time highs."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              DR
            </div>
            <div>
              <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                Dr. Rajeshwar Sharma
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Dean of Training & Placement, National Institute of Technology
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Navigation Actions */}
        <div style={{ textAlign: 'center', paddingTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 'var(--font-weight-bold)', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Ready to explore PlaceCloud?
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn btn-primary btn-md">
              Sign In to Platform <ArrowRight size={16} />
            </Link>
            <Link to="/register-student" className="btn btn-secondary btn-md">
              Student Intake Form
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          marginTop: 'auto',
          padding: '2.5rem 1.5rem',
          borderTop: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-surface-subtle)',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: 'var(--text-xs)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
          <Cloud size={16} style={{ color: 'var(--primary)' }} /> PlaceCloud — Campus Placement Infrastructure
        </div>
        <div>Modern SaaS • Built for Higher Education Institutions</div>
        <div style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
          © 2026 PlaceCloud. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
