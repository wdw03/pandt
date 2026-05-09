const SiteConfig = require('../models/SiteConfig');

const DEFAULT_CLIENT_ID = 'd45fe2a1-99f9-4b48-ae08-ae8fb6abe1a6';
const DEFAULT_CLIENT_SECRET = 'wWkGgybm8WEigOqCrCdTAKKiLbQkAPUiDIFiWQn2';
const TOKEN_URL = 'https://api.prokerala.com/token';
const PANCHANG_URL = 'https://api.prokerala.com/v2/astrology/panchang';
const HOROSCOPE_URL = 'https://api.prokerala.com/v2/horoscope/daily/advanced';
const AYANAMSA = 1;
const IST_OFFSET = '+05:30';

const zodiacSigns = {
    aries: { name: 'Aries', hindi: 'मेष', symbol: '♈' },
    taurus: { name: 'Taurus', hindi: 'वृषभ', symbol: '♉' },
    gemini: { name: 'Gemini', hindi: 'मिथुन', symbol: '♊' },
    cancer: { name: 'Cancer', hindi: 'कर्क', symbol: '♋' },
    leo: { name: 'Leo', hindi: 'सिंह', symbol: '♌' },
    virgo: { name: 'Virgo', hindi: 'कन्या', symbol: '♍' },
    libra: { name: 'Libra', hindi: 'तुला', symbol: '♎' },
    scorpio: { name: 'Scorpio', hindi: 'वृश्चिक', symbol: '♏' },
    sagittarius: { name: 'Sagittarius', hindi: 'धनु', symbol: '♐' },
    capricorn: { name: 'Capricorn', hindi: 'मकर', symbol: '♑' },
    aquarius: { name: 'Aquarius', hindi: 'कुंभ', symbol: '♒' },
    pisces: { name: 'Pisces', hindi: 'मीन', symbol: '♓' }
};

