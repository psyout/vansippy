import { useEffect, useRef, useState } from 'react';
import { getCloudinaryThumbnail } from '../../utils/getBusinessImage';
import './BusinessImageManager.scss';

const MAX_IMAGES = 10;
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

const getResponseBody = async (response) => {
	const body = await response.json().catch(() => ({}));
	if (!response.ok) throw new Error(body.message || `Request failed (${response.status})`);
	return body;
};

function BusinessImageManager({ business, onImagesChange }) {
	const businessId = business?._id || business?.id;
	const fileInputRef = useRef(null);
	const [images, setImages] = useState([]);
	const [uploading, setUploading] = useState(false);
	const [busyImageId, setBusyImageId] = useState(null);
	const [error, setError] = useState('');
	const [notice, setNotice] = useState('');

	useEffect(() => {
		const ordered = [...(business?.images || [])].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
		setImages(ordered);
	}, [business]);

	const applyImages = (nextImages) => {
		const ordered = [...nextImages].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
		setImages(ordered);
		onImagesChange?.(ordered);
	};

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

	const uploadOne = async (file) => {
		const signatureResult = await serverRequest(`/api/locations/${businessId}/images/signature`, { method: 'POST' });
		const { timestamp, signature, folder, cloudName, apiKey } = signatureResult.data;
		const formData = new FormData();
		formData.append('file', file);
		formData.append('api_key', apiKey);
		formData.append('timestamp', timestamp);
		formData.append('folder', folder);
		formData.append('signature', signature);

		const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
			method: 'POST',
			body: formData,
		});
		const uploaded = await getResponseBody(cloudinaryResponse);

		const saved = await serverRequest(`/api/locations/${businessId}/images`, {
			method: 'POST',
			body: JSON.stringify({
				publicId: uploaded.public_id,
				secureUrl: uploaded.secure_url,
				version: uploaded.version,
				width: uploaded.width,
				height: uploaded.height,
				format: uploaded.format,
				bytes: uploaded.bytes,
				originalFilename: uploaded.original_filename,
				signature: uploaded.signature,
			}),
		});

		return saved.data;
	};

	const handleFiles = async (event) => {
		const files = Array.from(event.target.files || []);
		if (fileInputRef.current) fileInputRef.current.value = '';
		if (!files.length) return;

		setError('');
		setNotice('');

		if (images.length + files.length > MAX_IMAGES) {
			setError(`You can upload ${MAX_IMAGES - images.length} more image(s).`);
			return;
		}

		const invalidFile = files.find((file) => !ALLOWED_TYPES.has(file.type) || file.size > MAX_BYTES);
		if (invalidFile) {
			setError(`${invalidFile.name} must be JPEG, PNG, WebP, or HEIC and no larger than 10 MB.`);
			return;
		}

		setUploading(true);
		try {
			let nextImages = images;
			for (const file of files) {
				nextImages = await uploadOne(file);
				applyImages(nextImages);
			}
			setNotice(`${files.length} image${files.length === 1 ? '' : 's'} uploaded successfully.`);
		} catch (uploadError) {
			setError(uploadError.message);
		} finally {
			setUploading(false);
		}
	};

	const updateImage = async (imageId, changes) => {
		setBusyImageId(imageId);
		setError('');
		try {
			const result = await serverRequest(`/api/locations/${businessId}/images/${imageId}`, {
				method: 'PATCH',
				body: JSON.stringify(changes),
			});
			applyImages(result.data);
		} catch (updateError) {
			setError(updateError.message);
		} finally {
			setBusyImageId(null);
		}
	};

	const moveImage = async (index, direction) => {
		const targetIndex = index + direction;
		if (targetIndex < 0 || targetIndex >= images.length) return;

		const reordered = [...images];
		[reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
		setBusyImageId(images[index]._id);
		setError('');
		try {
			const result = await serverRequest(`/api/locations/${businessId}/images/order`, {
				method: 'PATCH',
				body: JSON.stringify({ imageIds: reordered.map((image) => image._id) }),
			});
			applyImages(result.data);
		} catch (orderError) {
			setError(orderError.message);
		} finally {
			setBusyImageId(null);
		}
	};

	const deleteImage = async (image) => {
		if (!window.confirm('Delete this image permanently?')) return;
		setBusyImageId(image._id);
		setError('');
		setNotice('');
		try {
			const result = await serverRequest(`/api/locations/${businessId}/images/${image._id}`, { method: 'DELETE' });
			applyImages(result.data);
			setNotice('Image deleted.');
		} catch (deleteError) {
			setError(deleteError.message);
		} finally {
			setBusyImageId(null);
		}
	};

	return (
		<section className='business-image-manager' aria-labelledby='business-images-title'>
			<div className='business-image-manager__header'>
				<div>
					<h2 id='business-images-title'>Business images</h2>
					<p>Upload up to {MAX_IMAGES} images. The primary image appears on business cards.</p>
				</div>
				<label className={`business-image-manager__upload${uploading || images.length >= MAX_IMAGES ? ' is-disabled' : ''}`}>
					{uploading ? 'Uploading…' : 'Upload images'}
					<input
						ref={fileInputRef}
						type='file'
						accept='image/jpeg,image/png,image/webp,image/heic,image/heif'
						multiple
						disabled={uploading || images.length >= MAX_IMAGES}
						onChange={handleFiles}
					/>
				</label>
			</div>

			<p className='business-image-manager__count'>{images.length} of {MAX_IMAGES} images</p>
			{error && <p className='business-image-manager__message is-error' role='alert'>{error}</p>}
			{notice && <p className='business-image-manager__message is-success' role='status'>{notice}</p>}

			{images.length === 0 ? (
				<div className='business-image-manager__empty'>No Cloudinary images yet. Existing legacy images will continue to display.</div>
			) : (
				<div className='business-image-manager__grid'>
					{images.map((image, index) => {
						const isBusy = busyImageId === image._id;
						return (
							<article className='business-image-manager__card' key={image._id}>
								<div className='business-image-manager__preview'>
									<img src={getCloudinaryThumbnail(image.secureUrl)} alt={image.alt || business.name} />
									{image.isPrimary && <span>Primary</span>}
								</div>
								<label>
									Alt text
									<input
										type='text'
										maxLength='180'
										value={image.alt || ''}
										onChange={(event) => setImages((current) => current.map((candidate) => (
											candidate._id === image._id ? { ...candidate, alt: event.target.value } : candidate
										)))}
										onBlur={(event) => updateImage(image._id, { alt: event.target.value })}
									/>
								</label>
								<div className='business-image-manager__actions'>
									<button type='button' onClick={() => moveImage(index, -1)} disabled={isBusy || index === 0} aria-label='Move image earlier'>←</button>
									<button type='button' onClick={() => moveImage(index, 1)} disabled={isBusy || index === images.length - 1} aria-label='Move image later'>→</button>
									{!image.isPrimary && <button type='button' onClick={() => updateImage(image._id, { isPrimary: true })} disabled={isBusy}>Set primary</button>}
									<button type='button' className='is-danger' onClick={() => deleteImage(image)} disabled={isBusy}>Delete</button>
								</div>
							</article>
						);
					})}
				</div>
			)}
		</section>
	);
}

export default BusinessImageManager;
