import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { obtenerProductos, registrarVenta } from '../../services/api';
import usePedidos from './UsePedidos';
import ProductoList from './ProductoList';
import RegistrarVenta from './RegistrarVenta';
import PedidosPanel from './PedidosPanel';
import ReporteVentas from './ReporteVentas';
import '../../styles/vendedor.css';

const TABS = [
  { id: 'vender', etiqueta: 'Vender', icono: 'bi-cart3' },
  { id: 'pedidos', etiqueta: 'Pedidos', icono: 'bi-bag-check' },
  { id: 'reporte', etiqueta: 'Reporte', icono: 'bi-bar-chart-line' },
];

const cap = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

export default function VendedorDashboard() {
  const { usuario, logout, turno } = useAuth();
  const {
    pedidos,
    cargando: cargandoPedidos,
    error: errorPedidos,
    recargar: recargarPedidos,
  } = usePedidos();

  const [vista, setVista] = useState('vender');
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const pendientes = pedidos.filter((p) => p.estado === 'pendiente').length;
  const fechaHoy = cap(
    new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })
  );
  const horaTurno = (fecha) =>
    new Date(fecha).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    });

  // No activa "cargando" en recargas: así el catálogo no se reinicia tras una venta
  const cargarProductos = useCallback(async () => {
    try {
      const data = await obtenerProductos();
      setProductos(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargandoInicial(false);
    }
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  // El aviso de éxito se cierra solo a los 4 segundos
  useEffect(() => {
    if (mensaje?.tipo !== 'success') return;
    const temporizador = setTimeout(() => setMensaje(null), 4000);
    return () => clearTimeout(temporizador);
  }, [mensaje]);

  const reintentar = () => {
    setError(null);
    setCargandoInicial(true);
    cargarProductos();
  };

  const stockDe = (productoId) => productos.find((p) => p.id === productoId)?.stock ?? 0;

  const agregarAlCarrito = (producto, cantidad) => {
    const yaEnCarrito = carrito.find((i) => i.productoId === producto.id)?.cantidad || 0;

    if (yaEnCarrito + cantidad > producto.stock) {
      setMensaje({
        tipo: 'warning',
        texto: `Solo hay ${producto.stock} unidades de "${producto.nombre}" (ya tienes ${yaEnCarrito} en la venta).`,
      });
      return;
    }

    setMensaje(null);
    setCarrito((prev) => {
      const existente = prev.find((i) => i.productoId === producto.id);
      if (existente) {
        return prev.map((i) =>
          i.productoId === producto.id ? { ...i, cantidad: i.cantidad + cantidad } : i
        );
      }
      return [
        ...prev,
        { productoId: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad },
      ];
    });
  };

  const cambiarCantidad = (productoId, delta) => {
    setCarrito((prev) =>
      prev
        .map((item) => {
          if (item.productoId !== productoId) return item;
          const nueva = item.cantidad + delta;
          if (nueva > stockDe(productoId)) return item;
          return nueva > 0 ? { ...item, cantidad: nueva } : null;
        })
        .filter(Boolean)
    );
  };

  const quitarDelCarrito = (productoId) => {
    setCarrito((prev) => prev.filter((i) => i.productoId !== productoId));
  };

  const vaciarCarrito = () => setCarrito([]);

  const confirmarVenta = async () => {
    if (carrito.length === 0 || enviando) return;
    try {
      setEnviando(true);
      const items = carrito.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad }));
      await registrarVenta({ items });
      setCarrito([]);
      setMensaje({ tipo: 'success', texto: 'Venta registrada correctamente' });
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    } finally {
      setEnviando(false);
      cargarProductos(); // éxito o fallo, el stock mostrado queda al día
    }
  };

  return (
    <div className="vendedor-theme">
      <header className="vendedor-header py-3">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <div className="vendedor-avatar">
              {(usuario?.nombres || usuario?.nombre || 'V').charAt(0).toUpperCase()}
            </div>
            <div>
              <small className="text-uppercase opacity-75" style={{ letterSpacing: '0.08em' }}>
                <i className="bi bi-cup-hot-fill me-1"></i>CafeteriaWeb
              </small>
              <h1 className="h4 mb-0">Panel de Vendedor</h1>
              <small className="opacity-75 d-block">
                Hola, {usuario?.nombres || usuario?.nombre || 'Vendedor'}
              </small>
              {turno && (
                <small className="opacity-75 d-block">
                  Tu turno empezó a las {horaTurno(turno.inicio)} y termina a las{' '}
                  {horaTurno(turno.fin)}
                </small>
              )}
            </div>
          </div>
          <div className="d-flex align-items-center gap-3">
            <small className="opacity-75 d-none d-md-inline">
              <i className="bi bi-calendar3 me-1"></i>
              {fechaHoy}
            </small>
            <button className="btn btn-outline-light btn-sm" onClick={logout}>
              <i className="bi bi-box-arrow-right me-1"></i>Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="container py-4">
        <ul className="nav vendedor-tabs mb-4">
          {TABS.map((t) => (
            <li className="nav-item" key={t.id}>
              <button
                className={`nav-link ${vista === t.id ? 'active' : ''}`}
                onClick={() => setVista(t.id)}
              >
                <i className={`bi ${t.icono}`}></i>
                {t.etiqueta}
                {t.id === 'pedidos' && pendientes > 0 && (
                  <span className="badge rounded-pill text-bg-danger">{pendientes}</span>
                )}
              </button>
            </li>
          ))}
        </ul>

        {mensaje && (
          <div className={`alert alert-${mensaje.tipo} alert-dismissible`} role="alert">
            {mensaje.texto}
            <button type="button" className="btn-close" onClick={() => setMensaje(null)}></button>
          </div>
        )}

        {vista === 'vender' && (
          <div className="row">
            <div className="col-lg-7">
              {cargandoInicial && (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="alert alert-danger d-flex justify-content-between align-items-center">
                  <span>{error}</span>
                  <button className="btn btn-outline-danger btn-sm" onClick={reintentar}>
                    Reintentar
                  </button>
                </div>
              )}

              {!cargandoInicial && productos.length > 0 && (
                <ProductoList
                  productos={productos}
                  carrito={carrito}
                  onAgregar={agregarAlCarrito}
                />
              )}
            </div>
            <div className="col-lg-5">
              <RegistrarVenta
                carrito={carrito}
                enviando={enviando}
                onCambiarCantidad={cambiarCantidad}
                onQuitar={quitarDelCarrito}
                onVaciar={vaciarCarrito}
                onConfirmar={confirmarVenta}
              />
            </div>
          </div>
        )}

        {vista === 'pedidos' && (
          <PedidosPanel
            pedidos={pedidos}
            cargando={cargandoPedidos}
            error={errorPedidos}
            onRecargar={recargarPedidos}
            onStockCambio={cargarProductos}
          />
        )}

        {vista === 'reporte' && (
          <ReporteVentas
            pedidos={pedidos}
            errorPedidos={errorPedidos}
            onRecargarPedidos={recargarPedidos}
          />
        )}
      </main>
    </div>
  );
}