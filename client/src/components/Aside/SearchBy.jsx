import { BUSINESS_CATEGORIES } from '../../constants/businessOptions';

export const filters = [
	{ value: '', label: 'Categories' },
	...BUSINESS_CATEGORIES.map((category) => ({ value: category, label: category })),
];

export const hoodFilter = [
	{ value: '', label: 'Neighbourhood' },
	{ value: 'Kitsilano', label: 'Kitsilano' },
	{ value: 'Downtown', label: 'Downtown' },
	{ value: 'West End', label: 'West End' },
	{ value: 'Mount Pleasant', label: 'Mount Pleasant' },
	{ value: 'East Vancouver', label: 'East Vancouver' },
	{ value: 'North Vancouver', label: 'North Vancouver' },
	{ value: 'West Vancouver', label: 'West Vancouver' },
	{ value: 'South Granville', label: 'South Granville' },
	{ value: 'Point Grey', label: 'Point Grey' },
	{ value: 'Fair View', label: 'Fair View' },
	{ value: 'Dunbar', label: 'Dunbar' },
	{ value: 'Kerrisdale', label: 'Kerrisdale' },
	{ value: 'West Point Grey', label: 'West Point Grey' },
	{ value: 'Commercial Drive', label: 'Commercial Drive' },
];
