const ItemVenta = require('./ItemVenta');

const ESTADOS = ['pendiente', 'entregado', 'cancelado', 'vencido'];

class Pedido {
  constructor({ id, codigo, clienteId, items, tiempoEsperaMin }) {
    this.id = id;
    this.codigo = codigo;
    this.clienteId = clienteId;
    this.items = items.map((item) => new ItemVenta(item));
    this.total = +this.items
      .reduce((suma, item) => suma + item.subtotal, 0)
      .toFixed(2);
    this.estado = 'pendiente';
    this.fechaCreacion = new Date().toISOString();
    this.fechaVencimiento = new Date(Date.now() + tiempoEsperaMin * 60000).toISOString();
    this.fechaEntrega = null;
    this.ventaId = null;
    this.reactivaciones = 0;
  }
}

module.exports = Pedido;
module.exports.ESTADOS = ESTADOS;