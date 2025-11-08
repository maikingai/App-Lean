import pbAdmin from '../pbAdminClient.js';

export default function requireAdmin(req, res, next) {
	try {
		if (!pbAdmin || !pbAdmin.authStore || !pbAdmin.authStore.isValid) {
			return res.status(403).json({ success: false, message: 'Admin credentials not configured or not authenticated' });
		}
		// Optionally inspect model for admin flag if your admin model stores roles
		return next();
	} catch (e) {
		return res.status(500).json({ success: false, message: e?.message || 'requireAdmin error' });
	}
}
