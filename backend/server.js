const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, '../')));
app.use('/admin', express.static(path.join(__dirname, '../admindashboard')));
app.use('/assets/uploads', express.static(path.join(__dirname, '../assets/uploads')));

// Routes - Auth
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Routes - User Profile
const profileRoutes = require('./routes/profileRoutes');
app.use('/api/user', profileRoutes);

// Routes - Admin
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

// Routes - Public Data
const publicDataRoutes = require('./routes/publicDataRoutes');
app.use('/api/public', publicDataRoutes);

// Routes - Panchang/Horoscope Proxy
const panchangProxyRoutes = require('./routes/panchangProxyRoutes');
app.use('/api', panchangProxyRoutes);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB Connected');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`🔧 Admin panel at http://localhost:${PORT}/admin/`);
        });
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
    });
