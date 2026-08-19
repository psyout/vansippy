import 'dotenv/config';
import path from 'path';
import mongoose from 'mongoose';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';
import Location from '../models/locations.model.js';

const APPLY = process.argv.includes('--apply');
const ALLOWED_SOURCE_HOSTS = new Set(['vansippy.com', 'www.vansippy.com']);

const getSourceHost = (imageUrl) => {
	try {
		return new URL(imageUrl).hostname.toLowerCase();
	} catch {
		return null;
	}
};

const assertConfigured = () => {
	if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not configured');
	if (!isCloudinaryConfigured()) throw new Error('Cloudinary is not configured');
};

const migrateLocation = async (location) => {
	const folder = `vansippy/businesses/${location.id}`;
	const upload = await cloudinary.uploader.upload(location.image, {
		folder,
		resource_type: 'image',
		tags: ['legacy-migration'],
		use_filename: true,
		unique_filename: true,
		overwrite: false,
	});

	try {
		const image = {
			publicId: upload.public_id,
			secureUrl: upload.secure_url,
			version: Number(upload.version),
			width: Number(upload.width),
			height: Number(upload.height),
			format: upload.format,
			bytes: Number(upload.bytes),
			originalFilename: path.basename(new URL(location.image).pathname),
			alt: location.name,
			isPrimary: true,
			sortOrder: 0,
			uploadedBy: 'admin',
		};
		const result = await Location.updateOne(
			{
				_id: location._id,
				$or: [{ images: { $exists: false } }, { images: { $size: 0 } }],
			},
			{ $push: { images: image } },
		);
		if (result.modifiedCount !== 1) {
			throw new Error('Location was updated concurrently; migration skipped');
		}
	} catch (error) {
		await cloudinary.uploader.destroy(upload.public_id, { invalidate: true, resource_type: 'image' });
		throw error;
	}
};

const run = async () => {
	assertConfigured();
	await mongoose.connect(process.env.MONGO_URI);

	const locations = await Location.find({ image: { $type: 'string', $ne: '' } }).sort({ name: 1 });
	const summary = { eligible: 0, migrated: 0, alreadyMigrated: 0, thirdPartySkipped: 0, failed: 0 };

	for (const location of locations) {
		if (location.images.length > 0) {
			summary.alreadyMigrated += 1;
			console.log(`SKIP already migrated: ${location.name}`);
			continue;
		}

		const sourceHost = getSourceHost(location.image);
		if (!sourceHost || !ALLOWED_SOURCE_HOSTS.has(sourceHost)) {
			summary.thirdPartySkipped += 1;
			console.log(`SKIP third-party source: ${location.name} (${sourceHost || 'invalid URL'})`);
			continue;
		}

		summary.eligible += 1;
		if (!APPLY) {
			console.log(`WOULD MIGRATE: ${location.name} <- ${location.image}`);
			continue;
		}

		try {
			await migrateLocation(location);
			summary.migrated += 1;
			console.log(`MIGRATED: ${location.name}`);
		} catch (error) {
			summary.failed += 1;
			console.error(`FAILED: ${location.name}: ${error.message}`);
		}
	}

	console.log(JSON.stringify({ mode: APPLY ? 'apply' : 'dry-run', ...summary }, null, 2));
	await mongoose.disconnect();

	if (summary.failed > 0) process.exitCode = 1;
};

run().catch(async (error) => {
	console.error(`Migration stopped: ${error.message}`);
	await mongoose.disconnect().catch(() => {});
	process.exitCode = 1;
});
