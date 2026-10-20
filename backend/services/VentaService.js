// backend/services/VentaService.js
const Venta = require('../models/Venta');
const ProductoRepository = require('../repositories/ProductoRepository');
const VentaRepository = require('../repositories/VentaRepository');

class VentaService {
  constructor() {
    this.productoRepo = new ProductoRepository();
    this.ventaRepo = new VentaRepository();
  }

  registrarVenta({ vendedorId, items }) {
    const productosAVender = items.map((item) => {
      const producto = this.productoRepo.obtenerPorId(item.productoId);
      if (!producto.tieneStockSuficiente(item.cantidad)) {
        throw new Error(
          `Stock insuficiente para "${producto.nombre}" (disponible: ${producto.stock})`
        );
      }
      return { producto, cantidad: item.cantidad };
    });

    productosAVender.forEach(({ producto, cantidad }) => {
      producto.descontarStock(cantidad);
      this.productoRepo.actualizarStock(producto.id, producto.stock);
    });

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

  obtenerReporte() {
    const ventas = this.ventaRepo.obtenerTodas();
    const totalGeneral = +ventas.reduce((s, v) => s + v.total, 0).toFixed(2);

    const porProducto = {};
    ventas.forEach((venta) => {
      venta.items.forEach((item) => {
        if (!porProducto[item.nombre]) {
          porProducto[item.nombre] = { cantidadVendida: 0, totalGenerado: 0 };
        }
        porProducto[item.nombre].cantidadVendida += item.cantidad;
        porProducto[item.nombre].totalGenerado += item.subtotal;
      });
    });

    return { totalVentas: ventas.length, totalGeneral, porProducto };
  }
}

module.exports = VentaService;