
const express = require('express');
const { login, registrarCliente } = require('../controllers/authController');

const router = express.Router();

// Inicio de sesión del administrador
router.post('/login', login);
router.post('/registro', registrarCliente);

module.exports = router;
