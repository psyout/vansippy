import { FiChevronsRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function DrinksMenu({ drinks, website }) {
	// Convert drinks object to array format
	const drinksArray = drinks
		? Object.entries(drinks).map(([name, price]) => (
				<span>
					<strong className='restaurant-card__menu--item-name'>{name}</strong>
					<span className='restaurant-card__menu--item-price'>: {price}</span>
				</span>
			))
		: [];

	return (
		<>
			<div className='restaurant-card__menu'>
				<ul className='restaurant-card__menu--list-drinks'>
					{drinksArray.map((drink, index) => (
						<li
							className='restaurant-card__menu--item-drinks'
							key={index}>
							{drink}
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

export default DrinksMenu;
