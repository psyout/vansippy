import mongoose from 'mongoose';

const businessImageSchema = new mongoose.Schema(
	{
		publicId: { type: String, required: true },
		secureUrl: { type: String, required: true },
		version: { type: Number, required: true },
		width: { type: Number, required: true },
		height: { type: Number, required: true },
		format: { type: String, required: true },
		bytes: { type: Number, required: true },
		originalFilename: String,
		alt: { type: String, trim: true, maxlength: 180, default: '' },
		isPrimary: { type: Boolean, default: false },
		sortOrder: { type: Number, default: 0 },
		uploadedBy: { type: String, enum: ['admin', 'business'], required: true },
	},
	{ timestamps: true },
);

const locationSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		address: { type: String, required: true },
		coordinates: {
			type: [Number],
			required: true,
			validate: {
				validator: (arr) => arr.length === 2,
				message: 'Coordinates must be [longitude, latitude]',
			},
		},
		province: String,
		city: String,
		postal_code: String,
		contact_number: String,
		website: String,
		full_address: String,
		neighbourhoods: String,
		image: String,
		images: { type: [businessImageSchema], default: [] },
		googlePlace: {
			placeId: { type: String, default: null },
			name: String,
			formattedAddress: String,
			googleMapsUri: String,
			latitude: Number,
			longitude: Number,
			matchStatus: {
				type: String,
				enum: ['unmatched', 'suggested', 'verified'],
				default: 'unmatched',
			},
			matchedAt: Date,
			matchedBy: String,
		},

		category: String,

		hours: {
			type: Map,
			of: String,
			default: {},
		},
		drinks: {
			type: Map,
			of: mongoose.Schema.Types.Mixed,
			default: {},
		},
		food: {
			type: Map,
			of: mongoose.Schema.Types.Mixed,
			default: {},
		},
		specials: {
			type: Map,
			of: mongoose.Schema.Types.Mixed,
			default: {},
		},
	},
	{
		timestamps: true,
	},
);

export default mongoose.model('Location', locationSchema);
