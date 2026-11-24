const PedidoService = require('../services/PedidoService');

class PedidoController {
  constructor() {
    this.service = new PedidoService();
  }

  _error(res, err) {
    res.status(err.status || 500).json({ error: err.message });
  }

  crear = (req, res) => {
    try {
      const { items } = req.body || {};
      res.status(201).json(this.service.crearPedido({ clienteId: req.usuario.id, items }));
    } catch (err) {
      this._error(res, err);
    }
  };

  actualizar = (req, res) => {
    try {
      const { items } = req.body || {};
      res.json(this.service.actualizarPedido(req.params.codigo, {
        clienteId: req.usuario.id,
        items
      }));
    } catch (err) {
      this._error(res, err);
    }
  };

  listar = (req, res) => {
    try {
      res.json(this.service.listar({ estado: req.query.estado }));
    } catch (err) {
      this._error(res, err);
    }
  };

  listarPorCliente = (req, res) => {
    try {
      if (req.usuario.rol === 'cliente' && String(req.usuario.id) !== String(req.params.clienteId)) {
        return res.status(403).json({ error: 'Solo puedes consultar tus propios pedidos.' });
      }
      res.json(this.service.listarPorCliente(req.params.clienteId));
    } catch (err) {
      this._error(res, err);
    }
  };

  obtenerPorCodigo = (req, res) => {
    try {
      const clienteId = req.usuario.rol === 'cliente' ? req.usuario.id : undefined;
      res.json(this.service.obtenerPorCodigo(req.params.codigo, clienteId));
    } catch (err) {
      this._error(res, err);
    }
  };

  entregar = (req, res) => {
    try {
      res.json(this.service.entregarPedido(req.params.codigo, req.usuario.id));
    } catch (err) {
      this._error(res, err);
    }
  };

  cancelar = (req, res) => {
    try {
      res.json(this.service.cancelarPedido(req.params.codigo, req.usuario.id));
    } catch (err) {
      this._error(res, err);
    }
  };

  reactivar = (req, res) => {
    try {
      res.json(this.service.reactivarPedido(req.params.codigo));
    } catch (err) {
      this._error(res, err);
    }
  };
}

module.exports = PedidoController;