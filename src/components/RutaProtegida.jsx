
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RutaProtegida({ rolRequerido, children }) {
  const { usuario, token, cargando } = useAuth();

  if (cargando) {
    return <p>Cargando...</p>;
  }

  if (!usuario || !token) {
    return <Navigate to="/login" replace />;
  }

  const normalizarRol = (rol) => {
    const valor = String(rol || '').toLowerCase();

    if (valor === 'administrador') {
      return 'admin';
    }

    return valor;
  };

  const rolUsuario = normalizarRol(usuario.rol);
  const rolPermitido = normalizarRol(rolRequerido);

  if (rolRequerido && rolUsuario !== rolPermitido) {
    return <Navigate to="/" replace />;
  }

  return children;
}
