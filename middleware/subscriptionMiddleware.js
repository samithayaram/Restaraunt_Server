const Subscription = require('../models/Subscription');

/**
 * Middleware to check if the user has an active subscription.
 * Only users with status 'active' can proceed to the next middleware/controller.
 */
const checkSubscription = async (req, res, next) => {
    try {
        // SuperAdmin can bypass subscription checks
        if (req.user && req.user.role === 'SuperAdmin') {
            return next();
        }

        const subscription = await Subscription.findOne({ user: req.user.id });

        if (!subscription || subscription.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'This feature requires an active subscription. Please activate your account in the dashboard.'
            });
        }

        next();
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error verifying subscription status' });
    }
};

module.exports = { checkSubscription };
