import { useMemo, useState } from 'react';

const ICONOS = { Bebidas: 'bi-cup-hot', Comida: 'bi-egg-fried' };

function claseStock(stock) {
  if (stock === 0) return 'text-bg-danger';
  if (stock <= 5) return 'text-bg-warning';
  return 'text-bg-success';
}

export default function ProductoList({ productos, carrito, onAgregar }) {
  const [cantidades, setCantidades] = useState({});
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('Todas');

  const categorias = useMemo(
    () => ['Todas', ...new Set(productos.map((p) => p.categoria))],
    [productos]
  );

  const productosFiltrados = useMemo(
    () =>
      productos.filter(
        (p) =>
          (categoria === 'Todas' || p.categoria === categoria) &&
          p.nombre.toLowerCase().includes(busqueda.toLowerCase())
      ),
    [productos, categoria, busqueda]
  );

  const enCarrito = (id) => carrito.find((i) => i.productoId === id)?.cantidad || 0;
  const disponibleDe = (p) => Math.max(0, p.stock - enCarrito(p.id));
  const cantidadDe = (p) =>
    Math.min(cantidades[p.id] || 1, Math.max(1, disponibleDe(p)));

  const fijarCantidad = (p, valor) => {
    const tope = Math.max(1, disponibleDe(p));
    const nueva = Math.min(Math.max(1, Number(valor) || 1), tope);
    setCantidades((prev) => ({ ...prev, [p.id]: nueva }));
  };

  const agregar = (p) => {
    onAgregar(p, cantidadDe(p));
    setCantidades((prev) => ({ ...prev, [p.id]: 1 }));
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">
            <i className="bi bi-shop me-2"></i>Catálogo
          </h4>
          <small className="text-muted">{productosFiltrados.length} producto(s)</small>
        </div>

        <div className="input-group mb-3">
          <span className="input-group-text bg-white">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="d-flex flex-wrap gap-2 mb-4">
          {categorias.map((c) => (
            <button
              key={c}
              type="button"
              className={`btn btn-sm rounded-pill ${
                categoria === c ? 'btn-dark' : 'btn-outline-dark'
              }`}
              onClick={() => setCategoria(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {productosFiltrados.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-search"></i>
            No se encontraron productos
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 g-3">
            {productosFiltrados.map((p) => {
              const agotado = p.stock === 0;
              const disponible = disponibleDe(p);
              const yaEnVenta = enCarrito(p.id);
              return (
                <div className="col" key={p.id}>
                  <div className={`card product-tile h-100 ${agotado ? 'agotado' : ''}`}>
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex align-items-start gap-3 mb-3">
                        <div className="product-icon">
                          <i className={`bi ${ICONOS[p.categoria] || 'bi-box-seam'}`}></i>
                        </div>
                        <div className="flex-grow-1">
                          <h5 className="mb-0 fs-6 fw-semibold">{p.nombre}</h5>
                          <small className="text-muted">{p.categoria}</small>
                        </div>
                        <span className={`badge rounded-pill ${claseStock(p.stock)}`}>
                          {agotado ? 'Agotado' : `${p.stock} und.`}
                        </span>
                      </div>

                      <div className="d-flex justify-content-between align-items-center mt-auto mb-3">
                        <span className="price-tag">S/ {p.precio.toFixed(2)}</span>
                        {yaEnVenta > 0 && (
                          <small className="text-muted">
                            <i className="bi bi-cart-check me-1"></i>
                            {yaEnVenta} en la venta
                          </small>
                        )}
                      </div>

                      <div className="d-flex gap-2">
                        <div className="qty-stepper">
                          <button
                            type="button"
                            onClick={() => fijarCantidad(p, cantidadDe(p) - 1)}
                            disabled={disponible <= 0}
                          >
                            <i className="bi bi-dash-lg"></i>
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={disponible}
                            value={cantidadDe(p)}
                            onChange={(e) => fijarCantidad(p, e.target.value)}
                            disabled={disponible <= 0}
                          />
                          <button
                            type="button"
                            onClick={() => fijarCantidad(p, cantidadDe(p) + 1)}
                            disabled={disponible <= 0}
                          >
                            <i className="bi bi-plus-lg"></i>
                          </button>
                        </div>
                        <button
                          className="btn btn-primary flex-grow-1"
                          onClick={() => agregar(p)}
                          disabled={disponible <= 0}
                        >
                          <i className="bi bi-cart-plus me-1"></i>
                          Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}