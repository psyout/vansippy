import React from 'react';
import { Typography, Link } from '@mui/material';
import './Footer.scss';

function Footer() {
	return (
		<footer className='footer'>
			<Typography variant='body2'>
				{'© Made by '}
				<Link
					href='https://felipegonzalez.dev'
					target='_blank'
					rel='noopener noreferrer'
					className='footer__link'>
					Felipe
				</Link>
				{'  in Vancouver, BC '}
				{new Date().getFullYear()}
			</Typography>
		</footer>
	);
}

export default Footer;
