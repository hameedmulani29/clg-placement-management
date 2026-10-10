const PlacementResult = require('../models/PlacementResult');
const Application = require('../models/Application');

/**
 * Helper to escape CSV cell contents
 */
const escapeCSV = (val) => {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

/**
 * Export Comprehensive Placement Report as CSV (Admin only)
 * GET /api/v1/reports/export-csv
 */
const exportPlacementReportCSV = async (req, res, next) => {
  try {
    const { department, graduationYear } = req.query;

    const results = await PlacementResult.find()
      .populate('placementDriveId', 'title jobRole salaryPackage')
      .populate('studentId', 'collegeId firstName lastName department graduationYear cgpa phone')
      .populate('companyId', 'name industry')
      .sort({ selectionDate: -1 });

    const filteredResults = results.filter((r) => {
      if (!r.studentId) return false;
      if (department && r.studentId.department !== department) return false;
      if (graduationYear && r.studentId.graduationYear !== Number(graduationYear)) return false;
      return true;
    });

    const headers = [
      'College ID',
      'Student Name',
      'Department',
      'Graduation Year',
      'CGPA',
      'Phone',
      'Company Name',
      'Industry',
      'Job Role',
      'Offered Package (LPA)',
      'Status',
      'Offer Date',
    ];

    const rows = filteredResults.map((r) => {
      const student = r.studentId || {};
      const company = r.companyId || {};
      const drive = r.placementDriveId || {};
      const lpa = r.offeredSalary ? (r.offeredSalary / 100000).toFixed(2) : 'N/A';
      const offerDate = r.selectionDate ? new Date(r.selectionDate).toISOString().split('T')[0] : '';

      return [
        escapeCSV(student.collegeId || 'N/A'),
        escapeCSV(`${student.firstName || ''} ${student.lastName || ''}`.trim()),
        escapeCSV(student.department || 'N/A'),
        escapeCSV(student.graduationYear || 'N/A'),
        escapeCSV(student.cgpa || 'N/A'),
        escapeCSV(student.phone || 'N/A'),
        escapeCSV(company.name || 'N/A'),
        escapeCSV(company.industry || 'N/A'),
        escapeCSV(drive.jobRole || 'N/A'),
        escapeCSV(lpa),
        escapeCSV(r.status ? r.status.toUpperCase() : 'OFFERED'),
        escapeCSV(offerDate),
      ].join(',');
    });

    const csvContent = [headers.map(escapeCSV).join(','), ...rows].join('\r\n');

    const fileName = `Placement_Report_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exportPlacementReportCSV,
};
