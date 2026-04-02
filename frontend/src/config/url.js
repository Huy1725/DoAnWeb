const normalizeUrl = (url) => (url.endsWith('/') ? url.slice(0, -1) : url);

const resolveAdminSiteUrl = () => {
	if (import.meta.env.VITE_ADMIN_URL) {
		return import.meta.env.VITE_ADMIN_URL;
	}

	if (typeof window !== 'undefined') {
		const currentOrigin = window.location.origin;

		if (currentOrigin.includes('frontend')) {
			return currentOrigin.replace('frontend', 'admin');
		}
	}

	return 'http://localhost:5174';
};

export const API_BASE_URL = normalizeUrl(import.meta.env.VITE_API_URL || 'https://cellphone-backend-3gmw.onrender.com/');
export const ADMIN_SITE_URL = normalizeUrl(resolveAdminSiteUrl());
