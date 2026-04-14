const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    planId: String,          // e.g. 'price_H5ggYwtDq4fbrJ'
    planType: {
        type: String,
        enum: ['free', 'monthly', 'yearly'],
        default: 'free'
    },
    status: {
        type: String,
        enum: ['active', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'trialing'],
        default: 'incomplete'
    },
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
