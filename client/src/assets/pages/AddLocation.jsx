import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddLocation.scss';

function AddLocation({ editMode = false, mode = 'add', existingBusiness = null, onSuccess }) {
	const navigate = useNavigate();
	const [name, setName] = useState('');
	const [address, setAddress] = useState('');
	const [city, setCity] = useState('');
	const [province, setProvince] = useState('');
	const [postalCode, setPostalCode] = useState('');
	const [coordinates, setCoordinates] = useState({ lng: '', lat: '' });
	const [contactNumber, setContactNumber] = useState('');
	const [website, setWebsite] = useState('');
	const [category, setCategory] = useState('');
	const [neighbourhoods, setNeighbourhood] = useState('');
	const [hours, setHours] = useState([{ days: '', from: '', to: '' }]); // Multiple hours
	const [menuDrinks, setMenuDrinks] = useState([{ name: '', price: '' }]);
	const [menuFood, setMenuFood] = useState([{ name: '', price: '' }]);

	// Populate form with existing business data when in edit mode
	useEffect(() => {
		if (editMode && existingBusiness) {
			setName(existingBusiness.name || '');
			setAddress(existingBusiness.address || '');
			setCity(existingBusiness.city || '');
			setProvince(existingBusiness.province || '');
			setPostalCode(existingBusiness.postal_code || '');
			setCoordinates({
				lng: existingBusiness.coordinates?.[0] || '',
				lat: existingBusiness.coordinates?.[1] || '',
			});
			setContactNumber(existingBusiness.contact_number || '');
			setWebsite(existingBusiness.website || '');
			setCategory(existingBusiness.category || '');
			setNeighbourhood(existingBusiness.neighbourhoods || '');

			// Handle hours - convert from object to array format
			if (existingBusiness.hours) {
				const hoursArray = Object.entries(existingBusiness.hours).map(([days, time]) => {
					const [from, to] = time.split(' - ');
					return { days, from: from || '', to: to || '' };
				});
				setHours(hoursArray.length > 0 ? hoursArray : [{ days: '', from: '', to: '' }]);
			}

			// Handle drinks menu
			if (existingBusiness.drinks) {
				const drinksArray = Object.entries(existingBusiness.drinks).map(([name, price]) => ({
					name,
					price: price.toString(),
				}));
				setMenuDrinks(drinksArray.length > 0 ? drinksArray : [{ name: '', price: '' }]);
			}

			// Handle food menu
			if (existingBusiness.food) {
				const foodArray = Object.entries(existingBusiness.food).map(([name, price]) => ({
					name,
					price: price.toString(),
				}));
				setMenuFood(foodArray.length > 0 ? foodArray : [{ name: '', price: '' }]);
			}
		}
	}, [editMode, existingBusiness]);

	// Handle changes for hours
	const handleHoursChange = (index, field, value) => {
		const updatedHours = [...hours];
		updatedHours[index][field] = value;
		setHours(updatedHours);
	};

	const addHours = () => {
		setHours([...hours, { days: '', from: '', to: '' }]);
	};

	const removeHours = (index) => {
		setHours(hours.filter((_, i) => i !== index));
	};

	// Handle changes for menu items
	const handleMenuChange = (menu, setMenu, index, field, value) => {
		const updatedMenu = [...menu];
		if (field === 'price') {
			// Ensure the price always starts with a '$'
			updatedMenu[index][field] = value.startsWith('$') ? value : `$${value}`;
		} else {
			updatedMenu[index][field] = value;
		}
		setMenu(updatedMenu);
	};

	const addMenuItem = (menu, setMenu) => {
		setMenu([...menu, { name: '', price: '' }]);
	};

	const removeMenuItem = (menu, setMenu, index) => {
		setMenu(menu.filter((_, i) => i !== index));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		// Convert form data to match server API format
		const locationData = {
			name,
			address,
			city,
			province,
			postal_code: postalCode,
			coordinates: [parseFloat(coordinates.lng), parseFloat(coordinates.lat)],
			contact_number: contactNumber,
			website,
			neighbourhoods,
			category,
			// Convert hours array back to object format
			hours: hours.reduce((acc, hour) => {
				if (hour.days && hour.from && hour.to) {
					acc[hour.days] = `${hour.from} - ${hour.to}`;
				}
				return acc;
			}, {}),
			// Convert drinks array back to object format
			drinks: menuDrinks.reduce((acc, drink) => {
				if (drink.name && drink.price) {
					acc[drink.name] = drink.price;
				}
				return acc;
			}, {}),
			// Convert food array back to object format
			food: menuFood.reduce((acc, food) => {
				if (food.name && food.price) {
					acc[food.name] = food.price;
				}
				return acc;
			}, {}),
		};

		try {
			if (editMode) {
				// Update existing business
				await axios.put(`${process.env.REACT_APP_SERVER_URL}/api/locations/${existingBusiness._id || existingBusiness.id}`, locationData, {
					headers: { 'Content-Type': 'application/json' },
					withCredentials: true,
				});
				alert('Location updated successfully!');
			} else {
				// Create new business
				await axios.post(`${process.env.REACT_APP_SERVER_URL}/api/locations`, locationData, {
					headers: { 'Content-Type': 'application/json' },
					withCredentials: true,
				});
				alert('Location added successfully!');
			}

			// Call success callback if provided
			if (onSuccess) {
				onSuccess();
			} else if (!editMode) {
				// Reset form only for new locations
				setName('');
				setAddress('');
				setCity('');
				setProvince('');
				setPostalCode('');
				setCoordinates({ lng: '', lat: '' });
				setContactNumber('');
				setWebsite('');
				setNeighbourhood('');
				setCategory('');
				setHours([{ days: '', from: '', to: '' }]);
				setMenuDrinks([{ name: '', price: '' }]);
				setMenuFood([{ name: '', price: '' }]);
			}
		} catch (error) {
			console.error(`Error ${editMode ? 'updating' : 'adding'} location:`, error);
			alert(`Error ${editMode ? 'updating' : 'adding'} location. Please try again.`);
		}
	};

	const handleBackToAdmin = () => {
		navigate('/admin');
	};

	return (
		<div className={`add-location-container ${mode === 'add' ? 'add-mode' : ''}`}>
			<header className='add-location-header'>
				<div className='header-content'>
					<h1>{mode === 'edit' ? 'Edit Business' : 'Add New Business'}</h1>
					<p className='add-location-subtitle'>{mode === 'edit' ? 'Update business information' : 'Add a new business to Vansippy'}</p>
				</div>
				{mode === 'add' && (
					<div className='header-actions'>
						<button
							onClick={handleBackToAdmin}
							className='btn-secondary'>
							← Back to Admin
						</button>
					</div>
				)}
			</header>

			<div className='add-location-form'>
				<form onSubmit={handleSubmit}>
					<div className='form-group'>
						<label>Name:</label>
						<input
							type='text'
							className='form-input'
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
						/>
					</div>
					<div className='form-group address-group'>
						<label>Address:</label>
						<input
							type='text'
							className='form-input'
							placeholder='Street Address'
							value={address}
							onChange={(e) => setAddress(e.target.value)}
							required
						/>
						<input
							type='text'
							className='form-input'
							placeholder='City'
							value={city}
							onChange={(e) => setCity(e.target.value)}
							required
						/>
						<select
							className='form-select'
							value={province}
							onChange={(e) => setProvince(e.target.value)}
							required>
							<option
								value=''
								disabled>
								Select Province
							</option>
							<option value='AB'>Alberta</option>
							<option value='BC'>British Columbia</option>
							<option value='MB'>Manitoba</option>
							<option value='NB'>New Brunswick</option>
							<option value='NL'>Newfoundland and Labrador</option>
							<option value='NS'>Nova Scotia</option>
							<option value='ON'>Ontario</option>
							<option value='PE'>Prince Edward Island</option>
							<option value='QC'>Quebec</option>
							<option value='SK'>Saskatchewan</option>
							<option value='NT'>Northwest Territories</option>
							<option value='NU'>Nunavut</option>
							<option value='YT'>Yukon</option>
						</select>
						<input
							type='text'
							className='form-input'
							placeholder='Postal Code'
							value={postalCode}
							onChange={(e) => setPostalCode(e.target.value)}
							required
						/>
					</div>
					<div className='form-group'>
						<label>Neighborhood:</label>
						<select
							className='form-select'
							value={neighbourhoods}
							onChange={(e) => setNeighbourhood(e.target.value)}
							required>
							<option
								value=''
								disabled>
								Select Neighborhood
							</option>
							<option value='Downtown'>Downtown</option>
							<option value='Kitsilano'>Kitsilano</option>
							<option value='Mount Pleasant'>Mount Pleasant</option>
							<option value='West End'>West End</option>
							<option value='Yaletown'>Yaletown</option>
							<option value='Strathcona'>Strathcona</option>
							<option value='Gastown'>Gastown</option>
							<option value='Chinatown'>Chinatown</option>
							<option value='Commercial Drive'>Commercial Drive</option>
							<option value='East Vancouver'>East Vancouver</option>
							<option value='South Granville'>South Granville</option>
							<option value='Point Grey'>Point Grey</option>
							<option value='Fair View'>Fair View</option>
							<option value='Dunbar'>Dunbar</option>
						</select>
					</div>
					<div className='form-group'>
						<label>Category:</label>
						<select
							className='form-select'
							value={category}
							onChange={(e) => setCategory(e.target.value)}
							required>
							<option
								value=''
								disabled>
								Select Category
							</option>
							<option value='Restaurant'>Restaurant</option>
							<option value='Bar'>Bar</option>
							<option value='Pub'>Pub</option>
						</select>
					</div>
					<div className='form-group'>
						<label>Coordinates:</label>
						<input
							type='number'
							placeholder='Longitude'
							className='form-input'
							value={coordinates.lng || ''}
							onChange={(e) => setCoordinates({ ...coordinates, lng: e.target.value })}
							required
						/>
						<span className='form-spacer'></span>
						<input
							type='number'
							placeholder='Latitude'
							className='form-input'
							value={coordinates.lat || ''}
							onChange={(e) => setCoordinates({ ...coordinates, lat: e.target.value })}
							required
						/>
						<a
							className='coordinates-help-link'
							href='https://www.latlong.net/'
							target='_blank'
							rel='noopener noreferrer'>
							Need help finding coordinates?
						</a>
					</div>
					<div className='form-group'>
						<label>Contact Number:</label>
						<input
							type='tel'
							inputMode='numeric'
							className='form-input'
							value={contactNumber}
							onChange={(e) => setContactNumber(e.target.value)}
						/>
					</div>
					<div className='form-group'>
						<label>Website:</label>
						<input
							type='url'
							className='form-input'
							value={website}
							onChange={(e) => setWebsite(e.target.value)}
						/>
					</div>
					<div className='form-group'>
						<label>Hours of Operation:</label>
						{hours.map((hour, index) => (
							<div
								key={index}
								className='hours-row'>
								<input
									type='text'
									placeholder='Days (Monday - Sunday)'
									className='form-input'
									value={hour.days}
									onChange={(e) => handleHoursChange(index, 'days', e.target.value)}
									required
								/>
								<span className='form-spacer'></span>

								<div className='time-row'>
									<input
										type='time'
										className='form-input time-input'
										value={hour.from}
										onChange={(e) => handleHoursChange(index, 'from', e.target.value)}
										required
									/>
									<span className='time-separator'>to</span>
									<input
										type='time'
										className='form-input time-input'
										value={hour.to}
										onChange={(e) => handleHoursChange(index, 'to', e.target.value)}
										required
									/>
								</div>
								<button
									type='button'
									onClick={() => removeHours(index)}
									className='remove-button'>
									Remove
								</button>
							</div>
						))}
						<button
							type='button'
							onClick={addHours}
							className='add-menu-button'>
							Add Hours
						</button>
					</div>

					<div className='form-group'>
						<label>Happy Hour Menu (Drinks):</label>
						{menuDrinks.map((item, index) => (
							<div
								key={index}
								className='menu-item'>
								<input
									type='text'
									placeholder='Drink Name'
									className='form-input'
									value={item.name}
									onChange={(e) => handleMenuChange(menuDrinks, setMenuDrinks, index, 'name', e.target.value)}
								/>
								<input
									type='text' // Change to text to allow the '$' symbol
									placeholder='Price'
									className='form-input'
									value={item.price}
									onChange={(e) => handleMenuChange(menuDrinks, setMenuDrinks, index, 'price', e.target.value)}
								/>
								<button
									type='button'
									onClick={() => removeMenuItem(menuDrinks, setMenuDrinks, index)}>
									Remove
								</button>
							</div>
						))}
						<button
							className='add-menu-button'
							type='button'
							onClick={() => addMenuItem(menuDrinks, setMenuDrinks)}>
							Add Drink
						</button>
					</div>

					<div className='form-group'>
						<label>Happy Hour Menu (Food):</label>
						{menuFood.map((item, index) => (
							<div
								key={index}
								className='menu-item'>
								<input
									type='text'
									placeholder='Food Name'
									className='form-input'
									value={item.name}
									onChange={(e) => handleMenuChange(menuFood, setMenuFood, index, 'name', e.target.value)}
								/>
								<input
									type='text' // Change to text to allow the '$' symbol
									placeholder='Price'
									className='form-input'
									value={item.price}
									onChange={(e) => handleMenuChange(menuFood, setMenuFood, index, 'price', e.target.value)}
								/>
								<button
									type='button'
									onClick={() => removeMenuItem(menuFood, setMenuFood, index)}>
									Remove
								</button>
							</div>
						))}
						<button
							type='button'
							className='add-menu-button'
							onClick={() => addMenuItem(menuFood, setMenuFood)}>
							Add Food
						</button>
					</div>
					<button
						type='submit'
						className='submit-button'>
						{mode === 'edit' ? 'Update Business' : 'Add Business'}
					</button>
				</form>
			</div>
		</div>
	);
}

export default AddLocation;
