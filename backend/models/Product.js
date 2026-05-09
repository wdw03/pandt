const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Product title is required'],
        maxlength: 100,
        trim: true
    },
    description: { type: String, maxlength: 300, default: '' },
    price: { type: String, maxlength: 30, default: '' },
    seller: { type: String, maxlength: 80, default: '' },
    images: [{ type: String }],
    productId: { type: String, unique: true },
    productLink: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

productSchema.pre('save', function () {
    if (!this.productId) {
        this.productId = 'PROD-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }
});

module.exports = mongoose.model('Product', productSchema);
