const crypto = require('crypto');
const { getDB } = require('../config/db');

// Registry of all registered SQLite models for relational population
const modelRegistry = {};

function registerModel(name, modelClass) {
  modelRegistry[name] = modelClass;
}

function getModel(name) {
  return modelRegistry[name];
}

/**
 * Generate a 24-character hexadecimal ID compatible with MongoDB ObjectId format
 */
function generateId() {
  return crypto.randomBytes(12).toString('hex');
}

/**
 * Helper to get a nested property using dot-notation (e.g. 'eligibilityCriteria.allowedDepartments')
 */
function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
}

/**
 * Check if a row document matches a MongoDB-style query filter
 */
function matchesFilter(doc, filter) {
  if (!filter || Object.keys(filter).length === 0) return true;

  for (const [key, expected] of Object.entries(filter)) {
    if (key === '$or') {
      if (!Array.isArray(expected)) continue;
      const anyMatch = expected.some((subFilter) => matchesFilter(doc, subFilter));
      if (!anyMatch) return false;
      continue;
    }

    if (key === '$and') {
      if (!Array.isArray(expected)) continue;
      const allMatch = expected.every((subFilter) => matchesFilter(doc, subFilter));
      if (!allMatch) return false;
      continue;
    }

    const actual = getNestedValue(doc, key);

    // Filter value is an object containing query operators (e.g. $in, $gte, $lte, $ne)
    if (expected !== null && typeof expected === 'object' && !(expected instanceof RegExp)) {
      if ('$in' in expected) {
        const inList = Array.isArray(expected.$in) ? expected.$in : [];
        const inMatches = inList.some((item) => {
          if (actual === undefined || actual === null) return false;
          return String(item) === String(actual);
        });
        if (!inMatches) return false;
        continue;
      }

      if ('$nin' in expected) {
        const ninList = Array.isArray(expected.$nin) ? expected.$nin : [];
        const ninMatches = ninList.some((item) => String(item) === String(actual));
        if (ninMatches) return false;
        continue;
      }

      if ('$gte' in expected) {
        if (actual === undefined || actual === null || Number(actual) < Number(expected.$gte)) {
          return false;
        }
      }

      if ('$gt' in expected) {
        if (actual === undefined || actual === null || Number(actual) <= Number(expected.$gt)) {
          return false;
        }
      }

      if ('$lte' in expected) {
        if (actual === undefined || actual === null || Number(actual) > Number(expected.$lte)) {
          return false;
        }
      }

      if ('$lt' in expected) {
        if (actual === undefined || actual === null || Number(actual) >= Number(expected.$lt)) {
          return false;
        }
      }

      if ('$ne' in expected) {
        if (String(actual) === String(expected.$ne)) {
          return false;
        }
      }

      continue;
    }

    // Filter is a regular expression
    if (expected instanceof RegExp) {
      if (actual === undefined || actual === null) return false;
      // If actual is an array (e.g. skills), check if any element matches
      if (Array.isArray(actual)) {
        const arrayMatches = actual.some((item) => expected.test(String(item)));
        if (!arrayMatches) return false;
      } else {
        if (!expected.test(String(actual))) return false;
      }
      continue;
    }

    // If actual is an array (e.g. allowedDepartments), check if expected is inside the array
    if (Array.isArray(actual)) {
      if (!actual.includes(expected)) return false;
      continue;
    }

    // Direct comparison (handle string vs ObjectId vs boolean vs number)
    if (actual === undefined && expected === undefined) continue;
    if (actual === null && expected === null) continue;
    if (actual === undefined || actual === null) return false;

    if (typeof expected === 'boolean') {
      if (Boolean(actual) !== expected) return false;
    } else if (typeof expected === 'number') {
      if (Number(actual) !== expected) return false;
    } else {
      if (String(actual) !== String(expected)) return false;
    }
  }

  return true;
}

/**
 * Chainable Query Builder for SQLite Models
 */
