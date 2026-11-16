const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/pedidos.json');

class PedidoRepository {
  _leer() {
    if (!fs.existsSync(DATA_PATH)) return [];
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return raw.trim() ? JSON.parse(raw) : [];
  }

  _guardar(pedidos) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(pedidos, null, 2), 'utf-8');
  }

  obtenerTodos() {
    return this._leer();
  }

  guardarTodos(pedidos) {
    this._guardar(pedidos);
  }

  guardar(pedido) {
    const pedidos = this._leer();
    pedidos.push(pedido);
    this._guardar(pedidos);
    return pedido;
  }

  obtenerPorCodigo(codigo) {
    return this._leer().find((p) => p.codigo === codigo) || null;
  }

  existeCodigo(codigo) {
    return this._leer().some((p) => p.codigo === codigo);
  }

  actualizar(pedidoActualizado) {
    const pedidos = this._leer();
    const indice = pedidos.findIndex((p) => p.id === pedidoActualizado.id);
    if (indice === -1) throw new Error(`Pedido ${pedidoActualizado.id} no encontrado`);
    pedidos[indice] = pedidoActualizado;
    this._guardar(pedidos);
    return pedidoActualizado;
  }

  siguienteId() {
    const pedidos = this._leer();
    return pedidos.length ? Math.max(...pedidos.map((p) => p.id)) + 1 : 1;
  }
}

module.exports = PedidoRepository;