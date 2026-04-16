const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please add an item name']
    },
    description: String,
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    image: String,
    itemType: {
        type: String,
        enum: ['veg', 'non-veg'],
        default: 'veg'
    },
    isBestSeller: {
        type: Boolean,
        default: false
    },
    isTodaysSpecial: {
        type: Boolean,
        default: false
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
