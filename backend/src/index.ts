import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import adminRoutes from './routes/admin'; // Import admin routes
import auth from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Environment Variable Checks ---
if (!process.env.MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined. Please set this environment variable.');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined. Please set this environment variable.');
  process.exit(1);
}
if (!process.env.OLLAMA_API_URL) {
  console.error('FATAL ERROR: OLLAMA_API_URL is not defined. Please set this environment variable (e.g., http://localhost:11434).');
  process.exit(1);
}
// --- End Environment Variable Checks ---

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // For parsing application/json

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', auth, chatRoutes);
app.use('/api/admin', adminRoutes); // Add admin routes

app.get('/', (req, res) => {
  res.send('Ollama Chat Backend API is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});