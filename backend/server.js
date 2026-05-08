const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images
app.use(cors());

const path = require('path');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', profileRoutes);

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../')));

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Server Error' });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
});
