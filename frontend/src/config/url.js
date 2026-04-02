const normalizeUrl = (url) => (url.endsWith('/') ? url.slice(0, -1) : url);

export const API_BASE_URL = normalizeUrl(import.meta.env.VITE_API_URL || 'http://localhost:5000');
export const ADMIN_SITE_URL = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174';
