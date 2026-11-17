import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  obtenerPedido,
  entregarPedido,
  cancelarPedido,
  reactivarPedido,
} from '../../services/api';

const TIEMPO_ESPERA_MIN = 60; // debe coincidir con el plazo configurado en el backend

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
const ICONO_ESTADO = {
  pendiente: 'bi-hourglass-split',
  vencido: 'bi-clock-history',
  entregado: 'bi-check2-circle',
  cancelado: 'bi-x-circle',
};
const COLOR_ESTADO = {
  pendiente: 'warning',
  vencido: 'danger',
  entregado: 'success',
  cancelado: 'secondary',
};

// Color según el tiempo que le queda al pedido
function colorTiempo(minutos) {
  if (minutos > 30) return 'success';
  if (minutos >= 10) return 'warning';
  return 'danger';
}

const colorDe = (p) =>
  p.estado === 'pendiente' ? colorTiempo(p.minutosRestantes) : COLOR_ESTADO[p.estado];

const moneda = (n) => `S/ ${n.toFixed(2)}`;
const hora = (iso) =>
  new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
const fechaHora = (iso) => new Date(iso).toLocaleString('es-PE');

export default function PedidosPanel({ pedidos, cargando, error, onRecargar, onStockCambio }) {
  const { usuario } = useAuth();
  const [filtro, setFiltro] = useState('pendiente');
  const [busqueda, setBusqueda] = useState('');
  const [seleccionado, setSeleccionado] = useState(null); // código del pedido abierto
  const [accionEnCurso, setAccionEnCurso] = useState(false);
  const [mensaje, setMensaje] = useState(null);

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
      await onRecargar();
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
      onRecargar();
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

  if (cargando && pedidos.length === 0) {
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
          <button className="btn btn-outline-danger btn-sm" onClick={onRecargar}>
            Reintentar
          </button>
        </div>
      )}

      <div className="row">
        {/* ---------- Columna izquierda: buscador + lista ---------- */}
        <div className="col-lg-5">
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">
                  <i className="bi bi-bag-check me-2"></i>Pedidos
                </h4>
                <button className="btn btn-outline-secondary btn-sm" onClick={onRecargar}>
                  <i className="bi bi-arrow-clockwise me-1"></i>Actualizar
                </button>
              </div>

              <form className="input-group mb-3" onSubmit={buscarExacto}>
                <span className="input-group-text bg-white">
                  <i className="bi bi-search"></i>
                </span>
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
                <div className="empty-state">
                  <i className="bi bi-inbox"></i>
                  {busqueda.trim()
                    ? 'Ningún pedido coincide con esa búsqueda.'
                    : 'No hay pedidos en este estado.'}
                </div>
              ) : (
                <div className="list-group">
                  {visibles.map((p) => {
                    const color = colorDe(p);
                    const porcentaje = Math.min(
                      100,
                      ((p.minutosRestantes ?? 0) / TIEMPO_ESPERA_MIN) * 100
                    );
                    return (
                      <button
                        key={p.id}
                        type="button"
                        className={`list-group-item list-group-item-action ${
                          seleccionado === p.codigo ? 'active' : ''
                        }`}
                        onClick={() => setSeleccionado(p.codigo)}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <div className={`estado-icon bg-${color}-subtle text-${color}-emphasis`}>
                            <i className={`bi ${ICONO_ESTADO[p.estado]}`}></i>
                          </div>
                          <div className="flex-grow-1">
                            <div className="fw-semibold">{p.codigo}</div>
                            <small className="opacity-75">
                              {p.items.length} producto(s) · {moneda(p.total)} ·{' '}
                              {hora(p.fechaCreacion)}
                            </small>
                          </div>
                          {p.estado === 'pendiente' ? (
                            <span className={`badge text-bg-${color}`}>
                              <i className="bi bi-clock me-1"></i>
                              {p.minutosRestantes} min
                            </span>
                          ) : (
                            <span className={`badge ${BADGE_ESTADO[p.estado]}`}>
                              {ETIQUETA_ESTADO[p.estado]}
                            </span>
                          )}
                        </div>
                        {p.estado === 'pendiente' && (
                          <div className="progress mt-2" style={{ height: '4px' }}>
                            <div
                              className={`progress-bar bg-${color}`}
                              style={{ width: `${porcentaje}%` }}
                            />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ---------- Columna derecha: detalle ---------- */}
        <div className="col-lg-7">
          {!pedido ? (
            <div className="card">
              <div className="card-body empty-state mb-0">
                <i className="bi bi-hand-index-thumb"></i>
                Selecciona un pedido de la lista o búscalo por su código.
              </div>
            </div>
          ) : (
            <div className={`card mb-4 border-start border-4 border-${colorDe(pedido)}`}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h3 className="mb-1">{pedido.codigo}</h3>
                    <span className={`badge ${BADGE_ESTADO[pedido.estado]}`}>
                      <i className={`bi ${ICONO_ESTADO[pedido.estado]} me-1`}></i>
                      {ETIQUETA_ESTADO[pedido.estado]}
                    </span>
                  </div>
                  <div className="text-end">
                    <div className="kpi-label">Total</div>
                    <div className="total-line">{moneda(pedido.total)}</div>
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-sm-4">
                    <div className="kpi-label">Cliente</div>
                    <div className="fw-semibold">#{pedido.clienteId}</div>
                  </div>
                  <div className="col-sm-4">
                    <div className="kpi-label">Creado</div>
                    <div className="fw-semibold">{fechaHora(pedido.fechaCreacion)}</div>
                  </div>
                  <div className="col-sm-4">
                    <div className="kpi-label">Vence</div>
                    <div className="fw-semibold">{hora(pedido.fechaVencimiento)}</div>
                  </div>
                </div>

                {pedido.estado === 'pendiente' && (
                  <div className={`alert alert-${colorTiempo(pedido.minutosRestantes)} py-2`}>
                    <i className="bi bi-clock me-2"></i>
                    Quedan {pedido.minutosRestantes} min para recoger este pedido.
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
                          <td className="text-end">{moneda(item.precioUnitario)}</td>
                          <td className="text-end">{moneda(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {pedido.estado === 'pendiente' && (
                  <>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-primary btn-lg flex-grow-1"
                        onClick={() => entregar(pedido)}
                        disabled={accionEnCurso}
                      >
                        {accionEnCurso ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Procesando...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-bag-check me-2"></i>Entregar pedido
                          </>
                        )}
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => cancelar(pedido)}
                        disabled={accionEnCurso}
                      >
                        <i className="bi bi-x-circle me-1"></i>Cancelar
                      </button>
                    </div>
                    <small className="text-muted d-block mt-2">
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
                      <i className="bi bi-arrow-counterclockwise me-1"></i>Reactivar pedido
                    </button>
                  </div>
                )}

                {pedido.estado === 'entregado' && (
                  <p className="text-muted mb-0">
                    <i className="bi bi-check2-circle me-1"></i>
                    Entregado el {fechaHora(pedido.fechaEntrega)} · Venta #{pedido.ventaId}
                  </p>
                )}

                {pedido.estado === 'cancelado' && (
                  <p className="text-muted mb-0">Este pedido fue cancelado.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}