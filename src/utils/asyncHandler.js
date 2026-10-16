/**
 * Async Error Wrapper Middleware
 * Ensures all uncaught asynchronous errors inside controllers are safely passed to Express next()
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
