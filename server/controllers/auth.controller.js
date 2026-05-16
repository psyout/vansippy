import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

		if (!email || !password) {
			return res.status(400).json({ success: false, message: 'Email and password required' });
		}

		const adminEmail = process.env.ADMIN_EMAIL;
		const adminHash = process.env.ADMIN_PASSWORD_HASH;
		const secret = process.env.JWT_SECRET;

		if (!adminEmail || !adminHash || !secret) {
			return res.status(500).json({ success: false, message: 'Server misconfigured' });
		}

		if (email !== adminEmail) {
			return res.status(401).json({ success: false, message: 'Invalid credentials' });
		}

		const ok = await bcrypt.compare(password, adminHash);
		if (!ok) {
			return res.status(401).json({ success: false, message: 'Invalid credentials' });
		}

		const token = jwt.sign({ role: 'admin', email }, secret, { expiresIn: '7d' });

		res.cookie('token', token, {
			...getCookieOptions(),
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		return res.status(200).json({ success: true, user: { email, role: 'admin' } });
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
