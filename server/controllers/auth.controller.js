import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const safeStringEqual = (left, right) => {
	const leftBuffer = Buffer.from(String(left));
	const rightBuffer = Buffer.from(String(right));
	if (leftBuffer.length !== rightBuffer.length) return false;
	return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const getCookieOptions = () => {
	const isProd = process.env.NODE_ENV === 'production';

	return {
		httpOnly: true,
		secure: isProd,
		sameSite: isProd ? 'none' : 'lax',
		path: '/',
	};
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body || {};
		const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

		if (!normalizedEmail || !password) {
			return res.status(400).json({ success: false, message: 'Email and password required' });
		}

		const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
		const adminHash = process.env.ADMIN_PASSWORD_HASH?.trim();
		const adminPassword = process.env.ADMIN_PASSWORD?.trim();
		const secret = process.env.JWT_SECRET;

		if (!adminEmail || (!adminPassword && !adminHash) || !secret) {
			return res.status(500).json({ success: false, message: 'Server misconfigured' });
		}

		if (normalizedEmail !== adminEmail) {
			return res.status(401).json({ success: false, message: 'Invalid credentials' });
		}

		const ok = adminPassword
			? safeStringEqual(password, adminPassword)
			: await bcrypt.compare(password, adminHash);
		if (!ok) {
			return res.status(401).json({ success: false, message: 'Invalid credentials' });
		}

		const token = jwt.sign({ role: 'admin', email: adminEmail }, secret, { expiresIn: '7d' });

		res.cookie('token', token, {
			...getCookieOptions(),
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		return res.status(200).json({ success: true, user: { email: adminEmail, role: 'admin' } });
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Server error' });
	}
};

export const logout = (req, res) => {
	res.clearCookie('token', getCookieOptions());
	return res.status(200).json({ success: true });
};

export const me = (req, res) => {
	try {
		const token = req.cookies?.token;
		const secret = process.env.JWT_SECRET;

		if (!token || !secret) {
			return res.status(200).json({ authenticated: false });
		}

		const decoded = jwt.verify(token, secret);
		return res.status(200).json({ authenticated: true, user: { email: decoded.email, role: decoded.role } });
	} catch (error) {
		return res.status(200).json({ authenticated: false });
	}
};
