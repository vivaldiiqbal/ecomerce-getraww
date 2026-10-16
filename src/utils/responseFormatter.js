/**
 * Standardized Success JSON Response Format
 */
export const successResponse = (res, statusCode = 200, message = 'Sukses', data = null, meta = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta
  });
};

/**
 * Standardized Error JSON Response Format
 */
export const errorResponse = (res, statusCode = 400, message = 'Gagal', errorType = 'BadRequest', details = null) => {
  return res.status(statusCode).json({
    success: false,
    errorType,
    message,
    details
  });
};
