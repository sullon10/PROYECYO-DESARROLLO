const { Router } = require('express');
const PedidoController = require('../controllers/PedidoController');

const router = Router();
const controller = new PedidoController();

router.post('/', controller.crear);
router.get('/', controller.listar);
router.get('/cliente/:clienteId', controller.listarPorCliente); // antes que '/:codigo'
router.get('/:codigo', controller.obtenerPorCodigo);
router.patch('/:codigo/entregar', controller.entregar);
router.patch('/:codigo/cancelar', controller.cancelar);
router.patch('/:codigo/reactivar', controller.reactivar);

module.exports = router;