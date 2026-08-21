import './Card.scss';

const isGroupedMenuItem = (value) => value && typeof value === 'object' && !Array.isArray(value);

const renderMenuPrice = (value) => {
	if (isGroupedMenuItem(value)) {
		return value.price ? <span className='restaurant-card__menu--item-price'>: {value.price}</span> : null;
	}

	return <span className='restaurant-card__menu--item-price'>: {value}</span>;
};

const renderMenuItems = (value) => {
	if (!isGroupedMenuItem(value) || !Array.isArray(value.items) || value.items.length === 0) {
		return null;
	}

	return (
		<ul className='restaurant-card__menu--sublist'>
			{value.items.map((item) => (
				<li key={item}>{item}</li>
			))}
		</ul>
	);
};

function FoodMenu({ food, website }) {
	const foodArray = food ? Object.entries(food) : [];

	return (
		<div className='restaurant-card__menu'>
			{foodArray.length > 0 ? (
				<ul className='restaurant-card__menu--list-food'>
					{foodArray.map(([name, value]) => (
						<li
							className='restaurant-card__menu--item-food'
							key={name}>
							<span>
								<italic className='restaurant-card__menu--item-name'>{name}</italic>
								{renderMenuPrice(value)}
								{renderMenuItems(value)}
							</span>
						</li>
					))}
				</ul>
			) : (
				<ul className='restaurant-card__menu--list-food'>
					<li className='restaurant-card__menu--item-food'>No food specials here during happy hour.</li>
				</ul>
			)}
		</div>
	);
}

export default FoodMenu;
