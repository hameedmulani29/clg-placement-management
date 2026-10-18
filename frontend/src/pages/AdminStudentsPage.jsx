import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { Search, Users, Edit3, Trash2, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

const AdminStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [minCgpa, setMinCgpa] = useState('');

  // Edit Modal State
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({ cgpa: '', activeBacklogs: '', department: '', phone: '' });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [department, minCgpa]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (department) params.append('department', department);
      if (minCgpa) params.append('minCgpa', minCgpa);

      const res = await api.get(`/students?${params.toString()}`);
      if (res.data.success) {
        setStudents(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setEditFormData({
      cgpa: student.cgpa,
      activeBacklogs: student.activeBacklogs,
      department: student.department,
      phone: student.phone,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await api.put(`/students/${editingStudent._id}`, editFormData);
      if (res.data.success) {
        setIsEditModalOpen(false);
        await fetchStudents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update student');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteStudent = async (id, roll) => {
    if (window.confirm(`Are you sure you want to permanently delete student ${roll}?`)) {
      try {
        await api.delete(`/students/${id}`);
        setStudents((prev) => prev.filter((s) => s._id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete student');
      }
    }
  };

  const handleViewResume = async (studentId) => {
    try {
      const res = await api.get(`/resumes/view/${studentId}`);
      if (res.data.success) {
        window.open(res.data.data.downloadUrl, '_blank');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not open resume.');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Student Records Directory</h1>
        <p style={{ color: '#64748b', fontSize: '0.92rem' }}>Audit and manage student academic credentials and resume attachments</p>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <form onSubmit={(e) => { e.preventDefault(); fetchStudents(); }} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 250px' }}>
            <input
              type="text"
              placeholder="Search by student name, roll number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <select value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
            </select>
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <input
              type="number"
              step="0.5"
              placeholder="Min CGPA (e.g. 8.0)"
              value={minCgpa}
              onChange={(e) => setMinCgpa(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary">Filter</button>
        </form>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading student records..." />
      ) : students.length === 0 ? (
        <EmptyState title="No Students Found" description="Try adjusting search or filter criteria." />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Full Name</th>
                <th>Department</th>
                <th>CGPA</th>
                <th>Backlogs</th>
                <th>Batch</th>
                <th>Resume</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td><strong>{student.collegeId}</strong></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{student.firstName} {student.lastName}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{student.userId?.email}</div>
                  </td>
                  <td>{student.department}</td>
                  <td>
                    <span style={{ fontWeight: 800, color: student.cgpa >= 8 ? '#10b981' : '#4f46e5' }}>
                      {student.cgpa}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: student.activeBacklogs > 0 ? '#ef4444' : '#64748b', fontWeight: 600 }}>
                      {student.activeBacklogs}
                    </span>
                  </td>
                  <td>{student.graduationYear}</td>
                  <td>
                    {student.resumeS3Key ? (
                      <button
                        onClick={() => handleViewResume(student._id)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}
                      >
                        <FileText size={13} color="#4f46e5" /> View S3
                      </button>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Missing</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button onClick={() => openEditModal(student)} className="btn btn-secondary btn-sm" title="Edit Record">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleDeleteStudent(student._id, student.collegeId)} className="btn btn-outline-danger btn-sm" title="Delete Student">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Student Academic Details Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Student: ${editingStudent?.collegeId}`}>
        <form onSubmit={handleUpdateStudent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="grid-cols-2">
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>CGPA (0 - 10.0)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                required
                value={editFormData.cgpa}
                onChange={(e) => setEditFormData({ ...editFormData, cgpa: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Active Backlogs</label>
              <input
                type="number"
                min="0"
                required
                value={editFormData.activeBacklogs}
                onChange={(e) => setEditFormData({ ...editFormData, activeBacklogs: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Department</label>
            <select
              value={editFormData.department}
              onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>Phone</label>
            <input
              type="text"
              value={editFormData.phone}
              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={updating} className="btn btn-primary">{updating ? 'Saving...' : 'Update Record'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminStudentsPage;
