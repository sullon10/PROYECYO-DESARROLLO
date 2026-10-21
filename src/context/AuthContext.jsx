
import {
  createContext,
  useContext,
  useState
} from 'react';

const AuthContext = createContext(null);

const API_URL = 'http://localhost:3001/api';

function obtenerSesionGuardada() {
  try {
    // Recuperar sesiones anteriores del Administrador
    const token =
      sessionStorage.getItem('token') ||
      sessionStorage.getItem('adminToken') ||
      localStorage.getItem('token');

    const usuarioGuardado =
      sessionStorage.getItem('usuario') ||
      sessionStorage.getItem('adminUsuario') ||
      localStorage.getItem('usuario');

    return {
      token: token || null,
      usuario: token && usuarioGuardado
        ? JSON.parse(usuarioGuardado)
        : null
    };
  } catch {
    return {
      token: null,
      usuario: null
    };
  }
}

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(obtenerSesionGuardada);

  const token = sesion.token;
  const usuario = sesion.usuario;

  const [cargando] = useState(false);

  const iniciarSesion = async (correo, contraseña) => {
    const respuesta = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        correo,
        contraseña
      })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        datos.mensaje ||
        datos.error ||
        'Error al iniciar sesión'
      );
    }

    if (!datos.token || !datos.usuario) {
      throw new Error(
        'La respuesta del servidor no contiene una sesión válida'
      );
    }

    // Guardar la sesión de cualquier rol
    sessionStorage.setItem('token', datos.token);
    sessionStorage.setItem(
      'usuario',
      JSON.stringify(datos.usuario)
    );

    // Compatibilidad con las claves del módulo Administrador
    sessionStorage.setItem('adminToken', datos.token);
    sessionStorage.setItem(
      'adminUsuario',
      JSON.stringify(datos.usuario)
    );

    setSesion({
      token: datos.token,
      usuario: datos.usuario
    });

    return datos.usuario;
  };

  // Alias utilizado por Cliente y Vendedor
  const login = async (email, password) => {
    return iniciarSesion(email, password);
  };

  const cerrarSesion = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUsuario');

    // Limpiar sesiones del código anterior
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

    setSesion({
      token: null,
      usuario: null
    });
  };

  const logout = cerrarSesion;

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        cargando,
        iniciarSesion,
        cerrarSesion,
        login,
        logout,
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
