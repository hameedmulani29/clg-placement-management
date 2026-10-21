/**
 * Automated Placement Drive Eligibility Engine
 * Evaluates candidate profile attributes against target drive criteria.
 */

/**
 * Check if a student is eligible for a specific placement drive
 * @param {object} studentProfile Student profile Mongoose document
 * @param {object} placementDrive Placement drive Mongoose document
 * @returns {{ isEligible: boolean, reasons: string[] }}
 */
const checkEligibility = (studentProfile, placementDrive) => {
  const reasons = [];

  if (!studentProfile) {
    return {
      isEligible: false,
      reasons: ['Student academic profile is incomplete or missing.'],
    };
  }

  if (!placementDrive) {
    return {
      isEligible: false,
      reasons: ['Placement drive not found.'],
    };
  }

  const { eligibilityCriteria = {}, collegeSpecificCriteria = [], applicationDeadline, status } = placementDrive;

  // 1. Placement Drive status check
  if (status !== 'upcoming' && status !== 'ongoing') {
    reasons.push(`Placement drive is currently ${status} and no longer accepting applications.`);
  }

  // 2. Application deadline check
  if (applicationDeadline && new Date() > new Date(applicationDeadline)) {
    reasons.push(
      `Application deadline passed on ${new Date(applicationDeadline).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}.`
    );
  }

  // Determine criteria: College-specific override or general drive criteria
  const studentCollege = (studentProfile.collegeName || 'COEP Technological University').trim().toLowerCase();
  const collegeRule = Array.isArray(collegeSpecificCriteria)
    ? collegeSpecificCriteria.find((c) => (c.collegeName || '').trim().toLowerCase() === studentCollege)
    : null;

  const effectiveMinCgpa = collegeRule && collegeRule.minCgpa !== undefined ? collegeRule.minCgpa : eligibilityCriteria.minCgpa;
  const effectiveMaxBacklogs = collegeRule && collegeRule.maxBacklogs !== undefined ? collegeRule.maxBacklogs : eligibilityCriteria.maxBacklogs;
  const effectiveAllowedDepts = collegeRule && Array.isArray(collegeRule.allowedDepartments) && collegeRule.allowedDepartments.length > 0
    ? collegeRule.allowedDepartments
    : eligibilityCriteria.allowedDepartments;

  // 3. Minimum CGPA threshold check
  if (effectiveMinCgpa !== undefined && studentProfile.cgpa < effectiveMinCgpa) {
    const contextStr = collegeRule ? ` (Custom criteria for ${studentProfile.collegeName || 'your college'})` : '';
    reasons.push(
      `CGPA requirement not met: Minimum required is ${effectiveMinCgpa}${contextStr}, but your verified CGPA is ${studentProfile.cgpa}.`
    );
  }

  // 4. Department / Branch restriction check
  if (
    Array.isArray(effectiveAllowedDepts) &&
    effectiveAllowedDepts.length > 0 &&
    !effectiveAllowedDepts.includes(studentProfile.department)
  ) {
    reasons.push(
      `Department '${studentProfile.department}' is not eligible. Eligible departments: [${effectiveAllowedDepts.join(
        ', '
      )}].`
    );
  }

  // 5. Target Graduation / Pass-out Year check
  if (
    eligibilityCriteria.graduationYear &&
    studentProfile.graduationYear !== eligibilityCriteria.graduationYear
  ) {
    reasons.push(
      `Graduation year mismatch: Open exclusively for the ${eligibilityCriteria.graduationYear} batch (Your batch: ${studentProfile.graduationYear}).`
    );
  }

  // 6. Active backlogs threshold check
  if (
    effectiveMaxBacklogs !== undefined &&
    studentProfile.activeBacklogs > effectiveMaxBacklogs
  ) {
    reasons.push(
      `Active backlog threshold exceeded: Maximum allowed is ${effectiveMaxBacklogs}, but you currently have ${studentProfile.activeBacklogs}.`
    );
  }

  return {
    isEligible: reasons.length === 0,
    reasons,
  };
};

module.exports = {
  checkEligibility,
};
