const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

exports.getPlatformStats = async (req, res) => {
    try {
        const users = await User.countDocuments({ role: 'RestaurantOwner' });
        const restaurants = await Restaurant.countDocuments();
        
        res.status(200).json({ success: true, data: { users, restaurants } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'RestaurantOwner' }).select('-password');
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.isActive = !user.isActive;
        await user.save();
        
        // Also toggle their restaurant if any
        const restaurant = await Restaurant.findOne({ owner: user._id });
        if (restaurant) {
            restaurant.isActive = user.isActive;
            await restaurant.save();
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
