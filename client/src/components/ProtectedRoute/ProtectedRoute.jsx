import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
	const [status, setStatus] = useState({ loading: true, authenticated: false });

	useEffect(() => {
		let mounted = true;

		const check = async () => {
			try {
				const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/auth/me`, {
					credentials: 'include',
				});
				const data = await response.json();

				if (!mounted) return;
				setStatus({ loading: false, authenticated: Boolean(data?.authenticated) });
			} catch (e) {
				if (!mounted) return;
				setStatus({ loading: false, authenticated: false });
			}
		};

		check();

		return () => {
			mounted = false;
		};
	}, []);

	if (status.loading) return <div>Loading...</div>;
	if (!status.authenticated) return <Navigate to='/business-login' replace />;
	return children;
}

export default ProtectedRoute;
