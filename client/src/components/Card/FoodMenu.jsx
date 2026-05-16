import { Link } from 'react-router-dom';
import { FiChevronsRight } from 'react-icons/fi';

function FoodMenu({ food, website }) {
	// Convert food object to array format
	const foodArray = food
		? Object.entries(food).map(([name, price]) => (
				<span>
					<strong className='restaurant-card__menu--item-name'>{name}</strong>
					<span className='restaurant-card__menu--item-price'>: {price}</span>
				</span>
			))
		: [];

	return (
		<>
			<div className='restaurant-card__menu'>
				<ul className='restaurant-card__menu--list-food'>
					{foodArray.map((foodItem, index) => (
						<li
							className={'restaurant-card__menu--item-food'}
							key={index}>
							{foodItem}
						</li>
					))}
				</ul>
				<Link
					to={website}
					target='blank'
					className='restaurant-card__menu--item-website'>
					See full menu here
					<span>
						<FiChevronsRight />
					</span>
				</Link>
			</div>
		</>
	);
}

export default FoodMenu;
