import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function ClienteDashboard() {
  const { usuario, logout } = useAuth();
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [filtro, setFiltro] = useState('Todas');
  const [error, setError] = useState('');
  const [mensajeCompra, setMensajeCompra] = useState('');

  useEffect(() => {
    cargarProductos();
  }, []);

  const categorias = useMemo(
    () => ['Todas', ...new Set(productos.map((p) => p.categoria))],
    [productos]
  );

  const productosFiltrados = useMemo(() => {
    if (filtro === 'Todas') return productos;
    return productos.filter((p) => p.categoria === filtro);
  }, [productos, filtro]);

  const totalCarrito = carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);

  async function cargarProductos() {
    try {
      const respuesta = await fetch('http://localhost:3001/api/productos');
      if (!respuesta.ok) throw new Error('No se pudieron cargar los productos.');
      setProductos(await respuesta.json());
    } catch (err) {
      setError(err.message);
    }
  }

  function agregarAlCarrito(producto) {
    setMensajeCompra('');
    setError('');
    setCarrito((actual) => {
      const encontrado = actual.find((item) => item.id === producto.id);
      if (encontrado) {
        if (encontrado.cantidad >= producto.stock) {
          setError(`No hay más stock disponible de ${producto.nombre}.`);
          return actual;
        }
        return actual.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...actual, { ...producto, cantidad: 1 }];
    });
  }

  function cambiarCantidad(productoId, delta) {
    setCarrito((actual) =>
      actual
        .map((item) => {
          if (item.id !== productoId) return item;
          const nueva = item.cantidad + delta;
          return nueva > 0 ? { ...item, cantidad: nueva } : null;
        })
        .filter(Boolean)
    );
  }

  function eliminarDelCarrito(productoId) {
    setCarrito((actual) => actual.filter((item) => item.id !== productoId));
  }

  async function confirmarCompra() {
    if (carrito.length === 0) {
      setError('Tu carrito está vacío.');
      return;
    }
    try {
      const respuesta = await fetch('http://localhost:3001/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId: usuario.id,
          items: carrito.map((item) => ({ productoId: item.id, cantidad: item.cantidad })),
        }),
      });
      const data = await respuesta.json();
      if (!respuesta.ok) throw new Error(data.error || 'No se pudo completar la compra.');
      setCarrito([]);
      setMensajeCompra(data.mensaje || 'Compra realizada correctamente.');
      setError('');
      cargarProductos();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h2>Panel del cliente</h2>
          <small>Bienvenido, {usuario.nombre}</small>
        </div>
        <button className="logout-button" onClick={logout}>Cerrar sesión</button>
      </header>

      <main className="catalog-layout">
        <section className="catalog-panel">
          <div className="section-header"><h3>Catálogo de productos</h3></div>

          <div className="filters">
            {categorias.map((categoria) => (
              <button
                key={categoria}
                type="button"
                className={categoria === filtro ? 'filter active' : 'filter'}
                onClick={() => setFiltro(categoria)}
              >
                {categoria}
              </button>
            ))}
          </div>

          <div className="product-grid">
            {productosFiltrados.map((producto) => (
              <article key={producto.id} className="product-card">
                <div className="product-info">
                  <h4>{producto.nombre}</h4>
                  <span className="category">{producto.categoria}</span>
                  <strong>S/ {producto.precio.toFixed(2)}</strong>
                  <small>{producto.stock} unidades disponibles</small>
                </div>
                <button
                  type="button"
                  className="add-button"
                  onClick={() => agregarAlCarrito(producto)}
                  disabled={producto.stock === 0}
                >
                  {producto.stock === 0 ? 'Agotado' : 'Agregar'}
                </button>
              </article>
            ))}
          </div>
        </section>

        <aside className="cart-panel">
          <div className="section-header"><h3>Carrito</h3></div>

          {carrito.length === 0 ? (
            <p className="empty-cart">Tu carrito está vacío.</p>
          ) : (
            <div className="cart-items">
              {carrito.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div>
                    <strong>{item.nombre}</strong>
                    <span>S/ {item.precio.toFixed(2)} c/u</span>
                  </div>
                  <div className="quantity-controls">
                    <button type="button" onClick={() => cambiarCantidad(item.id, -1)}>-</button>
                    <span>{item.cantidad}</span>
                    <button type="button" onClick={() => cambiarCantidad(item.id, 1)}>+</button>
                  </div>
                  <button type="button" className="remove-button" onClick={() => eliminarDelCarrito(item.id)}>
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="cart-summary">
            <div><span>Total</span><strong>S/ {totalCarrito.toFixed(2)}</strong></div>
            <button type="button" className="checkout-button" onClick={confirmarCompra}>
              Confirmar compra
            </button>
          </div>

          {error && <div className="alert error margin-top">{error}</div>}
          {mensajeCompra && <div className="alert success margin-top">{mensajeCompra}</div>}
        </aside>
      </main>
    </div>
  );
}