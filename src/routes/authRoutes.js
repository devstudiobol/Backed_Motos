const express = require('express');
const router = express.Router();
const { login, verify } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Login
router.post('/login', login);

// Verificar token
router.get('/verify', verifyToken, verify);

module.exports = router;