import { useState, useEffect } from 'react';
import { obtenerProductosAdmin, crearProducto, actualizarProducto, eliminarProducto } from '../../services/api';

export default function GestionProductos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    stock: '',
    categoria: ''
  });

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const data = await obtenerProductosAdmin();
      setProductos(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', precio: '', stock: '', categoria: '' });
    setEditandoId(null);
    setShowForm(false);
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) {
        await actualizarProducto(editandoId, formData);
      } else {
        await crearProducto(formData);
      }
      resetForm();
      await cargarProductos();
    } catch (err) {
      setError(err.message);
    }
  };

  const manejarEditar = (producto) => {
    setFormData(producto);
    setEditandoId(producto.id);
    setShowForm(true);
  };

  const manejarEliminar = async (id) => {
    if (confirm('¿Eliminar este producto?')) {
      try {
        await eliminarProducto(id);
        await cargarProductos();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (cargando) {
    return <div className="spinner-border" role="status"><span className="visually-hidden">Cargando...</span></div>;
  }

  const categorias = [...new Set(productos.map(p => p.categoria))];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Gestión de Productos</h3>
        <button
          className="btn btn-success"
          onClick={() => {
            if (showForm && !editandoId) resetForm();
            else {
              setEditandoId(null);
              setFormData({ nombre: '', precio: '', stock: '', categoria: '' });
              setShowForm(!showForm);
            }
          }}
        >
          <i className="bi bi-plus-circle me-2"></i>
          {showForm ? 'Cancelar' : 'Nuevo Producto'}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">{editandoId ? 'Editar' : 'Nuevo'} Producto</h5>
            <form onSubmit={manejarSubmit}>
              <div className="row">
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
                <div className="col-md-3 mb-3">
                  <label className="form-label">Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Stock</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Categoría</label>
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    placeholder="Nueva o existente"
                    required
                  />
                  <div className="btn-group">
                    {categorias.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setFormData({ ...formData, categoria: cat })}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button type="submit" className="btn btn-primary">
                {editandoId ? 'Actualizar' : 'Crear'} Producto
              </button>
            </form>
          </div>
        </div>
      )}

      {productos.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No hay productos registrados
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(producto => (
                <tr key={producto.id}>
                  <td>{producto.nombre}</td>
                  <td>{producto.categoria}</td>
                  <td>${producto.precio.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${producto.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                      {producto.stock}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => manejarEditar(producto)}
                    >
                      <i className="bi bi-pencil"></i>
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => manejarEliminar(producto.id)}
                    >
                      <i className="bi bi-trash"></i>
                      Eliminar
                    </button>
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
