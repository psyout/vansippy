import React from 'react';
import { Link } from 'react-router-dom';
import { FaBeer, FaHamburger } from 'react-icons/fa';

function Menu({ selectedMenu, setSelectedMenu }) {
	return (
		<div className='restaurant-card__menu'>
			<ul className='restaurant-card__menu--list'>
				<li
					className={`restaurant-card__menu--item ${selectedMenu === 'drinks' ? 'restaurant-card__menu--item-active' : ''} ${
						selectedMenu !== 'menu' && selectedMenu !== 'drinks' ? 'restaurant-card__menu--item-disabled' : ''
					}`}>
					<Link
						onClick={() => setSelectedMenu('drinks')}
						className={`restaurant-card__menu--link ${selectedMenu === 'drinks' ? 'restaurant-card__menu--link-active' : ''}`}
						disabled={selectedMenu !== 'menu' && selectedMenu !== 'drinks'}>
						Drinks
						<span>
							<FaBeer className='restaurant-card__menu--icon' />
						</span>
					</Link>
				</li>
				<li
					className={`restaurant-card__menu--item ${selectedMenu === 'food' ? 'restaurant-card__menu--item-active' : ''} ${
						selectedMenu !== 'menu' && selectedMenu !== 'food' ? 'restaurant-card__menu--item-disabled' : ''
					}`}>
					<Link
						onClick={() => setSelectedMenu('food')}
						className={`restaurant-card__menu--link ${selectedMenu === 'food' ? 'restaurant-card__menu--link-active' : ''}`}
						disabled={selectedMenu !== 'menu' && selectedMenu !== 'food'}>
						Food
						<span>
							<FaHamburger />
						</span>
					</Link>
				</li>
			</ul>
		</div>
	);
}

export default Menu;
