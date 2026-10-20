const API_URL = 'http://localhost:3001/api';

export async function obtenerProductos() {
  const res = await fetch(`${API_URL}/productos`);
  if (!res.ok) throw new Error('Error al obtener productos');
  return res.json();
}

export async function registrarVenta({ vendedorId, items }) {
  const res = await fetch(`${API_URL}/ventas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vendedorId, items }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al registrar la venta');
  return data;
}

export async function obtenerHistorialVentas() {
  const res = await fetch(`${API_URL}/ventas`);
  if (!res.ok) throw new Error('Error al obtener el historial de ventas');
  return res.json();
}

export async function obtenerReporteVentas() {
  const res = await fetch(`${API_URL}/ventas/reporte`);
  if (!res.ok) throw new Error('Error al obtener el reporte de ventas');
  return res.json();
}