class ItemVenta {
  constructor({ productoId, nombre, cantidad, precioUnitario }) {
    this.productoId = productoId;
    this.nombre = nombre;
    this.cantidad = cantidad;
    this.precioUnitario = precioUnitario;
    this.subtotal = +(cantidad * precioUnitario).toFixed(2);
  }
}

module.exports = ItemVenta;