import React from 'react';
import AccessTimeTwoToneIcon from '@mui/icons-material/AccessTimeTwoTone';

function OpenTime({ time, isOpen }) {
	const statusText = isOpen ? 'Happy hour time!' : "Happy hour's over";
	const statusModifier = isOpen ? 'open' : 'closed';

	return (
		<span className='restaurant-card__caption'>
			{isOpen !== null && (
				<span className='restaurant-card__caption--container'>
					<span
						className={`restaurant-card__status restaurant-card__status--${statusModifier}`}
						aria-label={statusText}
						title={statusText}>
						<AccessTimeTwoToneIcon
							className='restaurant-card__status-icon'
							sx={{ fontSize: '0.95rem' }}
						/>
						<span className='restaurant-card__status-label'>{statusText}</span>
					</span>
				</span>
			)}
			<span className='restaurant-card__caption--hours'>
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
