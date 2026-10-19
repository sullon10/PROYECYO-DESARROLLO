
import {
  createContext,
  useContext,
  useState
} from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => sessionStorage.getItem('adminToken')
  );

  const [usuario, setUsuario] = useState(() => {
    try {
      const guardado = sessionStorage.getItem('adminUsuario');
      return guardado ? JSON.parse(guardado) : null;
    } catch {
      return null;
    }
  });

  const iniciarSesion = async (correo, contraseña) => {
    const respuesta = await fetch(
      'http://localhost:3001/api/auth/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ correo, contraseña })
      }
    );

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        datos.mensaje || 'Error al iniciar sesión'
      );
    }

    if (
      !datos.token ||
      datos.usuario?.rol !== 'administrador'
    ) {
      throw new Error('Acceso no autorizado');
    }

    sessionStorage.setItem('adminToken', datos.token);
    sessionStorage.setItem(
      'adminUsuario',
      JSON.stringify(datos.usuario)
    );

    setToken(datos.token);
    setUsuario(datos.usuario);
  };

  const cerrarSesion = () => {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUsuario');

    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,
        iniciarSesion,
        cerrarSesion,
        autenticado: Boolean(token && usuario)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error(
      'useAuth debe utilizarse dentro de AuthProvider'
    );
  }

  return contexto;
}
