const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/ventas.json');

class VentaRepository {
  _leer() {
    if (!fs.existsSync(DATA_PATH)) return [];
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return raw ? JSON.parse(raw) : [];
  }

  _guardar(ventas) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(ventas, null, 2), 'utf-8');
  }

  obtenerTodas() {
    return this._leer();
  }

  guardar(venta) {
    const ventas = this._leer();
    ventas.push(venta);
    this._guardar(ventas);
    return venta;
  }

  siguienteId() {
    const ventas = this._leer();
    return ventas.length ? Math.max(...ventas.map((v) => v.id)) + 1 : 1;
  }
}

module.exports = VentaRepository;