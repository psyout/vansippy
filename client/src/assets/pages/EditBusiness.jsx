import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AddLocation from './AddLocation';
import BusinessImageManager from '../../components/BusinessImageManager/BusinessImageManager';
import GooglePlaceMatcher from '../../components/GooglePlaceMatcher/GooglePlaceMatcher';
import './EditBusiness.scss';

function EditBusiness() {
	const { id } = useParams();
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
				const url = `${process.env.REACT_APP_SERVER_URL}/api/locations`;
				const isLocalBackend = (process.env.REACT_APP_SERVER_URL || '').includes('localhost');
				const response = await fetch(url, {
					...(isLocalBackend ? { credentials: 'include' } : {}),
				});

				if (!response.ok) {
					throw new Error(`Failed to fetch businesses (${response.status})`);
				}
				const result = await response.json();

				// Find the business with matching ID
				const businesses = result.data || [];
				const foundBusiness = businesses.find((b) => b._id === id || b.id === id);

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
	}, [id]);

	const handleUpdateSuccess = () => {
		navigate('/admin');
	};

	if (loading) {
		return <div className='edit-business-status'>Loading business data...</div>;
	}

	if (error) {
		return (
			<div className='edit-business-status edit-business-status--column'>
				<p>Error: {error}</p>
				<button
					onClick={() => navigate('/admin')}
					className='edit-business-status__button'>
					Back to Admin
				</button>
			</div>
		);
	}

	if (!business) {
		return <div className='edit-business-status'>Business not found</div>;
	}

	return (
		<div className='edit-business-container'>
			<header className='edit-business-header'>
				<h1>{business.name}</h1>
				<button
					onClick={() => navigate('/admin')}
					className='btn-secondary'>
					← Back to Admin
				</button>
			</header>
			<BusinessImageManager
				business={business}
				onImagesChange={(images) => setBusiness((current) => ({ ...current, images }))}
			/>
			<GooglePlaceMatcher
				business={business}
				onMatchChange={(googlePlace) => setBusiness((current) => ({ ...current, googlePlace }))}
			/>
			<AddLocation
				editMode={true}
				mode='edit'
				existingBusiness={business}
				onSuccess={handleUpdateSuccess}
			/>
		</div>
	);
}

export default EditBusiness;
