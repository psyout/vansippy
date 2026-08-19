import './AlternativeCard.scss';
import { useEffect, useMemo, useState } from 'react';
import { FiClock, FiGlobe, FiMapPin, FiPhone } from 'react-icons/fi';
import { TbBeer, TbBurger, TbCalendarEvent } from 'react-icons/tb';
import DrinksMenu from './DrinksMenu';
import FoodMenu from './FoodMenu';
import isBusinessOpen from '../../utils/isBusinessOpen';
import PlaceHolder from '../../assets/images/placeholder.jpg';

const getEntries = (value) => (value instanceof Map ? Array.from(value.entries()) : Object.entries(value || {}));

function AlternativeCard({
	title,
	address,
	time,
	hours,
	contact_number,
	drinks,
	food,
	specials,
	website,
	image,
	showSkeleton,
	onImageLoad,
	defaultExpandedDrinks = false,
	isSelected = false,
	autoExpandDrinks = false,
	hasUserSelected = false,
	compact = false,
	onViewDetails,
}) {
	const [expanded, setExpanded] = useState(defaultExpandedDrinks ? 'drinks' : null);
	const [cardImage, setCardImage] = useState(image || PlaceHolder);
	const [imageLoaded, setImageLoaded] = useState(false);
	const isOpen = useMemo(() => isBusinessOpen(hours), [hours]);
	const hasSpecials = useMemo(() => getEntries(specials).length > 0, [specials]);

	useEffect(() => {
		setCardImage(image || PlaceHolder);
		setImageLoaded(false);
	}, [image]);

	useEffect(() => {
		if (isSelected && autoExpandDrinks && drinks) setExpanded('drinks');
		else if (!isSelected && hasUserSelected) setExpanded(null);
	}, [isSelected, autoExpandDrinks, drinks, hasUserSelected]);

	const handleImageComplete = () => {
		setImageLoaded(true);
		onImageLoad?.();
	};

	const toggleExpanded = (section) => {
		setExpanded((current) => (current === section ? null : section));
	};

	const openMaps = () => {
		if (!address) return;
		window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank', 'noopener,noreferrer');
	};

	const openWebsite = () => {
		if (!website) return;
		window.open(website.startsWith('http') ? website : `https://${website}`, '_blank', 'noopener,noreferrer');
	};

	const renderSpecials = (value, keyPrefix = 'special') => (
		<ul className='alternative-card__specials-list'>
			{getEntries(value).map(([name, child]) => {
				const isNested = child && typeof child === 'object' && !Array.isArray(child);
				return (
					<li key={`${keyPrefix}-${name}`}>
						<strong>{name}</strong>
						{isNested ? renderSpecials(child, `${keyPrefix}-${name}`) : <span>: {String(child)}</span>}
					</li>
				);
			})}
		</ul>
	);

	if (showSkeleton) {
		return (
			<article
				className='alternative-card alternative-card--skeleton'
				aria-hidden='true'>
				<div className='alternative-card__skeleton-image' />
				<div className='alternative-card__skeleton-copy'>
					<span className='alternative-card__skeleton-line alternative-card__skeleton-line--title' />
					<span className='alternative-card__skeleton-line' />
					<span className='alternative-card__skeleton-line alternative-card__skeleton-line--short' />
				</div>
				<div className='alternative-card__skeleton-actions' />
			</article>
		);
	}

	return (
		<article className={`alternative-card${compact ? ' alternative-card--compact' : ''}`}>
			<div className='alternative-card__summary'>
				<div className='alternative-card__media'>
					{!imageLoaded && <span className='alternative-card__image-placeholder' />}
					<img
						src={cardImage}
						alt=''
						className={imageLoaded ? 'alternative-card__image' : 'alternative-card__image alternative-card__image--loading'}
						onLoad={handleImageComplete}
						onError={() => {
							if (cardImage !== PlaceHolder) setCardImage(PlaceHolder);
							else handleImageComplete();
						}}
					/>
					{isOpen !== null && (
						<span className={`alternative-card__status alternative-card__status--${isOpen ? 'open' : 'closed'}`}>
							<span aria-hidden='true' />
							{compact ? (isOpen ? 'Happy hour' : 'Ended') : isOpen ? `Happy hour\u2019s on!` : `Your hour\u2019s coming`}
						</span>
					)}
				</div>

				<div className='alternative-card__details'>
					<div className='alternative-card__title-row'>
						<h2 className='alternative-card__title'>{title}</h2>
						{/* </div></div>span
							className='alternative-card__rating'
							aria-label='Rated 4.6 out of 5'>
							<span aria-hidden='true'>★</span> 4.6/5
						</!> */}
					</div>

					<button
						type='button'
						className='alternative-card__address'
						onClick={openMaps}
						disabled={!address}>
						<FiMapPin aria-hidden='true' />
						<span>{address || 'Address unavailable'}</span>
					</button>

					<div className='alternative-card__hours'>
						<FiClock aria-hidden='true' />
						<div>{time?.length ? compact ? time[0] : time : <span>Hours unavailable</span>}</div>
					</div>

					{compact && (
						<div className='alternative-card__compact-actions'>
							<div className='alternative-card__quick-actions'>
								<a
									href={contact_number ? `tel:${contact_number}` : undefined}
									aria-disabled={!contact_number}
									aria-label='Call venue'>
									<FiPhone aria-hidden='true' />
								</a>
								{website && (
									<button
										type='button'
										onClick={openWebsite}
										aria-label='Open venue website'>
										<FiGlobe aria-hidden='true' />
									</button>
								)}
							</div>
							<button
								type='button'
								className='alternative-card__details-button'
								onClick={onViewDetails}>
								View details
							</button>
						</div>
					)}
				</div>
			</div>

			{!compact && (
				<div className='alternative-card__actions'>
					<div
						className='alternative-card__menu-actions'
						aria-label='Venue menus'>
						<button
							type='button'
							className={`alternative-card__menu-button--primary ${expanded === 'drinks' ? 'is-active' : ''}`}
							onClick={() => toggleExpanded('drinks')}
							aria-expanded={expanded === 'drinks'}>
							<TbBeer aria-hidden='true' /> Drinks
						</button>
						<button
							type='button'
							className={`alternative-card__menu-button--primary ${expanded === 'food' ? 'is-active' : ''}`}
							onClick={() => toggleExpanded('food')}
							aria-expanded={expanded === 'food'}>
							<TbBurger aria-hidden='true' /> Food
						</button>
						{hasSpecials && (
							<button
								type='button'
								className={expanded === 'specials' ? 'is-active' : ''}
								onClick={() => toggleExpanded('specials')}
								aria-expanded={expanded === 'specials'}
								aria-label='Specials'>
								<TbCalendarEvent aria-hidden='true' /> <span className='alternative-card__specials-label'>Specials</span>
							</button>
						)}
					</div>

					<div className='alternative-card__quick-actions'>
						<a
							href={contact_number ? `tel:${contact_number}` : undefined}
							aria-disabled={!contact_number}
							aria-label='Call venue'>
							<FiPhone aria-hidden='true' />
						</a>
						{website && (
							<button
								type='button'
								onClick={openWebsite}
								aria-label='Open venue website'>
								<FiGlobe aria-hidden='true' />
							</button>
						)}
					</div>
				</div>
			)}

			{!compact && expanded && (
				<div className='alternative-card__drawer'>
					{expanded === 'specials' && (
						<div className='alternative-card__drawer-heading'>
							<span>Specials</span>
							<small>Happy hour menu</small>
						</div>
					)}
					{expanded === 'drinks' && (
						<DrinksMenu
							drinks={drinks}
							website={website}
						/>
					)}
					{expanded === 'food' && (
						<FoodMenu
							food={food}
							website={website}
						/>
					)}
					{expanded === 'specials' && renderSpecials(specials)}
				</div>
			)}
		</article>
	);
}

export default AlternativeCard;
