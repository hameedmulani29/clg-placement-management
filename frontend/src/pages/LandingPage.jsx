import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  Cloud,
  ShieldCheck,
  CheckCircle2,
  Award,
  Users,
  ArrowRight,
  TrendingUp,
  Briefcase,
  FileText,
  Lock,
  ChevronRight,
  Sun,
  Moon,
  Laptop,
  Building2,
  Calendar,
  Sparkles,
  BarChart3,
  Search,
  CheckCircle,
  Clock,
  ExternalLink,
  Sliders,
  Filter,
  Layers,
  GraduationCap,
  Building,
  Target,
  FileCheck,
  AlertCircle,
  FileSpreadsheet,
  Zap,
} from 'lucide-react';

const LandingPage = () => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [selectedRole, setSelectedRole] = useState('students');
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);

  const workflowSteps = [
    {
      num: '01',
      title: 'Drive Publication',
      desc: 'TPO & corporate partners configure drive parameters: minimum CGPA, eligible branches, backlog tolerance, package (LPA), and application deadlines.',
    },
    {
      num: '02',
      title: 'Automated Eligibility',
      desc: 'PlaceCloud evaluates the student body against drive rules instantly. Ineligible candidates cannot apply, eliminating manual TPO spreadsheet audits.',
    },
    {
      num: '03',
      title: '1-Click Application',
      desc: 'Eligible students apply directly with verified academic records, dynamic skill tags, and secure resume references.',
    },
    {
      num: '04',
      title: 'Collaborative Screening',
      desc: 'Recruiters filter, review resumes, evaluate candidate profiles, and transition applicants through customizable pipeline stages.',
    },
    {
      num: '05',
      title: 'Interview Orchestration',
      desc: 'Multi-round interview schedules are broadcast with virtual meeting links, timing, and preparation instructions to candidates.',
    },
    {
      num: '06',
      title: 'Offer Release & Auditing',
      desc: 'Digital offers are recorded and tracked. Institutional placement ratios and department statistics update in real time for accreditation.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
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
              Enterprise
            </span>
          </span>
        </Link>

        {/* Center Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <a
            href="#how-it-works"
            style={{
              color: 'var(--text-secondary)',
              fontWeight: 'var(--font-weight-semibold)',
              fontSize: 'var(--text-sm)',
              textDecoration: 'none',
            }}
          >
            How It Works
          </a>
          <a
            href="#value-matrix"
            style={{
              color: 'var(--text-secondary)',
              fontWeight: 'var(--font-weight-semibold)',
              fontSize: 'var(--text-sm)',
              textDecoration: 'none',
            }}
          >
            Value Matrix
          </a>
          <a
            href="#stakeholders"
            style={{
              color: 'var(--text-secondary)',
              fontWeight: 'var(--font-weight-semibold)',
              fontSize: 'var(--text-sm)',
              textDecoration: 'none',
            }}
          >
            Roles & Value
          </a>
          <a
            href="#analytics-visibility"
            style={{
              color: 'var(--text-secondary)',
              fontWeight: 'var(--font-weight-semibold)',
              fontSize: 'var(--text-sm)',
              textDecoration: 'none',
            }}
          >
            Analytics
          </a>
          <a
            href="#trust-security"
            style={{
              color: 'var(--text-secondary)',
              fontWeight: 'var(--font-weight-semibold)',
              fontSize: 'var(--text-sm)',
              textDecoration: 'none',
            }}
          >
            Trust & Security
          </a>
          <Link
            to="/about"
            style={{
              color: 'var(--text-secondary)',
              fontWeight: 'var(--font-weight-semibold)',
              fontSize: 'var(--text-sm)',
              textDecoration: 'none',
            }}
          >
            About
          </Link>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
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

          <Link to="/login" className="btn btn-secondary btn-sm">
            Sign In
          </Link>
          <Link to="/register-student" className="btn btn-primary btn-sm">
            Student Intake <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '5.5rem 1.5rem 4rem',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        <div className="hero-ambient-glow" />

        <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-bold)',
              marginBottom: '1.75rem',
              border: '1px solid rgba(99, 102, 241, 0.25)',
            }}
          >
            <span className="beacon-dot" />
            <span>Next-Generation Institutional Placement Infrastructure</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 4rem)',
              fontFamily: 'var(--font-family-display)',
              fontWeight: 'var(--font-weight-extrabold)',
              color: 'var(--text-primary)',
              lineHeight: 1.12,
              letterSpacing: '-0.035em',
              marginBottom: '1.5rem',
            }}
          >
            The Modern Operating System for{' '}
            <span style={{ color: 'var(--primary)', position: 'relative' }}>
              Campus Placements
            </span>
          </h1>

          <p
            style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: '760px',
              margin: '0 auto 2.5rem',
            }}
          >
            PlaceCloud brings students, corporate recruiters, and college placement leadership onto one unified, intelligent platform. Experience zero-delay automated eligibility checks, confidential candidate vaults, structured interview pipelines, and real-time accreditation analytics.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn btn-primary btn-lg" style={{ padding: '0.85rem 2.5rem', fontSize: 'var(--text-md)' }}>
              Enter Portal Now <ArrowRight size={18} />
            </Link>
            <Link to="/register-student" className="btn btn-secondary btn-lg" style={{ padding: '0.85rem 2rem', fontSize: 'var(--text-md)' }}>
              Student Registration Intake
            </Link>
          </div>

          {/* Layered Interactive Hero Showcase */}
          <div className="hero-preview-stage">
            {/* Left Floating Card: Live Drive Eligibility Match */}
            <div className="hero-float-card hero-float-left" style={{ maxWidth: '320px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Live Placement Drive
                </span>
                <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                  <CheckCircle2 size={12} /> Eligible
                </span>
              </div>
              <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                Google Cloud
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Associate Cloud Architect • 32.5 LPA
              </div>
              <div style={{ fontSize: '0.72rem', backgroundColor: 'var(--bg-surface-subtle)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-xs)', color: 'var(--text-secondary)' }}>
                CGPA ≥ 8.00 ✓ • 0 Backlogs ✓ • CS/IT ✓
              </div>
            </div>

            {/* Right Floating Card: Scheduled Interview */}
            <div className="hero-float-card hero-float-right" style={{ maxWidth: '300px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.4rem', color: 'var(--info)' }}>
                <Calendar size={14} />
                <span style={{ fontSize: '0.7rem', fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase' }}>
                  Interview Confirmed
                </span>
              </div>
              <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                Goldman Sachs
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                Oct 24, 10:30 AM • Technical Round
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.4rem', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 'var(--font-weight-semibold)' }}>
                <span>Virtual Room Link Ready</span>
                <ArrowRight size={12} />
              </div>
            </div>

            {/* Main Window Mockup: Command Center Snapshot */}
            <div className="hero-window-mockup" style={{ textAlign: 'left' }}>
              {/* Window Header */}
              <div
                style={{
                  padding: '0.85rem 1.25rem',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  borderBottom: '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  <span style={{ marginLeft: '0.5rem', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-family-mono)' }}>
                    placecloud.internal/operations-command
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                    Placement Season 2026 Active
                  </span>
                </div>
              </div>

              {/* Window Body: Recruiter & Student Pipeline Simulation */}
              <div style={{ padding: '1.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-medium)' }}>Total Registered Students</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--text-primary)', marginTop: '0.2rem' }}>1,248</div>
                  </div>
                  <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-medium)' }}>Active Campus Drives</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--primary)', marginTop: '0.2rem' }}>18 Drives</div>
                  </div>
                  <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-medium)' }}>Batch Placement Rate</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--success)', marginTop: '0.2rem' }}>96.4%</div>
                  </div>
                  <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-medium)' }}>Average Compensation</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--warning)', marginTop: '0.2rem' }}>14.2 LPA</div>
                  </div>
                </div>

                {/* Simulated Pipeline Stages Bar */}
                <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                      Real-Time Applicant Pipeline (Amazon Campus Drive)
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>412 Applicants Screened</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                    <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-xs)', textAlign: 'center' }}>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Applied</div>
                      <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>412</div>
                    </div>
                    <div style={{ padding: '0.5rem', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-xs)', textAlign: 'center' }}>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)' }}>Shortlisted</div>
                      <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-sm)', color: 'var(--primary)' }}>86</div>
                    </div>
                    <div style={{ padding: '0.5rem', backgroundColor: 'var(--info-light)', borderRadius: 'var(--radius-xs)', textAlign: 'center' }}>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--info)' }}>Technical R1</div>
                      <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-sm)', color: 'var(--info)' }}>32</div>
                    </div>
                    <div style={{ padding: '0.5rem', backgroundColor: 'var(--warning-light)', borderRadius: 'var(--radius-xs)', textAlign: 'center' }}>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--warning)' }}>HR Final</div>
                      <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-sm)', color: 'var(--warning)' }}>18</div>
                    </div>
                    <div style={{ padding: '0.5rem', backgroundColor: 'var(--success-light)', borderRadius: 'var(--radius-xs)', textAlign: 'center' }}>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--success)' }}>Offers Released</div>
                      <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-sm)', color: 'var(--success)' }}>14</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Value Matrix: Before vs. With PlaceCloud */}
      <section
        id="value-matrix"
        style={{
          padding: '5rem 1.5rem',
          backgroundColor: 'var(--bg-surface-subtle)',
          borderTop: '1px solid var(--border-default)',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              The Operational Transformation
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--text-primary)', marginTop: '0.35rem' }}>
              Why Premier Institutions Switch to PlaceCloud
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', maxWidth: '640px', margin: '0.5rem auto 0' }}>
              Traditional campus hiring relies on fragmented noticeboards and unverified spreadsheets. PlaceCloud turns placement into an intelligent, auditable operation.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* The Old Way: Fragmented */}
            <div className="comparison-card comparison-card-before">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', marginBottom: '1.25rem' }}>
                <AlertCircle size={22} />
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                  Traditional Campus Hiring
                </h3>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>✕</span>
                  <span><strong>Spreadsheet Chaos:</strong> 50+ divergent Google Sheets and manual CGPA checking costing 40+ hours per drive.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>✕</span>
                  <span><strong>Unsecured Resumes:</strong> Student resumes circulating via public email attachments and unsecured drives.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>✕</span>
                  <span><strong>Zero Student Visibility:</strong> Candidates left guessing their application status across disjointed WhatsApp groups.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>✕</span>
                  <span><strong>Painful Audit Compliance:</strong> Manually compiling NAAC/NIRF accreditation data takes weeks of stressful cross-referencing.</span>
                </li>
              </ul>
            </div>

            {/* The PlaceCloud Way: Modern Enterprise */}
            <div className="comparison-card comparison-card-after">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '1.25rem' }}>
                <Zap size={22} />
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                  With PlaceCloud Enterprise
                </h3>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <CheckCircle size={18} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Programmatic Eligibility:</strong> Instant calculation of CGPA thresholds, backlog tolerances, and branches. 0 ms human verification.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <CheckCircle size={18} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Confidential Document Protection:</strong> Secured student resume vault with RBAC guards and time-expiring authorization tokens.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <CheckCircle size={18} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Transparent Pipeline Tracking:</strong> Students track their exact status: Applied → Shortlisted → Interview → Offer in real time.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                  <CheckCircle size={18} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>One-Click Accreditation Reports:</strong> Instant CSV exports for academic accreditation, department intake, and placement percentages.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How PlaceCloud Works */}
      <section id="how-it-works" style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Execution Lifecycle
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--text-primary)', marginTop: '0.35rem' }}>
              How PlaceCloud Orchestrates Campus Drives
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', maxWidth: '600px', margin: '0.5rem auto 0' }}>
              A frictionless 6-step flow connecting corporate job openings with eligible student applicants.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {workflowSteps.map((step, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  borderTop: idx === activeWorkflowStep ? '3px solid var(--primary)' : '1px solid var(--border-default)',
                  cursor: 'pointer',
                  transition: 'all var(--duration-fast)',
                }}
                onClick={() => setActiveWorkflowStep(idx)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--primary)' }}>
                    {step.num}
                  </span>
                  <span className={`badge ${idx === activeWorkflowStep ? 'badge-primary' : 'badge-neutral'}`}>
                    Stage {idx + 1}
                  </span>
                </div>
                <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {step.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.55 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three-Audience Experience */}
      <section
        id="stakeholders"
        style={{
          padding: '5rem 1.5rem',
          backgroundColor: 'var(--bg-surface-subtle)',
          borderTop: '1px solid var(--border-default)',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Unified Multi-Stakeholder Ecosystem
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--text-primary)', marginTop: '0.35rem' }}>
              Built Specifically for Each Placement Persona
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', maxWidth: '600px', margin: '0.5rem auto 0' }}>
              Students discover opportunities, recruiters screen candidates efficiently, and placement officers maintain total governance.
            </p>
          </div>

          {/* Interactive Role Switcher */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`role-tab-btn ${selectedRole === 'students' ? 'role-tab-btn-active' : ''}`}
              onClick={() => setSelectedRole('students')}
            >
              <GraduationCap size={18} />
              <span>For Students</span>
            </button>
            <button
              type="button"
              className={`role-tab-btn ${selectedRole === 'recruiters' ? 'role-tab-btn-active' : ''}`}
              onClick={() => setSelectedRole('recruiters')}
            >
              <Briefcase size={18} />
              <span>For Corporate Recruiters</span>
            </button>
            <button
              type="button"
              className={`role-tab-btn ${selectedRole === 'tpo' ? 'role-tab-btn-active' : ''}`}
              onClick={() => setSelectedRole('tpo')}
            >
              <Building size={18} />
              <span>For Placement Officers (TPO)</span>
            </button>
          </div>

          {/* Role Presentation Card */}
          <div className="card" style={{ padding: '2.75rem', boxShadow: 'var(--shadow-lg)' }}>
            {selectedRole === 'students' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    <Sparkles size={14} /> Candidate Empowerment
                  </div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.25 }}>
                    Never Miss an Opportunity. Stay in Total Control of Your Placement Journey.
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                    Say goodbye to scattered notices. PlaceCloud automatically tells you which campus drives you qualify for, lets you upload your resume directly, and sends updates on every stage.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                      <span><strong>Instant Eligibility Matching:</strong> Inspect detailed criteria breakdown for every drive.</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                      <span><strong>1-Click Resume Management:</strong> Drag-and-drop secure PDF upload with direct preview.</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                      <span><strong>Interview Hub:</strong> Scheduled interview dates, meeting links, and recruiter notes in one place.</span>
                    </div>
                  </div>
                  <div style={{ marginTop: '2rem' }}>
                    <Link to="/register-student" className="btn btn-primary btn-md">
                      Register as Student <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>
                    Live Student Interface Preview
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-sm)' }}>Microsoft — Software Engineer</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>CTC: 44.5 LPA • Deadline: Oct 28</div>
                      </div>
                      <span className="badge badge-success"><CheckCircle2 size={12} /> Eligible</span>
                    </div>
                    <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-sm)' }}>Amazon — Cloud Support Associate</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Status: Shortlisted for Interview</div>
                      </div>
                      <span className="badge badge-info"><Clock size={12} /> Round 1 Active</span>
                    </div>
                    <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-sm)' }}>Oracle Cloud — Full Stack Developer</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Status: Selected • Offer Letter Released</div>
                      </div>
                      <span className="badge badge-success"><Award size={12} /> Offer Accepted</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedRole === 'recruiters' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    <Briefcase size={14} /> Corporate Recruiter Workspace
                  </div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.25 }}>
                    Screen Faster. Collaborate with Evaluation Rubrics. Release Offers.
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                    Stop downloading massive zip files of raw resumes. PlaceCloud delivers structured candidate pipelines, in-app resume inspection, candidate scorecards, and scheduling tools.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                      <span><strong>High-Precision Filtering:</strong> Filter applicants by CGPA threshold, department, and candidate skills.</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                      <span><strong>Candidate Evaluation Modal:</strong> Record interview ratings (1–100) and structured recruiter remarks.</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                      <span><strong>Integrated Scheduling:</strong> Broadcast interview slots with direct Google Meet or physical room links.</span>
                    </div>
                  </div>
                  <div style={{ marginTop: '2rem' }}>
                    <Link to="/login" className="btn btn-primary btn-md">
                      Recruiter Portal Login <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>
                    Recruiter Candidate Evaluation Matrix
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-sm)' }}>Aarav Singhania</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>B.Tech CS • CGPA: 9.24 • React, AWS, Node</div>
                        </div>
                        <span className="badge badge-primary">Evaluation Score: 92/100</span>
                      </div>
                      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.72rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-xs)' }}>
                          Stage: Shortlisted for Technical Round
                        </span>
                      </div>
                    </div>
                    <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-sm)' }}>Priya Venkatesh</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>B.Tech IT • CGPA: 8.85 • Python, SQL, Docker</div>
                        </div>
                        <span className="badge badge-success">Offer Dispatched</span>
                      </div>
                      <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Package: 24.0 LPA • Designation: SDE 1
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedRole === 'tpo' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    <Building size={14} /> Placement Leadership & TPO Cell
                  </div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.25 }}>
                    Complete Operational Command Over Campus Placements.
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                    Empower your Training & Placement Cell with total visibility. Oversee drive lifecycles, enforce student eligibility thresholds, track department placement rates, and export accreditation data.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                      <span><strong>Drive Governance:</strong> Control drive status toggles (Upcoming, Active, Closed) and criteria.</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                      <span><strong>Student Directory & Safe Management:</strong> Search, audit credentials, and manage cohort records.</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                      <span><strong>Accreditation CSV Streams:</strong> Stream verified reports for NAAC/NBA institutional audits in one click.</span>
                    </div>
                  </div>
                  <div style={{ marginTop: '2rem' }}>
                    <Link to="/login" className="btn btn-primary btn-md">
                      Access TPO Command Center <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>
                    TPO Operational Dashboard Snapshot
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Offers Accepted</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--success)' }}>428 Offers</div>
                    </div>
                    <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Corporate Partners</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--primary)' }}>48 Companies</div>
                    </div>
                  </div>
                  <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 'var(--font-weight-bold)' }}>Computer Science Intake</span>
                      <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>98.2% Placed</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{ width: '98.2%', height: '100%', backgroundColor: 'var(--success)' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Simulated Demo Performance Metrics Bar */}
      <section style={{ padding: '4.5rem 1.5rem', backgroundColor: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Institutional Scale & Benchmark Performance (Platform Demo Metrics)
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.25rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--primary)', fontFamily: 'var(--font-family-display)' }}>
                96.4%
              </div>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '0.35rem' }}>
                Batch Placement Rate
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.25rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--success)', fontFamily: 'var(--font-family-display)' }}>
                44.5 LPA
              </div>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '0.35rem' }}>
                Peak Package Offered
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.25rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--info)', fontFamily: 'var(--font-family-display)' }}>
                150+
              </div>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '0.35rem' }}>
                Hiring Enterprise Partners
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.25rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--warning)', fontFamily: 'var(--font-family-display)' }}>
                0 ms
              </div>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '0.35rem' }}>
                Manual Eligibility Delay
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.25rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--accent)', fontFamily: 'var(--font-family-display)' }}>
                12,000+
              </div>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '0.35rem' }}>
                Applications Screened
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics & Institutional Visibility */}
      <section
        id="analytics-visibility"
        style={{
          padding: '5rem 1.5rem',
          backgroundColor: 'var(--bg-surface-subtle)',
          borderTop: '1px solid var(--border-default)',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Operational Intelligence
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--text-primary)', marginTop: '0.35rem' }}>
              Real-Time Placement Intelligence & Accreditation Visibility
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', maxWidth: '640px', margin: '0.5rem auto 0' }}>
              Make confident leadership decisions with live department distributions, salary tier metrics, and instant accreditation compliance data.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
                  Department Placement Breakdown
                </h3>
                <span className="badge badge-primary">Current Season</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>Computer Science & Eng.</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>98.4% (284/288)</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: '98.4%', height: '100%', backgroundColor: 'var(--primary)' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>Information Technology</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>96.1% (172/179)</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: '96.1%', height: '100%', backgroundColor: 'var(--primary)' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>Electronics & Communication</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>91.5% (204/223)</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: '91.5%', height: '100%', backgroundColor: 'var(--primary)' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>Mechanical & Industrial Eng.</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>84.2% (149/177)</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: '84.2%', height: '100%', backgroundColor: 'var(--primary)' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
                  Compensation Tier Distribution (LPA)
                </h3>
                <span className="badge badge-success">Offers Verified</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>Dream Tier (&gt; 20 LPA)</span>
                    <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>64 Offers (15%)</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: '15%', height: '100%', backgroundColor: 'var(--success)' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>Super Dream Tier (10 – 20 LPA)</span>
                    <span style={{ color: 'var(--info)', fontWeight: 'bold' }}>192 Offers (45%)</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: '45%', height: '100%', backgroundColor: 'var(--info)' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>Core Enterprise Tier (6 – 10 LPA)</span>
                    <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>148 Offers (35%)</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: '35%', height: '100%', backgroundColor: 'var(--warning)' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>Standard Intake (&lt; 6 LPA)</span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>24 Offers (5%)</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: '5%', height: '100%', backgroundColor: 'var(--text-muted)' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Institutional Trust (Product-Oriented) */}
      <section id="trust-security" style={{ padding: '5rem 1.5rem', backgroundColor: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Institutional Trust & Privacy
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--text-primary)', marginTop: '0.35rem' }}>
              Enterprise-Grade Security by Design
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', maxWidth: '600px', margin: '0.5rem auto 0' }}>
              Protecting student identity, academic integrity, and corporate evaluation confidentiality with enterprise safeguards.
            </p>
          </div>

          <div className="grid-cols-4" style={{ gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Strict RBAC Isolation
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
                Cryptographically enforced boundaries ensure recruiters only access candidates for their authorized drives, preventing cross-tenant data leakage.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--success-light)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Lock size={24} />
              </div>
              <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Protected Document Vaults
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
                Student resumes are protected behind private access barriers, accessible only to verified evaluators through expiring tokens.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--warning-light)',
                  color: 'var(--warning)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <FileCheck size={24} />
              </div>
              <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Verifiable Audit Logs
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
                Every applicant stage shift, interview schedule update, and administrative action generates an immutable audit record for institutional compliance.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--info-light)',
                  color: 'var(--info)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <FileSpreadsheet size={24} />
              </div>
              <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Total Data Sovereignty
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
                Institutional data belongs strictly to the college. Zero third-party data sharing and instant one-click CSV export capabilities anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Hiring Partners Ticker */}
      <section style={{ padding: '3.5rem 1.5rem', textAlign: 'center', backgroundColor: 'var(--bg-surface-subtle)', borderTop: '1px solid var(--border-default)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.5rem' }}>
            Trusted by Campus Hiring Teams Across Top Tech & Engineering Enterprises
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap', opacity: 0.85 }}>
            {['Google Cloud', 'Microsoft Azure', 'Amazon Web Services', 'Infosys Tech', 'Cisco Systems', 'Oracle Cloud'].map((corp, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-base)', color: 'var(--text-secondary)' }}>
                <Building2 size={18} style={{ color: 'var(--primary)' }} />
                <span>{corp}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* High-Converting Final Call to Action */}
      <section style={{ padding: '6rem 1.5rem', backgroundColor: 'var(--bg-canvas)' }}>
        <div
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '4rem 2.5rem',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-50%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '600px',
              height: '300px',
              background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99, 102, 241, 0.25), transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Get Started with PlaceCloud
            </span>
            <h2
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontFamily: 'var(--font-family-display)',
                fontWeight: 'var(--font-weight-extrabold)',
                color: 'var(--text-primary)',
                marginTop: '0.5rem',
                marginBottom: '1rem',
                lineHeight: 1.2,
              }}
            >
              Transform Your Campus Placement Operations Today
            </h2>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: 'var(--text-md)',
                maxWidth: '620px',
                margin: '0 auto 2.5rem',
                lineHeight: 1.6,
              }}
            >
              Equip your institution with an automated, auditable, and secure placement platform that accelerates student hiring.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/login" className="btn btn-primary btn-lg" style={{ padding: '0.85rem 2.5rem' }}>
                Sign In to Platform <ArrowRight size={18} />
              </Link>
              <Link to="/register-student" className="btn btn-secondary btn-lg" style={{ padding: '0.85rem 2rem' }}>
                Register as Student
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive SaaS Footer */}
      <footer
        style={{
          marginTop: 'auto',
          padding: '4rem 2rem 2.5rem',
          borderTop: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-secondary)',
          fontSize: 'var(--text-sm)',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', marginBottom: '3.5rem' }}>
            {/* Brand Column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontWeight: 'var(--font-weight-extrabold)', color: 'var(--text-primary)', fontSize: 'var(--text-md)', marginBottom: '0.75rem' }}>
                <div style={{ backgroundColor: 'var(--primary)', color: '#ffffff', padding: '0.35rem', borderRadius: 'var(--radius-sm)', display: 'flex' }}>
                  <Cloud size={18} />
                </div>
                <span>PlaceCloud</span>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '240px' }}>
                Modern enterprise cloud infrastructure for higher-education campus recruitment drives, student eligibility vetting, and candidate pipelines.
              </p>
            </div>

            {/* Product Column */}
            <div>
              <div style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                Product
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: 'var(--text-xs)' }}>
                <li><a href="#how-it-works" style={{ color: 'var(--text-secondary)' }}>How PlaceCloud Works</a></li>
                <li><a href="#value-matrix" style={{ color: 'var(--text-secondary)' }}>Operational Value Matrix</a></li>
                <li><a href="#analytics-visibility" style={{ color: 'var(--text-secondary)' }}>Placement Analytics</a></li>
                <li><a href="#trust-security" style={{ color: 'var(--text-secondary)' }}>Trust & Security</a></li>
              </ul>
            </div>

            {/* Stakeholders Column */}
            <div>
              <div style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                Stakeholders
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: 'var(--text-xs)' }}>
                <li><Link to="/register-student" style={{ color: 'var(--text-secondary)' }}>Student Intake & Portal</Link></li>
                <li><Link to="/login" style={{ color: 'var(--text-secondary)' }}>Corporate Recruiter Suite</Link></li>
                <li><Link to="/login" style={{ color: 'var(--text-secondary)' }}>TPO Command Center</Link></li>
                <li><Link to="/about" style={{ color: 'var(--text-secondary)' }}>Mission & Philosophy</Link></li>
              </ul>
            </div>

            {/* Access & Status Column */}
            <div>
              <div style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                Portal Access
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: 'var(--text-xs)' }}>
                <li><Link to="/login" style={{ color: 'var(--text-secondary)' }}>Sign In to Account</Link></li>
                <li><Link to="/register-student" style={{ color: 'var(--text-secondary)' }}>Register New Student</Link></li>
                <li><Link to="/about" style={{ color: 'var(--text-secondary)' }}>System Overview</Link></li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)' }}>
                  <span className="beacon-dot" />
                  <span>Platform Operational</span>
                </li>
              </ul>
            </div>
          </div>

          <div
            style={{
              paddingTop: '2rem',
              borderTop: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-muted)',
            }}
          >
            <div>
              © 2026 PlaceCloud. Production-Ready Enterprise Placement Platform. All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <Link to="/about" style={{ color: 'var(--text-muted)' }}>About PlaceCloud</Link>
              <Link to="/login" style={{ color: 'var(--text-muted)' }}>Portal</Link>
              <Link to="/register-student" style={{ color: 'var(--text-muted)' }}>Student Intake</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
