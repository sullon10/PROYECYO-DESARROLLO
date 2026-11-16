const Pedido = require('../models/Pedido');
const ProductoRepository = require('../repositories/ProductoRepository');
const PedidoRepository = require('../repositories/PedidoRepository');
const VentaService = require('./VentaService');

const { ESTADOS } = Pedido;
const TIEMPO_ESPERA_MIN = 60; // plazo de recojo: se cambia este valor para ajustarlo

// Error con código HTTP asociado, para que el controller responda con el status correcto
class PedidoError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

class PedidoService {
  constructor() {
    this.pedidoRepo = new PedidoRepository();
    this.productoRepo = new ProductoRepository();
    this.ventaService = new VentaService();
  }

  // ---------- CREAR (cliente) ----------
  crearPedido({ clienteId, items }) {
    if (clienteId === undefined || clienteId === null) {
      throw new PedidoError('Falta el cliente que genera el pedido.');
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw new PedidoError('El pedido debe incluir al menos un producto.');
    }

    // Agrupa líneas repetidas del mismo producto sumando sus cantidades
    const cantidades = new Map();
    for (const item of items) {
      const productoId = Number(item.productoId);
      const cantidad = Number(item.cantidad);
      if (!Number.isInteger(productoId) || !Number.isInteger(cantidad) || cantidad <= 0) {
        throw new PedidoError('Cada producto debe tener un id y una cantidad entera mayor a 0.');
      }
      cantidades.set(productoId, (cantidades.get(productoId) || 0) + cantidad);
    }

    // Nombre y precio salen del catálogo, nunca de lo que envía el cliente
    const itemsPedido = [];
    for (const [productoId, cantidad] of cantidades) {
      let producto;
      try {
        producto = this.productoRepo.obtenerPorId(productoId);
      } catch {
        throw new PedidoError(`El producto ${productoId} no existe.`, 404);
      }
      if (!producto.tieneStockSuficiente(cantidad)) {
        throw new PedidoError(
          `Stock insuficiente para "${producto.nombre}" (disponible: ${producto.stock}).`,
          409
        );
      }
      itemsPedido.push({
        productoId: producto.id,
        nombre: producto.nombre,
        cantidad,
        precioUnitario: producto.precio,
      });
    }

    const pedido = new Pedido({
      id: this.pedidoRepo.siguienteId(),
      codigo: this._generarCodigo(),
      clienteId,
      items: itemsPedido,
      tiempoEsperaMin: TIEMPO_ESPERA_MIN,
    });

    this.pedidoRepo.guardar(pedido);
    return this._presentar(pedido);
  }

  // ---------- CONSULTAS ----------
  listar({ estado } = {}) {
    this.expirarVencidos();
    if (estado && !ESTADOS.includes(estado)) {
      throw new PedidoError(`Estado inválido. Usa: ${ESTADOS.join(', ')}.`);
    }

    let pedidos = this.pedidoRepo.obtenerTodos();
    if (estado) pedidos = pedidos.filter((p) => p.estado === estado);

    // Pendientes primero (el que vence antes, arriba); luego el resto, más recientes primero
    pedidos.sort((a, b) => {
      const aPend = a.estado === 'pendiente';
      const bPend = b.estado === 'pendiente';
      if (aPend && !bPend) return -1;
      if (!aPend && bPend) return 1;
      if (aPend && bPend) return new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento);
      return new Date(b.fechaCreacion) - new Date(a.fechaCreacion);
    });

