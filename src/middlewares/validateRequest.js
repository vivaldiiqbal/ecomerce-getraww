import { z } from 'zod';
import { errorResponse } from '../utils/responseFormatter.js';

export const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issue = err.issues[0];
      return errorResponse(
        res,
        400,
        `Validasi gagal: ${issue.path.join('.')} - ${issue.message}`,
        'ValidationError',
        err.issues
      );
    }
    next(err);
  }
};

export const validateQuery = (schema) => (req, res, next) => {
  try {
    req.query = schema.parse(req.query);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issue = err.issues[0];
      return errorResponse(
        res,
        400,
        `Validasi query parameter gagal: ${issue.message}`,
        'ValidationError',
        err.issues
      );
    }
    next(err);
  }
};

export const validateParams = (schema) => (req, res, next) => {
  try {
    req.params = schema.parse(req.params);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return errorResponse(res, 400, 'Parameter URL tidak valid.', 'ValidationError', err.issues);
    }
    next(err);
  }
};
