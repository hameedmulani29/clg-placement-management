import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import FileDropzone from '../components/FileDropzone';
import { SkeletonCard } from '../components/LoadingSpinner';
import {
  User,
  FileText,
  Upload,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  ShieldCheck,
  Briefcase,
  Code2,
  Globe,
  Loader2,
} from 'lucide-react';

const StudentProfilePage = () => {
  const { profile, refreshProfile } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // Editable fields
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({ title: '', description: '', link: '' });

  // Resume upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeDownloadUrl, setResumeDownloadUrl] = useState('');

  useEffect(() => {
    if (profile) {
      setPhone(profile.phone || '');
      setSkills(profile.skills || []);
      setProjects(profile.projects || []);
      if (profile.resumeS3Key) {
        fetchResumeUrl(profile._id);
      }
    }
  }, [profile]);

  const fetchResumeUrl = async (studentId) => {
    try {
      const res = await api.get(`/resumes/view/${studentId}`);
      if (res.data.success) {
        setResumeDownloadUrl(res.data.data.downloadUrl);
      }
    } catch (err) {
      console.warn('Could not generate presigned URL:', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.put('/students/me', {
        phone,
        skills,
        projects,
      });

      if (res.data.success) {
        toast.success('Profile updated', 'Your contact info, skills, and portfolio projects were saved.');
        await refreshProfile();
      }
    } catch (err) {
      toast.error('Update failed', err.response?.data?.message || 'Could not update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async () => {
    if (!selectedFile) return;

    setUploadingResume(true);
    const formData = new FormData();
    formData.append('resume', selectedFile);

    try {
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        toast.success('Resume uploaded to AWS S3', 'Recruiters can now review your validated credentials.');
        setSelectedFile(null);
        await refreshProfile();
        if (profile?._id) fetchResumeUrl(profile._id);
      }
    } catch (err) {
      toast.error('Upload failed', err.response?.data?.message || 'Resume upload failed.');
    } finally {
      setUploadingResume(false);
    }
  };

  const addSkill = (e) => {
    if (e) e.preventDefault();
    const clean = newSkill.trim();
    if (clean && !skills.includes(clean)) {
      setSkills([...skills, clean]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const addProject = (e) => {
    if (e) e.preventDefault();
    if (newProject.title.trim()) {
      setProjects([...projects, { ...newProject }]);
      setNewProject({ title: '', description: '', link: '' });
      toast.info('Project added', 'Remember to click "Save Changes" below to persist.');
    }
  };

  const removeProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  if (!profile) {
    return (
      <div>
        <SkeletonCard height="150px" />
        <div style={{ marginTop: '1.5rem' }}>
          <SkeletonCard height="300px" />
        </div>
      </div>
    );
  }

  // Calculate profile completeness score
  let completenessScore = 40; // Base academic info
  if (profile.resumeS3Key) completenessScore += 25;
  if (skills.length > 0) completenessScore += 15;
  if (projects.length > 0) completenessScore += 15;
  if (phone) completenessScore += 5;
  completenessScore = Math.min(completenessScore, 100);

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto' }}>
      <PageHeader
        title="Academic Profile & Resume Vault"
        subtitle="Manage your contact details, technical competencies, projects, and cloud-stored PDF resume"
        breadcrumbs={[
          { label: 'Portal', to: '/dashboard' },
          { label: 'Student Profile' },
        ]}
      />

      {/* Profile Completeness Card */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-subtle) 100%)',
        }}
      >
        <div style={{ flex: 1, minWidth: '220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Profile Readiness & Verification Score
            </span>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary)' }}>
              {completenessScore}% Complete
            </span>
          </div>
          <div style={{ height: '8px', backgroundColor: 'var(--border-default)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${completenessScore}%`,
                backgroundColor: completenessScore === 100 ? 'var(--success)' : 'var(--primary)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.6s var(--ease-out)',
              }}
            />
          </div>
        </div>

        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          {completenessScore === 100 ? (
            <span style={{ color: 'var(--success)', fontWeight: 'var(--font-weight-semibold)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={15} /> All placement criteria ready
            </span>
          ) : (
            <span>Upload resume & add portfolio projects to reach 100%</span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Verified Institutional Records (Read-Only) */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
                <span>Verified Academic Standing (TPO Office Database)</span>
              </h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Institutional academic metrics verified by college administration for recruitment eligibility
              </p>
            </div>
            <span className="badge badge-selected">
              <CheckCircle2 size={11} /> Verified
            </span>
          </div>

          <div className="grid-cols-4" style={{ gap: '1rem' }}>
            <div style={{ padding: '0.9rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase' }}>
                FULL NAME
              </div>
              <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                {profile.firstName} {profile.lastName}
              </div>
            </div>

            <div style={{ padding: '0.9rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase' }}>
                ROLL NUMBER / ID
              </div>
              <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                {profile.collegeId}
              </div>
            </div>

            <div style={{ padding: '0.9rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase' }}>
                DEPARTMENT
              </div>
              <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                {profile.department}
              </div>
            </div>

            <div style={{ padding: '0.9rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-bold)', textTransform: 'uppercase' }}>
                CGPA / BACKLOGS
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginTop: '0.2rem' }}>
                <span style={{ fontWeight: 'var(--font-weight-extrabold)', fontSize: 'var(--text-md)', color: 'var(--primary)' }}>
                  {profile.cgpa}
                </span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  / 10.0 ({profile.activeBacklogs} backlogs)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AWS S3 Resume Vault & Upload */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} style={{ color: 'var(--primary)' }} />
                <span>AWS S3 Cloud Resume Vault</span>
              </h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Resumes are securely encrypted and delivered via 15-minute time-expiring Presigned URLs
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {profile.resumeS3Key ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  backgroundColor: 'var(--success-light)',
                  border: '1px solid var(--success-border)',
                  borderRadius: 'var(--radius-md)',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--success)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <FileText size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--success-text)', fontSize: 'var(--text-sm)' }}>
                      {profile.resumeOriginalName || 'Resume.pdf'}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--success-text)', opacity: 0.85, marginTop: '0.15rem' }}>
                      Encrypted SSE-256 on Amazon S3 • Updated: {new Date(profile.resumeUpdatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {resumeDownloadUrl && (
                  <a
                    href={resumeDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <ExternalLink size={14} /> Open Presigned S3 Link (15m)
                  </a>
                )}
              </div>
            ) : (
              <div
                style={{
                  padding: '1.15rem',
                  backgroundColor: 'var(--warning-light)',
                  border: '1px solid var(--warning-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--warning-text)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                No resume has been uploaded to the cloud vault yet. Upload your PDF resume below.
              </div>
            )}

            {/* Dropzone Component */}
            <FileDropzone
              selectedFile={selectedFile}
              onFileSelect={(file) => setSelectedFile(file)}
              onFileRemove={() => setSelectedFile(null)}
              disabled={uploadingResume}
            />

            {selectedFile && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleResumeUpload}
                  disabled={uploadingResume}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                >
                  {uploadingResume ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 0.9s linear infinite' }} /> Uploading to S3...
                    </>
                  ) : (
                    <>
                      <Upload size={16} /> Confirm S3 Vault Upload
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Editable Contact, Skills & Portfolio Projects */}
        <form onSubmit={handleUpdateProfile} className="card">
          <div className="card-header">
            <div>
              <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
                Candidate Contact & Technical Portfolio
              </h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Highlight your phone number, technical skills, and software project repositories
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Contact Phone */}
            <div className="form-group" style={{ maxWidth: '400px' }}>
              <label htmlFor="prof-phone" className="form-label">
                Contact Phone Number
              </label>
              <input
                id="prof-phone"
                type="tel"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Skills Tag Input */}
            <div className="form-group">
              <label htmlFor="prof-skill-input" className="form-label">
                Technical Skills & Tools
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <input
                  id="prof-skill-input"
                  type="text"
                  placeholder="e.g. React, Node.js, Python, AWS, Docker"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  style={{ maxWidth: '380px' }}
                />
                <button type="button" onClick={addSkill} className="btn btn-secondary btn-sm">
                  <Plus size={14} /> Add Tag
                </button>
              </div>

              {/* Skills Tag Container */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {skills.length === 0 ? (
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    No technical skills added yet. Type a skill and click Add Tag.
                  </span>
                ) : (
                  skills.map((skill, idx) => (
                    <span
                      key={idx}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.25rem 0.65rem',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-weight-semibold)',
                        border: '1px solid rgba(99, 102, 241, 0.25)',
                      }}
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        style={{ color: 'var(--primary)', opacity: 0.7, padding: '0.1rem', display: 'flex' }}
                        aria-label={`Remove skill ${skill}`}
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Portfolio Projects */}
            <div className="form-group">
              <label className="form-label">Portfolio & Academic Projects</label>

              {/* New project form */}
              <div
                style={{
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  marginBottom: '1rem',
                }}
              >
                <div className="grid-cols-2" style={{ gap: '0.85rem' }}>
                  <input
                    type="text"
                    placeholder="Project Title (e.g. Distributed Task Queue)"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  />
                  <input
                    type="url"
                    placeholder="Repository / Live URL (https://github.com/...)"
                    value={newProject.link}
                    onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                  />
                </div>
                <textarea
                  placeholder="Brief description of architecture, tech stack, and impact..."
                  rows={2}
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={addProject} className="btn btn-secondary btn-sm">
                    <Plus size={14} /> Add Project
                  </button>
                </div>
              </div>

              {/* Existing Projects List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {projects.map((proj, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-default)',
                      backgroundColor: 'var(--bg-surface)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
                          {proj.title}
                        </h4>
                        {proj.link && (
                          <a
                            href={proj.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: 'var(--text-xs)' }}
                          >
                            <Globe size={13} /> Link <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                        {proj.description || 'No description provided.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeProject(idx)}
                      className="btn btn-ghost btn-xs"
                      style={{ color: 'var(--danger)', padding: '0.3rem' }}
                      aria-label="Remove project"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-default)' }}>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.75rem' }}
              >
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentProfilePage;
