import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  obtenerPedidos,
  obtenerPedido,
  entregarPedido,
  cancelarPedido,
  reactivarPedido,
} from '../../services/api';

const ESTADOS = [
  { id: 'pendiente', etiqueta: 'Pendientes' },
  { id: 'vencido', etiqueta: 'Vencidos' },
  { id: 'entregado', etiqueta: 'Entregados' },
  { id: 'cancelado', etiqueta: 'Cancelados' },
];

const BADGE_ESTADO = {
  pendiente: 'text-bg-warning',
  vencido: 'text-bg-danger',
  entregado: 'text-bg-success',
  cancelado: 'text-bg-secondary',
};

const ETIQUETA_ESTADO = {
  pendiente: 'Pendiente',
  vencido: 'Vencido',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

const REFRESCO_MS = 15000; // actualiza la lista cada 15 segundos

// Color según el tiempo que le queda al pedido
function colorTiempo(minutos) {
  if (minutos > 30) return 'success';
  if (minutos >= 10) return 'warning';
  return 'danger';
}

const hora = (iso) =>
  new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
const fechaHora = (iso) => new Date(iso).toLocaleString('es-PE');

export default function PedidosPanel({ onStockCambio }) {
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState('pendiente');
  const [busqueda, setBusqueda] = useState('');
  const [seleccionado, setSeleccionado] = useState(null); // código del pedido abierto
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [accionEnCurso, setAccionEnCurso] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const cargar = useCallback(async () => {
    try {
      setPedidos(await obtenerPedidos());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargandoInicial(false);
    }
  }, []);

  // Carga inicial + refresco automático
  useEffect(() => {
    cargar();
    const intervalo = setInterval(cargar, REFRESCO_MS);
    return () => clearInterval(intervalo);
  }, [cargar]);

  const conteos = useMemo(() => {
    const total = { pendiente: 0, vencido: 0, entregado: 0, cancelado: 0 };
    pedidos.forEach((p) => {
      total[p.estado] = (total[p.estado] || 0) + 1;
    });
    return total;
  }, [pedidos]);

  // Con texto en el buscador se busca en TODOS los estados; sin texto, solo en la pestaña activa
  const visibles = useMemo(() => {
    const texto = busqueda.trim().toUpperCase();
    if (texto) return pedidos.filter((p) => p.codigo.includes(texto));
    return pedidos.filter((p) => p.estado === filtro);
  }, [pedidos, filtro, busqueda]);

  const pedido = pedidos.find((p) => p.codigo === seleccionado) || null;

  // Enter en el buscador: pide el pedido exacto al servidor (acepta "4821" o "PED-4821")
  const buscarExacto = async (e) => {
    e.preventDefault();
    const texto = busqueda.trim();
    if (!texto) return;
    try {
      const encontrado = await obtenerPedido(texto);
      await cargar();
      setFiltro(encontrado.estado);
      setSeleccionado(encontrado.codigo);
      setBusqueda('');
      setMensaje(null);
    } catch (err) {
      setMensaje({ tipo: 'warning', texto: err.message });
    }
  };

  // Ejecuta una acción sobre un pedido y deja la pantalla al día pase lo que pase
  const ejecutar = async (accion, textoExito, { refrescarStock = false } = {}) => {
    if (accionEnCurso) return;
    try {
      setAccionEnCurso(true);
      const resultado = await accion();
      setMensaje({ tipo: 'success', texto: textoExito(resultado) });
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    } finally {
      setAccionEnCurso(false);
      cargar();
      if (refrescarStock) onStockCambio?.();
    }
  };

  const entregar = (p) =>
    ejecutar(
      () => entregarPedido(p.codigo, usuario.id),
      (r) => `Pedido ${p.codigo} entregado. Venta #${r.venta.id} registrada.`,
      { refrescarStock: true }
    );

  const cancelar = (p) => {
    if (!window.confirm(`¿Cancelar el pedido ${p.codigo}?`)) return;
    ejecutar(() => cancelarPedido(p.codigo), () => `Pedido ${p.codigo} cancelado.`);
  };

  const reactivar = (p) =>
    ejecutar(
      () => reactivarPedido(p.codigo),
      (r) => `Pedido ${p.codigo} reactivado: vence en ${r.minutosRestantes} min.`
    );

  if (cargandoInicial) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {mensaje && (
        <div className={`alert alert-${mensaje.tipo} alert-dismissible`} role="alert">
          {mensaje.texto}
          <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <button className="btn btn-outline-danger btn-sm" onClick={cargar}>
            Reintentar
          </button>
        </div>
      )}

      <div className="row">
        {/* ---------- Columna izquierda: buscador + lista ---------- */}
        <div className="col-lg-5">
          <div className="card p-3 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">Pedidos</h4>
              <button className="btn btn-outline-secondary btn-sm" onClick={cargar}>
                Actualizar
              </button>
            </div>

            <form className="input-group mb-3" onSubmit={buscarExacto}>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por código (ej. 4821)"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">
                Buscar
              </button>
            </form>

            {busqueda.trim() ? (
              <p className="small text-muted mb-2">Buscando en todos los estados</p>
            ) : (
              <ul className="nav nav-pills flex-wrap gap-1 mb-3">
                {ESTADOS.map((e) => (
                  <li className="nav-item" key={e.id}>
                    <button
                      className={`nav-link py-1 px-2 ${filtro === e.id ? 'active' : ''}`}
                      onClick={() => setFiltro(e.id)}
                    >
                      {e.etiqueta}
                      <span className="badge text-bg-light ms-1">{conteos[e.id]}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {visibles.length === 0 ? (
              <p className="text-muted text-center py-3 mb-0">
                {busqueda.trim()
                  ? 'Ningún pedido coincide con esa búsqueda.'
                  : 'No hay pedidos en este estado.'}
              </p>
            ) : (
              <div className="list-group">
                {visibles.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                      seleccionado === p.codigo ? 'active' : ''
                    }`}
                    onClick={() => setSeleccionado(p.codigo)}
                  >
                    <div>
                      <div className="fw-semibold">{p.codigo}</div>
                      <small>
                        {p.items.length} producto(s) · S/ {p.total.toFixed(2)}
                      </small>
                    </div>
                    {p.estado === 'pendiente' ? (
                      <span className={`badge text-bg-${colorTiempo(p.minutosRestantes)}`}>
                        {p.minutosRestantes} min
                      </span>
                    ) : (
                      <span className={`badge ${BADGE_ESTADO[p.estado]}`}>
                        {ETIQUETA_ESTADO[p.estado]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ---------- Columna derecha: detalle ---------- */}
        <div className="col-lg-7">
          {!pedido ? (
            <div className="card p-4 text-center text-muted">
              Selecciona un pedido de la lista o búscalo por su código.
            </div>
          ) : (
            <div className="card p-3 mb-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h4 className="mb-1">{pedido.codigo}</h4>
                  <small className="text-muted">
                    Cliente #{pedido.clienteId} · creado {fechaHora(pedido.fechaCreacion)}
                  </small>
                </div>
                <span className={`badge fs-6 ${BADGE_ESTADO[pedido.estado]}`}>
                  {ETIQUETA_ESTADO[pedido.estado]}
                </span>
              </div>

              {pedido.estado === 'pendiente' && (
                <div className={`alert alert-${colorTiempo(pedido.minutosRestantes)} py-2`}>
                  Vence a las {hora(pedido.fechaVencimiento)} ({pedido.minutosRestantes} min
                  restantes)
                </div>
              )}

              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th className="text-end">Cant.</th>
                      <th className="text-end">P. unit.</th>
                      <th className="text-end">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedido.items.map((item) => (
                      <tr key={item.productoId}>
                        <td>{item.nombre}</td>
                        <td className="text-end">{item.cantidad}</td>
                        <td className="text-end">S/ {item.precioUnitario.toFixed(2)}</td>
                        <td className="text-end">S/ {item.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colSpan="3" className="text-end">
                        Total
                      </th>
                      <th className="text-end">S/ {pedido.total.toFixed(2)}</th>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {pedido.estado === 'pendiente' && (
                <>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-primary flex-grow-1"
                      onClick={() => entregar(pedido)}
                      disabled={accionEnCurso}
                    >
                      {accionEnCurso ? 'Procesando...' : 'Entregar pedido'}
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => cancelar(pedido)}
                      disabled={accionEnCurso}
                    >
                      Cancelar
                    </button>
                  </div>
                  <small className="text-muted mt-2">
                    Al entregar se registra la venta y se descuenta el stock.
                  </small>
                </>
              )}

              {pedido.estado === 'vencido' && (
                <div>
                  <p className="text-muted small">
                    Venció a las {hora(pedido.fechaVencimiento)}. Puedes reactivarlo para darle
                    otra hora de plazo.
                  </p>
                  <button
                    className="btn btn-outline-dark"
                    onClick={() => reactivar(pedido)}
                    disabled={accionEnCurso}
                  >
                    Reactivar pedido
                  </button>
                </div>
              )}

              {pedido.estado === 'entregado' && (
                <p className="text-muted mb-0">
                  Entregado el {fechaHora(pedido.fechaEntrega)} · Venta #{pedido.ventaId}
                </p>
              )}

              {pedido.estado === 'cancelado' && (
                <p className="text-muted mb-0">Este pedido fue cancelado.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}