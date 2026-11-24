import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegistroPage() {
  const { registrarCliente } = useAuth();
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    contraseña: ''
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  function actualizarCampo(evento) {
    setFormulario((actual) => ({
      ...actual,
      [evento.target.name]: evento.target.value
    }));
  }

  async function manejarRegistro(evento) {
    evento.preventDefault();
    setError('');
    setCargando(true);
    try {
      const usuario = await registrarCliente(formulario);
      navigate(`/${usuario.rol}`, { replace: true });
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
            <i className="bi bi-person-plus-fill"></i>
          </span>
          <h1>Crear cuenta</h1>
          <p>Regístrate como cliente</p>
        </div>
        <form className="login-form" onSubmit={manejarRegistro}>
          {error && <div className="alert error" role="alert">{error}</div>}
          <label>
            Nombres
            <input name="nombres" value={formulario.nombres} onChange={actualizarCampo} required />
          </label>
          <label>
            Apellidos
            <input name="apellidos" value={formulario.apellidos} onChange={actualizarCampo} />
          </label>
          <label>
            Correo electrónico
            <input name="correo" type="email" value={formulario.correo} onChange={actualizarCampo} required />
          </label>
          <label>
            Contraseña
            <input name="contraseña" type="password" minLength="6" value={formulario.contraseña} onChange={actualizarCampo} required />
          </label>
          <button type="submit" disabled={cargando}>
            <i className="bi bi-person-check" aria-hidden="true"></i>
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
        <Link className="login-exit-link" to="/login">Ya tengo una cuenta</Link>
      </div>
    </div>
  );
}
