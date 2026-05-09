const cleanString = (value = '') => {
    if (typeof value === 'string') {
        return value.trim();
    }

    if (value === null || value === undefined) {
        return '';
    }

    return String(value).trim();
};

const slugify = (value = '') => {
    return cleanString(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

const toWebAssetPath = (value = '') => {
    const normalized = cleanString(value).replace(/\\/g, '/');

    if (!normalized) {
        return '';
    }

    if (
        normalized.startsWith('http://') ||
        normalized.startsWith('https://') ||
        normalized.startsWith('data:')
    ) {
        return normalized;
    }

    const lower = normalized.toLowerCase();
    const assetIndex = lower.lastIndexOf('/assets/');

    if (assetIndex >= 0) {
        return normalized.slice(assetIndex);
    }

    if (lower.startsWith('assets/')) {
        return `/${normalized}`;
    }

    if (lower.startsWith('./assets/')) {
        return normalized.slice(1);
    }

    if (lower.startsWith('/assets/')) {
        return normalized;
    }

    return normalized;
};

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value, fallback = true) => {
    if (typeof value === 'boolean') {
        return value;
    }

    const normalized = cleanString(value).toLowerCase();

    if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
        return true;
    }

    if (normalized === 'false' || normalized === '0' || normalized === 'no') {
        return false;
    }

    return fallback;
};

const tryJsonParse = (value, fallback) => {
    try {
        return JSON.parse(value);
    } catch (error) {
        return fallback;
    }
};

const resolveIncoming = (input, key, fallback) => {
    return Object.prototype.hasOwnProperty.call(input, key) ? input[key] : fallback;
};

const toStringArray = (value) => {
    if (Array.isArray(value)) {
        return value
            .map((entry) => cleanString(entry))
            .filter(Boolean);
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();

        if (!trimmed) {
            return [];
        }

        if (trimmed.startsWith('[')) {
            const parsed = tryJsonParse(trimmed, []);
            return toStringArray(parsed);
        }

        return trimmed
            .split(/\r?\n|,/)
            .map((entry) => cleanString(entry))
            .filter(Boolean);
    }

    return [];
};

const toBenefitArray = (value) => {
    if (Array.isArray(value)) {
        return value
            .map((benefit) => ({
                preview: cleanString(benefit?.preview),
                heading: cleanString(benefit?.heading),
                body: cleanString(benefit?.body)
            }))
            .filter((benefit) => benefit.preview || benefit.heading || benefit.body);
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();

        if (!trimmed) {
            return [];
        }

        const parsed = tryJsonParse(trimmed, []);
        return toBenefitArray(parsed);
    }

    return [];
};

const normalizePoojaSlidePayload = (input = {}, existing = {}) => {
    const title = cleanString(resolveIncoming(input, 'title', existing.title));
    const slugSource = cleanString(resolveIncoming(input, 'slug', existing.slug)) || title || existing.slug;

    return {
        title,
        slug: slugify(slugSource),
        image: toWebAssetPath(resolveIncoming(input, 'image', existing.image)),
        imageTag: cleanString(resolveIncoming(input, 'imageTag', existing.imageTag)),
        cardDescription: cleanString(resolveIncoming(input, 'cardDescription', existing.cardDescription)),
        priceLabel: cleanString(resolveIncoming(input, 'priceLabel', existing.priceLabel)),
        subtitle: cleanString(resolveIncoming(input, 'subtitle', existing.subtitle)),
        aboutPreview: cleanString(resolveIncoming(input, 'aboutPreview', existing.aboutPreview)),
        aboutHeading: cleanString(resolveIncoming(input, 'aboutHeading', existing.aboutHeading)),
        aboutBody: cleanString(resolveIncoming(input, 'aboutBody', existing.aboutBody)),
        benefits: toBenefitArray(input.benefits ?? existing.benefits ?? []),
        order: toNumber(input.order ?? existing.order, 0),
        isActive: toBoolean(input.isActive ?? existing.isActive, true)
    };
};

const normalizeProductPayload = (input = {}, existing = {}) => {
    return {
        title: cleanString(resolveIncoming(input, 'title', existing.title)),
        description: cleanString(resolveIncoming(input, 'description', existing.description)),
        price: cleanString(resolveIncoming(input, 'price', existing.price)),
        seller: cleanString(resolveIncoming(input, 'seller', existing.seller)),
        images: toStringArray(input.images ?? existing.images ?? []).map(toWebAssetPath),
        productLink: cleanString(resolveIncoming(input, 'productLink', existing.productLink)),
        order: toNumber(input.order ?? existing.order, 0),
        isActive: toBoolean(input.isActive ?? existing.isActive, true)
    };
};

