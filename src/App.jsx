
import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { useAuth } from './context/AuthContext';
import RutaProtegida from './components/RutaProtegida';

import LoginPage from './pages/LoginPage';
import ClienteDashboard from './modules/cliente/ClienteDashboard';
import VendedorDashboard from './modules/vendedor/VendedorDashboard';

import GestionProductos from './modules/admin/GestionProductos';
import GestionVendedores from './modules/admin/GestionVendedores';
import ReportesAdmin from './modules/admin/ReportesAdmin';
import HistorialPedidos from './modules/admin/HistorialPedidos';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

// ====================================
// OPCIONES DEL MENÚ ADMINISTRADOR
// ====================================

const opciones = [
  { id: 'inicio', nombre: 'Panel principal', icono: 'bi-grid-1x2' },
  { id: 'productos', nombre: 'Productos', icono: 'bi-box-seam' },
  { id: 'vendedores', nombre: 'Vendedores', icono: 'bi-people' },
  { id: 'historial', nombre: 'Historial de Pedidos', icono: 'bi-clock-history' },
  { id: 'reportes', nombre: 'Reportes', icono: 'bi-bar-chart' }
];

// ====================================
// PANEL ADMINISTRADOR
// ====================================

function PanelAdministrador() {
  const { usuario, cerrarSesion } = useAuth();
  const [seccion, setSeccion] = useState('inicio');

  const tituloActual =
    opciones.find((opcion) => opcion.id === seccion)?.nombre ||
    'Panel principal';

  // ====================================
  // TARJETAS DEL PANEL PRINCIPAL
  // ====================================

  const tarjetas = [
    {
      id: 'productos',
      titulo: 'Gestión de Productos',
      descripcion: 'Administra productos, precios y stock.',
      icono: 'bi-box-seam',
      color: 'primary'
    },
    {
      id: 'vendedores',
      titulo: 'Gestión de Vendedores',
      descripcion: 'Registra y administra vendedores.',
      icono: 'bi-people',
      color: 'success'
    },
    {
      id: 'historial',
      titulo: 'Historial de Pedidos',
      descripcion: 'Consulta las ventas y los pedidos registrados.',
      icono: 'bi-clock-history',
      color: 'info'
    },
    {
      id: 'reportes',
      titulo: 'Reportes de Ventas',
      descripcion: 'Consulta los resultados de ventas.',
      icono: 'bi-graph-up-arrow',
      color: 'warning'
    }
  ];

  return (
    <div className="admin-layout">

      {/* ====================================
          MENÚ LATERAL
      ==================================== */}

      <aside className="admin-sidebar">

        <div className="admin-logo">
          <i className="bi bi-cup-hot-fill"></i>

          <div>
            <strong>CafeteríaWeb</strong>
            <small>Administración</small>
          </div>
        </div>

        <div className="admin-menu-label">
          MENÚ PRINCIPAL
        </div>

        <nav className="admin-nav">
          {opciones.map((opcion) => (
            <button
              key={opcion.id}
              type="button"
              className={`admin-nav-item ${
                seccion === opcion.id ? 'active' : ''
              }`}
              onClick={() => setSeccion(opcion.id)}
            >
              <i className={`bi ${opcion.icono}`}></i>
              <span>{opcion.nombre}</span>
            </button>
          ))}
        </nav>

        {/* PERFIL DEL ADMINISTRADOR */}

        <div className="admin-sidebar-footer">

          <div className="admin-profile">
            <div className="admin-avatar">
              <i className="bi bi-person-fill"></i>
            </div>

            <div>
              <strong>
                {usuario?.nombres ||
                  usuario?.nombre ||
                  'Administrador'}
              </strong>
              <small>Administrador</small>
            </div>
          </div>

          <button
            type="button"
            className="admin-logout"
            onClick={cerrarSesion}
          >
            <i className="bi bi-box-arrow-right"></i>
            Cerrar sesión
          </button>

        </div>
      </aside>

      {/* ====================================
          CONTENIDO PRINCIPAL
      ==================================== */}

      <main className="admin-main">

        <header className="admin-header">

          <div>
            <div className="admin-breadcrumb">
              CafeteríaWeb / Administración
            </div>

            <h1>{tituloActual}</h1>
          </div>

          <div className="admin-header-user">

            <div className="admin-avatar">
              <i className="bi bi-person-fill"></i>
            </div>

            <div>
              <strong>
                {usuario?.nombres ||
                  usuario?.nombre ||
                  'Administrador'}
              </strong>
              <small>Sesión activa</small>
            </div>

          </div>
        </header>

        <div className="admin-content">

          {/* ====================================
              PANEL PRINCIPAL
          ==================================== */}

          {seccion === 'inicio' && (
            <>

              <div className="admin-welcome">

                <div>
                  <span className="admin-welcome-label">
                    PANEL ADMINISTRATIVO
                  </span>

                  <h2>
                    ¡Bienvenido,{' '}
                    {usuario?.nombres ||
                      usuario?.nombre ||
                      'Administrador'}!
                  </h2>

                  <p>
                    Gestiona los productos, vendedores,
                    historial de pedidos y reportes
                    de tu cafetería desde un solo lugar.
                  </p>
                </div>

                <i className="bi bi-cup-hot-fill admin-welcome-icon"></i>

              </div>

              <h3 className="admin-section-title">
                Accesos rápidos
              </h3>

              <div className="row g-4">

                {tarjetas.map((tarjeta) => (
                  <div
                    className="col-12 col-md-6 col-xl-4"
                    key={tarjeta.id}
                  >

                    <button
                      type="button"
                      className="admin-module-card"
                      onClick={() => setSeccion(tarjeta.id)}
                    >

                      <div
                        className={`admin-module-icon bg-${tarjeta.color}-subtle text-${tarjeta.color}`}
                      >
                        <i className={`bi ${tarjeta.icono}`}></i>
                      </div>

                      <h4>{tarjeta.titulo}</h4>

                      <p>{tarjeta.descripcion}</p>

                      <span className="admin-module-link">
                        Administrar
                        <i className="bi bi-arrow-right"></i>
                      </span>

                    </button>

                  </div>
                ))}

              </div>
            </>
          )}

          {/* ====================================
              GESTIÓN DE PRODUCTOS
          ==================================== */}

          {seccion === 'productos' && (
            <section className="admin-content-card">
              <GestionProductos />
            </section>
          )}

          {/* ====================================
              GESTIÓN DE VENDEDORES
          ==================================== */}

          {seccion === 'vendedores' && (
            <section className="admin-content-card">
              <GestionVendedores />
            </section>
          )}

          {/* ====================================
              HISTORIAL DE PEDIDOS
          ==================================== */}

          {seccion === 'historial' && (
            <section className="admin-content-card">
              <HistorialPedidos />
            </section>
          )}

          {/* ====================================
              REPORTES DE VENTAS
          ==================================== */}

          {seccion === 'reportes' && (
            <section className="admin-content-card">
              <ReportesAdmin />
            </section>
          )}

        </div>
      </main>
    </div>
  );
}

