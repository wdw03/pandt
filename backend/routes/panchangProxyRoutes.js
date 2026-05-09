const express = require('express');
const {
    zodiacSigns,
    defaultCities,
    fetchPanchangData,
    fetchHoroscopeData,
    fetchAllHoroscopes
} = require('../utils/prokeralaService');

const router = express.Router();

router.get('/panchang', async (req, res) => {
    try {
        const data = await fetchPanchangData({
            lat: req.query.lat,
            lng: req.query.lng,
            date: req.query.date,
            city: req.query.city
        });

        return res.json({
            status: 'success',
            success: true,
            data
        });
    } catch (error) {
        return res.status(502).json({
            status: 'error',
            success: false,
            message: `Panchang service unavailable: ${error.message}`
        });
    }
});

const handleAllHoroscopes = async (req, res) => {
    const horoscopeType = req.query.type || 'general';
    const dateValue = req.query.date || '';
    const today = dateValue || new Date().toISOString().slice(0, 10);

    try {
        const result = await fetchAllHoroscopes({
            type: horoscopeType,
            date: dateValue
        });

        const response = {
            status: result.warning ? 'partial' : 'success',
            success: true,
            type: horoscopeType,
            date: today,
            data: result.signs
        };

        if (result.warning) {
            response.warning = `Live horoscope unavailable: ${result.warning}`;
        }

        return res.json(response);
    } catch (error) {
        return res.status(502).json({
            status: 'error',
            success: false,
            type: horoscopeType,
            date: today,
            message: `Horoscope service unavailable: ${error.message}`
        });
    }
};

router.get('/horoscope/all', handleAllHoroscopes);
router.get('/horoscope', handleAllHoroscopes);

router.get('/horoscope/:sign', async (req, res) => {
    const sign = String(req.params.sign || '').toLowerCase();

    if (!zodiacSigns[sign]) {
        return res.status(400).json({
            status: 'error',
            success: false,
            message: `Invalid zodiac sign. Use one of: ${Object.keys(zodiacSigns).join(', ')}`
        });
    }

    try {
        const data = await fetchHoroscopeData({
            sign,
            type: req.query.type || 'general',
            date: req.query.date || ''
        });

        return res.json({
            status: 'success',
            success: true,
            data
        });
    } catch (error) {
        return res.status(502).json({
            status: 'error',
            success: false,
            message: `Horoscope service unavailable: ${error.message}`
        });
    }
});

router.get('/zodiac-signs', (req, res) => {
    return res.json({
        status: 'success',
        success: true,
        data: zodiacSigns
    });
});

router.get('/cities', (req, res) => {
    return res.json({
        status: 'success',
        success: true,
        cities: defaultCities
    });
});

router.get('/health', (req, res) => {
    return res.json({
        status: 'healthy',
        service: 'ProKerala Panchang + Horoscope API (Node)',
        endpoints: {
            panchang: '/api/panchang',
            single_horoscope: '/api/horoscope/{sign}',
            all_horoscopes: '/api/horoscope/all',
            zodiac_signs: '/api/zodiac-signs',
            cities: '/api/cities'
        }
    });
});

module.exports = router;
