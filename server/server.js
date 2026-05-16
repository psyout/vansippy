import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import locationRoutes from "./routes/location.route.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.route.js";

dotenv.config();

const app = express();

app.use(helmet());

const apiLimiter = rateLimit({
   windowMs: 15 * 60 * 1000,
   limit: 300,
   standardHeaders: "draft-8",
   legacyHeaders: false,
});

const authLimiter = rateLimit({
   windowMs: 15 * 60 * 1000,
   limit: 10,
   standardHeaders: "draft-8",
   legacyHeaders: false,
   message: {
      success: false,
      message: "Sorry, too many login attempts. Please try again later.",
   },
});

app.use("/api", apiLimiter);

// Define the port using an environment variable or default to 8080
const PORT = process.env.PORT || 8080;

const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
   .split(",")
   .map((origin) => origin.trim())
   .filter(Boolean);

app.use(
   cors({
      origin: (origin, callback) => {
         if (!origin) return callback(null, true);
         if (corsOrigins.includes(origin)) return callback(null, true);
         return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
   }),
);

app.use(cookieParser());

// Middleware to parse JSON bodies
app.use(express.json({ limit: "100kb" }));

// Route to connect endpoints
app.use("/api/locations", locationRoutes);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth", authRoutes);

app.get("/health", (req, res) => {
   res.status(200).json({ ok: true });
});

// Middleware to Connect to MongoDB
app.listen(PORT, () => {
   connectDB();
   console.log(`Server started at ${PORT}`);
});
