import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import { SkeletonTable } from '../components/LoadingSpinner';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../context/ToastContext';
import {
  Search,
  Users,
  Edit3,
  Trash2,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  GraduationCap,
  Shield,
  Loader2,
} from 'lucide-react';

const AdminStudentsPage = () => {
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [minCgpa, setMinCgpa] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const debouncedSearch = useDebounce(search, 250);

  // Edit Modal State
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({ cgpa: '', activeBacklogs: '', department: '', phone: '' });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Confirm Delete Dialog State
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Resume viewing state
  const [loadingResumeId, setLoadingResumeId] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [debouncedSearch, department, minCgpa]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch.trim()) params.append('search', debouncedSearch.trim());
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
      phone: student.phone || '',
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
        toast.success(
          'Student Record Updated',
          `Academic records updated for ${editingStudent.firstName} (${editingStudent.collegeId}).`
        );
        await fetchStudents();
      }
    } catch (err) {
      toast.error('Update Failed', err.response?.data?.message || 'Failed to update student.');
    } finally {
      setUpdating(false);
    }
  };

  const promptDeleteStudent = (student) => {
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/students/${studentToDelete._id}`);
      setStudents((prev) => prev.filter((s) => s._id !== studentToDelete._id));
      setIsDeleteDialogOpen(false);
      toast.success(
        'Student Profile Deleted',
        `Student ${studentToDelete.collegeId} deleted with audit trail record logged.`
      );
    } catch (err) {
      toast.error('Deletion Failed', err.response?.data?.message || 'Could not delete student record.');
    } finally {
      setDeleting(false);
    }
  };

  const handleViewResume = async (studentId) => {
    setLoadingResumeId(studentId);
    try {
      const res = await api.get(`/resumes/view/${studentId}`);
      if (res.data.success) {
        window.open(res.data.data.downloadUrl, '_blank');
      }
    } catch (err) {
      toast.error('Resume Access Failed', err.response?.data?.message || 'Could not generate presigned resume URL.');
    } finally {
      setLoadingResumeId(null);
    }
  };

  const totalPages = Math.ceil(students.length / pageSize) || 1;
  const paginatedStudents = students.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div>
      <PageHeader
        title="Student Academic Directory & Records"
        subtitle="Search student records, audit verified credentials, update academic standing, and inspect cloud resumes"
        breadcrumbs={[
          { label: 'Admin' },
          { label: 'Student Directory' },
        ]}
        actions={
          <span
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-default)',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontWeight: 'var(--font-weight-semibold)',
            }}
          >
            {students.length} students registered
          </span>
        }
      />

      {/* Discovery & Filters Card */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <input
              type="text"
              placeholder="Search by student name, roll number, or skills..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={{ paddingLeft: '2.4rem', fontSize: 'var(--text-xs)' }}
              aria-label="Search student records"
            />
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
              aria-hidden="true"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  padding: '0.2rem',
                }}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setCurrentPage(1);
              }}
              style={{ fontSize: 'var(--text-xs)' }}
              aria-label="Filter by department"
            >
              <option value="">All Academic Branches</option>
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
              onChange={(e) => {
                setMinCgpa(e.target.value);
                setCurrentPage(1);
              }}
              style={{ fontSize: 'var(--text-xs)' }}
              aria-label="Filter by minimum CGPA"
            />
          </div>

          {(search || department || minCgpa) && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setDepartment('');
                setMinCgpa('');
                setCurrentPage(1);
              }}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <X size={13} /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Students Data Table */}
      {loading ? (
        <SkeletonTable rows={8} cols={7} />
      ) : students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Students Found"
          description={
            search || department || minCgpa
              ? 'No student profiles match your search criteria.'
              : 'There are no students currently registered in the database.'
          }
        />
      ) : (
        <div className="table-container">
          <table aria-label="Student database directory table">
            <thead>
              <tr>
                <th scope="col">Student Candidate</th>
                <th scope="col">Roll ID</th>
                <th scope="col">Branch / Dept</th>
                <th scope="col">CGPA / Backlogs</th>
                <th scope="col">Graduation Year</th>
                <th scope="col">Cloud Resume</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.map((st) => {
                const isViewingResume = loadingResumeId === st._id;
                return (
                  <tr key={st._id}>
                    <td>
                      <div style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
                        {st.firstName} {st.lastName}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {st.userId?.email || 'N/A'} • {st.phone || 'No phone'}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-family-mono)', fontSize: 'var(--text-xs)' }}>
                      {st.collegeId}
                    </td>
                    <td>{st.department}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                        <strong style={{ color: 'var(--primary)', fontSize: 'var(--text-sm)' }}>
                          {st.cgpa}
                        </strong>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          ({st.activeBacklogs} backlogs)
                        </span>
                      </div>
                    </td>
                    <td>{st.graduationYear}</td>
                    <td>
                      {st.resumeS3Key ? (
                        <button
                          type="button"
                          onClick={() => handleViewResume(st._id)}
                          disabled={isViewingResume}
                          className="btn btn-secondary btn-xs"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          title="Open 15-minute presigned AWS S3 resume link"
                        >
                          {isViewingResume ? (
                            <Loader2 size={13} style={{ animation: 'spin 0.9s linear infinite' }} />
                          ) : (
                            <FileText size={13} style={{ color: 'var(--primary)' }} />
                          )}
                          <span>Resume (S3)</span>
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-subtle)', fontSize: '0.72rem' }}>
                          Missing
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button
                          type="button"
                          onClick={() => openEditModal(st)}
                          className="btn btn-secondary btn-xs"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          title={`Edit credentials for ${st.collegeId}`}
                        >
                          <Edit3 size={13} /> Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => promptDeleteStudent(st)}
                          className="btn btn-outline-danger btn-xs"
                          style={{ padding: '0.3rem 0.5rem' }}
                          title={`Delete student ${st.collegeId}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={students.length}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}

      {/* Edit Student Credentials Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Student Academic Record`}
        subtitle={`${editingStudent?.firstName} ${editingStudent?.lastName} • Roll ID: ${editingStudent?.collegeId}`}
        maxWidth="500px"
      >
        <form onSubmit={handleUpdateStudent} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label htmlFor="edit-dept" className="form-label">
              Academic Department <span className="required">*</span>
            </label>
            <select
              id="edit-dept"
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

          <div className="grid-cols-2">
            <div className="form-group">
              <label htmlFor="edit-cgpa" className="form-label">
                Cumulative CGPA (0-10) <span className="required">*</span>
              </label>
              <input
                id="edit-cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                required
                value={editFormData.cgpa}
                onChange={(e) => setEditFormData({ ...editFormData, cgpa: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-backlogs" className="form-label">
                Active Standing Backlogs <span className="required">*</span>
              </label>
              <input
                id="edit-backlogs"
                type="number"
                min="0"
                required
                value={editFormData.activeBacklogs}
                onChange={(e) => setEditFormData({ ...editFormData, activeBacklogs: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="edit-phone" className="form-label">
              Contact Phone
            </label>
            <input
              id="edit-phone"
              type="tel"
              value={editFormData.phone}
              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEditModalOpen(false)}
              disabled={updating}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={updating}>
              {updating ? 'Saving Changes...' : 'Save Academic Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Accessible Destructive Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Permanently Delete Student Profile"
        description={`Are you sure you want to permanently delete student ${studentToDelete?.firstName} ${studentToDelete?.lastName} (Roll ID: ${studentToDelete?.collegeId})? This will cascade remove their applications and create an immutable audit log entry.`}
        confirmText="Confirm & Delete Student"
        loading={deleting}
      />
    </div>
  );
};

export default AdminStudentsPage;
