const { Router } = require('express');
const PedidoController = require('../controllers/PedidoController');
const verificarVendedor = require('../middlewares/verificarVendedor');

const router = Router();
const controller = new PedidoController();

router.post('/', controller.crear);
router.get('/', verificarVendedor, controller.listar);
router.get('/cliente/:clienteId', controller.listarPorCliente); // antes que '/:codigo'
router.get('/:codigo', verificarVendedor, controller.obtenerPorCodigo);
router.patch('/:codigo/entregar', verificarVendedor, controller.entregar);
router.patch('/:codigo/cancelar', verificarVendedor, controller.cancelar);
router.patch('/:codigo/reactivar', verificarVendedor, controller.reactivar);

module.exports = router;