const ProductoRepository = require('../repositories/ProductoRepository');

class ProductoController {
  constructor() {
    this.repo = new ProductoRepository();
  }

  listar = (req, res) => {
    try {
      res.json(this.repo.obtenerTodos());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  obtenerUno = (req, res) => {
    try {
      const producto = this.repo.obtenerPorId(Number(req.params.id));
      res.json(producto);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  };
}

module.exports = ProductoController;