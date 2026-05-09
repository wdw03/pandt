const mongoose = require('mongoose');

const contactSubmissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true
    },
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('ContactSubmission', contactSubmissionSchema);
