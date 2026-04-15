const express = require('express');
const { 
    saveRestaurant, 
    getRestaurants, 
    getPublicMenu, 
    addCategory, 
    addMenuItem,
    updateCategory,
    deleteCategory,
    updateMenuItem,
    deleteMenuItem
} = require('../controllers/restaurantController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { checkSubscription } = require('../middleware/subscriptionMiddleware');

const router = express.Router();

// Public route for customers 
router.get('/public/:slug', getPublicMenu);

// Protected routes for restaurant owners
router.post('/', protect, authorize('RestaurantOwner', 'SuperAdmin'), checkSubscription, saveRestaurant);
router.get('/', protect, authorize('RestaurantOwner', 'SuperAdmin'), getRestaurants);
router.post('/categories', protect, authorize('RestaurantOwner', 'SuperAdmin'), checkSubscription, addCategory);
router.put('/categories/:id', protect, authorize('RestaurantOwner', 'SuperAdmin'), checkSubscription, updateCategory);
router.delete('/categories/:id', protect, authorize('RestaurantOwner', 'SuperAdmin'), deleteCategory);

router.post('/menu-items', protect, authorize('RestaurantOwner', 'SuperAdmin'), checkSubscription, addMenuItem);
router.put('/menu-items/:id', protect, authorize('RestaurantOwner', 'SuperAdmin'), checkSubscription, updateMenuItem);
router.delete('/menu-items/:id', protect, authorize('RestaurantOwner', 'SuperAdmin'), deleteMenuItem);

module.exports = router;