    return pedidos.map((p) => this._presentar(p));
  }

  listarPorCliente(clienteId) {
    this.expirarVencidos();
    return this.pedidoRepo
      .obtenerTodos()
      .filter((p) => String(p.clienteId) === String(clienteId))
      .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
      .map((p) => this._presentar(p));
  }

  obtenerPorCodigo(codigo) {
    this.expirarVencidos();
    return this._presentar(this._obtener(codigo));
  }

  // ---------- ACCIONES (vendedor) ----------
  entregarPedido(codigo, vendedorId) {
    this.expirarVencidos();
    const pedido = this._obtener(codigo);
    this._exigirEstado(pedido, 'pendiente', 'entregar');

    // Aquí se descuenta el stock: reutiliza la validación "todo o nada" de VentaService.
    // Si falla, el pedido no se modifica y sigue pendiente.
    let venta;
    try {
      venta = this.ventaService.registrarVenta({
        vendedorId,
        items: pedido.items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })),
        pedidoId: pedido.id,
        clienteId: pedido.clienteId,
      });
    } catch (err) {
      throw new PedidoError(err.message, 409);
    }

    pedido.estado = 'entregado';
    pedido.fechaEntrega = new Date().toISOString();
    pedido.ventaId = venta.id;
    this.pedidoRepo.actualizar(pedido);

    return { pedido: this._presentar(pedido), venta };
  }

  cancelarPedido(codigo) {
    this.expirarVencidos();
    const pedido = this._obtener(codigo);
    this._exigirEstado(pedido, 'pendiente', 'cancelar');

    pedido.estado = 'cancelado';
    this.pedidoRepo.actualizar(pedido);
    return this._presentar(pedido);
  }

  // Opción B: el vendedor devuelve un pedido vencido a "pendiente" con otra hora de plazo
  reactivarPedido(codigo) {
    this.expirarVencidos();
    const pedido = this._obtener(codigo);
    this._exigirEstado(pedido, 'vencido', 'reactivar');

    pedido.estado = 'pendiente';
    pedido.fechaVencimiento = new Date(Date.now() + TIEMPO_ESPERA_MIN * 60000).toISOString();
    pedido.reactivaciones = (pedido.reactivaciones || 0) + 1;
    this.pedidoRepo.actualizar(pedido);
    return this._presentar(pedido);
  }

  // ---------- VENCIMIENTO "PEREZOSO" ----------
  // Sin temporizadores: antes de atender cualquier consulta, marca como vencidos
  // los pendientes cuya hora límite ya pasó. Usa el reloj del servidor.
  expirarVencidos() {
    const ahora = Date.now();
    const pedidos = this.pedidoRepo.obtenerTodos();
    let hubo = false;

    pedidos.forEach((p) => {
      if (p.estado === 'pendiente' && new Date(p.fechaVencimiento).getTime() <= ahora) {
        p.estado = 'vencido';
        hubo = true;
      }
    });

    if (hubo) this.pedidoRepo.guardarTodos(pedidos); // escribe el JSON solo si algo cambió
  }

  // ---------- PRIVADOS ----------
  _normalizarCodigo(codigo) {
    const limpio = String(codigo || '').trim().toUpperCase();
    // En el mostrador basta con dictar los 4 dígitos: "4821" equivale a "PED-4821"
    return /^\d{4}$/.test(limpio) ? `PED-${limpio}` : limpio;
  }

  _obtener(codigo) {
    const codigoNormalizado = this._normalizarCodigo(codigo);
    const pedido = this.pedidoRepo.obtenerPorCodigo(codigoNormalizado);
    if (!pedido) throw new PedidoError(`No existe un pedido con el código ${codigoNormalizado}.`, 404);
    return pedido;
  }

  _exigirEstado(pedido, esperado, accion) {
    if (pedido.estado === esperado) return;
    const motivos = {
      pendiente: 'sigue pendiente',
      entregado: 'ya fue entregado',
      cancelado: 'está cancelado',
      vencido: 'está vencido (puedes reactivarlo)',
    };
    throw new PedidoError(
      `No se puede ${accion} el pedido ${pedido.codigo}: ${motivos[pedido.estado]}.`,
      409
    );
  }

  _generarCodigo() {
    for (let intento = 0; intento < 50; intento++) {
      const codigo = `PED-${Math.floor(1000 + Math.random() * 9000)}`;
      if (!this.pedidoRepo.existeCodigo(codigo)) return codigo;
    }
    throw new PedidoError('No se pudo generar un código único. Intenta de nuevo.', 500);
  }

  // Agrega minutosRestantes calculado en el servidor (no se guarda en el JSON)
  _presentar(pedido) {
    const minutosRestantes =
      pedido.estado === 'pendiente'
        ? Math.max(0, Math.ceil((new Date(pedido.fechaVencimiento).getTime() - Date.now()) / 60000))
        : null;
    return { ...pedido, minutosRestantes };
  }
}

module.exports = PedidoService;
module.exports.PedidoError = PedidoError;