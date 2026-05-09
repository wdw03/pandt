const mongoose = require('mongoose');

const metaItemSchema = new mongoose.Schema({
    label: { type: String, maxlength: 40, default: '' },
    value: { type: String, maxlength: 60, default: '' }
}, { _id: true });

const routeSectionSchema = new mongoose.Schema({
    sectionKey: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    title: { type: String, maxlength: 80, default: '' },
    description: { type: String, maxlength: 300, default: '' },
    metaItems: [metaItemSchema],
    points: [{ type: String, maxlength: 100 }],
    image: { type: String, default: '' },
    order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('RouteSection', routeSectionSchema);
