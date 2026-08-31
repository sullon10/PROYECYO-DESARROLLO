const ItemVenta = require('./ItemVenta');

class Venta {
  constructor({ id, vendedorId, items }) {
    this.id = id;
    this.fecha = new Date().toISOString();
    this.vendedorId = vendedorId;
    this.items = items.map((item) => new ItemVenta(item));
    this.total = +this.items
      .reduce((suma, item) => suma + item.subtotal, 0)
      .toFixed(2);
  }
}

module.exports = Venta;