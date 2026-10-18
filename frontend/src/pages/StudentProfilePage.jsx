import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { User, FileText, Upload, ExternalLink, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

const StudentProfilePage = () => {
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
    setMessage('');
    setError('');

    try {
      const res = await api.put('/students/me', {
        phone,
        skills,
        projects,
      });

      if (res.data.success) {
        setMessage('Profile updated successfully!');
        await refreshProfile();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploadingResume(true);
    setMessage('');
    setError('');

    const formData = new FormData();
    formData.append('resume', selectedFile);

    try {
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setMessage('Resume successfully uploaded to Amazon S3!');
        setSelectedFile(null);
        await refreshProfile();
        if (profile?._id) fetchResumeUrl(profile._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Resume upload failed.');
    } finally {
      setUploadingResume(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const addProject = () => {
    if (newProject.title.trim()) {
      setProjects([...projects, { ...newProject }]);
      setNewProject({ title: '', description: '', link: '' });
    }
  };

  const removeProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  if (!profile) return <LoadingSpinner message="Loading profile..." />;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Academic Profile & Cloud Resume</h1>
        <p style={{ color: '#64748b', fontSize: '0.92rem' }}>Manage your credentials, projects, and cloud-stored resume document</p>
      </div>

      {message && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Academic Overview (Read-Only Verified) */}
        <div className="card">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} color="#4f46e5" /> Verified Academic Credentials (TPO Records)
          </h2>
          <div className="grid-cols-4">
            <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>FULL NAME</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginTop: '0.2rem' }}>
                {profile.firstName} {profile.lastName}
              </div>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>COLLEGE ROLL ID</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginTop: '0.2rem' }}>
                {profile.collegeId}
              </div>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>DEPARTMENT</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginTop: '0.2rem' }}>
                {profile.department}
              </div>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>CUMULATIVE CGPA</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#4f46e5', marginTop: '0.2rem' }}>
                {profile.cgpa} / 10.0
              </div>
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
            * Note: CGPA and active backlogs are verified by the institutional college placement office.
          </div>
        </div>

        {/* Amazon S3 Resume Vault */}
        <div className="card">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color="#4f46e5" /> Amazon S3 Secure Resume Storage
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {profile.resumeS3Key ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#065f46', fontSize: '0.95rem' }}>
                    {profile.resumeOriginalName || 'Resume.pdf'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#047857', marginTop: '0.2rem' }}>
                    Encrypted on AWS S3 • Last updated: {new Date(profile.resumeUpdatedAt).toLocaleDateString()}
                  </div>
                </div>
                {resumeDownloadUrl && (
                  <a
                    href={resumeDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <ExternalLink size={14} /> Open Presigned S3 Link (15-min)
                  </a>
                )}
              </div>
            ) : (
              <div style={{ padding: '1rem', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '10px', color: '#b45309', fontSize: '0.9rem' }}>
                No resume has been uploaded yet. Please upload your PDF resume below.
              </div>
            )}

            <form onSubmit={handleResumeUpload} style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                disabled={!selectedFile || uploadingResume}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Upload size={16} /> {uploadingResume ? 'Uploading to S3...' : 'Upload / Replace Resume'}
              </button>
            </form>
          </div>
        </div>

        {/* Technical Skills & Projects */}
        <div className="card">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>
            Skills & Portfolio
          </h2>

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                Primary Phone Number
              </label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" />
            </div>

            {/* Skills Tags */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                Technical Skills
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="e.g. AWS, React, Python, Docker"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                />
                <button type="button" onClick={addSkill} className="btn btn-secondary">
                  <Plus size={16} /> Add
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {skills.map((skill) => (
                  <span
                    key={skill}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: '#eef2ff',
                      color: '#4f46e5',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      style={{ background: 'none', border: 'none', color: '#6366f1', padding: 0, display: 'flex' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                Featured Projects
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                {projects.map((proj, idx) => (
                  <div key={idx} style={{ padding: '0.85rem', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>{proj.title}</div>
                      <div style={{ color: '#64748b', fontSize: '0.82rem' }}>{proj.description}</div>
                      {proj.link && (
                        <a href={proj.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#4f46e5' }}>
                          {proj.link}
                        </a>
                      )}
                    </div>
                    <button type="button" onClick={() => removeProject(idx)} className="btn btn-outline-danger btn-sm">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>Add Project</div>
                <input
                  type="text"
                  placeholder="Project Title (e.g. Cloud Placement Platform)"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Brief description of tech stack and achievements"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
                <input
                  type="url"
                  placeholder="GitHub or live URL (https://...)"
                  value={newProject.link}
                  onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                />
                <button type="button" onClick={addProject} className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}>
                  <Plus size={14} /> Add Project to Profile
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.75rem', alignSelf: 'flex-start' }}>
              {loading ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
