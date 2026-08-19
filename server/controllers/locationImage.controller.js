import crypto from 'crypto';
import mongoose from 'mongoose';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';
import Location from '../models/locations.model.js';

const MAX_IMAGES = 10;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_FORMATS = new Set(['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif']);

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

const ensureCloudinary = () => {
	if (!isCloudinaryConfigured()) {
		const error = new Error('Image service is not configured');
		error.status = 503;
		throw error;
	}
};

const persistImages = async (location) => {
	const result = await Location.updateOne(
		{ _id: location._id },
		{ $set: { images: location.images } },
		{ runValidators: true },
	);
	if (result.matchedCount !== 1) {
		const error = new Error('Location not found');
		error.status = 404;
		throw error;
	}
};

const safeSignatureMatch = (received, expected) => {
	if (!received || received.length !== expected.length) return false;
	return crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected));
};

const handleError = (res, error, action) => {
	console.error(`Error ${action}:`, error);
	return res.status(error.status || 500).json({
		success: false,
		message: error.status ? error.message : 'Server error',
	});
};

export const createImageUploadSignature = async (req, res) => {
	try {
		ensureCloudinary();
		const location = await getLocation(req.params.id);

		if (location.images.length >= MAX_IMAGES) {
			return res.status(409).json({ success: false, message: `A business can have up to ${MAX_IMAGES} images` });
		}

		const timestamp = Math.floor(Date.now() / 1000);
		const folder = `vansippy/businesses/${location.id}`;
		const signature = cloudinary.utils.api_sign_request(
			{ folder, timestamp },
			process.env.CLOUDINARY_API_SECRET,
		);

		return res.status(200).json({
			success: true,
			data: {
				timestamp,
				signature,
				folder,
				cloudName: process.env.CLOUDINARY_CLOUD_NAME,
				apiKey: process.env.CLOUDINARY_API_KEY,
			},
		});
	} catch (error) {
		return handleError(res, error, 'creating image upload signature');
	}
};

export const saveUploadedImage = async (req, res) => {
	try {
		ensureCloudinary();
		const location = await getLocation(req.params.id);
		const {
			publicId,
			secureUrl,
			version,
			width,
			height,
			format,
			bytes,
			originalFilename,
			signature,
		} = req.body || {};

		if (!publicId || !secureUrl || !version || !width || !height || !format || !bytes || !signature) {
			return res.status(400).json({ success: false, message: 'Incomplete Cloudinary upload response' });
		}

		const expectedFolder = `vansippy/businesses/${location.id}/`;
		if (!String(publicId).startsWith(expectedFolder)) {
			return res.status(400).json({ success: false, message: 'Image was uploaded to an invalid folder' });
		}

		const expectedSignature = cloudinary.utils.api_sign_request(
			{ public_id: publicId, version: Number(version) },
			process.env.CLOUDINARY_API_SECRET,
		);

		if (!safeSignatureMatch(String(signature), expectedSignature)) {
			return res.status(400).json({ success: false, message: 'Could not verify the uploaded image' });
		}

		const uploadedAsset = await cloudinary.api.resource(publicId, { resource_type: 'image' });
		const normalizedFormat = String(uploadedAsset.format || format).toLowerCase();
		if (!ALLOWED_FORMATS.has(normalizedFormat) || Number(uploadedAsset.bytes || bytes) > MAX_IMAGE_BYTES) {
			await cloudinary.uploader.destroy(publicId, { invalidate: true, resource_type: 'image' });
			return res.status(400).json({ success: false, message: 'Unsupported image type or image exceeds 10 MB' });
		}

		if (location.images.some((image) => image.publicId === publicId)) {
			return res.status(409).json({ success: false, message: 'Image has already been saved' });
		}

		if (location.images.length >= MAX_IMAGES) {
			await cloudinary.uploader.destroy(publicId, { invalidate: true, resource_type: 'image' });
			return res.status(409).json({ success: false, message: `A business can have up to ${MAX_IMAGES} images` });
		}

		location.images.push({
			publicId,
			secureUrl: uploadedAsset.secure_url,
			version: Number(uploadedAsset.version),
			width: Number(uploadedAsset.width || width),
			height: Number(uploadedAsset.height || height),
			format: normalizedFormat,
			bytes: Number(uploadedAsset.bytes || bytes),
			originalFilename: originalFilename ? String(originalFilename).slice(0, 180) : undefined,
			alt: location.name,
			isPrimary: location.images.length === 0,
			sortOrder: location.images.length,
			uploadedBy: 'admin',
		});

		try {
			await persistImages(location);
		} catch (error) {
			await cloudinary.uploader.destroy(publicId, { invalidate: true, resource_type: 'image' });
			throw error;
		}
		return res.status(201).json({ success: true, data: location.images });
	} catch (error) {
		return handleError(res, error, 'saving uploaded image');
	}
};

export const updateLocationImage = async (req, res) => {
	try {
		const location = await getLocation(req.params.id);
		const image = location.images.id(req.params.imageId);
		if (!image) return res.status(404).json({ success: false, message: 'Image not found' });

		if (Object.prototype.hasOwnProperty.call(req.body || {}, 'alt')) {
			image.alt = String(req.body.alt || '').trim().slice(0, 180);
		}

		if (req.body?.isPrimary === true) {
			location.images.forEach((candidate) => {
				candidate.isPrimary = candidate.id === image.id;
			});
		}

		await persistImages(location);
		return res.status(200).json({ success: true, data: location.images });
	} catch (error) {
		return handleError(res, error, 'updating image');
	}
};

export const reorderLocationImages = async (req, res) => {
	try {
		const location = await getLocation(req.params.id);
		const imageIds = req.body?.imageIds;
		const currentIds = location.images.map((image) => image.id);

		if (!Array.isArray(imageIds)
			|| imageIds.length !== currentIds.length
			|| new Set(imageIds).size !== imageIds.length
			|| imageIds.some((id) => !currentIds.includes(String(id)))) {
			return res.status(400).json({ success: false, message: 'Image order must include every image exactly once' });
		}

		location.images.forEach((image) => {
			image.sortOrder = imageIds.indexOf(image.id);
		});
		location.images.sort((a, b) => a.sortOrder - b.sortOrder);

		await persistImages(location);
		return res.status(200).json({ success: true, data: location.images });
	} catch (error) {
		return handleError(res, error, 'reordering images');
	}
};

export const deleteLocationImage = async (req, res) => {
	try {
		ensureCloudinary();
		const location = await getLocation(req.params.id);
		const image = location.images.id(req.params.imageId);
		if (!image) return res.status(404).json({ success: false, message: 'Image not found' });

		const wasPrimary = image.isPrimary;
		const cloudinaryResult = await cloudinary.uploader.destroy(image.publicId, {
			invalidate: true,
			resource_type: 'image',
		});

		if (!['ok', 'not found'].includes(cloudinaryResult.result)) {
			throw new Error('Cloudinary did not confirm image deletion');
		}

		image.deleteOne();
		location.images.forEach((candidate, index) => {
			candidate.sortOrder = index;
		});

		if (wasPrimary && location.images.length > 0) {
			location.images[0].isPrimary = true;
		}

		await persistImages(location);
		return res.status(200).json({ success: true, data: location.images });
	} catch (error) {
		return handleError(res, error, 'deleting image');
	}
};
