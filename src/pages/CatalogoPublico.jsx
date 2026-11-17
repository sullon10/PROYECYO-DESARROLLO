import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerCatalogo } from '../services/clienteApi';

function dinero(valor) {
  return `S/ ${Number(valor).toFixed(2)}`;
}

export default function CatalogoPublico() {
  const [productos, setProductos] = useState([]);
  const [filtro, setFiltro] = useState('Todas');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerCatalogo()
      .then(setProductos)
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  const categorias = useMemo(
    () => ['Todas', ...new Set(productos.map((producto) => producto.categoria))],
    [productos]
  );

  const productosFiltrados = useMemo(
    () => filtro === 'Todas'
      ? productos
      : productos.filter((producto) => producto.categoria === filtro),
    [productos, filtro]
  );

  return (
    <main className="public-catalog">
      <nav className="public-nav" aria-label="Navegación del catálogo">
        <Link className="public-brand" to="/">
          <i className="bi bi-cup-hot-fill" aria-hidden="true"></i>
          <span>CafeteríaWeb</span>
        </Link>
        <div className="public-nav-actions">
          <Link to="/">Inicio</Link>
          <Link className="public-login-link" to="/login">Iniciar sesión</Link>
        </div>
      </nav>

      <section className="public-catalog-heading">
        <span className="public-kicker">PRODUCTOS DE LA CASA</span>
        <h1>Conoce nuestro catálogo</h1>
        <p>Explora antes de entrar. Para crear un pedido necesitarás iniciar sesión.</p>
      </section>

      <section className="public-catalog-content">
        <div className="public-filter-row" aria-label="Filtrar productos por categoría">
          {categorias.map((categoria) => (
            <button
              type="button"
              key={categoria}
              className={categoria === filtro ? 'public-filter active' : 'public-filter'}
              onClick={() => setFiltro(categoria)}
            >
              {categoria}
            </button>
          ))}
        </div>

        {cargando && <p className="public-catalog-message">Cargando catálogo...</p>}
        {error && <p className="public-catalog-message error">{error}</p>}
        {!cargando && !error && productosFiltrados.length === 0 && (
          <p className="public-catalog-message">No hay productos disponibles.</p>
        )}

        {!cargando && !error && productosFiltrados.length > 0 && (
          <div className="public-product-grid">
            {productosFiltrados.map((producto) => (
              <article className="public-product-card" key={producto.id}>
                <div className="public-product-icon" aria-hidden="true">
                  <i className="bi bi-cup-straw"></i>
                </div>
                <span className="category">{producto.categoria}</span>
                <h2>{producto.nombre}</h2>
                <strong>{dinero(producto.precio)}</strong>
                <span className={producto.stock === 0 ? 'public-stock empty' : 'public-stock'}>
                  {producto.stock === 0 ? 'Agotado' : `${producto.stock} disponibles`}
                </span>
                <Link className="public-order-link" to="/login">
                  Iniciar sesión para pedir <i className="bi bi-arrow-right" aria-hidden="true"></i>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="public-footer">
        <span>CafeteríaWeb</span>
        <span>¿Listo para pedir? <Link to="/login">Ingresa a tu cuenta</Link></span>
      </footer>
    </main>
  );
}
