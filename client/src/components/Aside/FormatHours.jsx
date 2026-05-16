// src/utils/formatHours.js
import './FormatHours.scss';

export default function formatHours(hours) {
	const entries = hours instanceof Map ? Array.from(hours.entries()) : Object.entries(hours || {});

	return entries.map(([days, hrs]) => (
		<div key={days}>
			<span className='format-hours__day'>{days}</span>:<span className='format-hours__hrs'> {hrs}</span>
		</div>
	));
}
