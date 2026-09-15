const express = require('express');
const { obtenerEstado } = require('../controllers/adminController');

const router = express.Router();

router.get('/status', obtenerEstado);

module.exports = router;