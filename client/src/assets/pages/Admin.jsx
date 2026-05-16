import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.scss';

function Admin() {
	const [businesses, setBusinesses] = useState([]);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		fetchBusinesses();
	}, []);

	const fetchBusinesses = async () => {
		try {
			const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/locations`, {
				credentials: 'include',
			});
			const result = await response.json();
			setBusinesses(result.data || []);
		} catch (error) {
			console.error('Error fetching businesses:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleEditBusiness = (businessId) => {
		navigate(`/edit-business/${businessId}`);
	};

	const handleDeleteBusiness = async (businessId) => {
		if (window.confirm('Are you sure you want to delete this business?')) {
			try {
				await fetch(`${process.env.REACT_APP_SERVER_URL}/api/locations/${businessId}`, {
					method: 'DELETE',
					credentials: 'include',
				});
				fetchBusinesses(); // Refresh list
			} catch (error) {
				console.error('Error deleting business:', error);
			}
		}
	};

	if (loading) {
		return <div className='admin-loading'>Loading businesses...</div>;
	}

	return (
		<div className='admin-container'>
			<header className='admin-header'>
				<h1>Business Management</h1>
				<div className='admin-actions'>
					<button
						onClick={() => navigate('/add-location')}
						className='btn-primary'>
						Add New Business
					</button>
					<button
						onClick={() => navigate('/')}
						className='btn-secondary'>
						Back to Map
					</button>
				</div>
			</header>

			<div className='businesses-list'>
				{businesses.length === 0 ? (
					<p>No businesses found.</p>
				) : (
					businesses.map((business) => (
						<div
							key={business._id || business.id}
							className='business-card'>
							<div className='business-info'>
								<h3>{business.name}</h3>
								<p>{business.address}</p>
								<p>{business.category}</p>
							</div>
							<div className='business-actions'>
								<button
									onClick={() => handleEditBusiness(business._id || business.id)}
									className='btn-edit'>
									Edit
								</button>
								<button
									onClick={() => handleDeleteBusiness(business._id || business.id)}
									className='btn-delete'>
									Delete
								</button>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}

export default Admin;
