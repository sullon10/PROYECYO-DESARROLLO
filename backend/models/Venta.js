const ItemVenta = require('./ItemVenta');

class Venta {
  constructor({ id, vendedorId, items, pedidoId = null, clienteId = null }) {
    this.id = id;
    this.fecha = new Date().toISOString();
    this.vendedorId = vendedorId;
    this.pedidoId = pedidoId;
    this.clienteId = clienteId;
    this.items = items.map((item) => new ItemVenta(item));
    this.total = +this.items
      .reduce((suma, item) => suma + item.subtotal, 0)
      .toFixed(2);
  }
}

module.exports = Venta;