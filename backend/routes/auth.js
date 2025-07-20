const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');

router.post('/login', authController.login);
router.post('/register', authMiddleware, isAdmin, authController.register);

module.exports = router; 