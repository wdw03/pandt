const mongoose = require('mongoose');

const benefitSchema = new mongoose.Schema({
    preview: { type: String, maxlength: 100, default: '' },
    heading: { type: String, maxlength: 80, default: '' },
    body: { type: String, maxlength: 300, default: '' }
}, { _id: true });

const poojaSlideSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Pooja title is required'],
        maxlength: 60,
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true
    },
    image: { type: String, default: '' },
    imageTag: { type: String, maxlength: 40, default: '' },
    cardDescription: { type: String, maxlength: 200, default: '' },
    priceLabel: { type: String, maxlength: 20, default: '' },
    subtitle: { type: String, maxlength: 80, default: '' },
    aboutPreview: { type: String, maxlength: 200, default: '' },
    aboutHeading: { type: String, maxlength: 80, default: '' },
    aboutBody: { type: String, maxlength: 500, default: '' },
    benefits: [benefitSchema],
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

poojaSlideSchema.pre('save', function () {
    if (!this.slug && this.title) {
        this.slug = this.title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
});

module.exports = mongoose.model('PoojaSlide', poojaSlideSchema);