class QueryBuilder {
  constructor(modelClass, filter = {}, isSingle = false) {
    this.modelClass = modelClass;
    this.filter = filter;
    this.isSingle = isSingle;
    this.populateList = [];
    this.sortCriteria = null;
    this.skipCount = 0;
    this.limitCount = null;
    this.selectedFields = null;
    this.includePassword = false;
  }

  populate(pathOrOptions, selectFields) {
    if (typeof pathOrOptions === 'string') {
      this.populateList.push({ path: pathOrOptions, select: selectFields });
    } else if (pathOrOptions && typeof pathOrOptions === 'object') {
      this.populateList.push(pathOrOptions);
    }
    return this;
  }

  sort(criteria) {
    this.sortCriteria = criteria;
    return this;
  }

  skip(count) {
    this.skipCount = Number(count) || 0;
    return this;
  }

  limit(count) {
    this.limitCount = Number(count);
    return this;
  }

  select(fields) {
    if (typeof fields === 'string') {
      if (fields.includes('+password')) {
        this.includePassword = true;
      }
      this.selectedFields = fields.split(/\s+/).filter(Boolean);
    } else if (Array.isArray(fields)) {
      this.selectedFields = fields;
    }
    return this;
  }

  async execute() {
    const db = getDB();
    const rows = db.prepare(`SELECT * FROM ${this.modelClass.tableName}`).all();

    // Convert raw SQLite rows to model instances
    let docs = rows.map((row) => this.modelClass._fromRow(row, this.includePassword));

    // Filter documents
    if (this.filter && Object.keys(this.filter).length > 0) {
      docs = docs.filter((doc) => matchesFilter(doc, this.filter));
    }

    // Apply sorting
    if (this.sortCriteria) {
      let sortEntries = [];
      if (typeof this.sortCriteria === 'object') {
        sortEntries = Object.entries(this.sortCriteria);
      }
      docs.sort((a, b) => {
        for (const [field, order] of sortEntries) {
          const dir = order === 'asc' || order === 1 ? 1 : -1;
          const valA = getNestedValue(a, field);
          const valB = getNestedValue(b, field);
          if (valA === valB) continue;
          if (valA === undefined || valA === null) return 1;
          if (valB === undefined || valB === null) return -1;
          if (valA < valB) return -1 * dir;
          if (valA > valB) return 1 * dir;
        }
        return 0;
      });
    }

    // Single result request
    if (this.isSingle) {
      const doc = docs.length > 0 ? docs[0] : null;
      if (!doc) return null;
      await this.modelClass._applyPopulate([doc], this.populateList);
      this._applyFieldSelection([doc]);
      return doc;
    }

    // Apply pagination
    if (this.skipCount > 0) {
      docs = docs.slice(this.skipCount);
    }
    if (this.limitCount !== null && this.limitCount !== undefined && this.limitCount >= 0) {
      docs = docs.slice(0, this.limitCount);
    }

    // Apply relations populate
    if (docs.length > 0 && this.populateList.length > 0) {
      await this.modelClass._applyPopulate(docs, this.populateList);
    }

    // Apply field projection if requested
    this._applyFieldSelection(docs);

    return docs;
  }

  _applyFieldSelection(docs) {
    if (!this.selectedFields || this.selectedFields.length === 0) return;
    const includeFields = this.selectedFields.filter((f) => !f.startsWith('-') && !f.startsWith('+'));
    if (includeFields.length > 0) {
      const alwaysKeep = ['_id'];
      for (const doc of docs) {
        for (const key of Object.keys(doc)) {
          if (!includeFields.includes(key) && !alwaysKeep.includes(key)) {
            delete doc[key];
          }
        }
      }
    }
  }

  // Thenable interface so await Query works directly
  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }

  catch(reject) {
    return this.execute().catch(reject);
  }
}

/**
 * Base Model Class for SQLite entities
 */
class BaseModel {
  static tableName = '';
  static jsonFields = [];
  static booleanFields = [];
  static relations = {}; // fieldName -> ModelName

  constructor(data = {}) {
    Object.assign(this, data);
    if (!this._id) {
      this._id = generateId();
    }
    const now = new Date().toISOString();
    if (!this.createdAt) this.createdAt = now;
    if (!this.updatedAt) this.updatedAt = now;
  }

