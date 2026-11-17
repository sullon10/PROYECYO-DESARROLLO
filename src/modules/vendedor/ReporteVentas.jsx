import { useCallback, useEffect, useMemo, useState } from 'react';
import { obtenerHistorialVentas } from '../../services/api';

const SIN_PEDIDOS = []; // referencia estable por si el padre no envía pedidos
const MS_DIA = 86400000;

const TIPOS = [
  { id: 'dia', etiqueta: 'Hoy' },
  { id: 'semana', etiqueta: 'Semana' },
  { id: 'mes', etiqueta: 'Mes' },
  { id: 'anio', etiqueta: 'Año' },
  { id: 'todo', etiqueta: 'Todo' },
  { id: 'rango', etiqueta: 'Rango' },
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

const cap = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);
const moneda = (n) => `S/ ${n.toFixed(2)}`;
const fechaCorta = (d) => d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
const fechaHora = (iso) =>
  new Date(iso).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
const sumarDias = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

// "2026-11-15" -> fecha local (evita el desfase de zona horaria de new Date("2026-11-15"))
function leerFecha(texto) {
  if (!texto) return null;
  const [anio, mes, dia] = texto.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

// Devuelve el intervalo [desde, hasta) del período elegido. null = sin límite.
function calcularRango(tipo, offset, desdeTexto, hastaTexto) {
  const hoy = new Date();
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  if (tipo === 'dia') {
    const desde = sumarDias(inicioHoy, offset);
    return {
      desde,
      hasta: sumarDias(desde, 1),
      etiqueta: cap(
        desde.toLocaleDateString('es-PE', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      ),
    };
  }
  if (tipo === 'semana') {
    // La semana va de lunes a domingo
    const lunes = sumarDias(inicioHoy, -((inicioHoy.getDay() + 6) % 7) + offset * 7);
    const domingo = sumarDias(lunes, 6);
    return {
      desde: lunes,
      hasta: sumarDias(lunes, 7),
      etiqueta: `${fechaCorta(lunes)} – ${fechaCorta(domingo)} de ${domingo.getFullYear()}`,
    };
  }
  if (tipo === 'mes') {
    const desde = new Date(hoy.getFullYear(), hoy.getMonth() + offset, 1);
    return {
      desde,
      hasta: new Date(desde.getFullYear(), desde.getMonth() + 1, 1),
      etiqueta: cap(desde.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })),
    };
  }
  if (tipo === 'anio') {
    const anio = hoy.getFullYear() + offset;
    return {
      desde: new Date(anio, 0, 1),
      hasta: new Date(anio + 1, 0, 1),
      etiqueta: String(anio),
    };
  }
  if (tipo === 'rango') {
    const ultimoDia = leerFecha(hastaTexto);
    return {
      desde: leerFecha(desdeTexto),
      hasta: ultimoDia ? sumarDias(ultimoDia, 1) : null, // el día final entra completo
      etiqueta: 'Rango personalizado',
    };
  }
  return { desde: null, hasta: null, etiqueta: 'Todo el historial' };
}

// Agrupa las ventas por día (períodos cortos) o por mes (períodos largos) para el gráfico
function agruparPorPeriodo(ventas, rango) {
  let inicio = rango.desde;
  let fin = rango.hasta;

  if ((!inicio || !fin) && ventas.length > 0) {
    const tiempos = ventas.map((v) => new Date(v.fecha).getTime());
    const primero = new Date(Math.min(...tiempos));
    const ultimo = new Date(Math.max(...tiempos));
    inicio = inicio || new Date(primero.getFullYear(), primero.getMonth(), 1);
    fin = fin || new Date(ultimo.getFullYear(), ultimo.getMonth() + 1, 1);
  }
  if (!inicio || !fin || inicio >= fin) return [];

  const porDia = (fin - inicio) / MS_DIA <= 62;
  const clave = (f) =>
    porDia ? `${f.getFullYear()}-${f.getMonth()}-${f.getDate()}` : `${f.getFullYear()}-${f.getMonth()}`;

  const acumulado = new Map();
  ventas.forEach((v) => {
    const k = clave(new Date(v.fecha));
    const previo = acumulado.get(k) || { total: 0, n: 0 };
    acumulado.set(k, { total: previo.total + v.total, n: previo.n + 1 });
  });

  const grupos = [];
  let f = new Date(inicio);
  while (f < fin) {
    const datos = acumulado.get(clave(f)) || { total: 0, n: 0 };
    grupos.push({
      etiqueta: porDia
        ? f.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' })
        : f.toLocaleDateString('es-PE', { month: 'short' }),
      ...datos,
    });
    f = porDia ? sumarDias(f, 1) : new Date(f.getFullYear(), f.getMonth() + 1, 1);
  }
  return grupos;
}

