const Restaurant = require('../models/Restaurant');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

exports.saveRestaurant = async (req, res) => {
    try {
        const { name, description, address, slug } = req.body;
        
        // Owner logic: a user can have one restaurant
        let restaurant = await Restaurant.findOne({ owner: req.user.id });
        
        if (restaurant) {
            restaurant.name = name;
            restaurant.description = description;
            restaurant.address = address;
            restaurant.slug = slug;
            await restaurant.save();
        } else {
            restaurant = await Restaurant.create({
                owner: req.user.id,
                name, description, address, slug,
                qrCodeUrl: `${process.env.CLIENT_URL}/menu/${slug}` 
            });
        }
        res.status(200).json({ success: true, data: restaurant });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ owner: req.user.id });
        res.status(200).json({ success: true, data: restaurant });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPublicMenu = async (req, res) => {
    try {
        const { slug } = req.params;
        const restaurant = await Restaurant.findOne({ slug });
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }
        if (!restaurant.isActive) {
            return res.status(403).json({ success: false, message: 'Restaurant is currently inactive' });
        }
        
        const categories = await Category.find({ restaurant: restaurant._id }).sort('order');
        const menuItems = await MenuItem.find({ restaurant: restaurant._id, isAvailable: true });
        
        res.status(200).json({
            success: true,
            data: {
                restaurant: { name: restaurant.name, description: restaurant.description, logo: restaurant.logo, address: restaurant.address },
                categories,
                menuItems
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addCategory = async (req, res) => {
    try {
        const { name, order } = req.body;
        const restaurant = await Restaurant.findOne({ owner: req.user.id });
        if (!restaurant) return res.status(404).json({ success: false, message: 'Create a restaurant profile first.' });

        const category = await Category.create({ restaurant: restaurant._id, name, order });
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addMenuItem = async (req, res) => {
    try {
        const { categoryId, name, description, price, image } = req.body;
        const restaurant = await Restaurant.findOne({ owner: req.user.id });
        if (!restaurant) return res.status(404).json({ success: false, message: 'Create a restaurant profile first.' });

        const item = await MenuItem.create({ 
            restaurant: restaurant._id, 
            category: categoryId, 
            name, description, price, image 
        });
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Implement delete and update as necessary...
