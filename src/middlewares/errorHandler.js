import { errorResponse } from '../utils/responseFormatter.js';

export const notFoundHandler = (req, res, _next) => {
  return errorResponse(res, 404, `Endpoint "${req.originalUrl}" tidak ditemukan pada server API GETRAW®.`, 'NotFound');
};

export const globalErrorHandler = (err, req, res, _next) => {
  console.error('💥 Global Error Handler:', err.name, err.message);
  
  if (err.name === 'ZodError') {
    return errorResponse(res, 400, 'Validasi data gagal.', 'ValidationError', err.issues);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan internal pada server.';
  
  return errorResponse(res, statusCode, message, err.name || 'InternalServerError');
};