  /**
   * Convert an instance to a plain Javascript object
   */
  toObject() {
    const copy = { ...this };
    return copy;
  }

  /**
   * JSON serialization
   */
  toJSON() {
    return this.toObject();
  }

  /**
   * Persist instance to SQLite database (INSERT or UPDATE)
   */
  async save() {
    const db = getDB();
    const now = new Date().toISOString();
    this.updatedAt = now;

    const row = this.constructor._toRow(this);
    const columns = Object.keys(row);
    const placeholders = columns.map(() => '?').join(', ');
    const values = columns.map((col) => row[col]);

    const updateClauses = columns.map((col) => `${col} = excluded.${col}`).join(', ');

    const sql = `
      INSERT INTO ${this.constructor.tableName} (${columns.join(', ')})
      VALUES (${placeholders})
      ON CONFLICT(_id) DO UPDATE SET ${updateClauses}
    `;

    try {
      db.prepare(sql).run(...values);
    } catch (err) {
      // Map SQLite UNIQUE constraint error to MongoDB-compatible error code 11000
      if (err.message && err.message.includes('UNIQUE constraint failed')) {
        const error = new Error(err.message);
        error.code = 11000;
        const matched = err.message.match(/UNIQUE constraint failed: [^.]+\.(.+)/);
        const field = matched ? matched[1] : 'field';
        error.keyValue = { [field]: this[field] };
        throw error;
      }
      throw err;
    }

    return this;
  }

  /**
   * Convert SQLite database row to Model instance
   */
  static _fromRow(row, includePassword = false) {
    if (!row) return null;
    const data = { ...row };

    // Parse JSON fields
    for (const field of this.jsonFields) {
      if (data[field] !== undefined && data[field] !== null) {
        if (typeof data[field] === 'string') {
          try {
            data[field] = JSON.parse(data[field]);
          } catch (_) {
            data[field] = [];
          }
        }
      } else {
        data[field] = [];
      }
    }

    // Convert booleans
    for (const field of this.booleanFields) {
      if (data[field] !== undefined && data[field] !== null) {
        data[field] = Boolean(data[field]);
      }
    }

    const instance = new this(data);
    return instance;
  }

  /**
   * Get valid table columns from SQLite PRAGMA
   */
  static _getTableColumns() {
    if (!this._tableColumns) {
      try {
        const db = getDB();
        const cols = db.prepare(`PRAGMA table_info(${this.tableName})`).all();
        if (cols && cols.length > 0) {
          this._tableColumns = new Set(cols.map((c) => c.name));
        }
      } catch (_) {
        this._tableColumns = null;
      }
    }
    return this._tableColumns;
  }

  /**
   * Convert Model instance to SQLite database row
   */
  static _toRow(instance) {
    const row = {};
    const validCols = this._getTableColumns();

    for (const [key, value] of Object.entries(instance)) {
      if (key.startsWith('_') && key !== '_id') continue;
      if (typeof value === 'function') continue;
      if (validCols && !validCols.has(key)) continue;

      if (this.relations && this.relations[key] && value && typeof value === 'object' && value._id) {
        row[key] = String(value._id);
      } else if (this.jsonFields.includes(key)) {
        row[key] = typeof value === 'string' ? value : JSON.stringify(value ?? []);
      } else if (this.booleanFields.includes(key)) {
        row[key] = value ? 1 : 0;
      } else if (value instanceof Date) {
        row[key] = value.toISOString();
      } else {
        row[key] = value === undefined ? null : value;
      }
    }
    return row;
  }

  /**
   * Static find methods
   */
  static find(filter = {}) {
    return new QueryBuilder(this, filter, false);
  }

  static findOne(filter = {}) {
    return new QueryBuilder(this, filter, true);
  }

  static findById(id) {
    return new QueryBuilder(this, { _id: id ? id.toString() : null }, true);
  }

  static async countDocuments(filter = {}) {
    const docs = await this.find(filter);
    return docs.length;
  }

