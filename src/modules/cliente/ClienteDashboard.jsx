import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  cancelarPedidoCliente,
  crearPedidoCliente,
  actualizarPedidoCliente,
  obtenerCatalogo,
  obtenerPedidosCliente
} from '../../services/clienteApi';

const ESTADOS = {
  pendiente: 'Pendiente',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
  vencido: 'Vencido'
};

function dinero(valor) {
  return `S/ ${Number(valor).toFixed(2)}`;
}

function fecha(valor) {
  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(valor));
}

export default function ClienteDashboard() {
  const { usuario, logout } = useAuth();
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [pedidoEditando, setPedidoEditando] = useState(null);
  const [filtro, setFiltro] = useState('Todas');
  const [vista, setVista] = useState('catalogo');
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const nombre = usuario?.nombres || usuario?.nombre || usuario?.correo || 'Cliente';

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

  const totalCarrito = carrito.reduce(
    (total, item) => total + item.precio * item.cantidad,
    0
  );

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const [catalogo, historial] = await Promise.all([
        obtenerCatalogo(),
        obtenerPedidosCliente(usuario.id)
      ]);
      setProductos(catalogo);
      setPedidos(historial);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [usuario?.id]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  function agregarAlCarrito(producto) {
    if (producto.stock <= 0) return;
    setMensaje('');
    setError('');
    setCarrito((actual) => {
      const encontrado = actual.find((item) => item.id === producto.id);
      if (!encontrado) return [...actual, { ...producto, cantidad: 1 }];
      if (encontrado.cantidad >= producto.stock) {
        setError(`No hay más stock disponible de ${producto.nombre}.`);
        return actual;
      }
      return actual.map((item) => item.id === producto.id
        ? { ...item, cantidad: item.cantidad + 1 }
        : item);
    });
  }

  function cambiarCantidad(productoId, delta) {
    setCarrito((actual) => actual
      .map((item) => {
        if (item.id !== productoId) return item;
        const producto = productos.find((itemCatalogo) => itemCatalogo.id === productoId);
        const nuevaCantidad = item.cantidad + delta;
        if (producto && nuevaCantidad > producto.stock) return item;
        return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : null;
      })
      .filter(Boolean));
  }

  function eliminarDelCarrito(productoId) {
    setCarrito((actual) => actual.filter((item) => item.id !== productoId));
  }

  async function confirmarPedido() {
    if (carrito.length === 0) {
      setError('Tu carrito está vacío.');
      return;
    }
    setProcesando(true);
    setError('');
    setMensaje('');
    try {
      const datosPedido = {
        clienteId: usuario.id,
        items: carrito.map((item) => ({
          productoId: item.id,
          cantidad: item.cantidad
        }))
      };
      const pedido = pedidoEditando
        ? await actualizarPedidoCliente(pedidoEditando, datosPedido)
        : await crearPedidoCliente(datosPedido);
      setPedidos((actuales) => pedidoEditando
        ? actuales.map((actual) => actual.codigo === pedido.codigo ? pedido : actual)
        : [pedido, ...actuales]);
      setCarrito([]);
      setPedidoEditando(null);
      setVista('pedidos');
      setMensaje(`Pedido ${pedido.codigo} ${pedidoEditando ? 'actualizado' : 'creado'} correctamente.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  }

  function editarPedido(pedido) {
    setCarrito(pedido.items.map((item) => {
      const producto = productos.find((actual) => actual.id === item.productoId);
      return {
        ...(producto || {}),
        id: item.productoId,
        nombre: item.nombre,
        precio: item.precioUnitario,
        cantidad: item.cantidad
      };
    }));
    setPedidoEditando(pedido.codigo);
    setMensaje(`Editando ${pedido.codigo}. Ajusta los productos y confirma los cambios.`);
    setError('');
    setVista('catalogo');
  }

  async function cancelarPedido(codigo) {
    setProcesando(true);
    setError('');
    try {
      const pedidoActualizado = await cancelarPedidoCliente(codigo);
      setPedidos((actuales) => actuales.map((pedido) =>
        pedido.codigo === codigo ? pedidoActualizado : pedido
      ));
      setMensaje(`Pedido ${codigo} cancelado.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="client-shell">
      <header className="client-navbar">
        <div className="client-brand">
          <i className="bi bi-cup-hot-fill" aria-hidden="true"></i>
          <div>
            <strong>CafeteríaWeb</strong>
            <small>Área del cliente</small>
          </div>
        </div>
        <nav className="client-nav" aria-label="Navegación del cliente">
          <button
            type="button"
            className={vista === 'catalogo' ? 'client-nav-link active' : 'client-nav-link'}
            onClick={() => setVista('catalogo')}
          >
            <i className="bi bi-grid" aria-hidden="true"></i> Catálogo
          </button>
          <button
            type="button"
            className={vista === 'pedidos' ? 'client-nav-link active' : 'client-nav-link'}
            onClick={() => setVista('pedidos')}
          >
            <i className="bi bi-receipt" aria-hidden="true"></i> Mis pedidos
            {pedidos.length > 0 && <span className="client-nav-count">{pedidos.length}</span>}
          </button>
        </nav>
        <div className="client-account">
          <span>{nombre}</span>
          <button type="button" className="client-logout" onClick={logout} title="Cerrar sesión">
            <i className="bi bi-box-arrow-right" aria-hidden="true"></i>
          </button>
        </div>
      </header>

      <main className="client-main">
        <section className="client-heading">
          <div>
            <span className="client-eyebrow">CAFETERÍAWEB / CLIENTE</span>
            <h1>{vista === 'catalogo' ? 'Elige algo delicioso' : 'Mis pedidos'}</h1>
            <p>{vista === 'catalogo'
              ? 'Consulta el catálogo, arma tu pedido y revisa su estado.'
              : 'Consulta tus pedidos y el estado de atención en todo momento.'}
            </p>
          </div>
          <div className="client-heading-icon" aria-hidden="true">
            <i className={vista === 'catalogo' ? 'bi bi-cup-hot' : 'bi bi-receipt-cutoff'}></i>
          </div>
        </section>

        {error && <div className="alert error client-alert" role="alert">{error}</div>}
        {mensaje && <div className="alert success client-alert" role="status">{mensaje}</div>}

        {vista === 'catalogo' && (
          <div className="client-content-grid">
            <section className="catalog-panel client-section">
              <div className="section-header">
                <div>
                  <span className="client-section-label">PRODUCTOS DISPONIBLES</span>
                  <h2>Catálogo</h2>
                </div>
                <button type="button" className="client-refresh" onClick={cargarDatos} title="Actualizar catálogo">
                  <i className="bi bi-arrow-clockwise" aria-hidden="true"></i>
                </button>
              </div>
              {pedidoEditando && (
                <div className="editing-order-banner" role="status">
                  <i className="bi bi-pencil-square" aria-hidden="true"></i>
                  Editando {pedidoEditando}
                  <button type="button" onClick={() => { setPedidoEditando(null); setCarrito([]); }}>
                    Cancelar edición
                  </button>
                </div>
              )}
              <div className="filters" aria-label="Filtrar por categoría">
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
              {cargando ? (
                <p className="client-empty">Cargando productos...</p>
              ) : productosFiltrados.length === 0 ? (
                <p className="client-empty">No hay productos en esta categoría.</p>
              ) : (
                <div className="product-grid">
                  {productosFiltrados.map((producto) => (
                    <article key={producto.id} className="product-card">
                      <div className="product-info">
                        <span className="category">{producto.categoria}</span>
                        <h3>{producto.nombre}</h3>
                        <strong>{dinero(producto.precio)}</strong>
                        <small className={producto.stock === 0 ? 'stock-empty' : ''}>
                          {producto.stock === 0 ? 'Agotado' : `${producto.stock} unidades disponibles`}
                        </small>
                      </div>
                      <button
                        type="button"
                        className="add-button"
                        onClick={() => agregarAlCarrito(producto)}
                        disabled={producto.stock === 0}
                      >
                        <i className="bi bi-plus-lg" aria-hidden="true"></i>
                        {producto.stock === 0 ? 'Agotado' : 'Agregar'}
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <aside className="cart-panel client-section">
              <div className="section-header">
                <div>
                  <span className="client-section-label">TU SELECCIÓN</span>
                  <h2>Carrito <span className="cart-badge">{carrito.length}</span></h2>
                </div>
              </div>
              {carrito.length === 0 ? (
                <div className="client-empty client-cart-empty">
                  <i className="bi bi-basket3" aria-hidden="true"></i>
                  <p>Aún no agregas productos.</p>
                </div>
              ) : (
                <div className="cart-items">
                  {carrito.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <div>
                        <strong>{item.nombre}</strong>
                        <span>{dinero(item.precio)} c/u</span>
                      </div>
                      <div className="quantity-controls">
                        <button type="button" onClick={() => cambiarCantidad(item.id, -1)} aria-label={`Reducir ${item.nombre}`}>-</button>
                        <span>{item.cantidad}</span>
                        <button type="button" onClick={() => cambiarCantidad(item.id, 1)} aria-label={`Aumentar ${item.nombre}`}>+</button>
                        <button type="button" className="remove-button" onClick={() => eliminarDelCarrito(item.id)} title={`Quitar ${item.nombre}`}>
                          <i className="bi bi-trash3" aria-hidden="true"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="cart-summary">
                <div><span>Total estimado</span><strong>{dinero(totalCarrito)}</strong></div>
                <button type="button" className="checkout-button" onClick={confirmarPedido} disabled={procesando || carrito.length === 0}>
                  <i className="bi bi-check2-circle" aria-hidden="true"></i>
                  {procesando ? 'Procesando...' : 'Crear pedido'}
                </button>
              </div>
            </aside>
          </div>
        )}

        {vista === 'pedidos' && (
          <section className="client-section orders-section">
            {pedidos.length === 0 ? (
              <div className="client-empty orders-empty">
                <i className="bi bi-receipt" aria-hidden="true"></i>
                <h2>Aún no tienes pedidos</h2>
                <p>Visita el catálogo para crear tu primer pedido.</p>
                <button type="button" className="checkout-button" onClick={() => setVista('catalogo')}>Ver catálogo</button>
              </div>
            ) : (
              <div className="orders-list">
                {pedidos.map((pedido) => (
                  <article className="order-card" key={pedido.codigo}>
                    <div className="order-card-header">
                      <div>
                        <span className="client-section-label">PEDIDO</span>
                        <h2>{pedido.codigo}</h2>
                        <small>{fecha(pedido.fechaCreacion)}</small>
                      </div>
                      <span className={`order-status ${pedido.estado}`}>{ESTADOS[pedido.estado] || pedido.estado}</span>
                    </div>
                    <div className="order-items">
                      {pedido.items.map((item) => (
                        <div key={`${pedido.codigo}-${item.productoId}`}>
                          <span>{item.cantidad} x {item.nombre}</span>
                          <strong>{dinero(item.subtotal)}</strong>
                        </div>
                      ))}
                    </div>
                    <div className="order-card-footer">
                      <strong>Total {dinero(pedido.total)}</strong>
                      {pedido.estado === 'pendiente' && (
                        <div className="order-actions">
                          <button type="button" className="edit-order" onClick={() => editarPedido(pedido)} disabled={procesando}>
                            <i className="bi bi-pencil" aria-hidden="true"></i> Editar
                          </button>
                          <button type="button" className="cancel-order" onClick={() => cancelarPedido(pedido.codigo)} disabled={procesando}>
                            Cancelar pedido
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="client-footer">
        <span>CafeteríaWeb</span>
        <span>Consulta y pedidos en un solo lugar</span>
      </footer>
    </div>
  );
}
