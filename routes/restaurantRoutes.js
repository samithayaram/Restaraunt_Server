const express = require('express');
const { 
    saveRestaurant, 
    getRestaurant, 
    getPublicMenu, 
    addCategory, 
    addMenuItem 
} = require('../controllers/restaurantController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route for customers 
router.get('/public/:slug', getPublicMenu);

// Protected routes for restaurant owners
router.post('/', protect, authorize('RestaurantOwner', 'SuperAdmin'), saveRestaurant);
router.get('/', protect, authorize('RestaurantOwner', 'SuperAdmin'), getRestaurant);
router.post('/categories', protect, authorize('RestaurantOwner', 'SuperAdmin'), addCategory);
router.post('/menu-items', protect, authorize('RestaurantOwner', 'SuperAdmin'), addMenuItem);

module.exports = router;
