
const express = require('express');
const { login } = require('../controllers/authController');

const router = express.Router();

// Inicio de sesión del administrador
router.post('/login', login);

module.exports = router;
