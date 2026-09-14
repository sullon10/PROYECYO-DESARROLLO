import { useState, useEffect } from 'react';
import { obtenerVendedores, crearVendedor, actualizarVendedor } from '../../services/api';

export default function GestionVendedores() {
  const [vendedores, setVendedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ email: '', nombre: '' });
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarVendedores();
  }, []);

  const cargarVendedores = async () => {
    try {
      setCargando(true);
      const data = await obtenerVendedores();
      setVendedores(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const manejarCrear = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await crearVendedor(formData.email, formData.nombre);
      setFormData({ email: '', nombre: '' });
      setShowForm(false);
      await cargarVendedores();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const manejarDesactivar = async (id) => {
    if (confirm('¿Desactivar este vendedor?')) {
      try {
        await actualizarVendedor(id, { activo: false });
        await cargarVendedores();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const manejarActivar = async (id) => {
    if (confirm('¿Activar este vendedor?')) {
      try {
        await actualizarVendedor(id, { activo: true });
        await cargarVendedores();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (cargando) {
    return <div className="spinner-border" role="status"><span className="visually-hidden">Cargando...</span></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Gestión de Vendedores</h3>
        <button
          className="btn btn-success"
          onClick={() => setShowForm(!showForm)}
        >
          <i className="bi bi-plus-circle me-2"></i>
          {showForm ? 'Cancelar' : 'Nuevo Vendedor'}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <form onSubmit={manejarCrear}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Crear Vendedor'}
              </button>
            </form>
          </div>
        </div>
      )}

      {vendedores.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No hay vendedores registrados
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Email</th>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vendedores.map(vendedor => (
                <tr key={vendedor.id}>
                  <td>{vendedor.email}</td>
                  <td>{vendedor.nombre}</td>
                  <td>
                    <span className={`badge ${vendedor.activo ? 'bg-success' : 'bg-danger'}`}>
                      {vendedor.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    {vendedor.activo ? (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => manejarDesactivar(vendedor.id)}
                      >
                        <i className="bi bi-lock-fill"></i>
                        Desactivar
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => manejarActivar(vendedor.id)}
                      >
                        <i className="bi bi-unlock-fill"></i>
                        Activar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
