import AppError from "../utils/AppError.js";

export const validateBody = (schema) => {
  return (req, res, next) => {
    const errors = [];
    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      if (rules.required && (value === undefined || value === null || value === "")) {
        errors.push(`${field} is required`);
        continue;
      }

      if (value === undefined || value === null) continue;

      if (rules.type === "string" && typeof value !== "string") {
        errors.push(`${field} must be a string`);
        continue;
      }

      if (rules.type === "number" && typeof value !== "number") {
        errors.push(`${field} must be a number`);
        continue;
      }

      if (rules.type === "boolean" && typeof value !== "boolean") {
        errors.push(`${field} must be a boolean`);
        continue;
      }

      if (rules.type === "array" && !Array.isArray(value)) {
        errors.push(`${field} must be an array`);
        continue;
      }

      if (typeof value === "string") {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`);
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must be at most ${rules.maxLength} characters`);
        }
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(rules.patternMessage || `${field} has invalid format`);
        }
      }

      if (typeof value === "number") {
        if (rules.min !== undefined && value < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`);
        }
        if (rules.max !== undefined && value > rules.max) {
          errors.push(`${field} must be at most ${rules.max}`);
        }
      }

      if (rules.validate && typeof rules.validate === "function") {
        const err = rules.validate(value);
        if (err) errors.push(err);
      }
    }

    if (errors.length > 0) {
      throw new AppError("Validation failed", 400);
    }

    next();
  };
};
