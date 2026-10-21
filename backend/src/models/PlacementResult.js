const { BaseModel, registerModel } = require('./BaseModel');
const { getDB } = require('../config/db');
const MongoPlacementResult = require('./mongoose/PlacementResult');
const { createModelBridge } = require('./modelBridge');

class PlacementResult extends BaseModel {
  static tableName = 'placement_results';
  static relations = {
    placementDriveId: 'PlacementDrive',
    studentId: 'StudentProfile',
    companyId: 'Company',
  };

  constructor(data = {}) {
    super(data);
    if (!this.status) this.status = 'offered';
    if (this.offerLetterUrl === undefined) this.offerLetterUrl = '';
    if (!this.selectionDate) this.selectionDate = new Date().toISOString();
    if (this.selectionDate instanceof Date) {
      this.selectionDate = this.selectionDate.toISOString();
    }
    if (this.offeredSalary !== undefined) {
      this.offeredSalary = Number(this.offeredSalary);
      if (this.packageOffered === undefined) this.packageOffered = this.offeredSalary;
    }
    if (this.packageOffered !== undefined) {
      this.packageOffered = Number(this.packageOffered);
      if (this.offeredSalary === undefined) this.offeredSalary = this.packageOffered;
    }
    if (this.designation === undefined) {
      this.designation = 'Software Engineer';
    }
  }

  async save() {
    if (this.selectionDate instanceof Date) {
      this.selectionDate = this.selectionDate.toISOString();
    }
    if (this.offeredSalary !== undefined && this.packageOffered === undefined) {
      this.packageOffered = Number(this.offeredSalary);
    }
    if (this.packageOffered !== undefined && this.offeredSalary === undefined) {
      this.offeredSalary = Number(this.packageOffered);
    }
    if (!this.designation) {
      this.designation = 'Software Engineer';
    }
    return super.save();
  }

  static async aggregate(pipeline = []) {
    const db = getDB();

    // Check pipeline structure to determine which analytics query is requested
    const isCompanyAnalytics = pipeline.some((stage) => stage.$lookup && stage.$lookup.from === 'companies');

    if (isCompanyAnalytics) {
      const rows = db
        .prepare(
          `SELECT
            pr.companyId as _id,
            pr.companyId as companyId,
            c.name as companyName,
            c.industry as industry,
            COUNT(*) as totalHires,
            ROUND(AVG(pr.packageOffered)) as averagePackage,
            MAX(pr.packageOffered) as maxPackage
          FROM placement_results pr
          JOIN companies c ON pr.companyId = c._id
          GROUP BY pr.companyId
          ORDER BY totalHires DESC`
        )
        .all();

      return rows.map((r) => ({
        _id: r._id,
        companyId: r.companyId,
        companyName: r.companyName,
        industry: r.industry,
        totalHires: Number(r.totalHires),
        averagePackage: Number(r.averagePackage) || 0,
        maxPackage: Number(r.maxPackage) || 0,
      }));
    }

    // Default: Salary overview stats (admin summary)
    const stats = db
      .prepare(
        `SELECT
          AVG(packageOffered) as averageSalary,
          MAX(packageOffered) as highestSalary,
          MIN(packageOffered) as lowestSalary,
          COUNT(*) as totalOffers
        FROM placement_results`
      )
      .get();

    if (!stats || stats.totalOffers === 0) {
      return [];
    }

    return [
      {
        _id: null,
        averageSalary: Number(stats.averageSalary) || 0,
        highestSalary: Number(stats.highestSalary) || 0,
        lowestSalary: Number(stats.lowestSalary) || 0,
        totalOffers: Number(stats.totalOffers) || 0,
      },
    ];
  }
}

registerModel('PlacementResult', PlacementResult);

module.exports = createModelBridge(PlacementResult, MongoPlacementResult);
