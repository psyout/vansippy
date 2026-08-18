import Header from '../../components/Header/Header';
import Main from '../../components/Main/Main';
import Aside from '../../components/Aside/Aside';
import LoginForm from '../../components/LoginForm/LoginForm';
import './Home.scss';

import mapboxgl from 'mapbox-gl';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import 'mapbox-gl/dist/mapbox-gl.css';

import PlaceHolder from '../../assets/images/placeholder.jpg';

function Home() {
	const navigate = useNavigate();

	// Selected business ID from marker or list
	const [selectedBusiness, setSelectedBusiness] = useState(null);

	// All businesses from API
	const [businesses, setBusinesses] = useState([]);

	// GeoJSON data for map markers
	const [geoJson, setGeoJson] = useState(null);

	// Loading state for business cards
	const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(true);
	const [loadError, setLoadError] = useState(false);

	// Keep cards skeletonized until browser location is resolved or unavailable
	const [locationStatus, setLocationStatus] = useState('pending');

	// Search input state
	const [search, setSearch] = useState('');

	// User current coordinates
	const [userCenter, setUserCenter] = useState(null);

	// Login modal visibility
	const [showLogin, setShowLogin] = useState(false);
	const [mobileView, setMobileView] = useState('list');

	// Reference to map container div
	const mapContainer = useRef(null);

	// Reference to map instance
	const mapRef = useRef(null);

	// Store markers to clean them later
	const markersRef = useRef([]);

	// Fetch businesses from backend API
	const fetchGeoJson = async (signal) => {
		try {
			setIsLoadingBusinesses(true);
			setLoadError(false);

			const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/locations`, {
				signal,
				credentials: 'include',
			});
			if (!response.ok) throw new Error('Unable to load venues');

			const result = await response.json();

			const locations = result.data ?? [];

			// Convert backend data into GeoJSON format
			const geoJsonData = {
				type: 'FeatureCollection',

				features: locations.map((location) => ({
					properties: {
						id: location._id || location.id,
						name: location.name,
						address: location.address,
						coordinates: location.coordinates,
						contact_number: location.contact_number,
						website: location.website,
						hours: location.hours,
						drinks: location.drinks,
						food: location.food,
						specials: location.specials,
						neighbourhoods: location.neighbourhoods,
						url: location.url,
						category: location.category,

						// Use placeholder if image missing
						image: location.image || PlaceHolder,
					},

					geometry: {
						type: 'Point',
						coordinates: location.coordinates,
					},
				})),
			};

			// Save GeoJSON for map rendering
			setGeoJson(geoJsonData);

			// Save businesses for Aside component
			setBusinesses(
				locations.map((location) => ({
					...location,
					image: location.image || PlaceHolder,
				})),
			);
		} catch (error) {
			// Ignore aborted requests
			if (error.name !== 'AbortError') {
				console.error('Error fetching GeoJSON data:', error);
				setLoadError(true);
			}
		} finally {
			if (!signal?.aborted) {
				setIsLoadingBusinesses(false);
			}
		}
	};

	// Create map markers from GeoJSON
	const createMarkers = (geojson) =>
		geojson.features.map((feature) => {
			const { coordinates } = feature.geometry;

			const { name, address } = feature.properties;

			// Marker popup content. Use DOM nodes/textContent instead of HTML interpolation.
			const popupContent = document.createElement('div');
			const popupTitle = document.createElement('h3');
			const popupAddress = document.createElement('p');
			const popupAddressLabel = document.createElement('strong');

			popupTitle.textContent = name || 'Business';
			popupAddressLabel.textContent = 'Address: ';
			popupAddress.append(popupAddressLabel, address || 'Address unavailable');
			popupContent.append(popupTitle, popupAddress);

			const popup = new mapboxgl.Popup().setDOMContent(popupContent);

			// Create marker
			const marker = new mapboxgl.Marker({
				color: '#8a8ba6',
			})
				.setLngLat(coordinates)
				.setPopup(popup);

			// Store business ID inside marker
			marker.id = feature.properties.id;

			return marker;
		});

	// Initialize map once on component mount
	useEffect(() => {
		// Allows request cancellation on unmount
		const controller = new AbortController();

		// Fetch business data
		fetchGeoJson(controller.signal);

		// Mapbox access token
		mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || 'YOUR_MAPBOX_TOKEN';

		// Check browser WebGL support
		if (!mapboxgl.supported()) {
			alert('Your browser does not support WebGL');

			return () => controller.abort();
		}

		// Create map instance
		mapRef.current = new mapboxgl.Map({
			container: mapContainer.current,

			style: 'mapbox://styles/mapbox/streets-v12',

			// Default location
			center: [-123.114578, 49.285074],

			zoom: 13,
		});

		// Mapbox geolocation control
		const geolocate = new mapboxgl.GeolocateControl({
			positionOptions: {
				enableHighAccuracy: true,
			},

			trackUserLocation: true,

			showUserLocation: true,
		});

		mapRef.current.addControl(geolocate);

		const locationFallbackTimeout = setTimeout(() => {
			setLocationStatus((currentStatus) => (currentStatus === 'pending' ? 'unavailable' : currentStatus));
		}, 4000);

		// Automatically trigger geolocation on map load
		mapRef.current.on('load', () => {
			geolocate.trigger();
		});

		// Save user coordinates when location is found
		geolocate.on('geolocate', (e) => {
			const { latitude, longitude } = e.coords;

			setUserCenter([longitude, latitude]);
			setLocationStatus('ready');
			clearTimeout(locationFallbackTimeout);
		});

		geolocate.on('error', () => {
			setLocationStatus('unavailable');
			clearTimeout(locationFallbackTimeout);
		});

		// Cleanup when component unmounts
		return () => {
			controller.abort();
			clearTimeout(locationFallbackTimeout);

			if (mapRef.current) {
				mapRef.current.remove();

				mapRef.current = null;
			}
		};
	}, []);

	useEffect(() => {
		if (!showLogin) return undefined;

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		const handleKeyDown = (event) => {
			if (event.key === 'Escape') setShowLogin(false);
			if (event.key === 'Tab') {
				const focusable = Array.from(document.querySelectorAll('.login-modal-card button:not([disabled]), .login-modal-card input:not([disabled])'));
				if (!focusable.length) return;
				const first = focusable[0];
				const last = focusable[focusable.length - 1];
				if (event.shiftKey && document.activeElement === first) {
					event.preventDefault();
					last.focus();
				} else if (!event.shiftKey && document.activeElement === last) {
					event.preventDefault();
					first.focus();
				}
			}
		};
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener('keydown', handleKeyDown);
			document.querySelector('.header-profile-button')?.focus();
		};
	}, [showLogin]);

	useEffect(() => {
		if (mobileView !== 'map' || !mapRef.current) return;
		const frame = window.requestAnimationFrame(() => mapRef.current?.resize());
		return () => window.cancelAnimationFrame(frame);
	}, [mobileView]);

	// Render map markers whenever GeoJSON changes
	useEffect(() => {
		if (!geoJson || !mapRef.current) return;

		// Remove old markers before rendering new ones
		markersRef.current.forEach(({ marker, handler }) => {
			marker.getElement().removeEventListener('click', handler);

			marker.remove();
		});

		markersRef.current = [];

		// Create and add new markers
		createMarkers(geoJson).forEach((marker) => {
			// Handle marker click
			const handler = () => setSelectedBusiness(marker.id);

			// Add click listener
			marker.getElement().addEventListener('click', handler);

			// Add marker to map
			marker.addTo(mapRef.current);

			// Store marker reference for cleanup
			markersRef.current.push({
				marker,
				handler,
			});
		});

		// Cleanup markers on rerender
		return () => {
			markersRef.current.forEach(({ marker, handler }) => {
				marker.getElement().removeEventListener('click', handler);

				marker.remove();
			});

			markersRef.current = [];
		};
	}, [geoJson]);

	// Redirect after successful login
	const handleLoginSuccess = () => {
		setShowLogin(false);

		navigate('/admin');
	};

	return (
		<div className='container'>
			<Header
				search={search}
				handleSearchInput={(e) => setSearch(e.target.value)}
				onClearSearch={() => setSearch('')}
				onProfileClick={() => setShowLogin(true)}
			/>

			<div className='mobile-view-switch' aria-label='Choose results view'>
				<button type='button' className={mobileView === 'list' ? 'is-active' : ''} onClick={() => setMobileView('list')} aria-pressed={mobileView === 'list'}>List</button>
				<button type='button' className={mobileView === 'map' ? 'is-active' : ''} onClick={() => setMobileView('map')} aria-pressed={mobileView === 'map'}>Map</button>
			</div>

			<Aside
				selectedBusiness={selectedBusiness}
				setSelectedBusiness={setSelectedBusiness}
				geoJson={geoJson}
				search={search}
				onClearSearch={() => setSearch('')}
				businesses={businesses}
				userCenter={userCenter}
				isLoading={isLoadingBusinesses || locationStatus === 'pending'}
				error={loadError}
				onRetry={() => fetchGeoJson()}
				mobileHidden={mobileView === 'map'}
			/>

			<div className={`desktop-map ${mobileView === 'map' ? 'desktop-map--mobile-visible' : ''}`}>
				<Main mapContainer={mapContainer} />
			</div>

			{/* Login modal */}
			{showLogin && (
				<div className='login-modal-overlay' onMouseDown={(event) => {
					if (event.target === event.currentTarget) setShowLogin(false);
				}}>
					<div className='login-modal-card' role='dialog' aria-modal='true' aria-labelledby='admin-login-title'>
						{/* Close modal button */}
						<button
							onClick={() => setShowLogin(false)}
							className='login-modal-close'
							aria-label='Close admin sign in'>
							×
						</button>

						{/* Login form */}
						<LoginForm onSuccess={handleLoginSuccess} />
					</div>
				</div>
			)}
		</div>
	);
}

export default Home;
