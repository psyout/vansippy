import mongoose from 'mongoose';

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

		category: String,

		hours: {
			type: Map,
			of: String,
			default: {},
		},
		drinks: {
			type: Map,
			of: String,
			default: {},
		},
		food: {
			type: Map,
			of: String,
			default: {},
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.model('Location', locationSchema);
