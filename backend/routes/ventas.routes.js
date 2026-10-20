const { Router } = require('express');
const VentaController = require('../controllers/VentaController');

const router = Router();
const controller = new VentaController();

router.get('/reporte', controller.reporte); // antes de rutas dinamicas, si las hubiera
router.post('/', controller.registrar);
router.get('/', controller.historial);

module.exports = router;