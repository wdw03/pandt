const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const rootDir = path.join(__dirname, '../');

const servePage = (page) => (req, res) => {
    res.sendFile(path.join(rootDir, page));
};

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Page aliases
app.get(['/horoscope', '/horoscope/', '/horoscope.html'], servePage('horoscope.html'));
app.get(['/astrology', '/astrology/', '/astrology.html'], servePage('astrology-gallery.html'));
app.get(['/astrology-gallery', '/astrology-gallery/', '/astrology-gallery.html'], servePage('astrology-gallery.html'));
app.get(['/premium-pooja', '/premium-pooja/', '/premium-pooja.html'], servePage('premium-pooja.html'));
app.get(['/horoscope-detail', '/horoscope-detail/', '/horoscope-detail.html'], servePage('horoscope-detail.html'));
app.get(['/puja-detail', '/puja-detail/', '/puja-detail.html'], servePage('puja-detail.html'));
app.get(['/puja/:slug', '/puja/:slug/', '/pooja/:slug', '/pooja/:slug/'], servePage('puja-detail.html'));

// Static files
app.use(express.static(rootDir));
app.use('/admin', express.static(path.join(rootDir, 'admindashboard')));
app.use('/assets/uploads', express.static(path.join(rootDir, 'assets/uploads')));

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
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!mongoUri) {
    console.error('MongoDB connection error: missing MONGO_URI or MONGODB_URI in backend/.env');
    process.exit(1);
}

mongoose.connect(mongoUri)
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