const normalizeVideoPayload = (input = {}, existing = {}) => {
    return {
        title: cleanString(resolveIncoming(input, 'title', existing.title)),
        description: cleanString(resolveIncoming(input, 'description', existing.description)),
        url: cleanString(resolveIncoming(input, 'url', existing.url)),
        order: toNumber(input.order ?? existing.order, 0),
        isActive: toBoolean(input.isActive ?? existing.isActive, true)
    };
};

const cloneDefaults = (value) => JSON.parse(JSON.stringify(value));

const defaultPoojaSlides = [
    {
        title: 'Maha Yag Pooja',
        slug: 'maha-yag-pooja',
        image: '/assets/images/panditpujakete.jpg',
        imageTag: 'Sacred Ritual',
        cardDescription: 'Maha Yag Pooja is a sacred Vedic ritual performed to invite peace, protection and divine blessings into the home.',
        priceLabel: 'MRP 300',
        subtitle: 'Sacred ritual for peace and prosperity',
        aboutPreview: 'Maha Yag Pooja is performed with authentic Vedic discipline to energise the space and invite auspicious vibrations.',
        aboutHeading: 'About Maha Yag Pooja',
        aboutBody: 'Maha Yag Pooja is a deeply spiritual fire ritual performed for harmony, purification and blessings. When done with proper mantras and offerings, it helps elevate the environment, support family wellbeing and create a more auspicious atmosphere.',
        benefits: [
            {
                preview: 'Peace and positive energy',
                heading: 'Peace and Positive Energy',
                body: 'This pooja supports a calmer atmosphere and helps strengthen positive spiritual vibrations at home.'
            },
            {
                preview: 'Prosperity and spiritual growth',
                heading: 'Prosperity and Growth',
                body: 'It is often chosen to invite stability, blessings and a deeper spiritual connection for the family.'
            },
            {
                preview: 'Removes negative influence',
                heading: 'Negative Influence Removal',
                body: 'The ritual is believed to reduce negative influences and create a cleaner, more uplifting energetic environment.'
            }
        ],
        order: 0,
        isActive: true
    },
    {
        title: 'Lakshmi Pooja',
        slug: 'lakshmi-pooja',
        image: '/assets/images/lakshmipooja.jpg',
        imageTag: 'Prosperity Blessing',
        cardDescription: 'Lakshmi Pooja is offered with devotion to invite wealth, abundance, grace and prosperity into the household.',
        priceLabel: 'MRP 500',
        subtitle: 'Blessings for wealth, harmony and abundance',
        aboutPreview: 'Lakshmi Pooja is performed to seek the blessings of Maa Lakshmi for prosperity, peace and auspicious growth.',
        aboutHeading: 'About Lakshmi Pooja',
        aboutBody: 'Lakshmi Pooja is performed to invoke the blessings of Goddess Lakshmi for financial wellbeing, happiness and sacred abundance. With disciplined rituals and devotion, it helps create a prayerful environment aligned with prosperity and grace.',
        benefits: [
            {
                preview: 'Attracts wealth and abundance',
                heading: 'Wealth and Abundance',
                body: 'This pooja is traditionally associated with inviting financial strength, opportunity and abundance.'
            },
            {
                preview: 'Brings harmony at home',
                heading: 'Harmony at Home',
                body: 'Worship of Maa Lakshmi is believed to soften the home environment and bring calm, comfort and unity.'
            },
            {
                preview: 'Invites auspicious energy',
                heading: 'Auspicious Energy',
                body: 'It strengthens festive and sacred vibrations, making the space feel more positive and spiritually aligned.'
            }
        ],
        order: 1,
        isActive: true
    },
    {
        title: 'Ghar Pooja',
        slug: 'ghar-pooja',
        image: '/assets/images/gharouaj.jpg',
        imageTag: 'Home Harmony',
        cardDescription: 'Ghar Pooja is performed for domestic peace, purity and new beginnings, helping the family feel protected and settled.',
        priceLabel: 'MRP 800',
        subtitle: 'Purifies the home with peace and protection',
        aboutPreview: 'Ghar Pooja is a sacred home ritual performed to purify the space and fill it with peaceful, uplifting energy.',
        aboutHeading: 'About Ghar Pooja',
        aboutBody: 'Ghar Pooja is performed for household peace, purity and family wellbeing. When done with authentic procedures, it helps remove heaviness from the environment and supports a safer, more balanced and auspicious home atmosphere.',
        benefits: [
            {
                preview: 'Purifies the living space',
                heading: 'Purifies the Living Space',
                body: 'This pooja helps make the home environment feel lighter, purer and more spiritually positive.'
            },
            {
                preview: 'Strengthens family harmony',
                heading: 'Family Harmony',
                body: 'It supports warmth, empathy and a more harmonious connection among family members.'
            },
            {
                preview: 'Supports new beginnings',
                heading: 'New Beginnings',
                body: 'It is especially meaningful for a new home, a fresh chapter or any important new beginning.'
            }
        ],
        order: 2,
        isActive: true
    }
];

