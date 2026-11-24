
import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

const AuthContext = createContext(null);

const API_URL = 'http://localhost:3001/api';

function obtenerTurnoDesdeToken(token) {
  try {
    const segmento = token.split('.')[1];
    if (!segmento) return null;

    const base64 = segmento
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(segmento.length / 4) * 4, '=');
    const claims = JSON.parse(atob(base64));
    const inicio = Number(claims.iat);
    const fin = Number(claims.exp);

    if (!Number.isFinite(inicio) || !Number.isFinite(fin) || fin <= inicio) {
      return null;
    }

    return {
      inicio: new Date(inicio * 1000).toISOString(),
      fin: new Date(fin * 1000).toISOString()
    };
  } catch {
    return null;
  }
}

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
        : null,
      turno: token
        ? JSON.parse(
            sessionStorage.getItem('turno') ||
            localStorage.getItem('turno') ||
            'null'
          ) || obtenerTurnoDesdeToken(token)
        : null
    };
  } catch {
    return {
      token: null,
      usuario: null,
      turno: null
    };
  }
}

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(obtenerSesionGuardada);
  const [sesionExpirada, setSesionExpirada] = useState(false);

  const token = sesion.token;
  const usuario = sesion.usuario;

  const [cargando] = useState(false);

  useEffect(() => {
    const manejarSesionExpirada = () => {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('usuario');
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminUsuario');
      sessionStorage.removeItem('turno');
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      localStorage.removeItem('turno');
      setSesion({ token: null, usuario: null, turno: null });
      setSesionExpirada(true);
    };

    window.addEventListener('auth:expired', manejarSesionExpirada);
    return () => window.removeEventListener('auth:expired', manejarSesionExpirada);
  }, []);

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

    const turno =
      datos.turno ||
      (datos.usuario.rol === 'vendedor'
        ? obtenerTurnoDesdeToken(datos.token)
        : null);

    // Guardar la sesión de cualquier rol
    sessionStorage.setItem('token', datos.token);
    sessionStorage.setItem(
      'usuario',
      JSON.stringify(datos.usuario)
    );
    if (turno) {
      sessionStorage.setItem('turno', JSON.stringify(turno));
    } else {
      sessionStorage.removeItem('turno');
    }

    // Compatibilidad con las claves del módulo Administrador
    sessionStorage.setItem('adminToken', datos.token);
    sessionStorage.setItem(
      'adminUsuario',
      JSON.stringify(datos.usuario)
    );

    setSesion({
      token: datos.token,
      usuario: datos.usuario,
      turno
    });
    setSesionExpirada(false);

    return datos.usuario;
  };

  // Alias utilizado por Cliente y Vendedor
  const login = async (email, password) => {
    return iniciarSesion(email, password);
  };

  const registrarCliente = async (datosRegistro) => {
    const respuesta = await fetch(`${API_URL}/auth/registro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datosRegistro)
    });

    const datos = await respuesta.json();
    if (!respuesta.ok) {
      throw new Error(datos.mensaje || 'No se pudo crear la cuenta');
    }

    sessionStorage.setItem('token', datos.token);
    sessionStorage.setItem('usuario', JSON.stringify(datos.usuario));
    setSesion({ token: datos.token, usuario: datos.usuario });
    return datos.usuario;
  };

  const cerrarSesion = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUsuario');
    sessionStorage.removeItem('turno');

    // Limpiar sesiones del código anterior
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('turno');

    setSesion({
      token: null,
      usuario: null,
      turno: null
    });
    setSesionExpirada(false);
  };

  const logout = cerrarSesion;

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        turno: sesion.turno,
        sesionExpirada,
        cargando,
        iniciarSesion,
        registrarCliente,
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
