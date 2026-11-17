import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  function rutaPorRol(rol) {
    const rolNormalizado = rol?.toLowerCase();
    if (rolNormalizado === 'administrador' || rolNormalizado === 'admin') return '/admin';
    if (rolNormalizado === 'cliente') return '/cliente';
    if (rolNormalizado === 'vendedor') return '/vendedor';
    return '/';
  }

  async function manejarLogin(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const usuario = await login(email, password);
      navigate(rutaPorRol(usuario.rol), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card-topline">
          <Link className="login-back-link" to="/">
            <i className="bi bi-arrow-left" aria-hidden="true"></i>
            Volver al inicio
          </Link>
        </div>

        <div className="login-heading">
          <span className="login-mark" aria-hidden="true">
            <i className="bi bi-cup-hot-fill"></i>
          </span>
          <h1>CafeteríaWeb</h1>
          <p>Acceso a tu cuenta</p>
        </div>

        <form onSubmit={manejarLogin} className="login-form">
          {error && <div className="alert error">{error}</div>}

          <label>
            Correo electrónico
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>

          <label>
            Contraseña
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>

          <button type="submit" disabled={cargando}>
            <i className="bi bi-box-arrow-in-right" aria-hidden="true"></i>
            {cargando ? 'Iniciando sesión...' : 'Entrar a mi cuenta'}
          </button>
        </form>

        <Link className="login-exit-link" to="/">
          <i className="bi bi-x-lg" aria-hidden="true"></i>
          Salir
        </Link>
        <Link className="login-register-link" to="/registro">
          ¿No tienes cuenta? Regístrate como cliente
        </Link>
      </div>
    </div>
  );
}