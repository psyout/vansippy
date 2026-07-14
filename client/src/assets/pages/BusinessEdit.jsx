import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AddLocation from './AddLocation';
import './BusinessEdit.scss';

function BusinessEdit() {
	const { businessId } = useParams();
	const navigate = useNavigate();
	const [business, setBusiness] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		let isMounted = true;

		const fetchBusiness = async () => {
			try {
				setLoading(true);
				setError(null);
				const isLocalBackend = (process.env.REACT_APP_SERVER_URL || '').includes('localhost');
				const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/locations`, {
					...(isLocalBackend ? { credentials: 'include' } : {}),
				});
				const result = await response.json();
				const businesses = result.data || [];
				const foundBusiness = businesses.find((b) => b._id === businessId || b.id === businessId);

				if (!foundBusiness) {
					throw new Error('Business not found');
				}

				if (isMounted) setBusiness(foundBusiness);
			} catch (error) {
				console.error('Error fetching business:', error);
				if (isMounted) setError(error.message);
			} finally {
				if (isMounted) setLoading(false);
			}
		};

		fetchBusiness();

		return () => {
			isMounted = false;
		};
	}, [businessId]);

	const handleUpdateSuccess = () => {
		navigate(`/business/${businessId}`);
	};

	if (loading) {
		return (
			<div className='business-edit-container'>
				<div className='loading-state'>
					<h2>Loading business data...</h2>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='business-edit-container'>
				<div className='error-state'>
					<h2>Error: {error}</h2>
					<button
						onClick={() => navigate(`/business/${businessId}`)}
						className='btn-primary'>
						Back to Dashboard
					</button>
				</div>
			</div>
		);
	}

	if (!business) {
		return (
			<div className='business-edit-container'>
				<div className='error-state'>
					<h2>Business not found</h2>
					<button
						onClick={() => navigate('/')}
						className='btn-primary'>
						Back to Home
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='business-edit-container'>
			<header className='business-edit-header'>
				<div className='header-content'>
					<h1>Edit {business.name}</h1>
					<p className='edit-subtitle'>Update your business information</p>
				</div>
				<div className='header-actions'>
					<button
						onClick={() => navigate(`/business/${businessId}`)}
						className='btn-secondary'>
						← Back to Dashboard
					</button>
				</div>
			</header>
			<AddLocation
				editMode={true}
				mode='edit'
				existingBusiness={business}
				onSuccess={handleUpdateSuccess}
			/>
		</div>
	);
}

export default BusinessEdit;
