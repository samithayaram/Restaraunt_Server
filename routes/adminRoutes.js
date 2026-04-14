const express = require('express');
const { getPlatformStats, getUsers, toggleUserStatus } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('SuperAdmin'));

router.get('/stats', getPlatformStats);
router.get('/users', getUsers);
router.put('/users/:id/toggle', toggleUserStatus);

module.exports = router;
