import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BusinessLogin.scss';

function BusinessLogin() {
	const [businessId, setBusinessId] = useState('');
	const [loading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!businessId.trim()) return;

		setIsLoading(true);

		// Simulate API call to verify business exists
		setTimeout(() => {
			setIsLoading(false);
			// Navigate to business dashboard
			navigate(`/business/${businessId.trim()}`);
		}, 1000);
	};

	return (
		<div className='business-login-container'>
			<div className='business-login-form'>
				<header className='login-header'>
					<h1>Business Login</h1>
					<p>Access your business dashboard</p>
				</header>

				<form onSubmit={handleSubmit}>
					<div className='form-group'>
						<label htmlFor='businessId'>Business ID</label>
						<input
							id='businessId'
							type='text'
							value={businessId}
							onChange={(e) => setBusinessId(e.target.value)}
							placeholder='Enter your business ID'
							required
						/>
						<small>Enter the ID provided when your business was registered in Vansippy.</small>
					</div>

					<button
						type='submit'
						disabled={loading || !businessId.trim()}
						className='submit-button'>
						{loading ? 'Accessing...' : 'Access Dashboard'}
					</button>
				</form>

				{/* <div className='login-footer'>
					<p>Don't have a business ID?</p>
					<button
						onClick={() => navigate('/')}
						className='link-button'>
						View Public Directory
					</button>
				</div> */}
			</div>
		</div>
	);
}

export default BusinessLogin;
