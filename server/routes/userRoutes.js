const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, userController.getDashboardData);
router.put('/profile', protect, userController.updateProfile);
router.put('/password', protect, userController.updatePassword);

module.exports = router;
