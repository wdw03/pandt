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

const chunkLongText = (value = '', maxLength = 120) => {
    const normalized = cleanString(value).replace(/\s+/g, ' ');

    if (!normalized) {
        return [];
    }

    if (normalized.length <= maxLength) {
        return [normalized];
    }

    const words = normalized.split(' ');
    const chunks = [];
    let current = '';

    words.forEach((word) => {
        if (word.length > maxLength) {
            if (current) {
                chunks.push(current);
                current = '';
            }

            for (let index = 0; index < word.length; index += maxLength) {
                chunks.push(word.slice(index, index + maxLength));
            }
            return;
        }

        const nextValue = current ? `${current} ${word}` : word;

        if (nextValue.length <= maxLength) {
            current = nextValue;
            return;
        }

        if (current) {
            chunks.push(current);
        }

        current = word;
    });

    if (current) {
        chunks.push(current);
    }

    return chunks;
};

const toLimitedStringArray = (value, maxLength) => {
    return toStringArray(value).flatMap((entry) => chunkLongText(entry, maxLength));
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
        detailIntro: cleanString(resolveIncoming(input, 'detailIntro', existing.detailIntro)),
        detailBody: cleanString(resolveIncoming(input, 'detailBody', existing.detailBody)),
        detailHighlights: toLimitedStringArray(input.detailHighlights ?? existing.detailHighlights ?? [], 140),
        ritualSteps: toLimitedStringArray(input.ritualSteps ?? existing.ritualSteps ?? [], 260),
        preparationNotes: toLimitedStringArray(input.preparationNotes ?? existing.preparationNotes ?? [], 240),
        suitableFor: toLimitedStringArray(input.suitableFor ?? existing.suitableFor ?? [], 180),
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
        detailIntro: cleanString(resolveIncoming(input, 'detailIntro', existing.detailIntro)),
        detailBody: cleanString(resolveIncoming(input, 'detailBody', existing.detailBody)),
        highlights: toLimitedStringArray(input.highlights ?? existing.highlights ?? [], 120),
        detailPoints: toLimitedStringArray(input.detailPoints ?? existing.detailPoints ?? [], 180),
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

const normalizeAstrologyServicePayload = (input = {}, existing = {}) => {
    const title = cleanString(resolveIncoming(input, 'title', existing.title));
    const slugSource = cleanString(resolveIncoming(input, 'slug', existing.slug)) || title || existing.slug;
    const serviceType = cleanString(resolveIncoming(input, 'serviceType', existing.serviceType || 'overall'));

    return {
        title,
        slug: slugify(slugSource),
        serviceType: serviceType === 'topic' ? 'topic' : 'overall',
        badge: cleanString(resolveIncoming(input, 'badge', existing.badge)),
        priceLabel: cleanString(resolveIncoming(input, 'priceLabel', existing.priceLabel)),
        turnaround: cleanString(resolveIncoming(input, 'turnaround', existing.turnaround)),
        image: toWebAssetPath(resolveIncoming(input, 'image', existing.image)),
        secondaryImage: toWebAssetPath(resolveIncoming(input, 'secondaryImage', existing.secondaryImage)),
        shortDescription: cleanString(resolveIncoming(input, 'shortDescription', existing.shortDescription)),
        introHeading: cleanString(resolveIncoming(input, 'introHeading', existing.introHeading)),
        introBody: cleanString(resolveIncoming(input, 'introBody', existing.introBody)),
        detailHeading: cleanString(resolveIncoming(input, 'detailHeading', existing.detailHeading)),
        detailBody: cleanString(resolveIncoming(input, 'detailBody', existing.detailBody)),
        highlights: toLimitedStringArray(input.highlights ?? existing.highlights ?? [], 140),
        deliverables: toLimitedStringArray(input.deliverables ?? existing.deliverables ?? [], 180),
        dropdownOptions: toLimitedStringArray(input.dropdownOptions ?? existing.dropdownOptions ?? [], 80),
        whatsappNote: cleanString(resolveIncoming(input, 'whatsappNote', existing.whatsappNote)),
        formTitle: cleanString(resolveIncoming(input, 'formTitle', existing.formTitle)),
        formDescription: cleanString(resolveIncoming(input, 'formDescription', existing.formDescription)),
        topicPlaceholder: cleanString(resolveIncoming(input, 'topicPlaceholder', existing.topicPlaceholder)),
        buttonLabel: cleanString(resolveIncoming(input, 'buttonLabel', existing.buttonLabel)),
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
        detailIntro: 'Maha Yag Puja is a complete Vedic fire offering performed with sankalp, mantra discipline, sacred offerings and priestly guidance for devotees who want a stronger spiritual atmosphere around family wellbeing, prosperity and divine grace.',
        detailBody: 'This puja is usually chosen when the family wants a more complete ritual experience instead of a very short offering. The sankalp is taken with personal intention, the ritual is performed with authentic procedure, and the fire-based worship becomes the core sacred medium through which prayers are offered. Devotees often choose this puja when they are entering a new phase of life, beginning a major effort, praying for peace at home or seeking divine support with sincerity and reverence. The ritual experience is designed to feel devotional, structured and spiritually elevating.\n\nMaha Yag Puja can also be positioned as a high-value service for those who want more than a simple booking card. The full detail page can explain the devotional mood, priestly discipline, spiritual purpose, preparation steps, what the family should expect, and how the blessings are invoked during the sacred procedure. This makes the puja easier to understand and increases trust before a devotee confirms the booking.',
        detailHighlights: [
            'Authentic sankalp and fire ritual procedure',
            'Performed for peace, purification and blessings',
            'Suitable for major family prayers and auspicious beginnings'
        ],
        ritualSteps: [
            'The ritual begins with sankalp in the devotee name and purpose of the puja.',
            'Sacred mantras, fire offerings and traditional items are used in sequence with priestly guidance.',
            'The closing prayer focuses on divine blessings, peace and positive energy for the family.'
        ],
        preparationNotes: [
            'Keep the devotee name, nakshatra details or intention ready before confirmation.',
            'Maintain a clean and prayerful space if the family wants to join devotionally from home.',
            'Useful items or participation instructions can be shared in advance through the booking flow.'
        ],
        suitableFor: [
            'Families seeking peace, purification and positive vibrations',
            'Auspicious beginnings, spiritual support and major personal intentions',
            'Devotees who prefer a more complete and traditional Vedic ritual experience'
        ],
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
        detailIntro: 'Lakshmi Puja is a sacred prosperity ritual offered with devotion to Maa Lakshmi for abundance, grace, family harmony and a stronger sense of auspicious flow in the home or workplace.',
        detailBody: 'This puja is especially meaningful for devotees who want to pray for prosperity with reverence rather than treating wealth only as a material goal. The ritual focuses on invoking grace, harmony, auspiciousness and a softer energy of abundance in life. It can be positioned for festival bookings, home worship, special prayer days, financial stability prayers or family blessings related to success and peace. The detail page gives enough room to explain the devotional meaning of the puja, the spirit of the worship and the sacred mood around Lakshmi worship.\n\nBecause the puja is deeply associated with abundance and auspicious growth, it also works well as a strongly visual premium service page. The admin can explain the value of the ritual, the recommended situations for booking, the blessings devotees usually pray for and any special spiritual context that should be shared before the ritual is performed.',
        detailHighlights: [
            'Dedicated to Maa Lakshmi for abundance and grace',
            'Auspicious ritual for home, work and festive prayer',
            'Ideal for devotees seeking prosperity with spiritual balance'
        ],
        ritualSteps: [
            'The puja begins with sankalp and devotional invocation to Maa Lakshmi.',
            'Offerings, mantra chanting and sacred procedure are carried out with a calm prosperity-focused intent.',
            'The ritual concludes with prayer for abundance, harmony and auspicious blessings.'
        ],
        preparationNotes: [
            'A clean altar or prayer area is recommended before the ritual begins.',
            'The devotee can keep a specific prayer intention related to prosperity, harmony or household grace.',
            'Festival or special-day booking notes can be added from the dashboard when required.'
        ],
        suitableFor: [
            'Prosperity prayers for home and family wellbeing',
            'Festive worship, auspicious growth and peaceful abundance',
            'Devotees seeking a grace-oriented Lakshmi ritual experience'
        ],
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
        detailIntro: 'Ghar Puja is a home-focused ritual chosen for space purification, family harmony, protection, sacred beginnings and a calmer devotional environment inside the household.',
        detailBody: 'This puja is highly relevant when a family wants to pray specifically for the house itself, not only for an individual intention. It supports purification, emotional softness, peaceful energy and a stronger devotional atmosphere in the living space. It can be used for new homes, re-entry into a space, important family transitions, prayer before settling into a routine or simply when the family wants spiritual cleansing and positive vibrations around the home.\n\nOn the detail page, this puja can be explained in a very practical and meaningful way. The admin can describe why devotees book it, what kind of blessing they usually seek, how the ritual helps the home environment and what kind of preparation or participation is recommended. This makes the page feel useful, rich and easier to trust before the booking decision is taken.',
        detailHighlights: [
            'Home purification and family peace focus',
            'Designed for calm, harmony and sacred household energy',
            'Useful for new beginnings, shifts and spiritual settling'
        ],
        ritualSteps: [
            'The ritual starts with a sankalp for the home, family peace and purification.',
            'Traditional procedure is followed to bless the space and invite positive vibrations.',
            'Final prayers focus on protection, auspiciousness and a balanced domestic atmosphere.'
        ],
        preparationNotes: [
            'The home area should be kept neat and prayer-ready before the ritual time.',
            'The family can share any special intention related to peace, transition or new beginnings.',
            'Additional notes about the property or family context can be added from the admin dashboard if needed.'
        ],
        suitableFor: [
            'New homes, house entry and domestic transitions',
            'Families praying for protection, calm and spiritual balance',
            'Devotees wanting a cleaner and more uplifting home atmosphere'
        ],
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
        seller: 'Energised daily wear',
        detailIntro: 'A calm and balanced Rudraksha bracelet for devotees who want a simple spiritual accessory for prayer, travel and everyday protection.',
        detailBody: 'This 5 Mukhi Rudraksha bracelet is chosen by devotees who prefer a wearable spiritual product that feels light, meaningful and easy to carry every day. It suits morning prayer, temple visits, focused work routines and gifting for someone who values sacred simplicity. The crystal-style finish gives it a cleaner premium presentation while still keeping the devotional identity intact.',
        highlights: [
            'Comfortable for daily wear and gifting',
            'Suitable for prayer, calm and focus routines',
            'Simple bracelet format with a devotional look'
        ],
        detailPoints: [
            'Works well as a first spiritual accessory for regular use',
            'Can be paired with daily mantra or meditation practice',
            'A thoughtful option for devotees seeking a light wearable remedy'
        ],
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
        seller: 'Premium gemstone remedy',
        detailIntro: 'A premium emerald-style gemstone option for devotees who want a refined spiritual purchase with visual richness and astrological appeal.',
        detailBody: 'This green cut natural emerald beryl gemstone is presented as a premium remedy-oriented product for devotees who prefer a stronger visual finish and a more elevated product experience. It suits those looking for gemstone guidance, gifting, collection or astrology-linked selection. The product page can be used to explain purity, finish, recommendation flow and purchase enquiry in detail from the admin panel.',
        highlights: [
            'Premium green gemstone presentation',
            'Strong visual appeal for remedy seekers',
            'Suitable for gifting and guided selection'
        ],
        detailPoints: [
            'Best used when the devotee wants a premium-looking gemstone option',
            'Good fit for admin-led explanation of quality, suitability and recommendations',
            'Can be updated later with purity, weight or consultation notes'
        ],
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
        seller: 'Festive devotional decor',
        detailIntro: 'A Lord Ganesha decorative product for blessings, festive gifting, home decor and sacred desk placement.',
        detailBody: 'This Lord Ganesha decorative gift item is a devotional product designed for people who want a graceful spiritual showpiece for home, office, festive occasions or gift exchange. It is especially suitable for a visible sacred corner, entry area or work desk where the devotee wants a daily reminder of blessings, wisdom and auspicious beginnings.',
        highlights: [
            'Ideal for festive gifting and sacred decor',
            'Works well for desk, shelf or prayer corner placement',
            'A simple devotional product with strong emotional appeal'
        ],
        detailPoints: [
            'Useful for housewarming, festival gifting and daily decor',
            'Can be positioned as a blessings-oriented home accessory',
            'Easy to promote as a visual and devotional product together'
        ],
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

const defaultAstrologyServices = [
    {
        title: 'Manual Analysis Report in 24 Hours',
        slug: 'manual-analysis-report',
        serviceType: 'overall',
        badge: 'Overall Analysis',
        priceLabel: 'Rs 501',
        turnaround: 'Handwritten report in 24 hours',
        image: '/assets/images/home-analyze.png',
        secondaryImage: '/assets/images/Gemini_Generated_Image_alcwplalcwplalcw.png',
        shortDescription: 'Book a personal handwritten astrology report with remedies, life insights and clear guidance prepared manually after reviewing birth details.',
        introHeading: 'Overall life analysis with remedies',
        introBody: 'This service is meant for devotees who want a complete manual astrology reading. The analysis includes major life directions, practical observations and remedies prepared after reviewing the birth chart manually.',
        detailHeading: 'What the overall manual astrology report includes',
        detailBody: 'The overall manual analysis is prepared by reviewing the birth details carefully and then writing a clear report around the user’s current life direction. It can cover emotional state, opportunity timing, obstacles, guidance areas and suggested remedies. The report is meant to feel personal, readable and spiritually grounded instead of generic.',
        highlights: [
            'Handwritten style manual reading',
            'Delivered within 24 hours',
            'Includes remedies and practical guidance',
            'Suitable for full life direction'
        ],
        deliverables: [
            'Overall life direction analysis',
            'Focus on the selected concern area',
            'Written remedies and spiritual suggestions',
            'Admin uploaded report available in user profile'
        ],
        dropdownOptions: ['Career & Financial Growth', 'Health & Wellbeing Analysis', 'Marriage & Relationship Guidance', 'Complete Kundli & Horoscope Analysis'],
        whatsappNote: 'Share an active WhatsApp number to receive service updates quickly.',
        formTitle: 'Submit your overall astrology analysis request',
        formDescription: 'Fill in your birth details carefully so the manual report can be prepared correctly.',
        topicPlaceholder: '',
        buttonLabel: 'Submit Overall Analysis',
        order: 1,
        isActive: true
    },
    {
        title: 'One Topic Analysis and Remedies',
        slug: 'one-topic-analysis',
        serviceType: 'topic',
        badge: 'One Topic Reading',
        priceLabel: 'Rs 101',
        turnaround: 'Single-topic written guidance',
        image: '/assets/images/panditpujakete.jpg',
        secondaryImage: '/assets/images/home-analyze.png',
        shortDescription: 'Request a focused astrology reading for one important area of life and let the admin team upload your written report with remedies after review.',
        introHeading: 'Focused single-topic astrology guidance',
        introBody: 'This service is ideal if the user wants clarity only on one important area. The reading stays more focused, includes remedies and can also include a custom topic note from the user for better context.',
        detailHeading: 'What the one-topic analysis covers',
        detailBody: 'The one-topic service keeps the reading centered on a single concern, such as marriage, love life or career growth. The user can select a focus area and also write a short custom note. This helps the admin prepare a more practical written answer with remedies and guidance instead of a broad life reading.',
        highlights: [
            'Best for one important life question',
            'Shorter but focused analysis',
            'Custom note can be added by the user',
            'Written remedies included'
        ],
        deliverables: [
            'Single-topic reading based on birth details',
            'Specific written advice and remedies',
            'Custom topic note supported',
            'Admin uploaded report appears in user profile'
        ],
        dropdownOptions: ['Career & Financial Growth', 'Health & Wellbeing Analysis', 'Marriage & Relationship Guidance', 'Complete Kundli & Horoscope Analysis'],
        whatsappNote: 'Use your active WhatsApp number so the team can coordinate updates if needed.',
        formTitle: 'Submit your one-topic astrology request',
        formDescription: 'Select the concern area and add a custom topic note if you want the reading to focus on something specific.',
        topicPlaceholder: 'Write your exact topic or question here',
        buttonLabel: 'Submit One Topic Analysis',
        order: 2,
        isActive: true
    }
];

// SiteConfig defaults are seeded into MongoDB on first boot. Credential keys are
// intentionally seeded as empty strings — the admin must populate them via the
// admin dashboard Settings panel (or via env vars). Never hardcode real secrets here.
const defaultSiteConfigs = [
    { key: 'kundaliMatchingPrice', value: 'Rs 800' },
    { key: 'janamKundaliPrice', value: 'Rs 300' },
    { key: 'panchangClientId', value: '' },
    { key: 'panchangClientSecret', value: '' }
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
    normalizeAstrologyServicePayload,
    cloneDefaults,
    defaultPoojaSlides,
    defaultProducts,
    defaultVideos,
    defaultAstrologyServices,
    defaultSiteConfigs
};
