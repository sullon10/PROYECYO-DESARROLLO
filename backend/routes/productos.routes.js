const { Router } = require('express');
const ProductoController = require('../controllers/ProductoController');

const router = Router();
const controller = new ProductoController();

router.get('/', controller.listar);
router.get('/:id', controller.obtenerUno);

module.exports = router;