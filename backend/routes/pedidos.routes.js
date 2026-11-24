const { Router } = require('express');
const PedidoController = require('../controllers/PedidoController');
const { verificarToken, permitirRoles } = require('../middlewares/verificarToken');

const router = Router();
const controller = new PedidoController();

router.post('/', verificarToken, permitirRoles('cliente'), controller.crear);
router.get('/', verificarToken, permitirRoles('vendedor', 'administrador'), controller.listar);
router.get('/cliente/:clienteId', verificarToken, permitirRoles('cliente', 'vendedor', 'administrador'), controller.listarPorCliente);
router.patch('/:codigo', verificarToken, permitirRoles('cliente'), controller.actualizar);
router.get('/:codigo', verificarToken, permitirRoles('cliente', 'vendedor', 'administrador'), controller.obtenerPorCodigo);
router.patch('/:codigo/entregar', verificarToken, permitirRoles('vendedor'), controller.entregar);
router.patch('/:codigo/cancelar', verificarToken, permitirRoles('cliente'), controller.cancelar);
router.patch('/:codigo/reactivar', verificarToken, permitirRoles('vendedor'), controller.reactivar);

module.exports = router;