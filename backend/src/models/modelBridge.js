const { isMongoActive } = require('../config/db');

/**
 * Creates a transparent proxy that dynamically routes model operations to
 * either Mongoose (when MongoDB is active) or SQLite BaseModel (when SQLite is active).
 */
function createModelBridge(SqliteModel, MongoModel) {
  const handler = {
    get(target, prop, receiver) {
      // Invariant: prototype is a non-configurable property on function targets
      if (prop === 'prototype') {
        return target.prototype;
      }
      if (prop === Symbol.hasInstance) {
        return (instance) => {
          const ActiveClass = isMongoActive() ? MongoModel : SqliteModel;
          return instance instanceof ActiveClass || instance instanceof target;
        };
      }
      const active = isMongoActive() ? MongoModel : SqliteModel;
      const value = Reflect.get(active, prop);
      if (typeof value === 'function') {
        return value.bind(active);
      }
      return value;
    },
    construct(target, args, newTarget) {
      const ActiveClass = isMongoActive() ? MongoModel : SqliteModel;
      return Reflect.construct(ActiveClass, args, ActiveClass);
    },
    apply(target, thisArg, args) {
      const ActiveFn = isMongoActive() ? MongoModel : SqliteModel;
      return Reflect.apply(ActiveFn, thisArg, args);
    },
  };

  return new Proxy(SqliteModel, handler);
}

module.exports = { createModelBridge };
