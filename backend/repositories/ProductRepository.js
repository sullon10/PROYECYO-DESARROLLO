const fs = require('fs');
const path = require('path');
const Producto = require('../models/Producto');

const DATA_PATH = path.join(__dirname, '../data/productos.json');

class ProductoRepository {
  _leer() {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw).map((p) => new Producto(p));
  }

  _guardar(productos) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(productos, null, 2), 'utf-8');
  }

  obtenerTodos() {
    return this._leer();
  }

  obtenerPorId(id) {
    const producto = this._leer().find((p) => p.id === id);
    if (!producto) throw new Error(`Producto ${id} no encontrado`);
    return producto;
  }

  actualizarStock(id, nuevoStock) {
    const productos = this._leer();
    const producto = productos.find((p) => p.id === id);
    if (!producto) throw new Error(`Producto ${id} no encontrado`);
    producto.stock = nuevoStock;
    this._guardar(productos);
    return producto;
  }
}

module.exports = ProductoRepository;