// ====================================
// RUTAS PRINCIPALES DE LA APLICACIÓN
// ====================================

export default function App() {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <p className="text-center mt-5">
        Cargando...
      </p>
    );
  }

  const rutaPorRol = () => {
    if (!usuario) return '/login';

    const rol = usuario.rol?.toLowerCase();

    if (rol === 'administrador' || rol === 'admin') {
      return '/admin';
    }

    if (rol === 'cliente') {
      return '/cliente';
    }

    if (rol === 'vendedor') {
      return '/vendedor';
    }

    return '/login';
  };

  return (
    <Routes>

      {/* LOGIN */}

      <Route
        path="/login"
        element={
          usuario
            ? <Navigate to={rutaPorRol()} replace />
            : <LoginPage />
        }
      />

      {/* ADMINISTRADOR */}

      <Route
        path="/admin"
        element={
          <RutaProtegida rolRequerido="admin">
            <PanelAdministrador />
          </RutaProtegida>
        }
      />

      {/* CLIENTE */}

      <Route
        path="/cliente"
        element={
          <RutaProtegida rolRequerido="cliente">
            <ClienteDashboard />
          </RutaProtegida>
        }
      />

      {/* VENDEDOR */}

      <Route
        path="/vendedor"
        element={
          <RutaProtegida rolRequerido="vendedor">
            <VendedorDashboard />
          </RutaProtegida>
        }
      />

      {/* RUTA INICIAL */}

      <Route
        path="/"
        element={
          <Navigate to={rutaPorRol()} replace />
        }
      />

      {/* RUTAS NO ENCONTRADAS */}

      <Route
        path="*"
        element={
          <Navigate to={rutaPorRol()} replace />
        }
      />

    </Routes>
  );
}
