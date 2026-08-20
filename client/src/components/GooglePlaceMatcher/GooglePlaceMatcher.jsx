import { useState } from 'react';
import './GooglePlaceMatcher.scss';

const getResponseBody = async (response) => {
	const body = await response.json().catch(() => ({}));
	if (!response.ok) throw new Error(body.message || `Request failed (${response.status})`);
	return body;
};

function GooglePlaceMatcher({ business, onMatchChange }) {
	const businessId = business?._id || business?.id;
	const [candidates, setCandidates] = useState([]);
	const [searching, setSearching] = useState(false);
	const [savingPlaceId, setSavingPlaceId] = useState('');
	const [error, setError] = useState('');

	const serverRequest = async (path, options = {}) => {
		const response = await fetch(`${process.env.REACT_APP_SERVER_URL}${path}`, {
			...options,
			credentials: 'include',
			headers: {
				...(options.body ? { 'Content-Type': 'application/json' } : {}),
				...options.headers,
			},
		});
		return getResponseBody(response);
	};

	const search = async () => {
		setSearching(true);
		setError('');
		try {
			const result = await serverRequest(`/api/locations/${businessId}/google-place/search`, { method: 'POST' });
			setCandidates(result.data || []);
			if (!result.data?.length) setError('Google did not return a matching place.');
		} catch (searchError) {
			setError(searchError.message);
		} finally {
			setSearching(false);
		}
	};

	const verify = async (candidate) => {
		setSavingPlaceId(candidate.placeId);
		setError('');
		try {
			const result = await serverRequest(`/api/locations/${businessId}/google-place`, {
				method: 'PUT',
				body: JSON.stringify(candidate),
			});
			onMatchChange?.(result.data);
			setCandidates([]);
		} catch (saveError) {
			setError(saveError.message);
		} finally {
			setSavingPlaceId('');
		}
	};

	const verified = business?.googlePlace?.matchStatus === 'verified';

	return (
		<section className='google-place-matcher' aria-labelledby='google-place-title'>
			<div className='google-place-matcher__header'>
				<div>
					<h2 id='google-place-title'>Google Places</h2>
					<p>Confirm the correct Google Maps listing before using its photos.</p>
				</div>
				<button type='button' onClick={search} disabled={searching || Boolean(savingPlaceId)}>
					{searching ? 'Searching…' : verified ? 'Find a different match' : 'Find Google match'}
				</button>
			</div>

			{verified && (
				<div className='google-place-matcher__verified'>
					<strong>Verified:</strong> {business.googlePlace.name}
					<span>{business.googlePlace.formattedAddress}</span>
					{business.googlePlace.googleMapsUri && (
						<a href={business.googlePlace.googleMapsUri} target='_blank' rel='noreferrer'>Open in Google Maps</a>
					)}
				</div>
			)}

			{error && <p className='google-place-matcher__error' role='alert'>{error}</p>}

			{candidates.length > 0 && (
				<div className='google-place-matcher__results'>
					{candidates.map((candidate) => (
						<article key={candidate.placeId}>
							<div>
								<strong>{candidate.name}</strong>
								<span>{candidate.formattedAddress}</span>
								<small>{candidate.photoCount} Google photo{candidate.photoCount === 1 ? '' : 's'} available</small>
							</div>
							<button type='button' onClick={() => verify(candidate)} disabled={Boolean(savingPlaceId)}>
								{savingPlaceId === candidate.placeId ? 'Saving…' : 'Confirm match'}
							</button>
						</article>
					))}
				</div>
			)}
		</section>
	);
}

export default GooglePlaceMatcher;
