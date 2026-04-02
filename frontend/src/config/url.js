const normalizeUrl = (url) => (url.endsWith('/') ? url.slice(0, -1) : url);

export const API_BASE_URL = normalizeUrl(import.meta.env.VITE_API_URL || 'https://cellphone-backend-3gmw.onrender.com/');
export const ADMIN_SITE_URL = import.meta.env.VITE_ADMIN_URL || 'https://cellphone-backend-3gmw.onrender.com/';
