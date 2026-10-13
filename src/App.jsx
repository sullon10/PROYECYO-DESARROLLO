import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import RutaProtegida from './components/RutaProtegida';
import LoginPage from './pages/LoginPage';
import ClienteDashboard from './modules/cliente/ClienteDashboard';
import VendedorDashboard from './modules/vendedor/VendedorDashboard';
import './App.css';

function App() {
  const { usuario, cargando } = useAuth();

  if (cargando) return <p>Cargando...</p>;

  return (
    <Routes>
      <Route
        path="/login"
        element={usuario ? <Navigate to={`/${usuario.rol}`} replace /> : <LoginPage />}
      />

      <Route
        path="/cliente"
        element={
          <RutaProtegida rolRequerido="cliente">
            <ClienteDashboard />
          </RutaProtegida>
        }
      />

      <Route
        path="/vendedor"
        element={
          <RutaProtegida rolRequerido="vendedor">
            <VendedorDashboard />
          </RutaProtegida>
        }
      />

      {/* raíz: redirige segun sesion */}
      <Route path="/" element={<Navigate to={usuario ? `/${usuario.rol}` : '/login'} replace />} />

      {/* cualquier ruta desconocida */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;