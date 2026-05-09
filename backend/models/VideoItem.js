const mongoose = require('mongoose');

const videoItemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Video title is required'],
        maxlength: 80,
        trim: true
    },
    description: { type: String, maxlength: 200, default: '' },
    url: { type: String, maxlength: 500, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('VideoItem', videoItemSchema);
