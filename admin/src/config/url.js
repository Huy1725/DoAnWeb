const normalizeUrl = (url) => (url.endsWith('/') ? url.slice(0, -1) : url);

const resolveFrontendSiteUrl = () => {
	if (import.meta.env.VITE_FRONTEND_URL) {
		return import.meta.env.VITE_FRONTEND_URL;
	}

	if (typeof window !== 'undefined') {
		const currentOrigin = window.location.origin;

		if (currentOrigin.includes('admin')) {
			return currentOrigin.replace('admin', 'frontend');
		}
	}

	return 'http://localhost:5173';
};

export const API_BASE_URL = normalizeUrl(import.meta.env.VITE_API_URL || 'https://cellphone-backend-3gmw.onrender.com/');
export const FRONTEND_SITE_URL = normalizeUrl(resolveFrontendSiteUrl());