  static async distinct(field, filter = {}) {
    const docs = await this.find(filter);
    const set = new Set();
    for (const doc of docs) {
      const val = doc[field];
      if (val !== undefined && val !== null) {
        set.add(String(val));
      }
    }
    return Array.from(set);
  }

  static async exists(filter = {}) {
    const doc = await this.findOne(filter);
    return doc ? { _id: doc._id } : false;
  }

  static async create(dataOrArray) {
    if (Array.isArray(dataOrArray)) {
      const results = [];
      for (const item of dataOrArray) {
        const instance = new this(item);
        await instance.save();
        results.push(instance);
      }
      return results;
    } else {
      const instance = new this(dataOrArray);
      await instance.save();
      return instance;
    }
  }

  static findByIdAndUpdate(id, updateData, options = { new: true }) {
    const self = this;
    const promise = (async () => {
      const doc = await self.findById(id);
      if (!doc) return null;

      Object.assign(doc, updateData);
      await doc.save();
      return doc;
    })();

    // Make it thenable and populate-able
    promise.populate = function (pathOrOptions, selectFields) {
      return promise.then(async (doc) => {
        if (!doc) return null;
        await self._applyPopulate([doc], [typeof pathOrOptions === 'string' ? { path: pathOrOptions, select: selectFields } : pathOrOptions]);
        return doc;
      });
    };

    return promise;
  }

  static async findOneAndUpdate(filter, updateData, options = { new: true }) {
    let doc = await this.findOne(filter);

    if (!doc && options && options.upsert) {
      doc = new this({ ...filter, ...updateData });
      await doc.save();
      return doc;
    }

    if (!doc) return null;

    Object.assign(doc, updateData);
    await doc.save();
    return doc;
  }

  static async updateMany(filter, updateData) {
    const docs = await this.find(filter);
    for (const doc of docs) {
      Object.assign(doc, updateData);
      await doc.save();
    }
    return { modifiedCount: docs.length };
  }

  static async findByIdAndDelete(id) {
    const db = getDB();
    const doc = await this.findById(id);
    if (!doc) return null;
    db.prepare(`DELETE FROM ${this.tableName} WHERE _id = ?`).run(String(id));
    return doc;
  }

  static async deleteMany(filter = {}) {
    const db = getDB();
    if (!filter || Object.keys(filter).length === 0) {
      const result = db.prepare(`DELETE FROM ${this.tableName}`).run();
      return { deletedCount: result.changes };
    }
    const docs = await this.find(filter);
    for (const doc of docs) {
      db.prepare(`DELETE FROM ${this.tableName} WHERE _id = ?`).run(doc._id);
    }
    return { deletedCount: docs.length };
  }

  /**
   * Populate relations on an array of documents
   */
  static async _applyPopulate(docs, populateList) {
    for (const pop of populateList) {
      const fieldPath = pop.path;
      const selectFields = pop.select ? pop.select.split(/\s+/).filter(Boolean) : null;
      const nestedPopulate = pop.populate;

      const targetModelName = this.relations[fieldPath];
      if (!targetModelName) continue;
      const targetModel = getModel(targetModelName);
      if (!targetModel) continue;

      for (const doc of docs) {
        const foreignId = doc[fieldPath];
        if (!foreignId) continue;

        // If already populated, skip
        if (typeof foreignId === 'object' && foreignId._id) continue;

        const relatedDoc = await targetModel.findById(foreignId);
        if (relatedDoc) {
          // If select fields specified, filter related doc
          if (selectFields && selectFields.length > 0) {
            const filtered = { _id: relatedDoc._id };
            for (const f of selectFields) {
              filtered[f] = relatedDoc[f];
            }
            doc[fieldPath] = filtered;
          } else {
            doc[fieldPath] = relatedDoc;
          }

          // Handle nested populate if specified
          if (nestedPopulate && relatedDoc) {
            await targetModel._applyPopulate([relatedDoc], [nestedPopulate]);
          }
        }
      }
    }
  }
}

module.exports = {
  BaseModel,
  registerModel,
  getModel,
  generateId,
  matchesFilter,
};
