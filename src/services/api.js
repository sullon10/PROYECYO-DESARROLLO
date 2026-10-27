const API_URL = 'http://localhost:3001/api';

async function request(ruta, opciones = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  if (opciones.body) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${API_URL}${ruta}`, { ...opciones, headers });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // respuesta sin cuerpo JSON
  }

  if (!res.ok) {
    throw new Error(data?.error || `Error del servidor (${res.status})`);
  }
  return data;
}

export const obtenerProductos = () => request('/productos');

export const registrarVenta = ({ vendedorId, items }) =>
  request('/ventas', { method: 'POST', body: JSON.stringify({ vendedorId, items }) });

export const obtenerHistorialVentas = () => request('/ventas');

export const obtenerReporteVentas = () => request('/ventas/reporte');