import React from 'react';
import './SortByDropDown.scss';

function SortByDropDown({
	filters,
	filterByValue,
	onFilterByChange,
	hoodFilters,
	hoodByValue,
	onHoodByChange,
	openNow,
	onOpenNowChange,
	onClear,
	hasActiveFilters,
}) {
	return (
		<div
			className='options-dropdown'
			aria-label='Venue filters'>
			<div className='filter-dropdown'>
				<label
					className='options-dropdown__label'
					htmlFor='category-filter'>
					Category
				</label>
				<select
					id='category-filter'
					aria-label='Filter by category'
					className='options-dropdown__select'
					value={filterByValue}
					onChange={onFilterByChange}>
					{filters.map((filter) => (
						<option
							key={filter.value}
							value={filter.value}>
							{filter.label}
						</option>
					))}
				</select>
			</div>

			<div className='filter-dropdown'>
				<label
					className='options-dropdown__label'
					htmlFor='neighbourhood-filter'>
					Neighbourhood
				</label>
				<select
					id='neighbourhood-filter'
					aria-label='Filter by neighbourhood'
					className='options-dropdown__select'
					value={hoodByValue}
					onChange={onHoodByChange}>
					{hoodFilters.map((hood) => (
						<option
							key={hood.value}
							value={hood.value}>
							{hood.label}
						</option>
					))}
				</select>
			</div>

			<label className={`options-dropdown__toggle ${openNow ? 'options-dropdown__toggle--active' : ''}`}>
				<input
					type='checkbox'
					checked={openNow}
					onChange={onOpenNowChange}
				/>
				Happy Hour
			</label>

			{hasActiveFilters && (
				<button
					type='button'
					className='options-dropdown__clear'
					onClick={onClear}>
					Clear all
				</button>
			)}
		</div>
	);
}

export default SortByDropDown;
