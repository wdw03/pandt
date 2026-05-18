const mongoose = require('mongoose');

const astrologyServiceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Service title is required'],
        maxlength: 100,
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true
    },
    serviceType: {
        type: String,
        enum: ['overall', 'topic'],
        required: true
    },
    badge: { type: String, maxlength: 40, default: '' },
    priceLabel: { type: String, maxlength: 30, default: '' },
    turnaround: { type: String, maxlength: 80, default: '' },
    image: { type: String, default: '' },
    secondaryImage: { type: String, default: '' },
    shortDescription: { type: String, maxlength: 260, default: '' },
    introHeading: { type: String, maxlength: 100, default: '' },
    introBody: { type: String, maxlength: 1200, default: '' },
    detailHeading: { type: String, maxlength: 120, default: '' },
    detailBody: { type: String, maxlength: 5000, default: '' },
    highlights: [{ type: String, maxlength: 140 }],
    deliverables: [{ type: String, maxlength: 180 }],
    dropdownOptions: [{ type: String, maxlength: 80 }],
    whatsappNote: { type: String, maxlength: 160, default: '' },
    formTitle: { type: String, maxlength: 100, default: '' },
    formDescription: { type: String, maxlength: 320, default: '' },
    topicPlaceholder: { type: String, maxlength: 160, default: '' },
    buttonLabel: { type: String, maxlength: 40, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

astrologyServiceSchema.pre('save', function () {
    if (!this.slug && this.title) {
        this.slug = this.title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
});

module.exports = mongoose.model('AstrologyService', astrologyServiceSchema);
