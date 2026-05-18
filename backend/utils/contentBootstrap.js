const PoojaSlide = require('../models/PoojaSlide');
const Product = require('../models/Product');
const VideoItem = require('../models/VideoItem');
const AstrologyService = require('../models/AstrologyService');
const SiteConfig = require('../models/SiteConfig');
const {
    cloneDefaults,
    defaultPoojaSlides,
    defaultProducts,
    defaultVideos,
    defaultAstrologyServices,
    defaultSiteConfigs,
    normalizePoojaSlidePayload,
    normalizeProductPayload,
    normalizeVideoPayload,
    normalizeAstrologyServicePayload
} = require('./contentManager');

const ensurePoojaSlidesSeeded = async () => {
    const count = await PoojaSlide.countDocuments();

    if (count === 0) {
        const slides = cloneDefaults(defaultPoojaSlides).map((slide) =>
            normalizePoojaSlidePayload(slide)
        );

        if (slides.length) {
            await PoojaSlide.insertMany(slides, { ordered: true });
        }
    }
};

const ensureProductsSeeded = async () => {
    const count = await Product.countDocuments();

    if (count === 0) {
        const products = cloneDefaults(defaultProducts).map((product) =>
            normalizeProductPayload(product)
        );

        if (products.length) {
            await Product.insertMany(products, { ordered: true });
        }
    }
};

const ensureVideosSeeded = async () => {
    const count = await VideoItem.countDocuments();

    if (count === 0) {
        const videos = cloneDefaults(defaultVideos).map((video) =>
            normalizeVideoPayload(video)
        );

        if (videos.length) {
            await VideoItem.insertMany(videos, { ordered: true });
        }
    }
};

const ensureAstrologyServicesSeeded = async () => {
    const count = await AstrologyService.countDocuments();

    if (count === 0) {
        const services = cloneDefaults(defaultAstrologyServices).map((service) =>
            normalizeAstrologyServicePayload(service)
        );

        if (services.length) {
            await AstrologyService.insertMany(services, { ordered: true });
        }
    }
};

const ensureSiteConfigSeeded = async () => {
    const defaults = cloneDefaults(defaultSiteConfigs);
    const existingKeys = await SiteConfig.find(
        { key: { $in: defaults.map((entry) => entry.key) } },
        'key'
    );
    const existingKeySet = new Set(existingKeys.map((entry) => entry.key));
    const missingEntries = defaults.filter((entry) => !existingKeySet.has(entry.key));

    if (!missingEntries.length) {
        return;
    }

    await SiteConfig.insertMany(missingEntries, { ordered: true });
};

const ensureCoreAdminContent = async () => {
    await ensurePoojaSlidesSeeded();
    await ensureProductsSeeded();
    await ensureVideosSeeded();
    await ensureAstrologyServicesSeeded();
    await ensureSiteConfigSeeded();
};

module.exports = {
    ensurePoojaSlidesSeeded,
    ensureProductsSeeded,
    ensureVideosSeeded,
    ensureAstrologyServicesSeeded,
    ensureSiteConfigSeeded,
    ensureCoreAdminContent
};
