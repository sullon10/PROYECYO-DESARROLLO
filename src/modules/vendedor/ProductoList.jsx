import { useMemo, useState } from 'react';

export default function ProductoList({ productos, carrito, onAgregar }) {
  const [cantidades, setCantidades] = useState({});
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('Todas');

  const categorias = useMemo(
    () => ['Todas', ...new Set(productos.map((p) => p.categoria))],
    [productos]
  );

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const coincideCategoria = categoria === 'Todas' || p.categoria === categoria;
      const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
      return coincideCategoria && coincideBusqueda;
    });
  }, [productos, categoria, busqueda]);

  // Cuánto de este producto ya está en el carrito
  const enCarrito = (id) => carrito.find((i) => i.productoId === id)?.cantidad || 0;

  const cambiarCantidad = (id, valor) => {
    setCantidades((prev) => ({ ...prev, [id]: Number(valor) }));
  };

  const handleAgregar = (producto) => {
    const cantidad = cantidades[producto.id] || 1;
    if (cantidad < 1) return;
    onAgregar(producto, cantidad);
    setCantidades((prev) => ({ ...prev, [producto.id]: 1 }));
  };

  return (
    <div className="card p-3 mb-4">
      <h4 className="mb-3">Catálogo</h4>

      <div className="row g-2 mb-3">
        <div className="col-sm-7">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="col-sm-5">
          <select
            className="form-select"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            {categorias.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table align-middle mb-0">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio</th>
              <th>Stock</th>
              <th style={{ width: '110px' }}>Cantidad</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-muted py-3">
                  No se encontraron productos
                </td>
              </tr>
            )}
            {productosFiltrados.map((producto) => {
              const disponible = producto.stock - enCarrito(producto.id);
              return (
                <tr key={producto.id}>
                  <td>
                    <div className="fw-semibold">{producto.nombre}</div>
                    <small className="text-muted">{producto.categoria}</small>
                  </td>
                  <td>S/ {producto.precio.toFixed(2)}</td>
                  <td>
                    <span
                      className={`badge rounded-pill ${
                        producto.stock === 0
                          ? 'text-bg-danger'
                          : producto.stock <= 5
                          ? 'text-bg-warning'
                          : 'text-bg-success'
                      }`}
                    >
                      {producto.stock === 0 ? 'Agotado' : `${producto.stock} und.`}
                    </span>
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      min="1"
                      max={disponible}
                      value={cantidades[producto.id] || 1}
                      onChange={(e) => cambiarCantidad(producto.id, e.target.value)}
                      disabled={disponible <= 0}
                    />
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAgregar(producto)}
                      disabled={disponible <= 0}
                    >
                      Agregar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}