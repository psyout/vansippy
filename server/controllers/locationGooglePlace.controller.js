import mongoose from 'mongoose';
import Location from '../models/locations.model.js';

const PLACES_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';
const PLACE_DETAILS_URL = 'https://places.googleapis.com/v1/places';
const PHOTO_PREVIEW_LIMIT = 5;
const SEARCH_FIELD_MASK = [
	'places.id',
	'places.displayName',
	'places.formattedAddress',
	'places.location',
	'places.googleMapsUri',
	'places.photos',
].join(',');

const getLocation = async (id) => {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		const error = new Error('Invalid ID format');
		error.status = 400;
		throw error;
	}

	const location = await Location.findById(id);
	if (!location) {
		const error = new Error('Location not found');
		error.status = 404;
		throw error;
	}

	return location;
};

const handleError = (res, error, action) => {
	console.error(`Error ${action}:`, error);
	return res.status(error.status || 500).json({
		success: false,
		message: error.status ? error.message : 'Google Places request failed',
	});
};

const ensurePlacesConfigured = () => {
	if (!process.env.GOOGLE_PLACES_API_KEY?.trim()) {
		const error = new Error('Google Places is not configured');
		error.status = 503;
		throw error;
	}
};

export const searchGooglePlaces = async (req, res) => {
	try {
		ensurePlacesConfigured();
		const location = await getLocation(req.params.id);
		const address = location.full_address || [location.address, location.city, location.province, location.postal_code]
			.filter(Boolean)
			.join(', ');
		const body = {
			textQuery: `${location.name}, ${address}`,
			languageCode: 'en',
			regionCode: 'CA',
			pageSize: 5,
		};

		if (Array.isArray(location.coordinates) && location.coordinates.length === 2) {
			body.locationBias = {
				circle: {
					center: {
						latitude: Number(location.coordinates[1]),
						longitude: Number(location.coordinates[0]),
					},
					radius: 3000,
				},
			};
		}

		const response = await fetch(PLACES_SEARCH_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY.trim(),
				'X-Goog-FieldMask': SEARCH_FIELD_MASK,
			},
			body: JSON.stringify(body),
		});
		const result = await response.json().catch(() => ({}));

		if (!response.ok) {
			console.error('Google Places search response:', response.status, result?.error?.status);
			const error = new Error(result?.error?.message || `Google Places returned ${response.status}`);
			error.status = response.status === 429 ? 429 : 502;
			throw error;
		}

		const candidates = (result.places || []).map((place) => ({
			placeId: place.id,
			name: place.displayName?.text || '',
			formattedAddress: place.formattedAddress || '',
			googleMapsUri: place.googleMapsUri || '',
			latitude: place.location?.latitude,
			longitude: place.location?.longitude,
			photoCount: Array.isArray(place.photos) ? place.photos.length : 0,
		}));

		return res.status(200).json({ success: true, data: candidates });
	} catch (error) {
		return handleError(res, error, 'searching Google Places');
	}
};

export const verifyGooglePlace = async (req, res) => {
	try {
		const location = await getLocation(req.params.id);
		const { placeId, name, formattedAddress, googleMapsUri, latitude, longitude } = req.body || {};

		if (!placeId || !name || !formattedAddress) {
			return res.status(400).json({ success: false, message: 'Select a complete Google Places match' });
		}

		const googlePlace = {
			placeId: String(placeId),
			name: String(name).slice(0, 180),
			formattedAddress: String(formattedAddress).slice(0, 300),
			googleMapsUri: googleMapsUri ? String(googleMapsUri).slice(0, 500) : undefined,
			latitude: Number.isFinite(Number(latitude)) ? Number(latitude) : undefined,
			longitude: Number.isFinite(Number(longitude)) ? Number(longitude) : undefined,
			matchStatus: 'verified',
			matchedAt: new Date(),
			matchedBy: 'admin',
		};

		await Location.updateOne({ _id: location._id }, { $set: { googlePlace } }, { runValidators: true });
		return res.status(200).json({ success: true, data: googlePlace });
	} catch (error) {
		return handleError(res, error, 'verifying Google Place');
	}
};

export const getGooglePlacePhotos = async (req, res) => {
	try {
		ensurePlacesConfigured();
		const location = await getLocation(req.params.id);
		const placeId = location.googlePlace?.placeId;

		if (location.googlePlace?.matchStatus !== 'verified' || !placeId) {
			return res.status(409).json({ success: false, message: 'Verify the Google Places match first' });
		}

		const detailsResponse = await fetch(`${PLACE_DETAILS_URL}/${encodeURIComponent(placeId)}`, {
			headers: {
				'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY.trim(),
				'X-Goog-FieldMask': 'id,photos',
			},
		});
		const details = await detailsResponse.json().catch(() => ({}));

		if (!detailsResponse.ok) {
			console.error('Google Place Details response:', detailsResponse.status, details?.error?.status);
			const error = new Error(details?.error?.message || `Google Places returned ${detailsResponse.status}`);
			error.status = detailsResponse.status === 429 ? 429 : 502;
			throw error;
		}

		const photos = await Promise.all((details.photos || []).slice(0, PHOTO_PREVIEW_LIMIT).map(async (photo) => {
			const mediaUrl = new URL(`${PLACE_DETAILS_URL}/${photo.name.replace(/^places\//, '')}/media`);
			mediaUrl.searchParams.set('maxWidthPx', '1200');
			mediaUrl.searchParams.set('maxHeightPx', '900');
			mediaUrl.searchParams.set('skipHttpRedirect', 'true');
			mediaUrl.searchParams.set('key', process.env.GOOGLE_PLACES_API_KEY.trim());

			const mediaResponse = await fetch(mediaUrl);
			const media = await mediaResponse.json().catch(() => ({}));
			if (!mediaResponse.ok || !media.photoUri) {
				console.error('Google Place Photo response:', mediaResponse.status, media?.error?.status);
				return null;
			}

			return {
				photoUri: media.photoUri,
				widthPx: photo.widthPx,
				heightPx: photo.heightPx,
				googleMapsUri: photo.googleMapsUri || location.googlePlace.googleMapsUri,
				authorAttributions: (photo.authorAttributions || []).map((author) => ({
					displayName: author.displayName || 'Google Maps contributor',
					uri: author.uri || '',
					photoUri: author.photoUri || '',
				})),
			};
		}));

		return res.status(200).json({ success: true, data: photos.filter(Boolean) });
	} catch (error) {
		return handleError(res, error, 'loading Google Place photos');
	}
};
