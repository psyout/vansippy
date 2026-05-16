import React from 'react';
import { FiXCircle, FiFacebook, FiMail, FiTwitter } from 'react-icons/fi';
import { Link } from 'react-router-dom';

function Lightbox({ lightboxOpen, toggleLightbox, title, address, url, copied, copyLinkOnClick, shareOnFacebook, shareOnTwitter, shareOnGmail }) {
	return (
		<>
			{lightboxOpen && (
				<div className='lightbox'>
					<div className='lightbox__content'>
						<span className='close-btn' onClick={toggleLightbox}>
							<FiXCircle />
						</span>
						<h2 className='lightbox__content--title'>Share</h2>
						<h3 className='lightbox__content--name'>{title.slice(0, 26)}</h3>
						<p className='lightbox__content--address'>{address}</p>
						<div className='lightbox__content--copy'>
							<p>Link to share</p>
							<div className='lightbox__content--container'>
								<Link className='lightbox__content--container-url' to={url} target='blank'>
									{url.length > 30 ? url.slice(0, 30) + '...' : url}
								</Link>
								<button onClick={copyLinkOnClick}>{!copied ? 'Copy link' : 'Copied!'}</button>
							</div>
						</div>
						<div className='lightbox__content--social'>
							<FiFacebook className='lightbox__content--social-icon' onClick={shareOnFacebook} />
							<FiTwitter className='lightbox__content--social-icon' onClick={shareOnTwitter} />
							<FiMail className='lightbox__content--social-icon' onClick={shareOnGmail} />
						</div>
					</div>
				</div>
			)}
		</>
	);
}

export default Lightbox;
