import { useState, useEffect } from 'react';
import { obtenerReporteAdmin } from '../../services/api';

export default function ReportesAdmin() {
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarReporte();
  }, []);

  const cargarReporte = async () => {
    try {
      setCargando(true);
      const data = await obtenerReporteAdmin();
      setReporte(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return <div className="spinner-border" role="status"><span className="visually-hidden">Cargando...</span></div>;
  }

  if (!reporte) {
    return <div className="alert alert-info">No hay datos disponibles</div>;
  }

  return (
    <div>
      <h3 className="mb-4">Reportes de Ventas</h3>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Resumen General */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h6 className="card-title">Total de Ventas</h6>
              <h3 className="mb-0">{reporte.totalVentas}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h6 className="card-title">Ingreso Total</h6>
              <h3 className="mb-0">${reporte.ingresoTotal.toFixed(2)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h6 className="card-title">Promedio por Venta</h6>
              <h3 className="mb-0">
                ${reporte.totalVentas > 0 ? (reporte.ingresoTotal / reporte.totalVentas).toFixed(2) : '0.00'}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Ventas por Vendedor */}
      <div className="card mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">Ventas por Vendedor</h5>
        </div>
        <div className="card-body">
          {Object.keys(reporte.ventasPorVendedor).length === 0 ? (
            <p className="text-muted">Sin datos</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>ID Vendedor</th>
                    <th>Cantidad de Ventas</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(reporte.ventasPorVendedor).map(([vendedorId, cantidad]) => (
                    <tr key={vendedorId}>
                      <td>{vendedorId}</td>
                      <td>{cantidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Productos Vendidos */}
      <div className="card">
        <div className="card-header bg-light">
          <h5 className="mb-0">Productos Vendidos</h5>
        </div>
        <div className="card-body">
          {Object.keys(reporte.productosVendidos).length === 0 ? (
            <p className="text-muted">Sin datos</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead className="table-light">
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Ingreso Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(reporte.productosVendidos).map(([nombre, datos]) => (
                    <tr key={nombre}>
                      <td>{nombre}</td>
                      <td>{datos.cantidad}</td>
                      <td>${datos.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <button
        className="btn btn-primary mt-3"
        onClick={cargarReporte}
      >
        <i className="bi bi-arrow-clockwise me-2"></i>
        Actualizar Reporte
      </button>
    </div>
  );
}
