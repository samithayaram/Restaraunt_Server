const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please add a restaurant name']
    },
    description: String,
    logo: String,
    address: String,
    qrCodeUrl: String, 
    // unique identifier used in public menu URL (e.g. /menu/my-restaurant-id)
    slug: {
        type: String,
        unique: true,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
