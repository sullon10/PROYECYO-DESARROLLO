
import { useState } from 'react';

import { useAuth } from './context/AuthContext';

import LoginAdmin from './modules/admin/LoginAdmin';
import GestionProductos from './modules/admin/GestionProductos';
import GestionVendedores from './modules/admin/GestionVendedores';
import ReportesAdmin from './modules/admin/ReportesAdmin';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

const opciones = [
  {
    id: 'inicio',
    nombre: 'Panel principal',
    icono: 'bi-grid-1x2'
  },
  {
    id: 'productos',
    nombre: 'Productos',
    icono: 'bi-box-seam'
  },
  {
    id: 'vendedores',
    nombre: 'Vendedores',
    icono: 'bi-people'
  },
  {
    id: 'reportes',
    nombre: 'Reportes',
    icono: 'bi-bar-chart'
  }
];

export default function App() {
  const { autenticado, usuario, cerrarSesion } = useAuth();

  const [seccion, setSeccion] = useState('inicio');

  if (!autenticado) {
    return <LoginAdmin />;
  }

  const tituloActual =
    opciones.find((opcion) => opcion.id === seccion)?.nombre
    || 'Panel principal';

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
      id: 'reportes',
      titulo: 'Reportes de Ventas',
      descripcion: 'Consulta los resultados de ventas.',
      icono: 'bi-graph-up-arrow',
      color: 'warning'
    }
  ];

  return (
    <div className="admin-layout">

      {/* MENÚ LATERAL */}
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

        <div className="admin-sidebar-footer">
          <div className="admin-profile">
            <div className="admin-avatar">
              <i className="bi bi-person-fill"></i>
            </div>

            <div>
              <strong>{usuario?.nombres || 'Administrador'}</strong>
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

      {/* CONTENIDO PRINCIPAL */}
      <main className="admin-main">

        {/* CABECERA */}
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
              <strong>{usuario?.nombres || 'Administrador'}</strong>
              <small>Sesión activa</small>
            </div>
          </div>
        </header>

        <div className="admin-content">

          {/* PANTALLA PRINCIPAL */}
          {seccion === 'inicio' && (
            <>
              <div className="admin-welcome">
                <div>
                  <span className="admin-welcome-label">
                    PANEL ADMINISTRATIVO
                  </span>

                  <h2>
                    ¡Bienvenido, {usuario?.nombres || 'Administrador'}!
                  </h2>

                  <p>
                    Gestiona los productos, vendedores y
                    reportes de tu cafetería desde un solo lugar.
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

          {/* PRODUCTOS */}
          {seccion === 'productos' && (
            <section className="admin-content-card">
              <GestionProductos />
            </section>
          )}

          {/* VENDEDORES */}
          {seccion === 'vendedores' && (
            <section className="admin-content-card">
              <GestionVendedores />
            </section>
          )}

          {/* REPORTES */}
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
