const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const PoojaSlide = require('../models/PoojaSlide');
const Product = require('../models/Product');
const VideoItem = require('../models/VideoItem');
const RouteSection = require('../models/RouteSection');
const KundaliSubmission = require('../models/KundaliSubmission');
const ContactSubmission = require('../models/ContactSubmission');
const SiteConfig = require('../models/SiteConfig');
const User = require('../models/User');
const { toWebAssetPath } = require('../utils/contentManager');
const {
    ensurePoojaSlidesSeeded,
    ensureProductsSeeded,
    ensureVideosSeeded,
    ensureSiteConfigSeeded
} = require('../utils/contentBootstrap');

const router = express.Router();

const normalizeProductForPublic = (product) => {
    return {
        ...product.toObject(),
        images: Array.isArray(product.images) ? product.images.map(toWebAssetPath) : []
    };
};

const getOptionalAuthUser = async (req) => {
    try {
        const header = req.headers.authorization || '';

        if (!header.startsWith('Bearer ')) {
            return null;
        }

        const token = header.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded?.id) {
            return null;
        }

        return User.findById(decoded.id).select('name email');
    } catch (error) {
        return null;
    }
};

router.get('/pooja-slides', async (req, res) => {
    try {
        await ensurePoojaSlidesSeeded();
        const slides = await PoojaSlide.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
        const normalizedSlides = slides.map((slide) => ({
            ...slide.toObject(),
            image: toWebAssetPath(slide.image)
        }));
        return res.json({ success: true, data: normalizedSlides });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/route-sections', async (req, res) => {
    try {
        const sections = await RouteSection.find().sort({ order: 1 });
        const normalizedSections = sections.map((section) => ({
            ...section.toObject(),
            image: toWebAssetPath(section.image)
        }));
        return res.json({ success: true, data: normalizedSections });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/products', async (req, res) => {
    try {
        await ensureProductsSeeded();
        const products = await Product.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
        const normalizedProducts = products.map(normalizeProductForPublic);
        return res.json({ success: true, data: normalizedProducts });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/products/:id', async (req, res) => {
    try {
        await ensureProductsSeeded();
        const { id } = req.params;
        const query = {
            isActive: true,
            $or: [{ productId: id }]
        };

        if (mongoose.Types.ObjectId.isValid(id)) {
            query.$or.push({ _id: id });
        }

        const product = await Product.findOne(query);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        return res.json({ success: true, data: normalizeProductForPublic(product) });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/videos', async (req, res) => {
    try {
        await ensureVideosSeeded();
        const videos = await VideoItem.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
        return res.json({ success: true, data: videos });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/config/prices', async (req, res) => {
    try {
        await ensureSiteConfigSeeded();
        const kundaliPrice = await SiteConfig.getVal('kundaliMatchingPrice', 'Rs 800');
        const janamPrice = await SiteConfig.getVal('janamKundaliPrice', 'Rs 300');
        res.set('Cache-Control', 'no-store');

        return res.json({
            success: true,
            data: {
                kundaliMatchingPrice: kundaliPrice,
                janamKundaliPrice: janamPrice
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/kundali-submit', async (req, res) => {
    try {
        const authUser = await getOptionalAuthUser(req);
        const {
            boyName,
            boyBirthDay,
            boyBirthMonth,
            boyBirthYear,
            boyBirthHour,
            boyBirthMinute,
            boyTimeUnknown,
            boyBirthCity,
            boyChartType,
            girlName,
            girlBirthDay,
            girlBirthMonth,
            girlBirthYear,
            girlBirthHour,
            girlBirthMinute,
            girlTimeUnknown,
            girlBirthCity,
            girlChartType,
            whatsappNumber,
            userName,
            userEmail
        } = req.body;

        const submission = await KundaliSubmission.create({
            type: 'matching',
            userId: authUser?._id || null,
            boyData: {
                name: boyName,
                birthDay: boyBirthDay,
                birthMonth: boyBirthMonth,
                birthYear: boyBirthYear,
                birthHour: boyBirthHour,
                birthMinute: boyBirthMinute,
                timeUnknown: boyTimeUnknown === 'true' || boyTimeUnknown === true,
                birthCity: boyBirthCity,
                chartType: boyChartType
            },
            girlData: {
                name: girlName,
                birthDay: girlBirthDay,
                birthMonth: girlBirthMonth,
                birthYear: girlBirthYear,
                birthHour: girlBirthHour,
                birthMinute: girlBirthMinute,
                timeUnknown: girlTimeUnknown === 'true' || girlTimeUnknown === true,
                birthCity: girlBirthCity,
                chartType: girlChartType
            },
            whatsappNumber: whatsappNumber || '',
            userProfile: {
                name: authUser?.name || userName || '',
                email: authUser?.email || userEmail || ''
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Kundali matching details submitted successfully',
            data: { id: submission._id }
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
});

router.post('/janam-submit', async (req, res) => {
    try {
        const authUser = await getOptionalAuthUser(req);
        const {
            fullName,
            birthPlace,
            birthDay,
            birthMonth,
            birthYear,
            birthHour,
            birthMinute,
            timeUnknown,
            gender,
            whatsappNumber,
            userName,
            userEmail
        } = req.body;

        const submission = await KundaliSubmission.create({
            type: 'janam',
            userId: authUser?._id || null,
            singleData: {
                name: fullName,
                birthPlace,
                birthDay,
                birthMonth,
                birthYear,
                birthHour,
                birthMinute,
                timeUnknown: timeUnknown === 'true' || timeUnknown === true,
                gender
            },
            whatsappNumber: whatsappNumber || '',
            userProfile: {
                name: authUser?.name || userName || fullName || '',
                email: authUser?.email || userEmail || ''
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Janam Kundali details submitted successfully',
            data: { id: submission._id }
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
});

router.post('/contact-submit', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const submission = await ContactSubmission.create({ name, email, message });

        return res.status(201).json({
            success: true,
            message: 'Message received. We will get back to you soon.',
            data: { id: submission._id }
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;
