
import { useState, useEffect } from 'react';
import {
  obtenerVendedores,
  crearVendedor,
  actualizarVendedor,
  eliminarVendedor
} from '../../services/api';

export default function GestionVendedores() {
  const [vendedores, setVendedores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    nombre: ''
  });
  const [guardando, setGuardando] = useState(false);
  const [procesandoId, setProcesandoId] = useState(null);

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
    setError('');
    setMensaje('');

    try {
      await crearVendedor(formData.email, formData.nombre);

      setFormData({ email: '', nombre: '' });
      setShowForm(false);

      await cargarVendedores();
      setMensaje('Vendedor registrado correctamente');
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const manejarCambiarEstado = async (vendedor) => {
    const nuevoEstado = !vendedor.activo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';

    if (!window.confirm(
      `¿Deseas ${accion} al vendedor ${vendedor.nombre}?`
    )) {
      return;
    }

    setProcesandoId(vendedor.id);
    setError('');
    setMensaje('');

    try {
      await actualizarVendedor(vendedor.id, {
        activo: nuevoEstado
      });

      await cargarVendedores();

      setMensaje(
        `Vendedor ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesandoId(null);
    }
  };

  const manejarEliminar = async (vendedor) => {
    const confirmar = window.confirm(
      `¿Estás seguro de eliminar al vendedor "${vendedor.nombre}"?\n\n` +
      'Esta acción es permanente y no se puede deshacer.'
    );

    if (!confirmar) {
      return;
    }

    setProcesandoId(vendedor.id);
    setError('');
    setMensaje('');

    try {
      await eliminarVendedor(vendedor.id);

      await cargarVendedores();

      setMensaje(
        `El vendedor "${vendedor.nombre}" fue eliminado correctamente`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesandoId(null);
    }
  };

  if (cargando && vendedores.length === 0 && !error) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h3 className="mb-0">Gestión de Vendedores</h3>

        <button
          className="btn btn-success"
          onClick={() => {
            setShowForm(!showForm);
            setError('');
            setMensaje('');
          }}
        >
          <i className="bi bi-plus-circle me-2"></i>
          {showForm ? 'Cancelar' : 'Nuevo Vendedor'}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="alert alert-success" role="status">
          {mensaje}
        </div>
      )}

      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="mb-3">Registrar nuevo vendedor</h5>

            <form onSubmit={manejarCrear}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value
                      })
                    }
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nombre: e.target.value
                      })
                    }
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={guardando}
              >
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
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Email</th>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {vendedores.map((vendedor) => (
                <tr key={vendedor.id}>
                  <td>{vendedor.email}</td>
                  <td>{vendedor.nombre}</td>

                  <td>
                    <span
                      className={`badge ${
                        vendedor.activo
                          ? 'bg-success'
                          : 'bg-secondary'
                      }`}
                    >
                      {vendedor.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>

                  <td>
                    <div className="d-flex gap-2 flex-wrap">
                      <button
                        className={`btn btn-sm ${
                          vendedor.activo
                            ? 'btn-outline-warning'
                            : 'btn-outline-success'
                        }`}
                        onClick={() =>
                          manejarCambiarEstado(vendedor)
                        }
                        disabled={procesandoId !== null}
                      >
                        <i
                          className={`bi ${
                            vendedor.activo
                              ? 'bi-lock-fill'
                              : 'bi-unlock-fill'
                          } me-1`}
                        ></i>
                        {vendedor.activo
                          ? 'Desactivar'
                          : 'Activar'}
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() =>
                          manejarEliminar(vendedor)
                        }
                        disabled={procesandoId !== null}
                      >
                        <i className="bi bi-trash me-1"></i>
                        {procesandoId === vendedor.id
                          ? 'Procesando...'
                          : 'Eliminar'}
                      </button>
                    </div>
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
