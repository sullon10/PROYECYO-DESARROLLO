import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { obtenerProductos, registrarVenta } from '../../services/api';
import ProductoList from './ProductoList';
import RegistrarVenta from './RegistrarVenta';
import ReporteVentas from './ReporteVentas';

export default function VendedorDashboard() {
  const { usuario, logout } = useAuth();
  const [vista, setVista] = useState('vender');
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const cargarProductos = useCallback(async () => {
    try {
      setCargando(true);
      const data = await obtenerProductos();
      setProductos(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  const stockDe = (productoId) =>
    productos.find((p) => p.id === productoId)?.stock ?? 0;

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
          if (nueva > stockDe(productoId)) return item; // no pasar del stock
          return nueva > 0 ? { ...item, cantidad: nueva } : null;
        })
        .filter(Boolean)
    );
  };

  const quitarDelCarrito = (productoId) => {
    setCarrito((prev) => prev.filter((i) => i.productoId !== productoId));
  };

  const confirmarVenta = async () => {
    if (carrito.length === 0 || enviando) return;
    try {
      setEnviando(true);
      const items = carrito.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad }));
      await registrarVenta({ vendedorId: usuario.id, items });
      setCarrito([]);
      setMensaje({ tipo: 'success', texto: 'Venta registrada correctamente' });
      await cargarProductos();
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Panel de Vendedor</h2>
        <div>
          <span className="me-3">Hola, {usuario?.nombre}</span>
          <button className="btn btn-outline-secondary btn-sm" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </div>

      <ul className="nav nav-pills mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${vista === 'vender' ? 'active' : ''}`}
            onClick={() => setVista('vender')}
          >
            Vender
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${vista === 'reporte' ? 'active' : ''}`}
            onClick={() => setVista('reporte')}
          >
            Reporte
          </button>
        </li>
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
            {cargando && <p className="text-muted">Cargando productos...</p>}
            {error && <div className="alert alert-danger">{error}</div>}
            {!cargando && !error && (
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
              onConfirmar={confirmarVenta}
            />
          </div>
        </div>
      )}

            {vista === 'reporte' && <ReporteVentas />}
    </div>
  );
}