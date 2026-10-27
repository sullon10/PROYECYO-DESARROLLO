import { useCallback, useEffect, useState } from 'react';
import { obtenerHistorialVentas, obtenerReporteVentas } from '../../services/api';

export default function ReporteVentas() {
  const [historial, setHistorial] = useState([]);
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    try {
      setCargando(true);
      const [h, r] = await Promise.all([obtenerHistorialVentas(), obtenerReporteVentas()]);
      setHistorial([...h].reverse()); // las más recientes primero
      setReporte(r);
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

   if (cargando && !reporte) {
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

  const ticketPromedio =
    reporte.totalVentas > 0 ? reporte.totalGeneral / reporte.totalVentas : 0;

  const porProducto = Object.entries(reporte.porProducto).sort(
    (a, b) => b[1].totalGenerado - a[1].totalGenerado
  );

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Resumen de ventas</h4>
        <button className="btn btn-outline-secondary btn-sm" onClick={cargar} disabled={cargando}>
          {cargando ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-sm-4">
          <div className="card p-3 text-center">
            <div className="text-muted small">Ventas registradas</div>
            <div className="fs-3 fw-semibold">{reporte.totalVentas}</div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="card p-3 text-center">
            <div className="text-muted small">Total generado</div>
            <div className="fs-3 fw-semibold">S/ {reporte.totalGeneral.toFixed(2)}</div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="card p-3 text-center">
            <div className="text-muted small">Ticket promedio</div>
            <div className="fs-3 fw-semibold">S/ {ticketPromedio.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="card p-3 mb-4">
        <h5 className="mb-3">Ventas por producto</h5>
        {porProducto.length === 0 ? (
          <p className="text-muted mb-0">Aún no hay ventas registradas.</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th className="text-end">Unidades vendidas</th>
                  <th className="text-end">Total generado</th>
                </tr>
              </thead>
              <tbody>
                {porProducto.map(([nombre, datos]) => (
                  <tr key={nombre}>
                    <td>{nombre}</td>
                    <td className="text-end">{datos.cantidadVendida}</td>
                    <td className="text-end">S/ {datos.totalGenerado.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card p-3">
        <h5 className="mb-3">Historial de ventas</h5>
        {historial.length === 0 ? (
          <p className="text-muted mb-0">Aún no hay ventas registradas.</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Fecha</th>
                  <th>Vendedor</th>
                  <th>Detalle</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((venta) => (
                  <tr key={venta.id}>
                    <td>#{venta.id}</td>
                    <td>{new Date(venta.fecha).toLocaleString('es-PE')}</td>
                    <td>{venta.vendedorId ?? '—'}</td>
                    <td>{venta.items.map((i) => `${i.nombre} x${i.cantidad}`).join(', ')}</td>
                    <td className="text-end">S/ {venta.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}