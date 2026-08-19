import './Aside.scss';
import { useState, useEffect } from 'react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import SortByDropDown from '../SortByDropDown/SortByDropDown';
import Footer from '../Footer/Footer';
import Card from '../Card';
import { filters, hoodFilter } from './SearchBy';
import formatHours from './FormatHours';
import isBusinessOpen from '../../utils/isBusinessOpen';

const haversineKm = ([lng1, lat1], [lng2, lat2]) => {
	const toRad = (deg) => (deg * Math.PI) / 180;
	const R = 6371;
	const dLat = toRad(lat2 - lat1);
	const dLng = toRad(lng2 - lng1);
	const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
	return 2 * R * Math.asin(Math.sqrt(a));
};

const filterAndSort = (features, search, filterBy, hoodBy, excludeColumns, userCenter, openNow) => {
	const q = search.toLowerCase();

	const filtered = features
		.filter(({ properties }) => !search || Object.keys(properties).some((key) => !excludeColumns.includes(key) && properties[key]?.toString().toLowerCase().includes(q)))
		.filter(({ properties }) => !filterBy || properties.category === filterBy)
		.filter(({ properties }) => !hoodBy || properties.neighbourhoods === hoodBy)
		.filter(({ properties }) => !openNow || isBusinessOpen(properties.hours) === true);

	if (userCenter) {
		return filtered
			.map((f) => ({
				...f,
				__distance: haversineKm(userCenter, f.geometry.coordinates),
			}))
			.sort((a, b) => a.__distance - b.__distance)
			.map(({ __distance, ...rest }) => rest);
	}

	return filtered.sort((a, b) => a.properties.name.localeCompare(b.properties.name));
};

function Aside({ selectedBusiness, geoJson, search, onClearSearch, businesses, userCenter, isLoading = false, error, onRetry, mobileHidden = false }) {
	const [filterBy, setFilterBy] = useState('');
	const [hoodBy, setHoodBy] = useState('');
	const [openNow, setOpenNow] = useState(false);
	const [isFirstLoad, setIsFirstLoad] = useState(true);
	const excludeColumns = ['id'];

	// Ensure geoJson is available before processing
	const sortedFeatures = geoJson?.features ? filterAndSort(geoJson.features, search, filterBy, hoodBy, excludeColumns, userCenter, openNow) : [];
	const hasActiveFilters = Boolean(search || filterBy || hoodBy || openNow);

	const clearAll = () => {
		setFilterBy('');
		setHoodBy('');
		setOpenNow(false);
		onClearSearch();
	};

	// Track if user has made a selection (not first load anymore)
	// Reset first load state when user selects a business (from map or card click)
	useEffect(() => {
		if (selectedBusiness) {
			setIsFirstLoad(false);
		}
	}, [selectedBusiness]);

	const skeletonCards = Array.from({ length: 4 }, (_, index) => (
		<Card
			key={`card-skeleton-${index}`}
			title=''
			address=''
			showSkeleton={true}
		/>
	));

	const renderCards = sortedFeatures
		.filter(({ properties }) => properties?.id && businesses.some((b) => (b?._id || b?.id) === properties.id))
		.map(({ properties }, index) => {
			const isSelected = selectedBusiness === properties.id;
			// Only expand first card on initial load (when no selection has been made)
			const shouldExpandFirst = false;
			// Expand selected card when user clicks a pin (after first load)
			const shouldExpandSelected = Boolean(!isFirstLoad && isSelected && properties.drinks);

			return (
				<Card
					key={properties.id}
					title={properties.name}
					address={properties.address}
					neighbourhoods={properties.neighbourhoods}
					contact_number={properties.contact_number}
					time={formatHours(properties.hours)}
					hours={properties.hours}
					drinks={properties.drinks}
					food={properties.food}
					specials={properties.specials}
					website={properties.website}
					url={properties.url}
					image={properties.image}
					defaultExpandedDrinks={shouldExpandFirst}
					isSelected={isSelected}
					autoExpandDrinks={shouldExpandSelected}
					hasUserSelected={!isFirstLoad}
				/>
			);
		});

	// Highlight the selected business card
	if (selectedBusiness) {
		const selectedIndex = sortedFeatures.findIndex(({ properties }) => properties.id === selectedBusiness);
		if (selectedIndex > -1) {
			const selectedCard = renderCards.splice(selectedIndex, 1)[0];
			renderCards.unshift(selectedCard);
		}
	}

	return (
		<aside className={`aside ${mobileHidden ? 'aside--mobile-hidden' : ''}`}>
			<SortByDropDown
				filters={filters}
				filterByValue={filterBy}
				onFilterByChange={(e) => setFilterBy(e.target.value)}
				hoodFilters={hoodFilter}
				hoodByValue={hoodBy}
				onHoodByChange={(e) => setHoodBy(e.target.value)}
				openNow={openNow}
				onOpenNowChange={(e) => setOpenNow(e.target.checked)}
				onClear={clearAll}
				hasActiveFilters={hasActiveFilters}
			/>
			<div className='aside__list'>
				{error && !isLoading ? (
					<div className='aside__state' role='alert'>
						<span className='aside__state-icon' aria-hidden='true'>!</span>
						<h3>We couldn't load the happy hours</h3>
						<p>Check your connection and try again.</p>
						<button type='button' onClick={onRetry}>Try again</button>
					</div>
				) : !isLoading && renderCards.length === 0 ? (
					<div className='aside__state' aria-live='polite'>
						<span className='aside__state-icon' aria-hidden='true'>⌕</span>
						<h3>No happy hours match</h3>
						<p>Try a different search or remove a filter.</p>
						{hasActiveFilters && <button type='button' onClick={clearAll}>Clear filters</button>}
					</div>
				) : (
				<ResponsiveMasonry columnsCountBreakPoints={{ 450: 1, 690: 2, 1050: 3, 1269: 2 }}>
					<Masonry
						containerWidth={800}
						gutter='30px'>
						{isLoading ? skeletonCards : renderCards}
					</Masonry>
				</ResponsiveMasonry>
				)}
			</div>
			<Footer />
		</aside>
	);
}

export default Aside;
