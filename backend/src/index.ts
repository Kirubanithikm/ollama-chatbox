import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat'; // Import chat routes
import auth from './middleware/auth'; // Import auth middleware

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // For parsing application/json

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', auth, chatRoutes); // Protect chat routes with auth middleware

app.get('/', (req, res) => {
  res.send('Ollama Chat Backend API is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});