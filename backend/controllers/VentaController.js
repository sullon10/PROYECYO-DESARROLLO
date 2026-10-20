const VentaService = require('../services/VentaService');

class VentaController {
  constructor() {
    this.service = new VentaService();
  }

  registrar = (req, res) => {
    try {
      const { vendedorId, items } = req.body;
      if (!items || !items.length) {
        return res.status(400).json({ error: 'Debe incluir al menos un producto' });
      }
      const venta = this.service.registrarVenta({ vendedorId, items });
      res.status(201).json(venta);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

  historial = (req, res) => {
    try {
      res.json(this.service.obtenerHistorial());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  reporte = (req, res) => {
    try {
      res.json(this.service.obtenerReporte());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
}

module.exports = VentaController;