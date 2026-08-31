class Producto {
  constructor({ id, nombre, precio, stock, categoria }) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.stock = stock;
    this.categoria = categoria;
  }

  tieneStockSuficiente(cantidad) {
    return this.stock >= cantidad;
  }

  descontarStock(cantidad) {
    if (!this.tieneStockSuficiente(cantidad)) {
      throw new Error(`Stock insuficiente para "${this.nombre}"`);
    }
    this.stock -= cantidad;
  }
}

module.exports = Producto;