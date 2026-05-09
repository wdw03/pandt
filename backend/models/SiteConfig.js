const mongoose = require('mongoose');

const siteConfigSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    value: {
        type: String,
        default: ''
    }
}, { timestamps: true });

siteConfigSchema.statics.getVal = async function (key, fallback = '') {
    const doc = await this.findOne({ key });
    return doc ? doc.value : fallback;
};

siteConfigSchema.statics.setVal = async function (key, value) {
    return this.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, returnDocument: 'after' }
    );
};

module.exports = mongoose.model('SiteConfig', siteConfigSchema);
