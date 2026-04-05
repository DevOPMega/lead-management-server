import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDb from './src/config/db.js';
import leadRoute from './src/modules/lead/lead.route.js';
import { globalErrorHandler, routeNotFoundHandler } from './src/middleware/handler.js';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "OPTIONS", "DELETE"],
  allowedHeaders: [
    "Authorization",
    "Content-Type",
    "Accept-Language",
    "Cookie",
    "x-device-id",
  ],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

connectDb();

// Simple healthcheck endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('Lead management UAE server is running');
});

app.use("/api/v1/leads", leadRoute);


// Route not found handler
app.use(routeNotFoundHandler);

// Global error handler middleware
app.use(globalErrorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});
