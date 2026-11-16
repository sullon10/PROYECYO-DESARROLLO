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
      const { clienteId, items } = req.body || {};
      res.status(201).json(this.service.crearPedido({ clienteId, items }));
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
      res.json(this.service.listarPorCliente(req.params.clienteId));
    } catch (err) {
      this._error(res, err);
    }
  };

  obtenerPorCodigo = (req, res) => {
    try {
      res.json(this.service.obtenerPorCodigo(req.params.codigo));
    } catch (err) {
      this._error(res, err);
    }
  };

  entregar = (req, res) => {
    try {
      const { vendedorId } = req.body || {};
      if (vendedorId === undefined || vendedorId === null) {
        return res.status(400).json({ error: 'Falta el vendedor que entrega el pedido.' });
      }
      res.json(this.service.entregarPedido(req.params.codigo, vendedorId));
    } catch (err) {
      this._error(res, err);
    }
  };

  cancelar = (req, res) => {
    try {
      res.json(this.service.cancelarPedido(req.params.codigo));
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