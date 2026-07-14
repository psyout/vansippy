import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './BusinessDashboard.scss';

function BusinessDashboard() {
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
				const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/locations/${businessId}`, {
					credentials: 'include',
				});
				const result = await response.json();

				if (!response.ok) {
					throw new Error(result.message || 'Business not found');
				}

				if (isMounted) setBusiness(result.data);
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

	const handleEditBusiness = () => {
		navigate(`/business/${businessId}/edit`);
	};

	const handleLogout = () => {
		// For now, just navigate to home
		navigate('/business-login');
	};

	if (loading) {
		return (
			<div className='business-dashboard-container'>
				<div className='loading-state'>
					<h2>Loading your business dashboard...</h2>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='business-dashboard-container'>
				<div className='error-state'>
					<h2>Error: {error}</h2>
					<button
						onClick={() => navigate('/')}
						className='btn-primary'>
						Back to Home
					</button>
				</div>
			</div>
		);
	}

	if (!business) {
		return (
			<div className='business-dashboard-container'>
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
		<div className='business-dashboard-container'>
			<header className='business-dashboard-header'>
				<div className='header-content'>
					<h1>{business.name}</h1>
					<p className='business-subtitle'>Business Dashboard</p>
				</div>
				<div className='header-actions'>
					<button
						onClick={handleEditBusiness}
						className='btn-primary'>
						Edit Business
					</button>
					<button
						onClick={handleLogout}
						className='btn-logout'>
						Logout
					</button>
				</div>
			</header>

			<div className='dashboard-content'>
				<div className='business-overview'>
					<div className='overview-card'>
						<h3>Business Information</h3>
						<div className='info-grid'>
							<div className='info-item'>
								<label>Address:</label>
								<span>{business.address}</span>
							</div>
							<div className='info-item'>
								<label>City:</label>
								<span>
									{business.city}, {business.province}
								</span>
							</div>
							<div className='info-item'>
								<label>Neighbourhood:</label>
								<span>{business.neighbourhoods}</span>
							</div>
							<div className='info-item'>
								<label>Category:</label>
								<span>{business.category}</span>
							</div>
							<div className='info-item'>
								<label>Phone:</label>
								<span>{business.contact_number || 'Not provided'}</span>
							</div>
							<div className='info-item'>
								<label>Website:</label>
								<span>
									{business.website ? (
										<a
											href={business.website}
											target='_blank'
											rel='noopener noreferrer'>
											{business.website}
										</a>
									) : (
										'Not provided'
									)}
								</span>
							</div>
						</div>
					</div>

					<div className='overview-card'>
						<h3>Happy Hour Times</h3>
						{business.hours && Object.keys(business.hours).length > 0 ? (
							<div className='hours-list'>
								{Object.entries(business.hours).map(([day, time]) => (
									<div
										key={day}
										className='hour-item'>
										<span className='day'>{day}:</span>
										<span className='time'>{time}</span>
									</div>
								))}
							</div>
						) : (
							<p className='no-data'>No happy hour times set</p>
						)}
					</div>

					<div className='overview-card'>
						<h3>Drinks Menu</h3>
						{business.drinks && Object.keys(business.drinks).length > 0 ? (
							<div className='menu-list'>
								{Object.entries(business.drinks).map(([name, price]) => (
									<div
										key={name}
										className='menu-item'>
										<span className='name'>{name}</span>
										<span className='price'>{price}</span>
									</div>
								))}
							</div>
						) : (
							<p className='no-data'>No drinks menu items</p>
						)}
					</div>

					<div className='overview-card'>
						<h3>Food Menu</h3>
						{business.food && Object.keys(business.food).length > 0 ? (
							<div className='menu-list'>
								{Object.entries(business.food).map(([name, price]) => (
									<div
										key={name}
										className='menu-item'>
										<span className='name'>{name}</span>
										<span className='price'>{price}</span>
									</div>
								))}
							</div>
						) : (
							<p className='no-data'>No food menu items</p>
						)}
					</div>
				</div>

				<div className='dashboard-actions'>
					<div className='action-card'>
						<h3>Business Stats</h3>
						<div className='stats-grid'>
							<div className='stat-item'>
								<span className='stat-number'>{business.hours ? Object.keys(business.hours).length : 0}</span>
								<span className='stat-label'>Happy Hour Days</span>
							</div>
							<div className='stat-item'>
								<span className='stat-number'>{business.drinks ? Object.keys(business.drinks).length : 0}</span>
								<span className='stat-label'>Drink Items</span>
							</div>
							<div className='stat-item'>
								<span className='stat-number'>{business.food ? Object.keys(business.food).length : 0}</span>
								<span className='stat-label'>Food Items</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default BusinessDashboard;
