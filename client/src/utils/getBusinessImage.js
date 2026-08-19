export const getPrimaryBusinessImage = (business, fallback) => {
	const images = Array.isArray(business?.images) ? business.images : [];
	const primary = images.find((image) => image.isPrimary) || images[0];
	return primary?.secureUrl || business?.image || fallback;
};

export const getCloudinaryThumbnail = (url) => {
	if (!url || !url.includes('/upload/')) return url;
	return url.replace('/upload/', '/upload/f_auto,q_auto,c_fill,g_auto,w_640,h_360/');
};
