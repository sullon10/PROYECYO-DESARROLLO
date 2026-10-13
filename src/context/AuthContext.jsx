import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = 'http://localhost:3001/api';

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Recupera sesión guardada al recargar la página
  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');
    if (tokenGuardado && usuarioGuardado) {
      setToken(tokenGuardado);
      setUsuario(JSON.parse(usuarioGuardado));
    }
    setCargando(false);
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');

    setToken(data.token);
    setUsuario(data.usuario);
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    return data.usuario;
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}