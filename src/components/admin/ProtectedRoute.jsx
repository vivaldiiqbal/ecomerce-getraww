import React from 'react';

export const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('thx_token');
  const userRaw = localStorage.getItem('user');

  let user = null;
  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch {
      user = null;
    }
  }

  // Check if authenticated & has 'admin' role
  const isAdmin = token && user && user.role === 'admin';

  if (!isAdmin) {
    // Clear invalid session if any
    if (token || user) {
      localStorage.removeItem('thx_token');
      localStorage.removeItem('user');
    }

    // Redirect to admin login
    window.location.href = '/admin/login';
    return null;
  }

  return children;
};
