require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const chatRoutes = require('./routes/chat');
const historyRoutes = require('./routes/history');

const app = express();
const PORT = process.env.PORT || 5000;
// const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors()); // Allow frontend to connect
app.use(express.json());

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/history', historyRoutes);

// Base route test
app.get('/', (req, res) => {
    res.send('AJCI-bot Backend Server is running!');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
