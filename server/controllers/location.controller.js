import mongoose from "mongoose";
import Location from "../models/locations.model.js";

const allowedLocationFields = [
   "name",
   "address",
   "coordinates",
   "province",
   "city",
   "postal_code",
   "contact_number",
   "website",
   "full_address",
   "neighbourhoods",
   "image",
   "category",
   "hours",
   "drinks",
   "food",
];

const isPlainObject = (value) =>
   value &&
   typeof value === "object" &&
   !Array.isArray(value) &&
   !(value instanceof Map);

const mapFromEntries = (value, entryToPair) => {
   const mapped = new Map();

   if (!value) return mapped;

   if (value instanceof Map) {
      value.forEach((mapValue, key) => {
         if (key && mapValue !== undefined && mapValue !== null)
            mapped.set(String(key).trim(), String(mapValue).trim());
      });
      return mapped;
   }

   if (Array.isArray(value)) {
      value.forEach((entry) => {
         const pair = entryToPair(entry);
         if (pair) mapped.set(pair[0], pair[1]);
      });
      return mapped;
   }

   if (isPlainObject(value)) {
      Object.entries(value).forEach(([key, mapValue]) => {
         if (key && mapValue !== undefined && mapValue !== null)
            mapped.set(String(key).trim(), String(mapValue).trim());
      });
   }

   return mapped;
};

const normalizeHours = (hours) =>
   mapFromEntries(hours, (hour) => {
      if (!hour?.days || !hour?.from || !hour?.to) return null;
      return [
         String(hour.days).trim(),
         `${String(hour.from).trim()} - ${String(hour.to).trim()}`,
      ];
   });

const normalizeMenu = (items) =>
   mapFromEntries(items, (item) => {
      if (!item?.name || item.price === undefined || item.price === null)
         return null;
      return [String(item.name).trim(), String(item.price).trim()];
   });

const validateCoordinates = (coordinates) => {
   if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      return "Coordinates must be an array with exactly 2 elements [longitude, latitude]";
   }

   const [longitude, latitude] = coordinates.map(Number);

   if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
      return "Coordinates must contain valid numeric longitude and latitude values";
   }

   if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
      return "Coordinates are out of range. Longitude must be -180 to 180 and latitude must be -90 to 90";
   }

   return null;
};

const sanitizeLocationPayload = (payload = {}) => {
   const sanitized = {};

   allowedLocationFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(payload, field)) {
         sanitized[field] = payload[field];
      }
   });

   if (sanitized.coordinates) {
      sanitized.coordinates = sanitized.coordinates.map(Number);
   }

   if (Object.prototype.hasOwnProperty.call(sanitized, "hours"))
      sanitized.hours = normalizeHours(sanitized.hours);
   if (Object.prototype.hasOwnProperty.call(sanitized, "drinks"))
      sanitized.drinks = normalizeMenu(sanitized.drinks);
   if (Object.prototype.hasOwnProperty.call(sanitized, "food"))
      sanitized.food = normalizeMenu(sanitized.food);

   return sanitized;
};

const validateLocationPayload = (payload, { partial = false } = {}) => {
   const errors = [];

   if (!partial) {
      if (!payload.name) errors.push("Name is required");
      if (!payload.address) errors.push("Address is required");
      if (!payload.coordinates) errors.push("Coordinates are required");
   }

   if (payload.coordinates) {
      const coordinatesError = validateCoordinates(payload.coordinates);
      if (coordinatesError) errors.push(coordinatesError);
   }

   return errors;
};

export const getLocations = async (req, res) => {
   try {
      const locations = await Location.find({});
      res.status(200).json({ success: true, data: locations });
   } catch (error) {
      console.error("Error fetching locations:", error.message);
      res.status(500).json({ success: false, message: "Server error" });
   }
};

export const getLocationById = async (req, res) => {
   const { id } = req.params;

   if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
         .status(400)
         .json({ success: false, message: "Invalid ID format" });
   }

   try {
      const location = await Location.findById(id);

      if (!location) {
         return res
            .status(404)
            .json({ success: false, message: "Location not found" });
      }

      return res.status(200).json({ success: true, data: location });
   } catch (error) {
      console.error("Error fetching location:", error.message);
      return res.status(500).json({ success: false, message: "Server error" });
   }
};

export const addLocation = async (req, res) => {
   try {
      const location = sanitizeLocationPayload(req.body);
      const validationErrors = validateLocationPayload(location);

      if (validationErrors.length) {
         return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: validationErrors,
         });
      }

      const newLocation = new Location(location);

      await newLocation.save();
      res.status(201).json({ success: true, data: newLocation });
   } catch (error) {
      console.error("Error saving location:", error.message);

      if (error.name === "ValidationError") {
         const validationErrors = Object.values(error.errors).map(
            (err) => err.message,
         );
         return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: validationErrors,
         });
      }

      res.status(500).json({ success: false, message: "Server error" });
   }
};

export const updateLocation = async (req, res) => {
   const { id } = req.params;

   if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
         .status(400)
         .json({ success: false, message: "Invalid ID format" });
   }

   const updates = sanitizeLocationPayload(req.body);
   const validationErrors = validateLocationPayload(updates, { partial: true });

   if (validationErrors.length) {
      return res
         .status(400)
         .json({
            success: false,
            message: "Validation error",
            errors: validationErrors,
         });
   }

   try {
      const updatedLocation = await Location.findByIdAndUpdate(
         id,
         { $set: updates },
         {
            new: true,
            runValidators: true,
         },
      );

      if (!updatedLocation) {
         return res
            .status(404)
            .json({ success: false, message: "Location not found" });
      }

      res.status(200).json({ success: true, data: updatedLocation });
   } catch (error) {
      console.error("Error updating location:", error.message);

      if (error.name === "ValidationError") {
         const validationErrorsFromMongoose = Object.values(error.errors).map(
            (err) => err.message,
         );
         return res
            .status(400)
            .json({
               success: false,
               message: "Validation error",
               errors: validationErrorsFromMongoose,
            });
      }

      res.status(500).json({ success: false, message: "Server error" });
   }
};

export const deleteLocation = async (req, res) => {
   const { id } = req.params;

   if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
         .status(400)
         .json({ success: false, message: "Invalid ID format" });
   }

   try {
      const deletedLocation = await Location.findByIdAndDelete(id);

      if (!deletedLocation) {
         return res
            .status(404)
            .json({ success: false, message: "Location not found" });
      }

      res.status(200).json({ success: true, message: "Location deleted" });
   } catch (error) {
      console.error("Error deleting location:", error.message);
      res.status(500).json({ success: false, message: "Server Error" });
   }
};
