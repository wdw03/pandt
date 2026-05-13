const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
    name: { type: String, default: '' },
    birthDay: { type: String, default: '' },
    birthMonth: { type: String, default: '' },
    birthYear: { type: String, default: '' },
    birthHour: { type: String, default: '' },
    birthMinute: { type: String, default: '' },
    timeUnknown: { type: Boolean, default: false },
    birthCity: { type: String, default: '' },
    chartType: { type: String, default: '' },
    gender: { type: String, default: '' },
    birthPlace: { type: String, default: '' }
}, { _id: false });

const reportSchema = new mongoose.Schema({
    title: { type: String, default: '' },
    note: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    originalName: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    uploadedAt: { type: Date, default: null },
    isSeen: { type: Boolean, default: false }
}, { _id: false });

const kundaliSubmissionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['matching', 'janam'],
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
        index: true
    },
    boyData: { type: partnerSchema, default: null },
    girlData: { type: partnerSchema, default: null },
    singleData: { type: partnerSchema, default: null },
    whatsappNumber: { type: String, default: '' },
    userProfile: {
        name: { type: String, default: '' },
        email: { type: String, default: '' }
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed'],
        default: 'pending'
    },
    report: {
        type: reportSchema,
        default: () => ({})
    }
}, { timestamps: true });

module.exports = mongoose.model('KundaliSubmission', kundaliSubmissionSchema);