const defaultProducts = [
    {
        title: '5 Mukhi Rudraksha White Crystal Bracelet',
        description: 'The five Mukhi Rudraksha is associated with spiritual calm, protection and positive energy for daily wear.',
        price: 'Rs 80',
        seller: 'Energised spiritual product',
        images: [
            '/assets/images/astromallProduct_291713351741.png',
            '/assets/images/images.jpg'
        ],
        order: 0,
        isActive: true
    },
    {
        title: 'Green Cut Natural Emerald Beryl Gemstone',
        description: 'Barmunda gems Green Cut Natural Emerald Beryl Gemstone with a rich premium finish and strong astrological appeal.',
        price: 'Selling at Rs 4500',
        seller: 'Customer image',
        images: [
            '/assets/images/astromallProduct_281709056206.png',
            '/assets/images/images.jpg'
        ],
        order: 1,
        isActive: true
    },
    {
        title: 'Gold Art India Lord Ganesha Decorative Gift',
        description: 'A devotional Lord Ganesha gift and dashboard showpiece suitable for blessings, decor and festive gifting.',
        price: 'Selling at Rs 750',
        seller: 'Customer image',
        images: [
            '/assets/images/astromallProduct_271709056132.png',
            '/assets/images/images.jpg'
        ],
        order: 2,
        isActive: true
    }
];

const defaultVideos = [
    {
        title: 'Daily Astrology Guidance',
        description: 'Watch a sample spiritual video with a live YouTube thumbnail and future-ready video card layout.',
        url: 'https://youtu.be/SyqgAt-T0iQ?si=5nkmY-a5iSJEzV35',
        order: 0,
        isActive: true
    },
    {
        title: 'Weekly Energy Insights',
        description: 'A placeholder-ready block for an additional YouTube video managed from the admin dashboard.',
        url: '',
        order: 1,
        isActive: true
    },
    {
        title: 'Remedy and Ritual Tips',
        description: 'Use this section for stronger remedy explainers or puja process guidance videos later.',
        url: '',
        order: 2,
        isActive: true
    },
    {
        title: 'Relationship and Horoscope Reading',
        description: 'A future-ready space for relationship guidance, compatibility and prediction content.',
        url: '',
        order: 3,
        isActive: true
    },
    {
        title: 'Career and Prosperity Astrology',
        description: 'A good fit for success, business timing and prosperity-based astrology guidance videos.',
        url: '',
        order: 4,
        isActive: true
    }
];

const defaultSiteConfigs = [
    { key: 'kundaliMatchingPrice', value: 'Rs 800' },
    { key: 'janamKundaliPrice', value: 'Rs 300' },
    { key: 'panchangClientId', value: 'd45fe2a1-99f9-4b48-ae08-ae8fb6abe1a6' },
    { key: 'panchangClientSecret', value: 'wWkGgybm8WEigOqCrCdTAKKiLbQkAPUiDIFiWQn2' }
];

module.exports = {
    cleanString,
    slugify,
    toWebAssetPath,
    toNumber,
    toBoolean,
    toStringArray,
    toBenefitArray,
    normalizePoojaSlidePayload,
    normalizeProductPayload,
    normalizeVideoPayload,
    cloneDefaults,
    defaultPoojaSlides,
    defaultProducts,
    defaultVideos,
    defaultSiteConfigs
};
