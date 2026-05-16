import React, { useState } from 'react';
import './LoginForm.scss';

function LoginForm({ onSuccess }) {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError('');

		try {
			const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
					email: username,
					password,
				}),
			});

			if (!response.ok) {
				if (response.status === 401) {
					setError('Invalid email or password. Access denied.');
					return;
				}
				setError('Login failed. Please try again.');
				return;
			}

			if (typeof onSuccess === 'function') onSuccess();
		} catch (err) {
			setError('Login failed. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className='admin-login-form'>
			<header className='login-header'>
				<h1>Admin Login</h1>
				<p>Access the business management dashboard</p>
			</header>

			<form onSubmit={handleSubmit}>
				{error && <div className='error-message'>{error}</div>}

				<div className='form-group'>
					<label htmlFor='username'>Email</label>
					<input
						id='username'
						type='email'
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						placeholder='Enter your email'
						required
					/>
				</div>

				<div className='form-group'>
					<label htmlFor='password'>Password</label>
					<input
						id='password'
						type='password'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder='Enter your password'
						required
					/>
				</div>

				<button
					type='submit'
					disabled={isLoading || !username || !password}
					className='submit-button'>
					{isLoading ? 'Signing in...' : 'Sign In'}
				</button>
			</form>

			<div className='login-footer'>
				<p>Admin Access Only</p>
			</div>
		</div>
	);
}

export default LoginForm;
