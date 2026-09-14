const Venta = require('../models/Venta');
const ProductoRepository = require('../repositories/ProductoRepository');
const VentaRepository = require('../repositories/VentaRepository');

class VentaService {
  constructor() {
    this.productoRepo = new ProductoRepository();
    this.ventaRepo = new VentaRepository();
  }

  registrarVenta({ vendedorId, items }) {
    // 1. Validar stock de TODOS los items antes de modificar nada
    const productosAVender = items.map((item) => {
      const producto = this.productoRepo.obtenerPorId(item.productoId);
      if (!producto.tieneStockSuficiente(item.cantidad)) {
        throw new Error(
          `Stock insuficiente para "${producto.nombre}" (disponible: ${producto.stock})`
        );
      }
      return { producto, cantidad: item.cantidad };
    });

    // 2. Descontar stock de cada producto y persistirlo
    productosAVender.forEach(({ producto, cantidad }) => {
      producto.descontarStock(cantidad);
      this.productoRepo.actualizarStock(producto.id, producto.stock);
    });

    // 3. Armar y guardar la venta
    const itemsVenta = productosAVender.map(({ producto, cantidad }) => ({
      productoId: producto.id,
      nombre: producto.nombre,
      cantidad,
      precioUnitario: producto.precio,
    }));

    const venta = new Venta({
      id: this.ventaRepo.siguienteId(),
      vendedorId,
      items: itemsVenta,
    });

    return this.ventaRepo.guardar(venta);
  }

  obtenerHistorial() {
    return this.ventaRepo.obtenerTodas();
  }
}

module.exports = VentaService;