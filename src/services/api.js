import axios from 'axios';

// Dynamically determine API Base URL
const getBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  return '/api/v1';
};

const getUploadsBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_UPLOADS_BASE_URL) {
    return import.meta.env.VITE_UPLOADS_BASE_URL;
  }
  return '/uploads';
};

export const API_BASE_URL = getBaseUrl();
export const UPLOADS_BASE_URL = getUploadsBaseUrl();

// Create Axios Instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach Bearer token dynamically from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('thx_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch 401 Unauthorized errors and redirect to admin login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tangkap error jaringan atau jika server mati (tidak ada response object)
    if (!error.response) {
      return Promise.reject({
        response: {
          data: {
            message: 'Gagal terhubung ke server. Pastikan koneksi internet stabil atau hubungi admin.'
          }
        }
      });
    }

    if (error.response && error.response.status === 401) {
      localStorage.removeItem('thx_token');
      localStorage.removeItem('user');
      
      // Redirect to login if on admin route
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Helper to resolve product image URL
 * @param {string} imagePath 
 * @returns {string} full image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';
  }

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }

  // Strip leading slash or uploads/ prefix
  const cleanName = imagePath.replace(/^\/?(uploads\/)?/, '');
  return `${UPLOADS_BASE_URL}/${cleanName}`;
};

export default api;
