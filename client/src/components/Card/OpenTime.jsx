import React from 'react';
import AccessTimeTwoToneIcon from '@mui/icons-material/AccessTimeTwoTone';

function OpenTime({ time }) {
	return (
		<span className='restaurant-card__caption'>
			<span className='restaurant-card__caption--container'>
				<AccessTimeTwoToneIcon sx={{ fontSize: '1rem' }} />
				<span className='restaurant-card__caption--title'>Happy Hour Time</span>
			</span>
			<span>
				{time.map((hours, index) => (
					<span
						key={index}
						className='restaurant-card__caption--text'>
						{hours}
					</span>
				))}
			</span>
		</span>
	);
}

export default OpenTime;
