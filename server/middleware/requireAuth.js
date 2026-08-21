import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
	try {
		const authorization = req.get('authorization') || '';
		const bearerMatch = authorization.match(/^Bearer\s+(.+)$/i);
		const token = req.cookies?.token || bearerMatch?.[1]?.trim();

		if (!token) {
			return res.status(401).json({ success: false, message: 'Unauthorized' });
		}

		const secret = process.env.JWT_SECRET;
		if (!secret) {
			return res.status(500).json({ success: false, message: 'Server misconfigured' });
		}

		const decoded = jwt.verify(token, secret);
		req.user = decoded;
		return next();
	} catch (error) {
		return res.status(401).json({ success: false, message: 'Unauthorized' });
	}
};

export const requireAdmin = (req, res, next) => {
	if (req.user?.role !== 'admin') {
		return res.status(403).json({ success: false, message: 'Administrator access required' });
	}
	return next();
};
