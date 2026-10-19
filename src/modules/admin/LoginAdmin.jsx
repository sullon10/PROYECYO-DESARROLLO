
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginAdmin() {
  const { iniciarSesion } = useAuth();

  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      await iniciarSesion(correo, contraseña);
      setContraseña('');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow">
            <div className="card-body p-4">
              <h3 className="text-center mb-4">
                Administración de Cafetería
              </h3>

              <p className="text-center text-muted">
                Inicia sesión para continuar
              </p>

              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              <form onSubmit={manejarLogin}>
                <div className="mb-3">
                  <label
                    htmlFor="correoAdmin"
                    className="form-label"
                  >
                    Correo electrónico
                  </label>

                  <input
                    id="correoAdmin"
                    type="email"
                    className="form-control"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="admin@cafeteria.com"
                    autoComplete="username"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="claveAdmin"
                    className="form-label"
                  >
                    Contraseña
                  </label>

                  <input
                    id="claveAdmin"
                    type="password"
                    className="form-control"
                    value={contraseña}
                    onChange={(e) => setContraseña(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    autoComplete="current-password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={cargando}
                >
                  {cargando
                    ? 'Iniciando sesión...'
                    : 'Iniciar sesión'}
                </button>
              </form>
            </div>
          </div>

          <p className="text-center text-muted mt-3">
            Acceso exclusivo para administradores
          </p>
        </div>
      </div>
    </div>
  );
}