function Kpi({ icono, etiqueta, valor, detalle }) {
  return (
    <div className="col-6 col-lg-3">
      <div className="card h-100">
        <div className="card-body d-flex align-items-center gap-3">
          <div className="kpi-icon">
            <i className={`bi ${icono}`}></i>
          </div>
          <div>
            <div className="kpi-label">{etiqueta}</div>
            <div className="kpi-value">{valor}</div>
            {detalle && <small className="text-muted">{detalle}</small>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReporteVentas({
  pedidos = SIN_PEDIDOS,
  errorPedidos = null,
  onRecargarPedidos,
}) {
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [seccion, setSeccion] = useState('ventas');
  const [tipo, setTipo] = useState('todo');
  const [offset, setOffset] = useState(0);
  const [desdeTexto, setDesdeTexto] = useState('');
  const [hastaTexto, setHastaTexto] = useState('');
  const [orden, setOrden] = useState('reciente');
  const [estadoPedido, setEstadoPedido] = useState('todos');

  const cargar = useCallback(async () => {
    try {
      setCargando(true);
      setVentas(await obtenerHistorialVentas());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const actualizar = () => {
    cargar();
    onRecargarPedidos?.();
  };

  const cambiarTipo = (nuevo) => {
    setTipo(nuevo);
    setOffset(0);
  };

  const rango = useMemo(
    () => calcularRango(tipo, offset, desdeTexto, hastaTexto),
    [tipo, offset, desdeTexto, hastaTexto]
  );
  const rangoInvalido = Boolean(rango.desde && rango.hasta && rango.desde >= rango.hasta);
  const navegable = ['dia', 'semana', 'mes', 'anio'].includes(tipo);

  const dentro = useCallback(
    (iso) => {
      const t = new Date(iso).getTime();
      return (
        !rangoInvalido &&
        (!rango.desde || t >= rango.desde.getTime()) &&
        (!rango.hasta || t < rango.hasta.getTime())
      );
    },
    [rango, rangoInvalido]
  );

  const comparar = useCallback(
    (campo) => (a, b) => {
      const diferencia = new Date(a[campo]) - new Date(b[campo]);
      return orden === 'reciente' ? -diferencia : diferencia;
    },
    [orden]
  );

  // ---------- Ventas ----------
  const ventasFiltradas = useMemo(
    () => ventas.filter((v) => dentro(v.fecha)).sort(comparar('fecha')),
    [ventas, dentro, comparar]
  );

  const kpis = useMemo(() => {
    const total = ventasFiltradas.reduce((s, v) => s + v.total, 0);
    const unidades = ventasFiltradas.reduce(
      (s, v) => s + v.items.reduce((a, i) => a + i.cantidad, 0),
      0
    );
    const n = ventasFiltradas.length;
    return { n, total, unidades, ticket: n ? total / n : 0 };
  }, [ventasFiltradas]);

  const porProducto = useMemo(() => {
    const mapa = {};
    ventasFiltradas.forEach((v) =>
      v.items.forEach((i) => {
        mapa[i.nombre] = mapa[i.nombre] || { nombre: i.nombre, unidades: 0, total: 0 };
        mapa[i.nombre].unidades += i.cantidad;
        mapa[i.nombre].total += i.subtotal;
      })
    );
    return Object.values(mapa).sort((a, b) => b.total - a.total);
  }, [ventasFiltradas]);

  const masVendido = useMemo(
    () => [...porProducto].sort((a, b) => b.unidades - a.unidades)[0],
    [porProducto]
  );

  const grupos = useMemo(() => agruparPorPeriodo(ventasFiltradas, rango), [ventasFiltradas, rango]);
  const maxGrupo = Math.max(0, ...grupos.map((g) => g.total));

  const codigoPorPedidoId = useMemo(
    () => Object.fromEntries(pedidos.map((p) => [p.id, p.codigo])),
    [pedidos]
  );

  // ---------- Pedidos ----------
  const pedidosPeriodo = useMemo(
    () => pedidos.filter((p) => dentro(p.fechaCreacion)),
    [pedidos, dentro]
  );

  const pedidosFiltrados = useMemo(
    () =>
      pedidosPeriodo
        .filter((p) => estadoPedido === 'todos' || p.estado === estadoPedido)
        .sort(comparar('fechaCreacion')),
    [pedidosPeriodo, estadoPedido, comparar]
  );

  const kpisPedidos = useMemo(() => {
    const cuenta = { pendiente: 0, vencido: 0, entregado: 0, cancelado: 0 };
    pedidosPeriodo.forEach((p) => {
      cuenta[p.estado] = (cuenta[p.estado] || 0) + 1;
    });
    const resueltos = pedidosPeriodo.length - cuenta.pendiente;
    return {
      ...cuenta,
      total: pedidosPeriodo.length,
      tasa: resueltos > 0 ? (cuenta.entregado / resueltos) * 100 : 0,
    };
  }, [pedidosPeriodo]);

  if (cargando && ventas.length === 0 && !error) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex justify-content-between align-items-center">
        <span>{error}</span>
        <button className="btn btn-outline-danger btn-sm" onClick={cargar}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* ---------- Barra de filtros ---------- */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div className="btn-group btn-group-sm" role="group">
              <button
                className={`btn btn-outline-dark ${seccion === 'ventas' ? 'active' : ''}`}
                onClick={() => setSeccion('ventas')}
              >
                <i className="bi bi-receipt me-1"></i>Ventas
              </button>
              <button
                className={`btn btn-outline-dark ${seccion === 'pedidos' ? 'active' : ''}`}
                onClick={() => setSeccion('pedidos')}
              >
                <i className="bi bi-bag-check me-1"></i>Pedidos
              </button>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-2">
              <select
                className="form-select form-select-sm w-auto"
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                aria-label="Ordenar por fecha"
              >
                <option value="reciente">Más recientes primero</option>
                <option value="antigua">Más antiguas primero</option>
              </select>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={actualizar}
                disabled={cargando}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                {cargando ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>

          <hr className="my-3" />

          <div className="d-flex flex-wrap align-items-center gap-3">
            <div className="btn-group btn-group-sm" role="group">
              {TIPOS.map((t) => (
                <button
                  key={t.id}
                  className={`btn btn-outline-dark ${tipo === t.id ? 'active' : ''}`}
                  onClick={() => cambiarTipo(t.id)}
                >
                  {t.etiqueta}
                </button>
              ))}
            </div>

            {navegable && (
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setOffset((o) => o - 1)}
                  aria-label="Período anterior"
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
                <span className="fw-semibold text-center" style={{ minWidth: '190px' }}>
                  {rango.etiqueta}
                </span>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setOffset((o) => o + 1)}
                  disabled={offset >= 0}
                  aria-label="Período siguiente"
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            )}

            {tipo === 'rango' && (
              <div className="d-flex flex-wrap align-items-center gap-2">
                <input
                  type="date"
                  className="form-control form-control-sm w-auto"
                  value={desdeTexto}
                  onChange={(e) => setDesdeTexto(e.target.value)}
                  aria-label="Desde"
                />
                <span className="text-muted">a</span>
                <input
                  type="date"
                  className="form-control form-control-sm w-auto"
                  value={hastaTexto}
                  onChange={(e) => setHastaTexto(e.target.value)}
                  aria-label="Hasta"
                />
              </div>
            )}

            {tipo === 'todo' && <span className="text-muted">{rango.etiqueta}</span>}
          </div>

          {rangoInvalido && (
            <div className="alert alert-warning py-2 mt-3 mb-0">
              La fecha inicial es posterior a la final. Corrige el rango.
            </div>
          )}
        </div>
      </div>

      {/* =================== VENTAS =================== */}
      {seccion === 'ventas' && (
        <>
          <div className="row g-3 mb-4">
            <Kpi icono="bi-receipt" etiqueta="Ventas registradas" valor={kpis.n} />
            <Kpi icono="bi-cash-coin" etiqueta="Total generado" valor={moneda(kpis.total)} />
            <Kpi icono="bi-graph-up" etiqueta="Ticket promedio" valor={moneda(kpis.ticket)} />
            <Kpi
              icono="bi-trophy"
              etiqueta="Más vendido"
              valor={masVendido ? masVendido.nombre : '—'}
              detalle={masVendido ? `${masVendido.unidades} und. vendidas` : 'Sin ventas'}
            />
          </div>

          {grupos.length >= 2 && maxGrupo > 0 && (
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="mb-3">Ventas en el período</h5>
                <div className="bar-chart">
                  {grupos.map((g, i) => (
                    <div
                      className="bar-col"
                      key={i}
                      title={`${g.etiqueta}: ${moneda(g.total)} · ${g.n} venta(s)`}
                    >
                      <span className="bar-value">{g.total > 0 ? Math.round(g.total) : ''}</span>
                      <div
                        className={`bar ${g.total > 0 ? '' : 'bar-vacia'}`}
                        style={{
                          height: `${g.total > 0 ? Math.max(6, Math.round((g.total / maxGrupo) * 110)) : 3}px`,
                        }}
                      />
                      <span className="bar-label">{g.etiqueta}</span>
                    </div>
                  ))}
                </div>
                <small className="text-muted">Montos en soles. Pasa el cursor sobre una barra para ver el detalle.</small>
              </div>
            </div>
          )}

          <div className="card mb-4">
            <div className="card-body">
              <h5 className="mb-3">Ventas por producto</h5>
              {porProducto.length === 0 ? (
                <div className="empty-state">
                  <i className="bi bi-inbox"></i>
                  No hay ventas en este período.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th className="text-end">Unidades</th>
                        <th style={{ width: '35%' }}>Participación</th>
                        <th className="text-end">Total generado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {porProducto.map((p) => {
                        const porcentaje = kpis.total > 0 ? (p.total / kpis.total) * 100 : 0;
                        return (
                          <tr key={p.nombre}>
                            <td className="fw-semibold">{p.nombre}</td>
                            <td className="text-end">{p.unidades}</td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div className="progress flex-grow-1" style={{ height: '8px' }}>
                                  <div className="progress-bar" style={{ width: `${porcentaje}%` }} />
                                </div>
                                <small className="text-muted" style={{ minWidth: '38px' }}>
                                  {porcentaje.toFixed(0)}%
                                </small>
                              </div>
                            </td>
                            <td className="text-end">{moneda(p.total)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h5 className="mb-3">Historial de ventas</h5>
              {ventasFiltradas.length === 0 ? (
                <div className="empty-state">
                  <i className="bi bi-inbox"></i>
                  No hay ventas en este período.
                </div>
              ) : (
                <div className="table-responsive tabla-scroll">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>N°</th>
                        <th>Fecha</th>
                        <th>Origen</th>
                        <th>Vendedor</th>
                        <th>Detalle</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ventasFiltradas.map((v) => (
                        <tr key={v.id}>
                          <td>#{v.id}</td>
                          <td>{fechaHora(v.fecha)}</td>
                          <td>
                            {v.pedidoId ? (
                              <span className="badge text-bg-dark">
                                <i className="bi bi-bag-check me-1"></i>
                                {codigoPorPedidoId[v.pedidoId] || `Pedido #${v.pedidoId}`}
                              </span>
                            ) : (
                              <span className="badge text-bg-light border text-dark">
                                <i className="bi bi-shop me-1"></i>Mostrador
                              </span>
                            )}
                          </td>
                          <td>{v.vendedorId ?? '—'}</td>
                          <td>{v.items.map((i) => `${i.nombre} x${i.cantidad}`).join(', ')}</td>
                          <td className="text-end fw-semibold">{moneda(v.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* =================== PEDIDOS =================== */}
      {seccion === 'pedidos' && (
        <>
          {errorPedidos && (
            <div className="alert alert-warning d-flex justify-content-between align-items-center">
              <span>No se pudieron cargar los pedidos: {errorPedidos}</span>
              <button className="btn btn-outline-dark btn-sm" onClick={() => onRecargarPedidos?.()}>
                Reintentar
              </button>
            </div>
          )}

          <div className="row g-3 mb-4">
            <Kpi icono="bi-bag" etiqueta="Pedidos generados" valor={kpisPedidos.total} />
            <Kpi icono="bi-check2-circle" etiqueta="Entregados" valor={kpisPedidos.entregado} />
            <Kpi
              icono="bi-x-circle"
              etiqueta="Cancelados / vencidos"
              valor={kpisPedidos.cancelado + kpisPedidos.vencido}
              detalle={`${kpisPedidos.cancelado} canc. · ${kpisPedidos.vencido} venc.`}
            />
            <Kpi
              icono="bi-percent"
              etiqueta="Tasa de entrega"
              valor={`${kpisPedidos.tasa.toFixed(0)}%`}
              detalle="Sobre pedidos ya resueltos"
            />
          </div>

          <div className="card">
            <div className="card-body">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <h5 className="mb-0">Historial de pedidos</h5>
                <select
                  className="form-select form-select-sm w-auto"
                  value={estadoPedido}
                  onChange={(e) => setEstadoPedido(e.target.value)}
                  aria-label="Filtrar por estado"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="entregado">Entregados</option>
                  <option value="cancelado">Cancelados</option>
                  <option value="vencido">Vencidos</option>
                </select>
              </div>

              {pedidosFiltrados.length === 0 ? (
                <div className="empty-state">
                  <i className="bi bi-inbox"></i>
                  No hay pedidos en este período.
                </div>
              ) : (
                <div className="table-responsive tabla-scroll">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Creado</th>
                        <th>Cliente</th>
                        <th>Detalle</th>
                        <th className="text-end">Total</th>
                        <th>Estado</th>
                        <th>Venta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedidosFiltrados.map((p) => (
                        <tr key={p.id}>
                          <td className="fw-semibold">{p.codigo}</td>
                          <td>{fechaHora(p.fechaCreacion)}</td>
                          <td>#{p.clienteId}</td>
                          <td>{p.items.map((i) => `${i.nombre} x${i.cantidad}`).join(', ')}</td>
                          <td className="text-end">{moneda(p.total)}</td>
                          <td>
                            <span className={`badge ${BADGE_ESTADO[p.estado]}`}>
                              {ETIQUETA_ESTADO[p.estado]}
                            </span>
                          </td>
                          <td>{p.ventaId ? `#${p.ventaId}` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}