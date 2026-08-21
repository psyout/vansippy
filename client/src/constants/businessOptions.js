export const BUSINESS_CATEGORIES = [
	'Seafood',
	'Bars',
	'Canadian',
	'Karaoke',
	'Deli',
	'Cideries',
	'Restaurant',
	'Cocktail',
	'Mexican',
	'Lounges',
	'Spanish',
	'Australian',
	'Pub',
	'Gastropub',
	'Persian',
	'Dive Bars',
	'Italian',
	'Wine Bar',
	'Bakery',
];

const CATEGORY_ALIASES = {
	Bar: 'Bars',
};

export const normalizeBusinessCategory = (category) => CATEGORY_ALIASES[category] || category;