const defaultCities = [
    { id: 1, name: 'Patna', lat: 25.5941, lng: 85.1376 },
    { id: 2, name: 'Delhi', lat: 28.6139, lng: 77.2090 },
    { id: 3, name: 'Mumbai', lat: 19.076, lng: 72.8777 },
    { id: 4, name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
    { id: 5, name: 'Chennai', lat: 13.0827, lng: 80.2707 },
    { id: 6, name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
    { id: 7, name: 'Hyderabad', lat: 17.385, lng: 78.4867 },
    { id: 8, name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
    { id: 9, name: 'Pune', lat: 18.5204, lng: 73.8567 },
    { id: 10, name: 'Jaipur', lat: 26.9124, lng: 75.7873 }
];

const nakshatraToRasi = {
    Ashwini: 'Aries',
    Bharani: 'Aries',
    Krittika: 'Taurus',
    Rohini: 'Taurus',
    Mrigashirsha: 'Gemini',
    Ardra: 'Gemini',
    Punarvasu: 'Cancer',
    Pushya: 'Cancer',
    Ashlesha: 'Cancer',
    Magha: 'Leo',
    'Purva Phalguni': 'Leo',
    'Uttara Phalguni': 'Virgo',
    Hasta: 'Virgo',
    Chitra: 'Libra',
    Swati: 'Libra',
    Vishakha: 'Scorpio',
    Anuradha: 'Scorpio',
    Jyeshtha: 'Scorpio',
    Moola: 'Sagittarius',
    'Purva Ashadha': 'Sagittarius',
    'Uttara Ashadha': 'Capricorn',
    Shravana: 'Capricorn',
    Dhanishta: 'Aquarius',
    Shatabhisha: 'Aquarius',
    'Purva Bhadrapada': 'Aquarius',
    'Uttara Bhadrapada': 'Pisces',
    Revati: 'Pisces'
};

const tokenCache = {
    token: null,
    expiresAt: 0,
    clientId: '',
    clientSecret: ''
};

const resetTokenCache = () => {
    tokenCache.token = null;
    tokenCache.expiresAt = 0;
    tokenCache.clientId = '';
    tokenCache.clientSecret = '';
};

const getNowInIst = () => {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
};

const pad = (value) => String(value).padStart(2, '0');

const formatApiDateTime = (dateInput) => {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${IST_OFFSET}`;
};

const parseIsoDate = (dateValue) => {
    if (!dateValue) {
        return getNowInIst();
    }

    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) {
        return getNowInIst();
    }

    return parsed;
};

const formatTime12Hr = (value) => {
    try {
        if (!value) {
            return 'N/A';
        }

        return new Date(value).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata'
        });
    } catch (error) {
        return 'N/A';
    }
};

const getLunarMonthFromDate = (date) => {
    const month = date.getMonth() + 1;

    if (month >= 3 && month <= 4) {
        return { amanta: 'Chaitra', purnimanta: 'Vaisakha' };
    }

    if (month >= 4 && month <= 5) {
        return { amanta: 'Vaisakha', purnimanta: 'Jyeshta' };
    }

    if (month >= 5 && month <= 6) {
        return { amanta: 'Jyeshta', purnimanta: 'Ashadha' };
    }

    return { amanta: 'Vaisakha', purnimanta: 'Jyeshta' };
};

const calculateMoonPhases = (tithiName, paksha, date) => {
    const tithiMap = {
        Pratipada: 1,
        Dwitiya: 2,
        Tritiya: 3,
        Chaturthi: 4,
        Panchami: 5,
        Shashthi: 6,
        Saptami: 7,
        Ashtami: 8,
        Navami: 9,
        Dashami: 10,
        Ekadashi: 11,
        Dwadashi: 12,
        Trayodashi: 13,
        Chaturdashi: 14,
        Purnima: 15,
        Amavasya: 30
    };

    const tithiNumber = tithiMap[tithiName] || 7;
    let daysToFull = 0;
    let daysToNew = 0;

    if (paksha === 'Shukla Paksha') {
        daysToFull = 15 - tithiNumber;
        daysToNew = daysToFull + 15;
    } else {
        daysToNew = 15 - tithiNumber;
        daysToFull = daysToNew + 15;
    }

    const fullMoonDate = new Date(date);
    fullMoonDate.setDate(fullMoonDate.getDate() + daysToFull);

    const newMoonDate = new Date(date);
    newMoonDate.setDate(newMoonDate.getDate() + daysToNew);

    const formatter = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    });

    return {
        full_moon: formatter.format(fullMoonDate),
        new_moon: formatter.format(newMoonDate)
    };
};

const mapPanchangResponse = (rawData, cityName, date) => {
    const data = rawData?.data || {};
    const tithi = Array.isArray(data.tithi) ? data.tithi[0] || {} : data.tithi || {};
    const nakshatra = Array.isArray(data.nakshatra) ? data.nakshatra[0] || {} : data.nakshatra || {};
    const yoga = Array.isArray(data.yoga) ? data.yoga[0] || {} : data.yoga || {};
    const karana = Array.isArray(data.karana) ? data.karana[0] || {} : data.karana || {};
    const paksha = tithi.paksha || 'N/A';
    const tithiName = tithi.name || 'N/A';
    const nakshatraName = nakshatra.name || 'N/A';
    const lunarMonths = getLunarMonthFromDate(date);
    const moonPhases = calculateMoonPhases(tithiName, paksha, date);
    const rasiName = data.rasi?.name || data.moon_sign?.name || nakshatraToRasi[nakshatraName] || 'N/A';

    const payload = {
        selected_date: date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: '2-digit',
            year: 'numeric'
        }).toUpperCase(),
        date_iso: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
        location: cityName || 'Unknown',
        daily_core_details: {
            tithi: {
                code: 'TI',
                label: 'Tithi',
                name: tithiName,
                paksha
            },
            nakshatra: {
                code: 'NA',
                label: 'Nakshatra',
                name: nakshatraName,
                lord: nakshatra.lord?.vedic_name || nakshatra.lord?.name || 'N/A'
            },
            yoga: {
                code: 'YO',
                label: 'Yoga',
                name: yoga.name || 'N/A'
            },
            karana: {
                code: 'KA',
                label: 'Karana',
                name: karana.name || 'N/A'
            },
            rasi: {
                code: 'RA',
                label: 'Rasi',
                name: rasiName
            }
        },
        timings_and_lunar_notes: {
            sunrise: { code: 'SR', label: 'Sunrise', time: formatTime12Hr(data.sunrise) },
            sunset: { code: 'SS', label: 'Sunset', time: formatTime12Hr(data.sunset) },
            moonrise: { code: 'MR', label: 'Moonrise', time: formatTime12Hr(data.moonrise) },
            moonset: { code: 'MS', label: 'Moonset', time: formatTime12Hr(data.moonset) },
            next_full_moon: { code: 'FM', label: 'Next Full Moon', date: moonPhases.full_moon },
            next_new_moon: { code: 'NM', label: 'Next New Moon', date: moonPhases.new_moon },
            amanta_month: { code: 'AM', label: 'Amanta Month', name: lunarMonths.amanta },
            paksha: { code: 'PK', label: 'Paksha', name: paksha },
            purnimanta: { code: 'PM', label: 'Purnimanta', name: lunarMonths.purnimanta }
        }
    };

    payload.primary = [
        { label: 'Tithi', value: payload.daily_core_details.tithi.name, icon: payload.daily_core_details.tithi.code },
        { label: 'Nakshatra', value: payload.daily_core_details.nakshatra.name, icon: payload.daily_core_details.nakshatra.code },
        { label: 'Yoga', value: payload.daily_core_details.yoga.name, icon: payload.daily_core_details.yoga.code },
        { label: 'Karana', value: payload.daily_core_details.karana.name, icon: payload.daily_core_details.karana.code },
        { label: 'Rasi', value: payload.daily_core_details.rasi.name, icon: payload.daily_core_details.rasi.code }
    ];

    payload.additional = [
        { label: 'Sunrise', value: payload.timings_and_lunar_notes.sunrise.time, icon: payload.timings_and_lunar_notes.sunrise.code },
        { label: 'Sunset', value: payload.timings_and_lunar_notes.sunset.time, icon: payload.timings_and_lunar_notes.sunset.code },
        { label: 'Moonrise', value: payload.timings_and_lunar_notes.moonrise.time, icon: payload.timings_and_lunar_notes.moonrise.code },
        { label: 'Moonset', value: payload.timings_and_lunar_notes.moonset.time, icon: payload.timings_and_lunar_notes.moonset.code },
        { label: 'Next Full Moon', value: payload.timings_and_lunar_notes.next_full_moon.date, icon: payload.timings_and_lunar_notes.next_full_moon.code },
        { label: 'Next New Moon', value: payload.timings_and_lunar_notes.next_new_moon.date, icon: payload.timings_and_lunar_notes.next_new_moon.code },
        { label: 'Amanta Month', value: payload.timings_and_lunar_notes.amanta_month.name, icon: payload.timings_and_lunar_notes.amanta_month.code },
        { label: 'Paksha', value: payload.timings_and_lunar_notes.paksha.name, icon: payload.timings_and_lunar_notes.paksha.code },
        { label: 'Purnimanta', value: payload.timings_and_lunar_notes.purnimanta.name, icon: payload.timings_and_lunar_notes.purnimanta.code }
    ];

    return payload;
};

const normalizeText = (value = '') => String(value ?? '').replace(/\s+/g, ' ').trim();

const mapSingleHoroscope = (rawData, signKey, date) => {
    const signInfo = zodiacSigns[signKey] || {
        name: signKey.charAt(0).toUpperCase() + signKey.slice(1),
        hindi: '',
        symbol: ''
    };
    const data = rawData?.data || {};

    return {
        zodiac_sign: signInfo.name,
        zodiac_sign_hindi: signInfo.hindi,
        symbol: signInfo.symbol,
        date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
        date_formatted: date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: '2-digit',
            year: 'numeric'
        }),
        prediction: normalizeText(data.prediction || data.description || ''),
        lucky_color: normalizeText(data.lucky_color || 'N/A') || 'N/A',
        lucky_number: normalizeText(data.lucky_number || 'N/A') || 'N/A',
        lucky_time: normalizeText(data.lucky_time || 'N/A') || 'N/A',
        mood: normalizeText(data.mood || 'N/A') || 'N/A',
        compatibility: normalizeText(data.compatibility || 'N/A') || 'N/A',
        overall_rating: Number(data.overall_rating) || 0
    };
};

const getCredentials = async () => {
    const [configClientId, configClientSecret] = await Promise.all([
        SiteConfig.getVal('panchangClientId', process.env.PROKERALA_CLIENT_ID || DEFAULT_CLIENT_ID),
        SiteConfig.getVal('panchangClientSecret', process.env.PROKERALA_CLIENT_SECRET || DEFAULT_CLIENT_SECRET)
    ]);

    return {
        clientId: configClientId || DEFAULT_CLIENT_ID,
        clientSecret: configClientSecret || DEFAULT_CLIENT_SECRET
    };
};

const getAccessToken = async () => {
    const { clientId, clientSecret } = await getCredentials();
    const now = Date.now();

    if (
        tokenCache.token &&
        tokenCache.expiresAt > now + 60 * 1000 &&
        tokenCache.clientId === clientId &&
        tokenCache.clientSecret === clientSecret
    ) {
        return tokenCache.token;
    }

    const body = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
    });

    const response = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body
    });

    const data = await response.json();

    if (!response.ok || !data.access_token) {
        throw new Error(data.error_description || data.message || 'Failed to fetch ProKerala token');
    }

    tokenCache.token = data.access_token;
    tokenCache.expiresAt = now + Number(data.expires_in || 0) * 1000;
    tokenCache.clientId = clientId;
    tokenCache.clientSecret = clientSecret;

    return tokenCache.token;
};

const prokeralaGet = async (url, params) => {
    const token = await getAccessToken();
    const searchParams = new URLSearchParams(params);
    const response = await fetch(`${url}?${searchParams.toString()}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || data.error_description || `ProKerala request failed with ${response.status}`);
    }

    return data;
};

const fetchPanchangData = async ({ lat = '25.5941', lng = '85.1376', date = '', city = 'Patna' } = {}) => {
    const parsedDate = parseIsoDate(date);
    const apiDateTime = formatApiDateTime(parsedDate);
    const rawData = await prokeralaGet(PANCHANG_URL, {
        ayanamsa: AYANAMSA,
        coordinates: `${lat},${lng}`,
        datetime: apiDateTime
    });

    return mapPanchangResponse(rawData, city, parsedDate);
};

const fetchHoroscopeData = async ({ sign = 'aries', type = 'general', date = '' } = {}) => {
    const parsedDate = parseIsoDate(date);
    const apiDateTime = formatApiDateTime(parsedDate);
    const rawData = await prokeralaGet(HOROSCOPE_URL, {
        sign,
        type,
        datetime: apiDateTime
    });

    return mapSingleHoroscope(rawData, sign, parsedDate);
};

const fetchAllHoroscopes = async ({ type = 'general', date = '' } = {}) => {
    const parsedDate = parseIsoDate(date);
    const apiDateTime = formatApiDateTime(parsedDate);
    const rawData = await prokeralaGet(HOROSCOPE_URL, {
        sign: 'all',
        type,
        datetime: apiDateTime
    });

    const predictions = Array.isArray(rawData?.data?.daily_predictions)
        ? rawData.data.daily_predictions
        : [];

    const bySign = {};

    predictions.forEach((entry) => {
        const signKey = normalizeText(entry?.sign?.name).toLowerCase();
        const predictionList = Array.isArray(entry?.predictions) ? entry.predictions : [];

        let selectedPrediction = predictionList[0] || {};
        if (type !== 'all') {
            selectedPrediction = predictionList.find((item) => normalizeText(item?.type).toLowerCase() === type.toLowerCase()) || selectedPrediction || {};
        }

        bySign[signKey] = mapSingleHoroscope({ data: selectedPrediction }, signKey, parsedDate);
    });

    Object.keys(zodiacSigns).forEach((signKey) => {
        if (!bySign[signKey]) {
            bySign[signKey] = mapSingleHoroscope({ data: {} }, signKey, parsedDate);
        }
    });

    return bySign;
};

module.exports = {
    zodiacSigns,
    defaultCities,
    fetchPanchangData,
    fetchHoroscopeData,
    fetchAllHoroscopes,
    resetTokenCache
};
