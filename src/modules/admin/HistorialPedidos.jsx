
import { useEffect, useMemo, useState } from 'react';
import { obtenerHistorialPedidos } from '../../services/api';

export default function HistorialPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [fecha, setFecha] = useState('');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargarPedidos = async () => {
    setCargando(true);
    setError('');

    try {
      const datos = await obtenerHistorialPedidos();
      if (!Array.isArray(datos)) {
        throw new Error('El servidor no devolvió una lista de pedidos');
      }
      setPedidos(datos);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el historial');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const moneda = (valor) =>
    `S/ ${Number(valor || 0).toFixed(2)}`;

  const mostrarFecha = (valor) =>
    valor ? new Date(valor).toLocaleString('es-PE') : 'Sin fecha';

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((pedido) => {
      const texto = `${pedido.id} ${pedido.vendedorId}`.toLowerCase();
      const coincideBusqueda = texto.includes(busqueda.toLowerCase());
      const coincideFecha =
        !fecha || (pedido.fecha || '').slice(0, 10) === fecha;

      return coincideBusqueda && coincideFecha;
    });
  }, [pedidos, busqueda, fecha]);

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Historial de Pedidos</h2>
          <p className="text-muted mb-0">
            Consulta las ventas registradas en la cafetería.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={cargarPedidos}
          disabled={cargando}
        >
          Actualizar
        </button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Buscar por pedido o vendedor..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <input
            type="date"
            className="form-control"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <button
            className="btn btn-outline-secondary w-100"
            onClick={() => {
              setBusqueda('');
              setFecha('');
            }}
          >
            Limpiar
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {cargando ? (
        <p>Cargando pedidos...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>N.º Pedido</th>
                <th>Fecha</th>
                <th>Vendedor</th>
                <th>Productos</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((pedido) => (
                <tr key={pedido.id}>
                  <td>#{pedido.id}</td>
                  <td>{mostrarFecha(pedido.fecha)}</td>
                  <td>{pedido.vendedorId ?? 'No registrado'}</td>
                  <td>{pedido.items?.length ?? 0}</td>
                  <td>{moneda(pedido.total)}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setPedidoSeleccionado(pedido)}
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
              {pedidosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No se encontraron pedidos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {pedidoSeleccionado && (
        <div className="card shadow-sm mt-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              Detalle del pedido #{pedidoSeleccionado.id}
            </h5>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setPedidoSeleccionado(null)}
            >
              Cerrar
            </button>
          </div>
          <div className="card-body">
            <p>
              <strong>Fecha:</strong>{' '}
              {mostrarFecha(pedidoSeleccionado.fecha)}
            </p>
            <p>
              <strong>Vendedor ID:</strong>{' '}
              {pedidoSeleccionado.vendedorId ?? 'No registrado'}
            </p>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio unitario</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(pedidoSeleccionado.items || []).map((item, indice) => (
                    <tr key={indice}>
                      <td>{item.nombre}</td>
                      <td>{item.cantidad}</td>
                      <td>{moneda(item.precioUnitario)}</td>
                      <td>{moneda(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h5 className="text-end">
              Total: {moneda(pedidoSeleccionado.total)}
            </h5>
          </div>
        </div>
      )}
    </div>
  );
}
