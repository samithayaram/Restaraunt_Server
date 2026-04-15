const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

exports.saveRestaurant = async (req, res) => {
    try {
        const { id, name, description, address, slug, logo } = req.body;

        const slugify = (text) => text.toString().toLowerCase().trim()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-');         // Replace multiple - with single -

        const cleanSlug = slugify(slug || name);
        const CLIENT_URL = process.env.CLIENT_URL || 'https://restaraunt-saas.vercel.app';
        
        // Check if slug is already taken (excluding current restaurant if updating)
        if (cleanSlug) {
            const slugExists = await Restaurant.findOne({ 
                slug: cleanSlug, 
                _id: { $ne: id } 
            });
            if (slugExists) {
                return res.status(400).json({ success: false, message: 'This slug or restaurant name is already taken. Please choose another.' });
            }
        }

        let restaurant;
        if (id) {
            // Update existing
            restaurant = await Restaurant.findOneAndUpdate(
                { _id: id, owner: req.user.id },
                { name, description, address, slug: cleanSlug, logo, qrCodeUrl: `${CLIENT_URL}/menu/${cleanSlug}` },
                { new: true, runValidators: true }
            );
        } else {
            // Create new
            restaurant = await Restaurant.create({
                owner: req.user.id,
                name, description, address, slug: cleanSlug,
                logo,
                qrCodeUrl: `${CLIENT_URL}/menu/${cleanSlug}` 
            });
        }

        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found or unauthorized' });
        }

        res.status(200).json({ success: true, data: restaurant });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find({ owner: req.user.id });
        res.status(200).json({ success: true, data: restaurants });
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
        const menuItems = await MenuItem.find({ restaurant: restaurant._id });
        
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
        const { restaurantId, name, order } = req.body;
        const restaurant = await Restaurant.findOne({ _id: restaurantId, owner: req.user.id });
        if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found or unauthorized.' });

        const category = await Category.create({ restaurant: restaurant._id, name, order });
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addMenuItem = async (req, res) => {
    try {
        const { restaurantId, categoryId, name, description, price, image } = req.body;
        const restaurant = await Restaurant.findOne({ _id: restaurantId, owner: req.user.id });
        if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found or unauthorized.' });

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

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, order } = req.body;
        console.log(`[DEBUG] Updating Category: id=${id}, user=${req.user?.id}`);
        
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }

        const restaurant = await Restaurant.findOne({ 
            _id: category.restaurant, 
            owner: req.user.id 
        });

        if (!restaurant) {
            console.log(`[DEBUG] Ownership check failed for user ${req.user.id} on category ${id}`);
            return res.status(403).json({ success: false, message: 'Unauthorized: You do not own the restaurant for this category.' });
        }

        if (name) category.name = name;
        if (order !== undefined) category.order = order;
        
        await category.save();
        res.status(200).json({ success: true, data: category });
    } catch (error) {
        console.error('[CRITICAL] Update Category Error:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[DEBUG] Deleting Category: id=${id}, user=${req.user?.id}`);

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }

        const restaurant = await Restaurant.findOne({ 
            _id: category.restaurant, 
            owner: req.user.id 
        });

        if (!restaurant) {
            console.log(`[DEBUG] Ownership check failed for user ${req.user.id} during deletion of category ${id}`);
            return res.status(403).json({ success: false, message: 'Unauthorized: You do not own the restaurant for this category.' });
        }

        // Delete associated menu items
        const deletedItems = await MenuItem.deleteMany({ category: new mongoose.Types.ObjectId(id) });
        console.log(`[DEBUG] Deleted ${deletedItems.deletedCount} items from category ${id}`);

        await category.deleteOne();
        res.status(200).json({ success: true, message: 'Category and its items deleted successfully.' });
    } catch (error) {
        console.error('[CRITICAL] Delete Category Error:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

exports.updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, image, categoryId, isAvailable } = req.body;
        console.log(`[DEBUG] Updating Menu Item: id=${id}, user=${req.user?.id}`);

        const item = await MenuItem.findById(id);
        if (!item) return res.status(404).json({ success: false, message: 'Menu item not found.' });

        const restaurant = await Restaurant.findOne({ _id: item.restaurant, owner: req.user.id });
        if (!restaurant) return res.status(403).json({ success: false, message: 'Unauthorized: You do not own the restaurant for this item.' });

        if (name) item.name = name;
        if (description !== undefined) item.description = description;
        if (price !== undefined) item.price = Number(price);
        if (image !== undefined) item.image = image;
        if (categoryId) item.category = categoryId;
        if (isAvailable !== undefined) item.isAvailable = isAvailable;

        await item.save();
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        console.error('[CRITICAL] Update MenuItem Error:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};

exports.deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[DEBUG] Deleting Menu Item: id=${id}, user=${req.user?.id}`);

        const item = await MenuItem.findById(id);
        if (!item) return res.status(404).json({ success: false, message: 'Menu item not found.' });

        const restaurant = await Restaurant.findOne({ _id: item.restaurant, owner: req.user.id });
        if (!restaurant) return res.status(403).json({ success: false, message: 'Unauthorized: You do not own the restaurant for this item.' });

        await item.deleteOne();
        res.status(200).json({ success: true, message: 'Menu item deleted successfully.' });
    } catch (error) {
        console.error('[CRITICAL] Delete MenuItem Error:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
};
